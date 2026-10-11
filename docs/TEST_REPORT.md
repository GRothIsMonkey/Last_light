# Last Light — Chapter Four: horror revision: verification

Source: `claude/chapter4-main-street` at `8cc59e26111c4c2032a2893c69b67fafc548612a` (unchanged). Branch: `claude/chapter4-horror-revision`. Renders are software (SwiftShader); no real-GPU frame rate is claimed. Sound off throughout: audio is placeholder hooks only.

| Gate | Result |
|---|---|
| Full simulation suite (`QUICK=1 node tests/verify.mjs`): the prologue and Chapters One–Three played naturally, then Chapter Four played on from Chapter Three's end card with no QA jump (the **natural muted walkthrough**), Chapter Four's focused checks, the Chapter Four replay, then **all of Chapter Four again from the DEV selector's Chapter Four Start**, then the DEV selector checks | ⟨FULL⟩ |
| Chapter Four alone (`QUICK=1 ONLY=chapter4 node tests/verify.mjs`) | **35 passed**, 0 failed |
| Chapter Three alone (`QUICK=1 ONLY=chapter3 node tests/verify.mjs`; the creature's code is shared) | **156 passed**, 0 failed |
| Chapter Four in Chromium (`QA_OUTPUT=docs/qa/chapter4-horror-revision node tests/chapter4-browser.mjs`): the walkthrough from Chapter Three's end card by inputs alone, then all 42 DEV Chapter Four scenes by real clicks | ⟨BROWSER⟩ |
| JavaScript / console / WebGL or shader warnings in the browser run | ⟨ERRORS⟩ |

## What was checked, by problem

**1. The creature's animation.** Lab renders of every motion from four sides (`docs/qa/chapter4-horror-revision/creature-lab/`): foot slip 0 in the gallop, stalk and turn, ≤ 0.07 m in the trot's blend, ≤ 0.17 m in the last frames of a hard stop. In the chapter: foot slip ⟨SLIP⟩ m at most through the whole Second Street encounter (was 2.2 m where it left the creek bank: it now falls on an arc and its feet go with it), 1.6 m from anyone at its closest in the narrow way, never rearing or clawing. Chapter Three's chase with the new gait: 156 checks; floating 0, speed error median 0.004, heading error p95 0.003.

**2. The greater evil.** The encounter's stages in order — watch, stalk, freeze, look, back, scurry, **hide**, flinch, flee, gone — with the corner's lights dying after it looks there and before it backs away, the cascade beginning far up Main while it hides and before it runs; at its closest ⟨CLOSEST⟩ m (readable; was 26–48 m); "It's hiding." and "There's nothing there." said; nothing spoken names or ranks it ("controls", "servant", "in charge", "created" never appear).

**3. The escape.** Every way out of the video store, walking and running, reaches the Lyric with no carry-on:

| Way | Walking | Running | The creature | Closest it came | The dark: nearest / farthest | Boys, farthest |
|---|---|---|---|---|---|---|
| laundromat | 51 s | 30 s | narrow way | 1.5 m | 4.2 / 27 m | 8.0 / 13.5 m |
| narrow way to Depot Street | 49 s | — | narrow way | 1.5 m | 4.2 / 30 m | 8.0 m |
| passage to Main | 49 s | 33 s | Main | 3.1–3.5 m | 2.9 / 23 m | 12.8 / 14.0 m |
| gangway to Main | 48 s | — | Main | 3.5 m | 2.9 / 32 m | 5.5 m |
| along the creek | 57 s | — | the creek | 2.4 m | 3.8 / 21 m | 4.4 m |

The narrow-way pass in the natural walkthrough: come, stop, look (1.9 s), afraid, bolt, gone; "[Behind them, a light goes out.]" and the far end's light both went out; "It didn't even look at us." Seeded randomized runs (idle and walking out the back, idling on Depot Street, never going back for the bikes) all reach the next beat.

**4. Jamie and Sam.** Stress runs on the final code (worst distance from the player; time spent more than 14–16 m away):

| Run | Jamie | Sam | Lost |
|---|---|---|---|
| sprinting the whole escape | 12.6 m | 12.0 m | 0 s |
| walking with long stops | 7.7 m | 5.5 m | 0 s |
| narrow way to Depot Street | 7.9 m | 6.6 m | 0 s |
| passage to Main | 5.3 m | 5.7 m | 0 s |
| turning back toward the store, then on | 7.7 m | 6.8 m | 0 s |
| lingering 70 s in the alley | 12.4 m | 3.7 m | 0 s |
| sprinting through the cascade to the store | 5.6 m | 6.7 m | 0 s |
| the ride home, fast | 5.4 m | 5.1 m | 0 s |
| wandering at dusk | 6.1 m | 5.7 m | 0 s |

Before the fix: sprinting 14.4 / 18.1 m (Sam lost 12 s), the cascade 28.6 / 26.4 m, the ride home 17.3 / 14.4 m, any route but the laundromat stranded them. Neither boy was hidden in any sample; in the route runs the unseen recovery (`guardLog.recovered`) never fired.

**5. The Lyric.** In order: "…Alex?" "Jamie. Don't." "Did you guys hear that?" "…Hear what?" "Never mind." "That's what he said. On the hill. That's exactly—" "Don't run. Don't run." "…That's what I said." "Alright, I'm this way." "See you tomorrow." While he is there the town's sound is 0, nothing goes out, nothing holds the player or turns the camera; none of the generic threats is said; the blackout, his disappearance, the lights' return and the Pine Ridge picture on the camera follow.

**The video store.** Turned away from the TV, its first shot held 16 s (its length is 7 s; watched, 7 s); walking to the corner the live picture was from, the picture moved to another corner and Sam said so.

**DEV selector.** 42 Chapter Four scenes start without an error (14 checked to start shortly before their event, the new ones included); the DEV start equals the natural arrival from Chapter Three's end card (0 differences); in the revision's switching order (C4 Creature Fear → C3 Chase → C4 Downtown Escape → C1 Old Oak → C4 Theater → C2 Briarwood → C4 Video Store → C4 Ending) every Chapter Four scene is identical to a clean start of it and nothing of Chapter Four is left in the others (this found the creature keeping its last pose between scenes; fixed).

## Performance (software rendering: counts are real, times are not GPU measurements)

| | |
|---|---|
| The creature | 1 skinned mesh, 23,820 triangles: one draw call per pass; its animation costs about **0.16 ms** of CPU per update (Node, galloping or cowering) |
| Downtown (Chromium, 1440×900) | 136–1,047 draw calls, 83–417 k triangles across the walkthrough's frames (Main Street arriving by day is the most; the escape 136–191; the marquee 174–194) |
| Chapter Three's tunnel, with the creature | 65–74 draw calls, 54–70 k triangles |
| Renderer | ⟨GPU⟩ |
| JavaScript / shader errors | ⟨ERRORS⟩ |

---

# Last Light — Chapter Four: Main Street: verification

Source: `codex/astra-chapter3-final-polish` at `5be68143c13dfdb24ccec24afbd7ec0b4769f469` (unchanged). Branch: `claude/chapter4-main-street`. Tested runtime: `dist/` at `62dc7e3`; the browser report records the SHA-256 of every runtime file it served (`docs/qa/chapter4-main-street/chapter4-browser-report.json`). Chromium 141.0.7390.37 with ANGLE/SwiftShader (software rendering): no real-GPU frame rate is claimed.

| Gate | Result |
|---|---|
| Full simulation suite (`QUICK=1 node tests/verify.mjs`): prologue, Chapters One–Three as before, then Chapter Four played on from Chapter Three's end card, Chapter Four's focused checks, the DEV selector (Chapters 0–4) | **593 passed**, 0 failed |
| Chapter Four alone (`QUICK=1 ONLY=chapter4 node tests/verify.mjs`) | **33 passed**, 0 failed |
| Chapter Four in Chromium (`tests/chapter4-browser.mjs`): muted walkthrough from Chapter Three's ending with real clicks and inputs, no QA jump inside it; then all 38 DEV Chapter Four scenes started from the selector with real clicks | **11 passed**, 0 failed; **76 captures** (38 walkthrough, 38 DEV) |
| JavaScript / console / WebGL or shader warnings in the browser run | **0 / 0** |
| Chapter Four played straight through (simulation, scripted, direct) | **20.4 and 20.8 minutes** of game time (from the end card; again after all the jumps); the ride downtown 121 s; 140 lines spoken, every one a caption |
| QA jumps / aliases / checkpoints | **38 / 13 / 12**, each started and checked; Continue returns to each checkpoint; past the store the picture of the screen is on the camera again |
| Seeded randomized runs through the fallbacks | **18**, all reach the next beat (idling, wandering, missing the picture, letting the phone ring); Jamie takes the picture, Sam answers the phone, the carry-on fades are used where a player stands still |
| Start over and jumps back into Chapters 0–3 from inside Chapter Four | nothing of it left behind (town navigation, lights, people, cars, TV pictures, doors, the creature, the camera) |
| DEV selector | Chapters 0–3 and their 58 scenes unchanged; Chapter Four's **38** start without error; the DEV start equals the natural arrival from Chapter Three's end card (**0 differences**); 10 key scenes start before their event; switching 4→1→4→3→4→0→2→4 leaks nothing |
| Audio | **hooks only**: the placeholder sound events fire at the right beats (relay, phone, shutter, flash, door, steps); nothing was rendered or listened to |

## What was run

**Simulation** (`tests/verify.mjs` with `tests/chapter4-sim.mjs`: the real modules and Three.js geometry with a mocked renderer and DOM). After Chapter Three, the same session presses the end card's **Chapter Four** button and plays the chapter with inputs only (walking, looking, riding, F, V, A/D, the wheel). Checked beat by beat:

- the CHAPTER FOUR card over black, then Tuesday, August 23, 1:52 PM, at Sam's; Sam's mother's three things (the police called, the backpack, home before the streetlights); F at the backpack; his camera in playback;
- the old bike found by magnifying four of Alex's pictures, the last at Mason's;
- a real ride downtown: Oak Hollow, Summerfield Road, Old Mill Road, Main Street in that order, every frame continuous (no step over 1.2 m between frames);
- an ordinary Tuesday downtown: at least 8 people and 6 cars, moving cars stopping for the boys (closest approach measured);
- Mason's window, the poster, the florist; the library; the five microfilm records read in order as the clock runs to ten to eight;
- dusk: Alex across Main, nobody follows; the streetlights coming on one by one (8 or more distinct steps), the sky never brightening again;
- the creature at the end of Second Street: watch, stalk, freeze, fear, turn, flee, gone in that order, more than 25 m away at its closest, cowering, never rearing or clawing;
- the lights going out in order up Main toward them; the dark waiting at the TV shop until its window has been looked at up close (1.5 s), the sets showing them live from above, then "GO";
- the video store: Alex from impossible places, the PINE RIDGE sign photographed through the viewfinder, his room from the ceiling, the phone ("…Jamie?"), "That's us", the lights going from the front;
- the narrow way: it passes from behind without looking at them (closest more than 0.8 m), never clawing; the laundromat; the Lyric's windows (a figure in one, gone when looked at straight on);
- the marquee's five lines in order, the blackout, the lights back, Alex gone; the picture of the sign on Alex's camera; the ride home; the oak's three lines; the end card;
- nobody and nothing missing or non-finite at any frame; every spoken line a caption; the sound hooks fired.

Then the focused checks: all 38 jumps and 13 aliases, the 12 checkpoints with Continue, the picture remade after a Continue, Start over and jumps back into earlier chapters leaving nothing behind, 18 seeded randomized runs, and the DEV selector's Chapter Four (start compared with the natural arrival, switching, all scenes, 10 key scenes before their event). The whole Chapter Four is then played a second time in the same session.

**Browser** (`tests/chapter4-browser.mjs`, Chromium, SwiftShader, sound off): Chapter Three's end checkpoint played to its card; the card's **Chapter Four** button clicked; the chapter played with keys, look, F and V only, captured at each beat (`00`–`37`); then the DEV panel: **Chapter Four** chosen and each of its 38 scenes started with **START SCENE**, captured (`dev-*`). Gallery: `docs/qa/chapter4-main-street/index.html`.

## Found and fixed in this pass (by the rendered walkthrough and the full suite)

- An inline `//` comment had swallowed the start of the first microfilm record and the `c4-historical-clue` checkpoint (the simulation caught it: record 0 unread).
- The microfilm reader's screen, the poster in Mason's window and the figures in the Lyric's windows were parented to building groups that are baked into merged meshes, so they never drew; they now live on the town's live root, as the TV screens already did.
- Looking in Mason's window faced the door, not the poster; the Lyric's window glow and figures sat behind opaque glass (and the figures faced inward).
- The TV window lasted about two seconds at about 22 m before "GO" and its live view (16 m up) showed specks; the dark now waits there, and the view is close enough to be plainly them.
- The video store's front door could shut on you while you stood in the doorway (you were stuck until the fallback); it now waits until you are past it.
- A directed light cascade put the lamps behind its start point out backwards (far side first).
- The DEV Chapter Four start did not carry what Chapters 0–3 leave behind (`HISTORY[4]` had never been generated); it is now generated from the natural playthrough, Chapter Three's leftovers included, and the start equals the natural arrival.
- The `c4-store-live` jump (and its DEV scene) began with the live view already on; it now begins 1.6 s before it.
- The full suite measured the chapter's length on the game clock, which restarts at the hand-over; it now uses the chapter's own clock.

## Captures (inspected)

**38** walkthrough captures (`00`–`37`, one per beat) and **38** DEV-scene captures (`dev-*`, one per Chapter Four scene) in `docs/qa/chapter4-main-street/` (gallery `index.html`), all inspected. Rendered problems they showed are listed above and were fixed before this run; what remains is the art (see Not done).

- `00`…: Chapter Three ends (its end card, the button)
- `01`…: Sam’s house: his mom, the backpack, the camera, the old bike in the pictures
- `05`…: the ride: Summerfield, Old Mill Road, into town
- `08`…: Main Street by day: Mason’s window, the florist, the library, the microfilm, closing
- `15`…: dusk: the square, Alex across the street, the creature afraid, the lights going, the TV window
- `21`…: the video store: the TV’s shots, the viewfinder, his room, the phone, “That’s us”, the lights going
- `27`…: out the back: the alley, it running past, the laundromat, the Lyric’s windows
- `31`…: the marquee: Alex, the blackout, the lights back, the picture of the sign
- `35`…: home: Old Mill Road, the old oak, the end card

## Performance (SwiftShader; no real-GPU frame rate was measured)

Every capture records the renderer's own count for that frame (`chapter4-browser-report.json`). Over all 76 captures: **60,343–961,819 triangles** and **89–1047 draw calls**. The heaviest frames are on Old Mill Road's crest and arriving on Main (the whole downtown and the neighbourhood behind in view: about 1,000 draw calls) and the rides home; inside the library, the store and the laundromat (`town-int` drawn only within 55 m) frames are 60–420 k triangles. The TVs and the camera render the scene again into small targets (a TV at 12 Hz only while it is on, near and in view; Alex's pictures a few at a time while nobody looks at them), which these counts do not include.

| Capture | Phase | Triangles | Draw calls |
|---|---|---:|---:|
| `01-sams-house-mom` | d4-sam | 464,519 | 253 |
| `03-camera-first-picture` | d4-photos | 376,220 | 230 |
| `06-old-mill-road-crest` | d4-ride | 211,342 | 939 |
| `07-main-street-arrival` | d4-town | 206,022 | 1047 |
| `08-main-street-by-day` | d4-town | 188,583 | 606 |
| `12-microfilm-1988-mason` | d4-archive | 60,343 | 91 |
| `15-dusk-the-square` | e4-dusk | 191,386 | 293 |
| `17-creature-end-of-second-street` | e4-creature | 364,398 | 180 |
| `19-the-lights-going` | e4-cascade | 333,532 | 497 |
| `20-tv-window-live` | e4-cascade | 118,773 | 154 |
| `25-store-thats-us` | n4-store | 418,784 | 473 |
| `28-it-runs-past` | n4-alley | 207,304 | 358 |
| `30-theater-upper-windows` | n4-depot | 89,036 | 185 |
| `31-alex-under-the-marquee` | n4-marquee | 96,338 | 194 |
| `34-the-picture-pine-ridge` | n4-clue | 422,131 | 440 |
| `35-ride-home-old-mill-road` | n4-ride | 961,819 | 536 |
| `36-the-old-oak-it-was-scared` | n4-oak | 104,236 | 137 |

## Not done / limits

- **Audio** is deferred: every sound is a placeholder hook (`sound(...)` events), nothing was rendered offline and nobody has listened.
- **Real GPU**: not measured. Software rendering times say nothing about frame rate.
- **Art**: Chapter Four is a structural pass. People, buildings, interiors and props are deliberately plain (see the handoff's *Future targets for Astra*).
- The several-hour full release browser suite (`npm run test:browser`) was **not rerun**; Chapters 0–3 are covered by the full simulation suite here and their DEV starts are unchanged.
- A natural walkthrough by a person has not been done; the walkthroughs here are scripted inputs.
- The in-game Credits screen does not name the creature's author (true since Chapter Three; the attribution is in `docs/THIRD_PARTY_ASSETS.md` and inside the model file). The private playable copy adds the CC BY credit to its Credits screen; the repository's runtime was left as tested.

---

# Last Light — Astra Chapter Three visual polish: verification

Accepted source: `claude/chapter3-creature-chase` at `6edcad0bb44426ba29da61fd83d2f35cc94fad5c`. Work branch: `codex/astra-chapter3-final-polish`. Final runtime commit: `797bf62382d5ad5760d13ecb1a4d70eb73cb1a38`; later commits are QA/documentation only. Current evidence is under `docs/qa/chapter3-astra-*`; the older report below is retained as historical source evidence, not counted as this pass's validation. The art/restoration reports predate only the final caption-backing fix; every other runtime hash in them matches exactly.

| Gate | Result |
|---|---|
| Full simulation / geometry and progression suite | **551 passed** |
| Complete muted Chapter Three from Chapter Two hand-over; all 34 jumps, Continue, captions and audio hooks | **83 passed; 109 captures** |
| DEV chapter starts, 10 key natural-state scene comparisons, chapter/scene switching, normal-mode selector, complete muted Chapter Three from DEV | **142 passed; 74 captures** |
| Simulation DEV coverage | **58/58 scenes start; 46 natural comparisons, zero differences; zero switching leaks** |
| Multi-angle art review | **114 captures** |
| Earlier-chapter art restoration / cleanup / culling / water | **13 passed; 6 captures** |
| Rendered caption-wall regression + focused caption unit cases | **1 + 6 passed; 1 capture** |
| Completed browser reports: JavaScript / shader errors | **0** |
| Evidence validation | **55 runtime files across six reports; only the documented earlier caption hash differs in art/restoration** |

**304 QA captures** total, excluding source references, the derived comparison and failure diagnostics. Both natural browser walkthroughs reach the ending with sound off: 56 s chase, 3.2 s gate hold, 8.3 m minimum running gap, 14.3 m final road figure. The DEV browser switching checks record no leaks. Chromium 153.0.8010.0 with ANGLE/Vulkan SwiftShader; no real-GPU FPS claim. Audio hooks only, no offline/HRTF renders or listening claims.

The real flashlight-wall failure was fixed without weakening its assertion: contrast 1.96:1, soft-backing response **0.11 → 0.68**, transparent background, zero border. Capture timeouts/interruptions are recorded separately in the polish report; they are not counted as passing runs. The frozen-view QA capture helper now waits for actual readback instead of redrawing the same view twelve times. Moving-background fixtures keep their original assertions. The several-hour full release browser suite was not rerun; earlier chapters are covered by full simulation, rendered DEV starts/switching and focused restoration checks.

Full details, scope, limitations and per-frame source/final inventories: [ASTRA_CHAPTER3_FINAL_VISUAL_POLISH.md](ASTRA_CHAPTER3_FINAL_VISUAL_POLISH.md).

## Historical source report — creature chase

Source: `claude/chapter3-horror-escalation` at `e575f069c2f1bec4641253632a3d670ce68c45e3` (unchanged). Branch: `claude/chapter3-creature-chase`. Tested runtime: `dist/` at `28dd30e` (`dist/chapter3.js` SHA-256 `f4ab3d15…1d90`; later commits change only tests, QA evidence and documentation). Chromium 141.0.7390.37, ANGLE/SwiftShader (software rendering).

| Gate | Result |
|---|---:|
| Full simulation / geometry suite (`npm test`, no `QUICK`) | **551 passed**, 0 failed (escalation: 475) |
| Chapter Three Chromium pass (`tests/chapter3-browser-only.mjs`): muted natural walkthrough (no QA jump), every jump, Continue, captions, audio hooks | **83 passed**, 0 failed (109 captures) |
| DEV Chapter → Scene selector, Chromium (`tests/dev-chapters-browser.mjs`): real clicks, every scene, natural-equivalence, switching, Chapter Three played from the DEV start | **142 passed**, 0 failed (74 captures) |
| DEV selector, simulation: 58 scenes start; 46 compared with a natural playthrough | **0 differences**; switching **0 leaks** |
| JavaScript / console / shader errors | **0** |
| The creature at the culvert | facing forward, left, right, behind, the light 16° off it, never looked at, and 14 randomized: never missed, never before it is seen, seen at ≥ 21.2 m; it drops 3.8 s after being seen |
| The boy and the creature on screen together | **0 frames** (every frame of every Chapter Three test) |
| Visible teleports (it moving > 1.2 m in one frame while in view) | **0** |
| Randomized (seeded) | **24** chases, **12** road rides, **12** drain walks, **10** road-figure rides, **14** boy reveals, **14** creature reveals: all completed, nobody stuck, nobody caught |
| Chapter Three in one session | **3** full playthroughs in the simulation (the first, then two more after every jump and Start over); in Chromium the walkthrough, then all 34 jumps and Continue in one page; the DEV run switches scenes in one page and then plays Chapter Three through |
| Captures | **109** in `docs/qa/chapter3-creature/` (gallery `index.html`) and 74 in `docs/qa/dev-scenes-creature/`; inspected |
| Audio | **hooks only** (placeholders; no new voices, no heartbeat tuning, no offline or HRTF renders; nobody has listened) |
| Full release browser suite (`npm run test:browser`) | **not rerun** for this pass (see below) |

## What was run

**Simulation** (`tests/verify.mjs`: real modules and Three.js geometry, mocked renderer and DOM). The prologue, Chapter One and Chapter Two are played with inputs, and the same run goes on through Chapter Three with inputs only (`tests/chapter3-sim.mjs`): walking, looking, F where the prompt says, holding W through the run, riding. Checked beat by beat:

- **the day, shorter**: his mom's scene ≤ 60 s (30.1 s); the phone ready as soon as it is noticed (3 s) and opening on the last recording, one F (27.9 s), the older ones optional and nothing held; the window with no camera lock; Mr. Okafor (28.1 s) the one neighbour who matters;
- the night as before up to the first reveal (the boy at 22.2 m, present ≥ 10.7 s after seen);
- **the lure**: him again by the culvert at 42.1 m, his back to them, into the culvert; his voice from inside;
- **the creature**: at the lip, seen (27.7 m in the walkthrough), "That's not Alex.", the drop, RUN;
- **the chase**: seen far back (25.4 m), out of the wall (12.1 m), right behind (10.4 m), never closer than 8.3 m while running; Jamie goes down; the pipe bursts; the bike across the way out; the gate held 3.2 s; the exit; the bike without a prompt; 52.8 s from "RUN!" to the bike;
- **the road**: the look back, it at the treeline ahead (19.4 m); the boy in the road (14.4 m); nobody stops;
- the ending lines ("That wasn't Alex." "…I know." "Then what did we follow?", no answer); the end card; every phase in order; the tension curve.

Then the focused checks:

- all 34 QA jumps (phase, date and time of day, everyone somewhere a person can be, the bike's, the boy's and the creature's state, never both on screen) and the aliases;
- the 16 checkpoints and Continue (after a reload too);
- Start over from inside Chapter Three clearing everything, now including the creature, the gate, the lure and their colliders;
- the creature at the culvert from four facings, with the light off it, never looked at, and 14 randomized;
- the chase perceived: far (18.9 m when looked at), side (14.8 m), near (10.3 m), standing still (it rears up at 4.6 m), the gate (Jamie holds it; 6 blows, 1.28 m back from the bars; 3.2 s), the gate after stalling (4.7 m), the bike in the way (straight at it 5.4 s, jumping 5.3 s), the treeline (19.2 m);
- its body through a chase (915 frames): float 0 m, foot-speed error median 0.004 m/s (p95 0.111), heading error p95 0.003 rad, lift ≤ 0.194 m, the gait cycling, 0 jumps;
- 10 road-figure rides (seen at 6.5–14.5 m; one rider never looked);
- muted reactions, captions, audio hooks;
- 24 randomized chases (56–78 s; closest 6.2 m, 6.3 m while running; the gate held in 23 of 24; in the other it was not shut, and the run still ended at the bikes), 12 road rides and 12 drain walks;
- turning back in the drain; culling deep in the drain (only the tunnel's 69 merged meshes drawn).

Chapter Three is then played twice more in the same page (52.8 and 53.0 s runs), and the DEV selector checks run last (below).

**DEV Chapter → Scene** (simulation): all 58 scenes start; the 14 key scenes start before their event (the boy's reveal, the creature's reveal, RUN, the far sighting, the side, the bike, the gate, the remount, the road figure, the recording, the neighbours, the three departures); each of the 46 scenes a natural playthrough reaches is compared with it (the meaning of the state: phase, flags, objective, date, the boy, the creature, the chase, the bike, the gate, people, props, lighting, save): **0 differences**; the brief's switching order (3/c3-creature-reveal → 1/oak → 3/c3-creature-chase-start → 0/alex-departure → 2/alex-bike → 3/c3-creature-reveal → 3/chapter3-end → 2/memory-reconstruction → 3/c3-creature-chase-start), playing a little each time: **0 leaks**; chapter-level starts as before (0 differences; 0 leaks switching 3→1→3→0→3 and 3→1→2→3→0→2→1→3, also after playing); Start over afterwards begins the prologue normally.

**Chapters 0–2 regression** is the same suite as before and passed in full.

**Browser** (`tests/chapter3-browser-only.mjs`): from the Chapter Two end checkpoint, the hand-over, then the whole of Chapter Three **with the sound off (M) and no QA jump**, played with inputs, a capture at each beat. Then every QA jump rendered, Continue, the captions measured with the real frame readback, the captions setting, and the audio hooks. `tests/dev-chapters-browser.mjs` clicks the title's DEV panel (chapter, scene, START SCENE) for every scene, compares the starts with the natural snapshots (`docs/qa/dev-scenes-creature/natural-snapshots.json`), switches scenes in one page through the pause menu, and plays Chapter Three from the DEV start to its end card, muted.

**Found and fixed during this verification** (recorded, not hidden):

- In Chromium the walkthrough first stood where the culvert's lip cannot be seen (it stopped walking when the boy began to climb); Jamie called it up as designed, but the script did not move, and the reveal came by the 40 s fallback (the check failed: "seen at null m"). The script now walks on as the simulation does (seen at 22.2 m).
- The treeline glimpse rendered as a few pixels at 24 m (crouched 3.2 m beyond the verge, unlit). It is now half risen at the road's edge, about 20 m ahead (19.4–19.8 m when seen).
- The road figure check ran before Jamie's "Don't stop. DON'T STOP." (Sam's line comes first); the script now waits for it.
- The full suite's DEV comparison picked up a Chapter Two scene captured during a later QA jump, not the natural playthrough; natural capture now stops after the first playthrough.
- In Chromium, switching DEV scenes in one page showed Chapter One's **silent** siren carrying a muffling value (0.058) into a later start; like the silent siren's doppler values it never reaches the audio, and it is now excluded from the comparison (`tests/dev-chapters-sim.mjs`). Not a game change. (The full 551-check suite ran before this change; the simulation's DEV checks, `ONLY=dev`, were rerun after it: 221 passed, 0 differences, 0 leaks.)
- The browser's audio-hook check still asked for two bells in its stretch; this pass replaced the escalation's bell beside them before RUN with the lure and the creature, so there is one (the simulation's check already asked for one). It now asks for one.
- One DEV browser run timed out loading a fresh page (120 s) while two other test runs shared the machine's 4 cores; the browser runs were then made one after the other.
- On the first frame after a jump out of the drain the cave lighting was taken from the previous frame's zone (a real bug, shared code): fixed in `730b5d0`.

**Not rerun:** the full release browser suite (`npm run test:browser`, several hours on SwiftShader). Chapters 0–2 are unchanged except for code paths that are inert outside Chapter Three (the cave-light fix applies only where the drain is), verified by the simulation regression and by the DEV selector's browser starts of every chapter and scene.

## Durations and distances (scripted, direct; a person exploring will take longer)

| | Simulation | Browser |
|---|---:|---:|
| The day, Chapter Three's start to the plan for tonight | 306 s (escalation 554 s) | |
| His mom's scene | 30.1 s (escalation 50.4 s of talk) | |
| The phone ready / the last recording played | 3 s / 27.9 s | one F |
| Mr. Okafor | 28.1 s | |
| In the drain, entering to the run | 5.5 min (escalation 6.2) | |
| The boy, first reveal | 22.2 m, present 10.7 s after seen (trials ≥ 12.3 s) | 22.2 m, 12.3 s |
| The lure by the culvert, when seen | 42.1 m | 42.1 m |
| The creature at the lip, when seen | 27.7 m (trials 21.2 m) | 22.2 m |
| It, far, when seen / looked at | 25.4 m / 18.9 m | 21.1 m |
| It, out of the wall | 12.1 m / 14.8 m | 14.1 m |
| It, near | 10.4 m / 10.3 m | 8.3 m |
| Closest it came | 8.3 m running in the walkthrough; 6.3 m running, 6.2 m overall in 24 randomized runs; 4.6 m standing still | 8.3 m running |
| The gate | held 3.2 s, 6 blows, 1.28 m back from the bars | held 3.2 s |
| The run ("RUN!" to the bike) | 52.8 s (replays 52.8, 53.0; randomized 56–78 s) | 56 s |
| The treeline glimpse | 19.4 m (focused 19.2 m) | 19.8 m |
| The boy in the road | 14.4 m (10 rides: 6.5–14.5 m) | 14.3 m |
| The ride out to the streetlight | 94.1 s | |
| Chapter Three, all of it (game time) | 19.1 min (escalation 23.7) | |

## Captures (inspected)

From the muted natural walkthrough (no QA jump), in `docs/qa/chapter3-creature/`:

| | Capture(s) |
|---|---|
| The day: the corner, his mom, his room, the phone, the window, Mr. Okafor, the gate, the road | `c3-d01` … `c3-d11` (`c3-d03-alex-mom`, `c3-d06-the-last-recording`, `c3-d07-window-to-the-creek`, `c3-d08-mr-okafor`) |
| The night road and the drain, unchanged beats | `c3-n01` … `c3-n25` |
| The lure: him again by the culvert; climbing in | `c3-n26-him-again-by-the-culvert`, `c3-n27-he-climbs-into-the-culvert` |
| The creature: at the lip; "That's not Alex."; the drop | `c3-n28-something-at-the-lip`, `c3-n29-that-is-not-alex`, `c3-n30-it-drops-into-the-water` |
| The chase: RUN; it is coming; round the bend, nothing; Jamie goes down; out of the wall; the pipe; the bike ahead; right behind; the gate; the way out | `c3-n31` … `c3-n40` (`c3-n32-it-is-coming`, `c3-n35-out-of-the-wall`, `c3-n38-right-behind-them`, `c3-n39-it-claws-at-the-gate`) |
| The remount; it watching from the mouth (a review camera, not a story frame) | `c3-n41-straight-onto-the-bike`, `c3-n42-qa-watching-from-the-mouth` |
| The forest: it at the treeline ahead; the flight; the boy in the road; into the trees | `c3-n43-it-at-the-treeline-ahead`, `c3-n44` … `c3-n46` |
| The end: the streetlight; the four lines; the card | `c3-n47` … `c3-n49` |

Plus all 34 QA jumps (`qa-jump-*`), Continue (`c3-title-continue`), a narrowed review view of the boy and the caption fixtures (`caption-*`). The DEV run adds the panel (`dev-00-title-selector-*`), the chapter starts and the scene starts (`dev-scene-*`) in `docs/qa/dev-scenes-creature/`.

What the renders answer: the creature reads at the lip as a pale hunched shape in the beam at about 20 m (`n28`); far behind it is small but clear when you look back (`n32`, partly behind a friend in that frame); out of the wall and right behind it is unmistakable (`n35`, `n38`); at the gate it is up on its hind legs at the bars (`n39`); at the treeline it is a pale figure half risen at the road's edge (`n43`, after the restaging above); the boy and it are never in the same frame.

## Performance (SwiftShader; no real-GPU frame rate was measured)

Static world: **2,514,058 triangles / 1,131 merged meshes** (unchanged from the escalation). The creature is one skinned mesh of **23,820 triangles** (not decimated), one draw call (plus its shadow where shadows are drawn), drawn only while it is shown (hidden otherwise; while shown it is not frustum-culled, since a skinned mesh's bounds do not follow its pose); the gate is 6 meshes, 468 triangles. Deep in the drain only the tunnel's 69 merged meshes are drawn (plus the creature, the gate and the people), the far plane drops to 150 m and the sky is not drawn.

| Moment | Capture | Triangles | Draw calls |
|---|---|---:|---:|
| Briarwood corner (day, the neighbourhood) | `c3-00-chapter-three-card` | 1,348,041 | 563 |
| his room: the helmet | `c3-d05-his-helmet-on-the-desk` | 896,690 | 289 |
| the old road at night | `c3-n06-road-deep` | 477,722 | 65 |
| the drain mouth | `c3-n08-the-mouth` | 659,039 | 219 |
| the deep box | `c3-n18-deep-low-ceiling-ankle-water` | 36,834 | 74 |
| the lure by the culvert | `c3-n26-him-again-by-the-culvert` | 34,621 | 73 |
| **it at the lip** | `c3-n28-something-at-the-lip` | 39,292 | 38 |
| **it coming, far** | `c3-n32-it-is-coming` | 50,180 | 82 |
| **out of the wall** | `c3-n35-out-of-the-wall` | 49,274 | 66 |
| **right behind** (near the first bend, the way out in view) | `c3-n38-right-behind-them` | 378,677 | 171 |
| **the gate** | `c3-n39-it-claws-at-the-gate` | 586,297 | 188 |
| **the treeline** | `c3-n43-it-at-the-treeline-ahead` | 625,593 | 91 |
| the boy in the road | `c3-n45-him-in-the-road-ahead` | 418,053 | 93 |
| the first streetlight | `c3-n47-the-first-streetlight` | 923,833 | 562 |

Ranges over the walkthrough captures: inside the drain past the first bend 20,890–79,382 triangles, 38–195 draw calls; near the first bend and the way out, where the mouth and the woods beyond are in view, 369,049–681,592 and 130–242; the woods road at night 418,053–653,958 and 62–212; the day 570,929–1,348,041 and 129–563 (unchanged by this pass); the street at night 399,398–923,833 and 170–562. Every frame is under the 1.5–1.8 M hero ceiling; the creature adds 23,820 triangles and one or two draw calls to the frames it is in (in the deep drain that is roughly half of a frame's triangles, at 20–80 k in total).

## Audio

Placeholder and deferred, per the brief. Its movement (a splash or a step per bound), its impacts (the gate, the culvert), the gate's clangs and the voice from the culvert reuse the existing synthesized placeholders; the simulation and Chromium check only that each hook is called a bounded number of times without errors (one stretch in the simulation: its movement 57, steps 29, impacts 9, the gate 9). **No new voices, no heartbeat tuning, no offline renders, no HRTF rendering.** Nobody has listened.

## Where

- [chapter3-creature/](qa/chapter3-creature/) (gallery `index.html`, `chapter3-browser-report.json`, `simulation-report.json`)
- [dev-scenes-creature/](qa/dev-scenes-creature/) (`dev-chapters-browser-report.json`, captures, `natural-snapshots.json`)

To rerun:

```
npm test
DEV_NATURAL_OUT=docs/qa/dev-scenes-creature/natural-snapshots.json npm test
BROWSER_PATH=/path/to/chromium node tests/chapter3-browser-only.mjs
BROWSER_PATH=/path/to/chromium node tests/dev-chapters-browser.mjs
```

---

# Last Light — Chapter Three horror escalation: verification

Source: `claude/chapter3-horror-rebuild` at `26304a9dbc30ce66dcdc0a5e65f4082fc53a55e0` (unchanged). Branch: `claude/chapter3-horror-escalation`. Tested runtime: `dist/` at `43b71e6` (later commits change only tests, QA evidence and documentation). Chromium 141.0.7390.37, ANGLE/SwiftShader (software rendering).

| Gate | Result |
|---|---:|
| Full simulation / geometry suite (`npm test`, no `QUICK`) | **475 passed**, 0 failed (rebuild: 436) |
| Chapter Three Chromium pass (`tests/chapter3-browser-only.mjs`): muted natural walkthrough (no QA jump), every jump, Continue, captions, audio hooks | **79 passed** |
| DEV selector, Chromium (`tests/dev-chapters-browser.mjs`): real clicks, natural-equivalence, switching, Chapter Three played to its end card from the DEV start | **74 passed** |
| JavaScript / console / shader errors | **0** |
| The boy's reveal | facing forward, left, right, away, never looking, and 14 randomized: never missed; present ≥ 12.3 s after first seen; Jamie and Sam never within 0.81 m of your line of sight to him |
| Randomized runs (seeded) | **24** escapes, **12** road rides, **12** drain walks, **10** road-figure rides, **14** reveals: all completed, nobody stuck |
| Chapter Three in one session | **3** full playthroughs in the simulation (the first, then two more after every jump and Start over); in Chromium, the walkthrough then all 33 jumps and Continue in one page, and the DEV run switching chapters in one page before playing Chapter Three through |
| Captures | **104** in `docs/qa/chapter3-escalation/` (gallery `index.html`), and 63 in `docs/qa/dev-chapters-escalation/`; inspected |
| Audio | **hooks only** (placeholders; no offline renders, no HRTF rendering; nobody has listened) |
| Full release browser suite (`npm run test:browser`) | **not rerun** for this pass (see below) |

## What was run

**Simulation** (`tests/verify.mjs`: real modules and Three.js geometry, mocked renderer and DOM). The prologue, Chapter One and Chapter Two are played with inputs as before, and the same run goes on through Chapter Three with inputs only (`tests/chapter3-sim.mjs`): walking, looking, F where the prompt says, holding W through the run, riding. The night is checked beat by beat:

- the drain closing in (mouth 4.6 × 3.6 m, the old stretch ≤ 3.8 × 2.8 m, the deep box ≤ 3.2 × 2.35 m with water and a dry ledge);
- the bend, the prints, the knock, the first bell;
- **the helmet**: the line in his room this morning, the four lines in the drain, Sam turned to the way out;
- **the bike**: found by the light, a click and no ring, then gone while unwatched and noticed;
- **the boy**: they stop either side of you (a step ahead, more than 0.6 m out, neither within 0.45 m of your sightline) at 17–28 m; he stays ≥ 4 s after being seen; he turns and walks round the bend; past it, nobody;
- the wet footprint, a pause of ≥ 10 s, the crossing seen;
- "Jamie?" ahead, "Guys?" behind, the search behind, the close bell, "RUN!";
- **the run**: median speed ≥ 4.8 m/s, the view ≥ 69°, no exhaustion, 40–95 s; he is seen at 14–22 m and later at 6.5–11.5 m, never closer than 6 m; Jamie goes down; the pipe bursts; the bike lies across the way out and is seen; the exit is seen; you are on the bike without a prompt;
- **the road**: he is seen in the road at 8–16 m, steps off, nobody stops;
- the streetlight and the four last lines; the end card; every phase in order; the tension curve.

Then the focused checks:

- all 33 QA jumps (date, time of day, phase, everyone somewhere a person can be, the bike's state, the boy's state);
- the six drain/escape checkpoints and Continue (after a reload too);
- Start over from inside Chapter Three clearing everything, including field of view, escape state, boosts and the pursuit;
- the boy from four facings, never looking, and 14 randomized reveals;
- the bike staying while watched, going only while unwatched;
- the pursuit perceived: far, near, and stopping dead (he slows and stands, never closer than 8.2 m);
- the bike in the way: run straight at it (vault), and jump it;
- 10 road-figure rides with glances, two of them never looking at the road;
- muted reactions on Jamie and Sam for each sound;
- captions for every sound that matters;
- the audio hooks: each called a handful of times, no errors;
- 24 randomized escapes, 12 road rides and 12 drain walks;
- turning back in the drain;
- culling deep in the drain (only the tunnel's 69 merged meshes drawn, far plane 150 m, no sky).

Chapter Three is then played twice more in the same page, and the DEV selector's equivalence checks run last: 0 differences for Chapters 0–3, and 0 leaks switching 3→1→3→0→3 and 3→1→2→3→0→2→1→3, also after playing.

**Chapters 0–2 regression** is the same suite as before and passed in full: the playtest fixes (fan and TV chatter steady over an hour, the flag, the hoops, the old oak with its 120-trial randomized sweep: 0 stuck), the Chapter One and Two walkthroughs, their jumps, checkpoints, Continue, companions, the flashlight and captions.

**Browser** (`tests/chapter3-browser-only.mjs`): from the Chapter Two end checkpoint, the hand-over, then the whole of Chapter Three **with the sound off (M) and no QA jump**, played with inputs, a capture at each beat the brief lists (below). Then every QA jump rendered, Continue, the captions measured with the real frame readback, the captions setting, and the audio hooks. `tests/dev-chapters-browser.mjs` clicks the title's DEV buttons, compares each start with the natural snapshots (`docs/qa/dev-chapters-escalation/natural-snapshots.json`), switches chapters repeatedly in one page, and plays Chapter Three from the DEV start to its end card, muted, with the same walkthrough.

**One browser run failed and was rerun** (recorded here, not hidden). The first full walkthrough on the final runtime passed every night check (the reveal 22.2 m with a clear sightline, 12.3 s after seen, the crossing after 11 s, the run 54 s, the pursuer 17.3 m then 10 m, the road figure 14.1 m, every phase in order), but failed "Jamie and Sam stayed with you": **31.2 m** at the start of the *day* road ride (limit 30; the rebuild's run measured 23.8). The day sequence is unchanged; the walkthrough now also stops at Alex's desk for the helmet, so the test rode off from Mr. Okafor's at full speed while Jamie and Sam were still walking back to their bikes (they caught up). The walkthrough now lets them get back on their bikes first, and the 30 m limit is unchanged.

**Not rerun:** the full release browser suite (`npm run test:browser`, several hours on SwiftShader). Chapters 0–2 are unchanged except for code paths that are inert outside Chapter Three's drain and escape (verified by the simulation regression above and by the DEV selector's browser starts of every chapter). Its last results are the rebuild's (420 passed).

## Durations (scripted, direct; a person exploring will take longer)

| | Simulation | Browser |
|---|---:|---:|
| Night ride, end of Briarwood to the outfall | 102 s | |
| In the drain, entering to the run | 6.2 min | |
| The run (bell to the bikes) | 52.8 s (randomized: 56–76 s) | 55.1 s |
| The ride out to the streetlight | 105.1 s | |
| The boy when first seen | 22.2 m (73 ft) | 22.2 m |
| The boy present after being seen | 10.7 s (trials ≥ 12.3 s) | 12.3 s |
| The pursuer, far, when seen / looked at | 19.1 m / 16.3 m | 17.2 m |
| The pursuer, near, when seen | 10.5 m | 10 m |
| Closest he came | 9 m in the run; 7.7 m in randomized escapes; 8.2 m standing still | |
| The boy in the road, when seen | 14.4 m | 14.3 m |
| Chapter Three, all of it (game time) | 23.7 min | |

The rebuild's drain took 3.7 minutes; it is 6.2 now because more happens (the helmet, the bike gone, the stop and the wait for him, the search, the pause before the crossing, the search behind), not because it was padded. The run is shorter (rebuild: 73.7 s) and dense: something every 5–10 s.

## Captures (all inspected)

Every shot the brief lists, from the muted natural walkthrough (no QA jump), in `docs/qa/chapter3-escalation/`:

| The brief | Capture(s) |
|---|---|
| Tunnel mood: entrance | `c3-n07-the-outfall`, `c3-n08-the-mouth` |
| loss of entrance visibility | `c3-n10-after-the-bend-no-way-out` |
| lower-ceiling section; ankle water | `c3-n18-deep-low-ceiling-ankle-water` (also `c3-n16`, `c3-n19`) |
| side-drain darkness | `c3-n13-side-drain-black` |
| Alex's item | `c3-d05-his-helmet-on-the-desk` (morning), `c3-n14-his-helmet-in-the-silt`, `c3-n15-sam-wants-out` |
| old bike reveal; the bell; gone | `c3-n16-the-bike-in-the-light`, `c3-n17-try-the-bell-click`, `c3-n19-the-bike-is-gone` |
| Figure: first reveal, eye height | `c3-n20-figure-from-eye-height` |
| first reveal, wide | `c3-n21-qa-wide-reveal` (a review camera behind the three of them; not a story frame) |
| framed by Jamie's and Sam's lights | `c3-n22-framed-by-their-lights` |
| turning; walking behind the bend | `c3-n23-he-turns`, `c3-n24-walking-round-the-bend` |
| empty bend | `c3-n25-the-bend-empty`, `c3-n26-a-wet-footprint` |
| second presence; voices; search; bell | `c3-n27-someone-crosses-ahead`, `c3-n28`, `c3-n29`, `c3-n30-searching-behind-nothing`, `c3-n31-the-bell-beside-them` |
| Pursuit: RUN start | `c3-n32-run` |
| companion look-back | `c3-n33-they-look-back` |
| far figure running behind | `c3-n34-he-is-running-after-them` |
| Jamie goes down; the side pipe | `c3-n35-jamie-goes-down`, `c3-n36-water-bursts-from-a-side-pipe` |
| old bike suddenly ahead | `c3-n37-the-bike-ahead-of-them` |
| near figure | `c3-n38-closer` |
| exit light ahead | `c3-n39-the-way-out` |
| Road: remount | `c3-n40-straight-onto-the-bike` |
| dark forest escape | `c3-n41-flight-up-the-dark-road` |
| figure standing in the road; stepping into the trees | `c3-n42-him-in-the-road-ahead`, `c3-n43-he-steps-into-the-trees` |
| neighbourhood lights returning | `c3-n44-the-first-streetlight`, `c3-n45-under-the-streetlight`, `c3-n46-chapter-three-end` |

Plus all 33 QA jumps (`qa-jump-*`), Continue (`c3-title-continue`), a narrowed review view of the boy (`c3-qa-figure-zoomed-for-review`) and the caption fixtures (`caption-*`). The DEV selector run adds its own walkthrough (`dev-c3-*`) and the chapter starts in `docs/qa/dev-chapters-escalation/`.

Reviewing these renders is what found the problems fixed in `43b71e6`. Jamie stood almost in front of you at the reveal. The deep box went black whenever Jamie was in your beam. The water was a black void. The pursuer at 18 m was a dim 45-pixel shape. The bike ahead was two glinting rims. Answers to the brief's review questions, from the final frames:

- **A person down there?** Yes: a lit child at the centre of two beams (`n22`).
- **A child, not a polygon; like Alex?** Yes: Alex's build, mustard shirt, green shorts, brown hair.
- **Can I see the pursuer while running?** Yes, when you look back: far (`n34`), near (`n38`).
- **Does the tunnel feel oppressive?** The low wet box (`n18`); judged by eye, not measured.
- **Does the exit look like safety?** A pale opening at the end (`n39`).
- **Is the relocated bike obvious?** Yes: across the floor, both of them swerving (`n37`).
- **Does the road figure read instantly?** Yes: a boy standing in the road in the lights (`n42`).

## Captions

| Background | Words | Worst-case contrast | Opposite-tone edge | Mean luminance behind |
|---|---|---:|---:|---:|
| night asphalt | light | 12.91:1 | 0.28 | 0.0241 |
| day grass | light | 2.72:1 | 0.72 | 0.1738 |
| day field end of briarwood | light | 4.2:1 | 0.41 | 0.1685 |
| woods road night | light | 15.43:1 | 0.31 | 0.0064 |
| drain darkness | light | 19.12:1 | 0.29 | 0.0000 |
| drain flashlight on the wall | light | 3.9:1 | 0.48 | 0.0993 |
| drain flashlight floor | light | 19:1 | 0.31 | 0.0003 |
| bright house siding | dark | 6.47:1 | 0.32 | 0.4187 |
| streetlight | light | 9.17:1 | 0.28 | 0.0446 |
| daylight sky | dark | 5.32:1 | 0.32 | 0.2839 |
| memory | light | 5.9:1 | 0.28 | 0.0494 |
| police lights | light | 12.01:1 | 0.28 | 0.0268 |

The sky → ground → sky sweep changed tone once, never a flicker. Where contrast is below 3:1 the opposite-tone edge round each letter is strengthened (≥ 0.7).

## Audio

Placeholder and deferred, per the brief. This pass checked only that the story still calls each hook (the bells far, clean and beside them, his voice ahead and behind, the click, splashes) a sensible number of times and without errors (simulation and Chromium). **No offline renders and no HRTF rendering were run**; `C3_AUDIO_RENDER=1` brings the old signal renders back. Nobody has listened.

## Performance (SwiftShader; no real-GPU frame rate was measured)

Static world: **2,514,058 triangles / 1,131 meshes** (rebuild 2,505,240 / 1,124), far under the pass's soft targets (~6 M / ~2,000). The drain's new detail is merged into its zone, so it adds draw calls only where it is drawn. Culling: deep in the drain only the tunnel's batches are drawn (69 merged meshes), the far plane drops to 150 m and the sky is not drawn; the neighbourhood views of Chapters 0–2 never draw the tunnel.

| Moment | Capture | Triangles | Draw calls |
|---|---|---:|---:|
| Briarwood corner (day, the neighbourhood) | `c3-00-chapter-three-card.jpg` | 1,348,041 | 563 |
| his room: the helmet | `c3-d05-his-helmet-on-the-desk.jpg` | 896,690 | 289 |
| the old road at night | `c3-n06-road-deep.jpg` | 477,722 | 65 |
| the drain mouth | `c3-n08-the-mouth.jpg` | 660,951 | 217 |
| the deep box | `c3-n18-deep-low-ceiling-ankle-water.jpg` | 36,834 | 74 |
| the reveal | `c3-n22-framed-by-their-lights.jpg` | 55,992 | 100 |
| looking back in the run | `c3-n34-he-is-running-after-them.jpg` | 35,836 | 124 |
| the bike ahead (near the first bend) | `c3-n37-the-bike-ahead-of-them.jpg` | 557,024 | 187 |
| the near pursuer | `c3-n38-closer.jpg` | 605,018 | 233 |
| the boy in the road | `c3-n42-him-in-the-road-ahead.jpg` | 418,053 | 93 |
| the first streetlight | `c3-n44-the-first-streetlight.jpg` | 963,120 | 462 |

Ranges over the walkthrough captures: the drain 26,700–660,951 triangles, 58–233 draw calls (33 frames; the top of the range is the mouth with the woods behind); the day 570,929–1,348,041, 129–563 (11); the woods road at night 337,148–823,338, 57–368 (10); back in the street 730,264–963,120, 327–462 (3). Every frame is under the pass's 1.5–1.8 M hero ceiling; the deep drain sits far under the 800 k–1.2 M normal band (it is small and enclosed, and culled to itself). The only frames over ~450 draw calls are the day neighbourhood's (the Briarwood corner card at 563), which this pass did not change.

## Where

- [chapter3-escalation/](qa/chapter3-escalation/) (gallery `index.html`, `chapter3-browser-report.json`, `simulation-report.json`)
- [dev-chapters-escalation/](qa/dev-chapters-escalation/) (`dev-chapters-browser-report.json`, captures, `natural-snapshots.json`)

To rerun:

```
npm test
BROWSER_PATH=/path/to/chromium node tests/chapter3-browser-only.mjs
BROWSER_PATH=/path/to/chromium node tests/dev-chapters-browser.mjs
```

---

# Last Light — Chapter Three horror rebuild: verification

Source: `claude/chapter3-horror-investigation` at `8f06b2bb3b8f545243c75f3644627cb8a217d7ec` (unchanged). Branch: `claude/chapter3-horror-rebuild`. Tested runtime: commit `8e30cbeac758f53be2d68c13a5fa5b83870c8e1b` (later commits change tests and documentation only); the runtime hashes in each report match the committed `dist/` files. The structural pass's verification below this section is historical: its basin, pond road and culvert are gone.

| Gate | Result |
|---|---:|
| Full simulation / geometry suite (`npm test`, no `QUICK`) | **436 passed**, 0 failed (structural pass: 339) |
| Chapter Three Chromium pass (`tests/chapter3-browser-only.mjs`): muted walkthrough, every jump, Continue, captions, audio signals | **81 passed** |
| DEV selector, Chromium (`tests/dev-chapters-browser.mjs`) | **65 passed** |
| Full release browser suite (`npm run test:browser`, SwiftShader) | **420 passed, 479 captures** |
| JavaScript / console / shader errors | **0** |
| Randomized runs (seeded) | **24** escapes, **12** road rides, **12** drain walks: all completed, nobody stuck |
| Figure trials | facing **forward, left, right, away**, and never looking: seen in every case, view never turned |
| Chapter Three replays in one session | **3** full playthroughs (the first and two more after every jump and Start over): same beats, nothing carried over |
| Captures | **73** in `docs/qa/chapter3-rebuild/` (gallery: `index.html`), inspected |
| Audio signal cases | **21** offline renders (signal checks only; nobody has listened) |

## What was run

**Simulation** (`tests/verify.mjs`: real modules and Three.js geometry, mocked renderer and DOM).
- The prologue, Chapter One and Chapter Two are played with inputs, as before. The same run continues through the rebuilt Chapter Three with inputs only (`tests/chapter3-sim.mjs`): riding, walking, looking, F where the prompt says, the recordings, the window, the neighbours, the end of Briarwood by day, home, the night ride down the old road, the outfall, the drain on foot, the old bike and its bell, the figure, following Jamie, the voices, the wait, the bell, the run, the remount, the ride out, the last four lines and the end card.
- The checks follow the story beat by beat: dialogue, objectives, phases in order; the tension curve (calm at home, rising down the road, peak at the bell); each road event said once; Jamie a few steps ahead and Sam a step or two behind in the drain; nobody lost or non-finite.
- Then the focused checks:
  - all 23 QA jumps, each landing in its phase with the right date and time of day and everyone where people can be;
  - all 15 checkpoints saved silently and returned to through Continue, labels known before they are reached;
  - Start over from six places leaving nothing of Chapter Three behind;
  - the figure from four facings and when never looked at;
  - the muted reactions (first bell, "Guys?", the close bell, the run);
  - captions for every sound that matters;
  - the randomized runs;
  - turning back in the drain;
  - getting off right beside a parked bike;
  - culling (deep in the drain only the drain is drawn; from the neighbourhood the drain never is).
- Chapter Three is then played twice more in the same page after all of that. The DEV selector's equivalence checks run last.

The Chapter Zero to Two regression is the same suite as before and passed in full: the four human-playtest fixes (fan and TV chatter, flag, hoops, old oak with its randomized sweep), the Chapter One and Two walkthroughs, jumps, checkpoints and Continue, and Chapter Two's "the morning is the same neighbourhood as the night". That check caught the first version of the zone culling, which toggled `visible`; culling now uses render layers.

**Browser** (Chromium 141.0.7390.37, ANGLE/SwiftShader). `tests/chapter3-browser-only.mjs` starts at Chapter Two's end. It checks the hand-over, then plays the whole of Chapter Three **with the sound off (M) and no QA jump**, and captures each beat. It also renders every QA jump, checks Continue from the title, renders a zoomed review view of the figure, measures the captions from the real frame over twelve backgrounds plus a sky-to-ground sweep, checks the captions setting, and renders the Chapter Three sounds offline. `npm run test:browser` runs the whole release suite, whose main walkthrough and two natural runs go from the prologue through Chapter Three's end card.

## Durations (scripted, direct; a person exploring will take longer)

| | |
|---|---:|
| Night ride, end of Briarwood to the outfall | 103 s |
| In the drain, entering to the run (walking at drain pace, every beat) | 3.7 min |
| The run out of the drain | 73.7 s |
| The ride out to the streetlight | 123.5 s |
| Distance to the figure when he is first seen | 24.9 m (82 ft) |
| The figure visible after being seen | 2.37 s |
| Chapter Three, all of it (scripted, game time) | 23.1 min |

The scripted run walks the shortest line at the drain's careful pace, so 3.7 minutes is a floor. Someone looking around, stopping at each sound and turning back once will be in the drain for the brief's five to ten minutes; that has not been measured with a person.

## Captions (measured from the rendered frame)

| Background | Words | Worst-case contrast | Opposite-tone edge | Mean luminance behind |
|---|---|---:|---:|---:|
| night asphalt | light | 12.91:1 | 0.28 | 0.0241 |
| day grass | light | 2.72:1 | 0.72 | 0.1738 |
| day field end of briarwood | light | 4.2:1 | 0.41 | 0.1682 |
| woods road night | light | 12.25:1 | 0.3 | 0.0174 |
| drain darkness | light | 19.12:1 | 0.29 | 0 |
| drain flashlight on the wall | light | 2.61:1 | 0.74 | 0.2014 |
| drain flashlight floor | light | 19:1 | 0.31 | 0.0003 |
| bright house siding | dark | 6.47:1 | 0.32 | 0.4187 |
| streetlight | light | 9.17:1 | 0.28 | 0.0446 |
| daylight sky | dark | 5.32:1 | 0.32 | 0.2839 |
| memory | light | 5.9:1 | 0.28 | 0.0494 |
| police lights | light | 12.38:1 | 0.28 | 0.0247 |

The sky → ground → sky sweep changed tone 1 time(s), never a flicker. Where contrast is below 3:1 the opposite-tone edge round each letter is strengthened (≥ 0.7).

## Audio (signal validation only)

| Case | Peak | RMS | Beats |
|---|---:|---:|---:|
| c3-heartbeat-calm | 0.0000 | 0.00000 |  |
| c3-heartbeat-uneasy | 0.0392 | 0.00557 | 21 |
| c3-heartbeat-afraid | 0.2445 | 0.03635 | 27 |
| c3-heartbeat-panic | 0.3316 | 0.05577 | 37 |
| c3-heartbeat-rising | 0.3337 | 0.04381 | 22 |
| c3-night-ambience-full | 0.0292 | 0.00332 |  |
| c3-night-ambience-gone | 0.0048 | 0.00100 |  |
| c3-bell-far-in-the-drain | 0.0102 | 0.00085 |  |
| c3-bell-clear-ahead | 0.0133 | 0.00111 |  |
| c3-bell-right-beside | 0.0510 | 0.00342 |  |
| c3-bell-far-behind-on-the-road | 0.0166 | 0.00122 |  |
| c3-voice-jamie-ahead-in-the-drain | 0.0130 | 0.00122 |  |
| c3-voice-guys-behind-in-the-drain | 0.0067 | 0.00043 |  |
| c3-recording-1 | 0.1124 | 0.01039 |  |
| c3-recording-2 | 0.0710 | 0.00519 |  |
| c3-recording-3 | 0.0452 | 0.00434 |  |
| c3-recording-4 | 0.0505 | 0.00366 |  |
| c3-recording-5-the-night-before | 0.1066 | 0.00609 |  |
| c3-old-bell-lever-click | 0.0065 | 0.00007 |  |
| c3-splash-behind-placeholder | 0.0245 | 0.00051 |  |
| c3-knock-up-the-shaft | 0.0337 | 0.00122 |  |

All 21 finite and unclipped (the calm heartbeat is silent, as intended).

Rendered offline (48 kHz, the game's own audio module driven frame by frame) in a plain Chromium instance of their own, with HRTF placement. A long software-rendered session once left Chromium's shared HRTF loader stuck, so the runner now separates these renders from the game session and keeps one tiny HRTF render alive for the stage; equal-power panning would be used, and recorded, if HRTF stalled.

**No perceptual listening has been done by anyone.** Every Chapter Three drain sound is a synthesized placeholder. The renders in `docs/qa/chapter3-rebuild/audio/` exist so that someone can listen.

## Performance

Static world: **2,505,240 triangles / 1,124 meshes** (structural pass: 1,813,219 / 986), under the 4,000,000 / 1,500 normal targets. The woods are about 106 merged meshes / ~706,000 triangles, the drain about 59 / ~45,000.

Per-frame submissions in Chapter Three captures (SwiftShader):

| Capture | Triangles | Draw calls | Active lights |
|---|---:|---:|---:|
| c3-00-chapter-three-card | 1,347,311 | 559 | 2 |
| c3-d01-briarwood-opening | 962,928 | 458 | 2 |
| c3-d02-alex-house-exterior | 1,139,975 | 436 | 2 |
| c3-d03-alex-mom | 1,101,144 | 377 | 2 |
| c3-d04-bedroom-first-person | 856,671 | 536 | 2 |
| c3-d06-window-to-the-creek | 647,291 | 322 | 2 |
| c3-d07-mr-okafor | 757,663 | 190 | 2 |
| c3-d08-end-of-briarwood-gate | 626,911 | 134 | 2 |
| c3-d09-tire-track-in-the-dust | 828,136 | 227 | 2 |
| c3-d10-the-road-into-the-woods | 619,465 | 171 | 2 |
| c3-n01-night-home | 881,484 | 370 | 4 |
| c3-n02-corner-at-night | 399,434 | 170 | 4 |
| c3-n03-end-of-briarwood-at-night | 577,388 | 114 | 6 |
| c3-n04-road-early | 461,509 | 85 | 6 |
| c3-n05-road-middle | 402,741 | 61 | 6 |
| c3-n06-road-deep | 477,722 | 65 | 6 |
| c3-n07-the-outfall | 645,906 | 182 | 6 |
| c3-n08-the-mouth | 652,713 | 193 | 6 |
| c3-n09-first-stretch | 572,723 | 144 | 8 |
| c3-n10-after-the-bend-no-way-out | 30,457 | 45 | 8 |
| c3-n11-footprints-in-the-silt | 39,543 | 54 | 8 |
| c3-n12-first-bell-they-freeze | 49,103 | 85 | 8 |
| c3-n13-the-bike-down-here | 32,229 | 68 | 8 |
| c3-n14-try-the-bell-click | 24,151 | 54 | 8 |
| c3-n15-the-boy-down-the-tunnel | 41,901 | 79 | 8 |
| c3-n16-the-bend-empty | 28,893 | 59 | 8 |
| c3-n17-search-wet-footprint | 31,277 | 62 | 8 |
| c3-n18-voice-ahead | 28,475 | 56 | 8 |
| c3-n19-voice-behind-they-turn | 28,475 | 56 | 8 |
| c3-n20-nothing-there | 26,584 | 65 | 8 |
| c3-n21-the-bell-beside-them | 26,992 | 66 | 8 |
| c3-n22-run-looking-back | 45,885 | 92 | 8 |
| c3-n23-back-on-the-bikes | 382,030 | 218 | 6 |
| c3-n24-flight-up-the-road | 714,803 | 173 | 6 |
| c3-n25-under-the-streetlight | 948,099 | 449 | 6 |
| c3-n26-chapter-three-end | 720,727 | 298 | 6 |
| c3-title-continue | 600,339 | 356 | 2 |
| c3-qa-figure-zoomed-for-review | 33,515 | 55 | 8 |

Peak in Chapter Three (outside the title card, which renders the street behind black): 1,139,975 triangles and 536 draw calls. In the drain: 24,151–49,103 triangles, 45–92 draw calls.

**Culling.**
- Deep in the drain only the drain's own batches are drawn and the view ends at 70 m. Inside it ends at 170 m; in the night woods past 200 m, 260 m.
- The drain is drawn only from inside it or within 95 m of the outfall, and never from the neighbourhood.
- The woods' batches are drawn within 280 m at night (420 m by day).
- Culling switches render layers, so a culled batch is neither drawn nor shadowed.

**Cost to earlier views.** Compared capture by capture with the structural pass's release-suite captures (335 views of Chapters 0–2): median change +0 draw calls / +0 triangles; largest increase +22 draw calls (astra-face-officer), largest triangle increase +432,425 (c2-15-morning-home); largest decrease -34 draw calls (polish-sign-04). Peak frame in the whole suite: natural-1-c2-11-police-flashlight (592 draw calls). Both natural runs (prologue to Chapter Three's end card, inputs only) reached the end card; their Chapter Three captures are in [qa/chapter3-rebuild/release-natural/](qa/chapter3-rebuild/release-natural/). Scene allocation including invisible objects: 2,321 mesh instances / 3,191,604 triangle instances (structural pass: 2,138 / 2,495,099; ceiling 6,000,000).

**The woods by day (a real cost).** 97 of these 335 views gain more than 50,000 triangles: views toward the end of Briarwood, the creek and the easement, which now also draw the new woods behind them (within 420 m by day, 280 m at night). They gain at most +432,425 triangles (a morning view) and +22 draw calls. Compared by eye with the earlier captures (c2-15-morning-home, c2-04-easement-at-night), the scenes are the same apart from a few more trees on the horizon by day; at night the extra trees are lost in the dark. The heaviest Chapter 0–2 frame went from 997,711 triangles (astra-sam-garage-side-exit) to 1,203,265 (c2-15-morning-home). Instanced or impostor far trees (Astra) would remove most of this; a tighter daytime cull would too, at the cost of trees appearing on the horizon.

**Build time (a real cost).** Built back to back on the same machine under the same load, the structural pass's world took 8.6–9.1 s and the rebuild's 13.7–15.4 s. That is about 60 % longer, some 5 s more before the title can start. Nearly all of it is baking the woods' ~4,100 trees, which reuse the neighbourhood's tree builder (several meshes each). Instanced far trees or a lighter far forest would win most of it back; that is left for Astra's art pass, with the woods' look. (The full simulation run reports 38,178 ms because several other jobs shared the machine.)

All rendering was **SwiftShader (software)**. **No real-GPU frame rate was measured, and none is claimed.**

## Visual review

Every Chapter Three capture was inspected (contact sheets and full size). Fixed as a result:
- The day tire track, its dust and the drain's tire line never rendered: their strips faced down and their materials were single-sided.
- With Jamie in your beam the drain round him was black: the flashlight now has a dim spill round its hotspot.
- The "T Flashlight" hint stayed on screen through the drain. (This one is shared code: the light is handed over already on in Chapter One as well, so there too the hint now goes after eight seconds of walking with the light on, instead of staying until T, which switched the light off. In the earlier capture of c2-04-easement-at-night the hint is on screen; now it is not. Nothing else in Chapters 0–2 is meant to look different.)
- The `c3-road-day` jump showed Chapter One's date.
- The test's outfall view looked into a companion; it is now taken on foot from the apron.

The browser and simulation runs also found:
- the branch on the night road repeating every six seconds;
- a player who could be boxed in by a friend's parked bike;
- a companion stopping dead behind the cruiser at Alex's curb;
- Jamie never taking his place at the drain mouth if he was still riding when you stepped off;
- the figure's position surviving Start over.

All are fixed and covered by checks.

## Reproduce

```sh
npm test                                                 # full simulation
QUICK=1 ONLY=chapter3 node tests/verify.mjs              # Chapter Three alone, from Chapter Two's end
QUICK=1 ONLY=chapter3 SKIPCHECKS=1 REPLAYS=3 node tests/verify.mjs   # the chapter three times in one page
QUICK=1 ONLY=dev node tests/verify.mjs                   # DEV selector equivalence
BROWSER_PATH=/path/to/chromium node tests/chapter3-browser-only.mjs
BROWSER_PATH=/path/to/chromium node tests/dev-chapters-browser.mjs
BROWSER_PATH=/path/to/chromium SOFTWARE_GL=1 QA_OUTPUT=/path/to/qa npm run test:browser
```

Machine-readable evidence:
- [simulation](qa/chapter3-rebuild/simulation-report.json)
- [Chapter Three browser](qa/chapter3-rebuild/chapter3-browser-report.json)
- [release browser suite](qa/chapter3-rebuild/release-suite-browser-report.json) (of its 479 captures, the two natural runs' 72 Chapter Three frames are committed in [release-natural/](qa/chapter3-rebuild/release-natural/))
- [DEV selector browser](qa/dev-chapters-rebuild/dev-chapters-browser-report.json)

Gallery: [qa/chapter3-rebuild/index.html](qa/chapter3-rebuild/index.html).

---


# Last Light — Chapter Three verification (structural pass)

Source: the frozen Chapter Two release, `codex/astra-chapter2-final-polish` at `68cc54396bdc2599cfa35b59ba6a4c981db6a8f3`. Branch: `claude/chapter3-horror-investigation`. Tested runtime: commit `38ff68d309c71a0d3a6d9568fefd7a615940ceae` (every later commit changes tests or documentation only); the runtime hashes in each report below match the committed `dist/` files.

| Gate | Result |
|---|---:|
| Full simulation / geometry suite (`npm test`, no `QUICK`) | **339 passed** (Chapter Two release: 230; +109 Chapter Three) |
| Chapter Three Chromium / WebGL / Web Audio pass (`tests/chapter3-browser-only.mjs`) | **77 passed** |
| Full release browser suite (`npm run test:browser`, SwiftShader) | **434 passed** (Chapter Two release: 311), 462 captures |
| JavaScript / console / shader errors | **0** |
| Chapter Three randomized runs (3 seeds) | **33 trials** (12 pond-road walks, 9 fence-gap entries, 12 escapes): 0 stuck |
| Old-oak randomized sweep (retained) | **120 trials**, 0 stuck (max departure 4.4 s, max final gap 2.3 m) |
| Chapter Three captures | **60** in `docs/qa/chapter3/` (gallery: `index.html`) |
| Chapter Three audio signal cases | **19 renders, 22 checks** (offline renders, signal checks only) |

## What was run

**Simulation** (`tests/verify.mjs`, real modules and Three.js geometry, mocked renderer/DOM). The prologue, Chapter One and Chapter Two are played with inputs exactly as before, and the same run continues through **Chapter Three** with inputs (`tests/chapter3-sim.mjs`): riding, walking with the heading, looking, F where the prompt says, the five recordings, the window, three neighbours, the pond road, the old bike and its bell, home, the night ride, the drive, the gate, through the fence, the basin, the culvert, turning toward the voice, running out. 35 checks follow the story beat by beat (dialogue order, objectives, phases in order, ambience order, tension curve, companions never lost or non-finite). Then 74 focused checks: all 20 QA jumps (15 sections + 5 aliases) and what each sets up; four jumps played on from where they land; all 14 checkpoints saved and returned to through Continue, and their labels known before they are reached; Start over from inside the room, at the close bell and during the escape, and a jump after the scare, each leaving nothing behind (no bells, voices or waits from before); the tension system (silent when calm, bounded rise, hold, slow decay, exertion); the heartbeat as scheduled audio events (no beats when calm, steady interval at steady tension, monotonic quickening with no jump over 8 % between beats, no catch-up bunching after a dropped frame, silence after reset, gain ceiling); bells, voices and recordings as audio graphs (HRTF placement, the culvert's filter and echoes, the dry close bell, a child's pitch rising like a question, recording lengths matching their captions, stopping a recording); in the game each voice once and one close bell; the caption tone logic (light on dark, dark on bright after a settle, no flicker under alternating lights, no flapping near the threshold, one change on a slow ramp, the faint glow only where the background is too mixed for either tone, a small readback strip, asynchronous pixel-pack readback that never blocks); seeded randomized runs.

The four human-playtest fixes of the Chapter One release remain covered (fan/TV chatter at 5 s, 15 min and 1 h: 4.49 turns/s each; flag; all 13 hoops; old oak, including the captured failing configuration and the 120-trial sweep).

**Browser** (Chromium 141.0.7390.37, ANGLE/SwiftShader software rendering). `tests/chapter3-browser-only.mjs` starts at the Chapter Two end checkpoint, checks the hand-over (no end menu), then plays the whole of Chapter Three with inputs and captures each beat; renders every QA jump; checks Continue from the title; renders the glimpse as a review-only view; measures the captions with the real frame readback over nine backgrounds and a sky-to-ground sweep; checks the captions setting; renders the Chapter Three sounds offline. `npm run test:browser` runs the whole release suite, in which the main walkthrough and both natural (no QA jump) runs now continue from the prologue through Chapter Three's end card.  In that run the main walkthrough and **both natural runs went from the prologue through Chapter Three's end card without a QA jump**, and every earlier gate passed again: the prologue, Chapter One and Chapter Two walkthroughs, jumps, lingering, Continue, the four playtest fixes, Chapter Two's caption checks (now checking the adaptive captions in the same eleven scenes), close-ups, sidewalks, curbs, signs, and 40 earlier audio cases (all finite and unclipped; maximum peak 0.14938, as before). Scene allocation including invisible objects: 2,138 mesh instances / 2,495,099 triangle instances (ceiling 6,000,000). Peak captured frame in the whole suite: 598 draw calls / 997,711 triangles (`astra-sam-garage-side-exit`, a Chapter One close-up; 561 there in the Chapter Two release). Its output went to a scratch folder, so the committed Chapter Two evidence in `docs/qa/` is unchanged.

## Captions (measured from the rendered frame)

| Background | Words | Worst-case contrast | Opposite-tone edge | Mean luminance behind |
|---|---|---:|---:|---:|
| night asphalt | light | 12.91:1 | 0.28 | 0.0241 |
| day grass | light | 2.72:1 | 0.72 | 0.1738 |
| culvert darkness | light | 12.1:1 | 0.28 | 0.0176 |
| flashlight hotspot | light | 14.98:1 | 0.29 | 0.0133 |
| bright house siding | dark | 6.47:1 | 0.32 | 0.4187 |
| streetlight | light | 18.38:1 | 0.28 | 0.0019 |
| daylight sky | dark | 5.32:1 | 0.47 | 0.2839 |
| memory | light | 9.22:1 | 0.28 | 0.0503 |
| police lights | light | 12.02:1 | 0.28 | 0.0269 |

Worst-case contrast is against the brightest (light words) or darkest (dark words) sixth of the strip behind the caption; where it is below 3:1 (a lit patch in a dark strip, mixed grass and shadow) the opposite-tone edge round each letter is strengthened (≥ 0.7). Where neither tone reaches 2:1, a faint opposite-tone glow eases in behind the line: in the walkthrough captures this happened twice, over Alex's mother in front of pale siding (glow 0.65) and over a flashlit shirt in the basin (0.86); it was absent everywhere else.

The sky → ground → sky sweep: 2 tone changes, at least 2.7 s apart (sky: dark words; houses and trees at the horizon: light; the sunlit ground straight down: dark), never a flicker. Turning captions off in Settings hides spoken captions; turning them on shows them.

## Audio (signal validation only)

19 offline renders (OfflineAudioContext, 48 kHz, the game's own audio module driven frame by frame), 22 checks: all finite and unclipped (calm heartbeat silent, as intended); heartbeat level and beat count grow with tension; the night with its layers gone is far quieter than the ordinary night; the close bell is louder than the culvert bell. The simulation adds the scheduling checks listed above.

| Case | Peak | RMS | Low-band onsets |
|---|---:|---:|---:|
| c3-heartbeat-calm | 0.0000 | 0.00000 |  |
| c3-heartbeat-uneasy | 0.0392 | 0.00557 | 21 |
| c3-heartbeat-afraid | 0.2445 | 0.03635 | 27 |
| c3-heartbeat-panic | 0.3316 | 0.05577 | 37 |
| c3-heartbeat-rising | 0.3337 | 0.04381 | 22 |
| c3-night-ambience-full | 0.0292 | 0.00332 |  |
| c3-night-ambience-gone | 0.0048 | 0.00100 |  |
| c3-bell-in-the-culvert | 0.0172 | 0.00133 |  |
| c3-bell-from-the-slope | 0.0215 | 0.00107 |  |
| c3-bell-right-behind | 0.0351 | 0.00254 |  |
| c3-voice-jamie-in-the-culvert | 0.0207 | 0.00188 |  |
| c3-voice-guys-behind | 0.0134 | 0.00080 |  |
| c3-recording-1 | 0.1124 | 0.01039 |  |
| c3-recording-2 | 0.0710 | 0.00519 |  |
| c3-recording-3 | 0.0452 | 0.00434 |  |
| c3-recording-4 | 0.0505 | 0.00366 |  |
| c3-recording-5-the-night-before | 0.1066 | 0.00609 |  |
| c3-old-bell-click | 0.0265 | 0.00052 |  |
| c3-chain-link | 0.0102 | 0.00022 |  |

**No perceptual listening has been done by anyone.** The renders in `docs/qa/chapter3/audio/` (24 kHz; bells and voices stereo) exist so that someone can.

## Performance

Static world: **1,813,219 triangles / 986 meshes** (Chapter Two release: 1,760,234 / 949), under the 4,000,000 / 1,500 normal targets. Per-frame submissions in representative Chapter Three captures:

| Capture | Triangles | Draw calls | Active lights |
|---|---:|---:|---:|
| c3-d01-briarwood-opening | 892,898 | 454 | 2 |
| c3-d03-alex-mom | 758,924 | 400 | 2 |
| c3-d04-bedroom-first-person | 919,204 | 540 | 2 |
| c3-d05-phone-recording-the-bell | 349,258 | 202 | 2 |
| c3-d06-bedroom-window-view | 806,362 | 383 | 2 |
| c3-d09-old-bike-at-the-gate | 646,221 | 328 | 2 |
| c3-n02-night-ride-briarwood | 334,299 | 180 | 5 |
| c3-n05-empty-gate | 589,235 | 303 | 6 |
| c3-n07-basin-flashlight-search | 776,132 | 304 | 6 |
| c3-n09-alex-voice-from-the-culvert | 667,749 | 271 | 6 |
| c3-n11-close-bell | 242,981 | 117 | 6 |
| c3-n13-safe-street | 498,444 | 271 | 6 |

Peak captured in Chapter Three: 919,204 triangles (`c3-d04-bedroom-first-person`) and 540 draw calls (`c3-d04-bedroom-first-person`). Inside Alex's room the frame still draws the street through his two windows (there is no occlusion or portal culling), which is why the room is the heaviest view; the room's own furniture is batched. Chapter Two's captured peak was 578 draw calls.

**Cost added to earlier views.** The pond road and basin are part of the world, so views whose frustum includes them pay for them even from Oak Hollow (there is no occlusion culling): compared frame by frame with the Chapter Two release's captures, the largest increases are about +42 draw calls and +53,000 triangles (for example `c1-01-ride-home-siren`). A distance or occlusion cull for the basin group is a cheap follow-up for Astra.

All rendering was **SwiftShader (software)**. **No real-GPU frame rate was measured, and none is claimed.** Static totals, scene allocation and per-frame submissions are different measurements.

## Visual review

All Chapter Three captures were inspected (contact sheets and full size). Fixed as a result: Chapter Three's per-run state now clears completely on Start over and replays (a second natural full-story run in the release suite counted bells from the first); the culvert wall's collision box lay across the basin instead of along the wall (a phantom barrier, and the wall itself walkable through); the gate-gap terrace had no way down past the wall's end (the wall's north wing is shorter and the bank slopes down round it); Alex's garage roof filled his side window (lower pitch); a stale caption readback after a jump chose dark words over a dark street (pending reads are discarded on reset); the bedroom review camera sat below the floor (test camera). Remaining roughness is listed in [ASTRA_CHAPTER3_HANDOFF.md](ASTRA_CHAPTER3_HANDOFF.md) §13; notably a nearby companion is over-exposed by the player's flashlight at night.

## Reproduce

```sh
npm test                                   # full simulation (about 5 minutes)
ONLY=chapter3 node tests/verify.mjs        # Chapter Three alone, from the Chapter Two end checkpoint
BROWSER_PATH=/path/to/chromium QA_OUTPUT=docs/qa/chapter3 node tests/chapter3-browser-only.mjs
BROWSER_PATH=/path/to/chromium SOFTWARE_GL=1 QA_OUTPUT=/path/to/qa npm run test:browser
```

Machine-readable evidence: [simulation](qa/chapter3/simulation-report.json), [Chapter Three browser](qa/chapter3/chapter3-browser-report.json), [full release browser suite](qa/chapter3/release-suite-browser-report.json) (its 462 captures are not committed; the Chapter Two release's `docs/qa/` captures are unchanged). Gallery: [qa/chapter3/index.html](qa/chapter3/index.html).

---

# Last Light — Chapter Two final verification

Source: `claude/optimistic-tesla-obxiv5` at `3384204a42872ad0d3592b6647441582cb48531b`. Tested implementation: `f9ef319d31b01f27a07ec8639c5db3106ce0f04f`, on `codex/astra-chapter2-final-polish`. All three reports contain identical runtime hashes that match all 41 committed `dist/` files. This report supersedes the structural-pass results retained in Git history.

| Gate | Result |
|---|---:|
| Full simulation / geometry suite | **230 passed** |
| Main Chromium / WebGL / Web Audio suite | **311 passed** |
| Supplemental morning navigation route | **10 passed** |
| JavaScript / console / shader errors | **0** |
| Continuous prologue → Chapter Two ending browser walkthroughs | **2 passed** |
| Rendered captures / contact sheets | **343 / 18** |
| Audio signal cases | **40 passed**, included in the browser total |

## Coverage and method

The full simulation loads real Three.js geometry and game modules with a mocked renderer/DOM. It retains prologue and Chapter One regressions, follows the Chapter Two story, and verifies bicycle/reflector continuity, evidence, culvert opening and navigation boundary, bell location, search, morning, memory and ending. All ten Chapter Two QA jumps and seven checkpoints are checked, including Continue labels, registration after reload and reset from within a memory.

Two complete browser walkthroughs render the real WebGL game and use movement, steering, look and interaction inputs from the prologue through the Chapter Two end card. Neither uses a QA jump within its run. The harness controls clock stepping; these are not real-time human playtests. The second run includes extra waiting, looking around, flashlight toggles, oblique walking, and leaving the memory corner before returning on foot. Separate fixtures exercise QA jumps, 150-second waits, wrong-way exploration, alternate bike approaches and title/Continue behavior.

Caption checks cover eleven story locations, sky and asphalt, and 1280 × 720 and 700 × 900 layouts. Toggling captions preserves navigation. The memory objective, distinct prompt, broad facing, one reminder and persistence after 14 seconds plus another 30 seconds are verified. The supplemental route starts at the morning-oak checkpoint, travels to Briarwood with inputs, confirms the objective and stopped-bike prompt, and starts the memory. Its nine frames document a scripted first-time-style review, not an uninformed human usability test.

The four prior playtest fixes remain covered: fan/chatter stability at 5 seconds, 15 minutes and one hour; flag orientation; all 13 hoops; and old-oak following. The added 120-trial seeded oak sweep varies starting position, heading, wait and turn direction. **No deadlocks:** maximum departure 4.4 seconds; maximum final gap 2.3 m. Randomized setup uses a fixture; departures use controls.

## Rendered review

All 18 refreshed contact sheets were inspected. Representative scenes/details were opened at full resolution: Chapter Two evidence, reflector, culvert/bell, police/Dad/tape, morning/flyer, memory glance, captions, navigation, faces, hands, flag and hoops. The gallery identifies diagnostic caption fixtures and the artificially lit daylight culvert view. Detached art cameras hide the intentionally headless first-person body; natural walkthroughs retain normal gameplay rendering.

Intermediate review corrected a sealed culvert aperture, water/terrain spikes, roof-cap gaps, floating dirt and flyer overflow. The final package uses the frozen runtime throughout. See the [visual gallery](qa/visual-review.html) and [450-file hash manifest](qa/manifest.json).

| Representative capture | Triangles | Draw calls | Active lights |
|---|---:|---:|---:|
| c2-02-same-creek-moments-later | 634,547 | 282 | 7 |
| c2-04-easement-at-night | 634,308 | 279 | 7 |
| c2-09-broken-reflector | 773,477 | 288 | 7 |
| c2-10-second-bell-culvert | 741,040 | 315 | 6 |
| c2-11-police-flashlight | 930,093 | 577 | 7 |
| c2-12-tape-adults-dad | 701,595 | 356 | 6 |
| c2-16-morning-street-search | 813,348 | 404 | 2 |
| c2-21-memory-alex-stops-and-looks | 753,625 | 347 | 2 |

## Performance and audio

Static world: **1,760,234 triangles / 949 meshes**, below the existing 4-million / 1,500 normal limits. Full scene allocation, including invisible objects: **1,899 mesh instances / 2,285,582 triangle instances**, 271,634,244 unique geometry-buffer bytes (259.1 MiB), 16 material textures. Peak captured draw calls: **578** in `natural-1-c2-11-police-flashlight` (930,501 triangles). Peak captured triangles: **955,683** in `angle-above-police`.

Chromium 141.0.7390.37 uses ANGLE/SwiftShader software rendering. **Real-GPU/laptop FPS was not measured.** Static world counts, total allocation and per-frame submissions are distinct measurements.

All 40 OfflineAudioContext cases are finite and unclipped; maximum absolute peak 0.14938. Cases include the fan, culvert bell/channel loops, police/night, morning and muffled memory. MP3 clips and the indexed reel were regenerated. **No perceptual listening has been done.** See [audio-review.html](qa/audio-review.html).

## Reproduce

```sh
npm test
BROWSER_PATH=/path/to/chromium SOFTWARE_GL=1 QA_OUTPUT=/path/to/qa npm run test:browser
BROWSER_PATH=/path/to/chromium QA_OUTPUT=/path/to/qa node tests/memory-usability-browser.mjs
```

Playwright must be available in the development environment. `QUICK=1` was not used for the final simulation. The simulation emits JSON to stdout; the browser runners write reports/captures into `QA_OUTPUT`.

Machine-readable evidence: [simulation](qa/simulation-report.json), [browser](qa/browser-report.json), [morning route](qa/memory-usability-report.json), [errors](qa/errors.json). See [ASTRA_CHAPTER2_FINAL_RELEASE.md](ASTRA_CHAPTER2_FINAL_RELEASE.md) for changes, revision identities and remaining limits.
