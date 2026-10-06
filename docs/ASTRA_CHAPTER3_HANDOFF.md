# Last Light — Chapter Three structural handoff (for Astra)

> **On `claude/chapter3-horror-rebuild` this chapter's second half was rebuilt.** The pond road, basin, fence gap
> and culvert described below are gone; see [ASTRA_CHAPTER3_REBUILD_HANDOFF.md](ASTRA_CHAPTER3_REBUILD_HANDOFF.md).
> This document is kept as the structural pass's record.

This is the structural, gameplay and story pass for Chapter Three. It is **not** an art pass. Everything
here works and is tested; it is deliberately plain wherever art direction belongs to Astra.

## Source and branch

| | |
|---|---|
| Input branch | `codex/astra-chapter2-final-polish` (frozen; not modified) |
| Input SHA | `68cc54396bdc2599cfa35b59ba6a4c981db6a8f3` (Chapter Two final release) |
| Chapter Three branch | `claude/chapter3-horror-investigation` |
| Tested runtime | `38ff68d309c71a0d3a6d9568fefd7a615940ceae` — the last commit that changes `dist/`; later commits change tests and documentation only |
| History | Linear on top of the input SHA. No rebase, no merge to `main`; Chapter Two's release history and QA evidence are untouched (Chapter Three's evidence is in `docs/qa/chapter3/`). |

Serve `dist/` over HTTP as before. `?qa` exposes `window.lastLight`; `lastLight.jump(section)` starts at any
QA section below. **Continue** on the title returns to the last checkpoint reached.

## 1. What the player experiences

Chapter Two no longer ends on a menu. After "He heard it before he left." the picture goes black, a
quiet **CHAPTER THREE** card appears, and the same Briarwood corner returns a few minutes later
(August 22, 9:16 AM, bright late morning).

**Day.** Jamie: "If Alex heard it before he left…" — "Maybe yesterday wasn't the first time." They ride
to Alex's house. The search is still going (cruiser out front, flyers); his mother is tired and polite.
He kept asking if she heard a bike bell outside at night — Thursday, Friday, maybe Saturday. She thought
it was a neighbour kid. She lets them up to his room.

His room is an ordinary 2011 boy's bedroom you walk yourself. His flip phone is on the desk; the police
went through it and gave it back. Its voice recorder holds four ordinary recordings (Jamie and Sam
cracking up; a freewheel ticking down, "That's my new ringtone"; the TV downstairs; crickets, "Summer
night. Very exciting.") and then Saturday 08/20, 11:52 PM: his box fan, insects, a bike bell outside,
the bell again, and Alex, quietly: "There it is again." Then the bed creaks, footsteps, the blinds. From
his side window you look over the garage roof to the trees: "That's the creek. Behind the trees."

On his street the neighbours remember ordinary things (Mr. Huang wears earplugs; Mrs. Delaney blames
teenagers by the creek; Mr. Pruitt only noticed every dog on the street going nuts around midnight). Jamie suggests Mr. Okafor next door, whose yard goes way
back: he heard it too, a few nights, late, and tells them about the old **pond road**, the city's access
drive to the retention pond where "the big drain from the creek comes out".

The pond road runs between Alex's yard and Mr. Okafor's: cracked asphalt, chain-link both sides, a
chained gate, the detention basin beyond. **The old bike from the oak is leaning on the gate.** "The
bike. From the oak." — "You said it wasn't there." — Sam: "I said I didn't remember it." Up close it is
very old: rust, a cracked saddle, an old township bicycle-licence sticker (number 417, the year rubbed
off), the scratched initials. **Its bell does not ring**: the lever barely moves, a dull click. The grass
is flattened in two lanes and there is a tyre print in the mud: somebody wheeled it in, today. Jamie:
"We have to come back tonight." Sam refuses, then agrees: "If anything happens, we leave. Right away."
"Eleven. The corner. Bring a flashlight."

**Night (11:12 PM).** Home, dark; you go out. The same street at night, with its ordinary sounds:
crickets, katydids, distant traffic, a dog, an air conditioner, a TV, a sprinkler. Jamie and Sam at the
corner ("You came."). You ride past Alex's house (his window lit) to the pond road and walk in. Going
down it, the sounds go one layer at a time: traffic first, then the street's own noises, then the
insects; only the air is left. Sam: "Why'd everything stop?" At the gate **the bike is gone**. "It was
right here." — "Okay. I saw it this time."

After a silence, **one bell, far off**, from the direction of the culvert outlet. "Did you hear that?"
Objective: **Find where the bell came from.** Jamie finds the chain-link peeled back beside the gate.
Inside the basin a **second bell**, closer, from up the bank; then, three seconds later, from the far
corner. "It moved." — "Bells don't move." Jamie's light passes over the far fence now and then; if you
are looking there with a light on it, for 0.3 s at most there may be a small shape with a bike at the
edge of the light, 9–30 m away, never again (Sam: "What? What is it?" — "…Nothing. I thought…").

At the culvert mouth, after a long, empty wait: **Alex's ordinary voice, from deep inside the pipe:
"Jamie?"** Jamie answers; Sam backs away. Then, **from behind them, where nobody can be: "Guys?"** You
turn; there is nothing there. Silence. Then **the bell, right behind you**, a metre away. Nothing there
either. Sam and Jamie: run. **Run.** is yours to play: back through the fence, up the pond road. Jamie
and Sam run ahead but never leave you; there is no chaser and no further bell; the chain-link rattles as you
squeeze through and the gate chain clinks behind you. Out under the street light the night sounds come back. Hands on knees. "That was
him." — "No." — "You heard it. It said your name." — "I know." — "It was right behind us." They look back
at the dark gate; for a fraction of a second something small and red catches the light by the fence.
Fade. **LAST LIGHT / Chapter Three / August 22, 2011.**

Nothing is explained, nothing is seen clearly, no creature, no body, no notes. Chapter Four can go into
the tunnel.

## 2. State machine

`dist/chapter3.js` (`createChapter3(options, chapter1.kit, chapter2)`). Chapter One still runs the shared
systems (dialogue queue, objectives, companions, flashlights, cars, checkpoints) and hands phases to
Chapter Two, which hands every phase starting `c3-`, `d3-` or `n3-` to Chapter Three (`api.next`),
together with spots, sound sources, blockers, Start over and jumps. Transitions are explicit conditions,
not timers alone; every wait has a fallback so nothing can stall.

| Phase | What happens | Leaves when |
|---|---|---|
| `c3-black` | Black; CHAPTER THREE card. | timed (5.6 s) |
| `d3-corner` | The opening lines at the corner; checkpoint `chapter3-start`. **Go to Alex's house.** | dialogue |
| `d3-street` | Riding to Alex's. Arriving sets checkpoint `c3-alex-house`, **Talk to Alex's mom.** | F at his mom, or 7 s near her |
| `d3-mom` | Her lines; she invites them up. **Go up to Alex's room.** "Go inside" at the porch steps. | F at the door (fade) |
| `d3-room` | His room (nav room zone on, his window glass hidden from inside, muffled outdoors). Checkpoint `alex-bedroom`. | the phone noticed (near it, looked at, or 18 s) |
| `d3-phone` | "Listen to his recordings" → a close pose at the desk; F plays each recording in turn (Play / Next recording). Checkpoint `phone-recording`. | the fifth recording ends |
| `d3-window` | **Look out his window.** Standing at the side window looking out (1.1 s), the lines about the creek. | dialogue; then "Go back outside" at his door |
| `d3-neighbors` | Outside again; checkpoint `neighbor-investigation`. **Ask around near the creek.** F talks to each neighbour. After two, Jamie suggests Mr. Okafor. | Mr. Okafor tells them about the pond road |
| `d3-road` | **Find the old pond road.** On the drive: checkpoint `service-access-day`, **Follow it back.** | the old bike within 7 m, or in view within 16 m |
| `d3-oldbike` | The exchange about the oak; checkpoint `old-bike`. **Look at the bicycle.** F: a close pose (sticker); **Try the bell** (F, twice; Jamie tries it himself after 16 s); the flattened grass. | dialogue |
| `d3-plan` | Jamie's plan; Sam's refusal and conditions. **Go home.** | dialogue |
| `d3-home` | Walking away. | 15 m away or 45 s, then fade |
| `c3-night` | Black; "That night". | timed |
| `n3-home` | Home in the dark; checkpoint `night-start`; flashlight owned, off. **Meet Jamie and Sam at the corner.** | within 15 m of them |
| `n3-corner` | "You came." … | dialogue → `n3-ride`, **Go to the pond road.** (they ride with you) |
| `n3-ride` | Riding there. | at the drive mouth → `n3-drive`, **Go down the pond road.** |
| `n3-drive` | Walking down the drive; ambience dropout by distance; Sam's line when the insects have gone. If you run to the gate before that, the quiet is noticed first, at the gate. | at the gate (6.5 m from where the bike was), once the quiet line is said |
| `n3-gate` | The empty gate; checkpoint `service-access-night`. | 6.5 s of quiet after the lines → the first bell |
| `n3-bell` | The first bell (from 5 m inside the culvert); checkpoint `first-bell`. | dialogue → `n3-search`, **Find where the bell came from.** |
| `n3-search` | Through the fence gap (Jamie points it out after 14 s if needed). The second bell and its echo elsewhere (checkpoint `drainage-search`); the optional glimpse; the expectant wait at the outlet. | 4.5 s within 9.5 m of the outlet looking at it (or 9 s) |
| `n3-voice` | "Jamie?" from deep in the culvert; checkpoint `alex-voice`. | 3.4 s after the lines, looking at the outlet (or 7.5 s) → "Guys?" from behind → `n3-close` |
| `n3-close` | Silence while you turn. | 1.7 s after you face where the voice was (or 4.6 s) → the bell right behind you → `n3-run` |
| `n3-run` | **Run.** Checkpoint `escape`. Companion flight scripts; sprint drains slower (×0.42). | you are back on Briarwood (side street, v < 9) |
| `n3-safe` | Checkpoint `chapter3-end`; the closing lines, the red glint, the fade. | timed → `n3-end` → ending card |

`chapter3.state` (and `lastLight.state.chapter3`) exposes phase, flags, room/recording state, ambience
layers and depth, bells and voices heard (where and when), tension and glimpse state.

## 3. Geography: the pond road and the basin

Defined in `dist/layout.js` (`BASIN`) and built by `dist/basin.js`, in the Briarwood side-street frame
(u along the street, v across it). It is downstream of Chapter Two's easement: the big culvert under the
wooded rise comes out in the basin's west retaining wall.

* **Access drive** (u = 141.6, v 7.4 → 42.6): between Alex's house (u = 127) and Mr. Okafor's; cracked
  asphalt with gravel shoulders and weeds, chain-link both sides from v = 21; a NO PARKING / DRAINAGE
  ACCESS / PUBLIC WORKS sign at the mouth; a pole and transformer.
* **Gate** at v = 42 (posts u 139.65 and 142.2): chained double gate, padlock, faded DETENTION BASIN /
  KEEP OUT / WATER MAY RISE RAPIDLY sign. Beside it (u 142.2–143.55) the chain-link is peeled back from
  the corner post: the only way in on foot.
* **Basin** (fence u 138.8–166, v 42–64): flat bottom at y −1.5, 1:3 grass slopes, a long concrete
  retaining wall on the west (u = 146) with the box culvert's outlet (2.4 × 2.05 m, 6 m of visible
  depth, then dark), riprap apron, a concrete low-flow channel to an outlet riser with a trash rack, a
  staff gauge. Behind the wall a level terrace runs from the gate; round the wall's north end the bank
  comes down into the bowl (the way in and out).
* **Navigation:** the basin is its own nav zone (`basinNav`): walkable on the drive corridor and inside
  the fence; the wall and posts are solid; inside the culvert only the first step past the mouth. Bikes
  can be ridden down the drive as far as the gate.
* The older side-street lawn and far ground leave out cells under the basin (`bz.near`/`nearXZ`); the
  basin's own height patch covers them. Its reserved space keeps background trees and sheds out.

## 4. Alex's room and the phone

* `dist/alex-room.js` builds the room as real geometry inside Alex's house, behind his upstairs window
  (house-local x 0.95–5.5, z 0.5–4.45, floor 2.86 m): bed with rumpled comforter, nightstand with a red
  LED clock (9:47), desk under the front window (chair, notebook, pencils, game cases, lamp, coin jar),
  dresser with a small CRT and console, box fan by the side window, clothes, sneakers, backpack, red
  helmet, comics, basketball, posters (space shuttle LIFTOFF, BMX RIDE, a band, an August 2011
  calendar), corkboard, door. `dist/houses.js` cuts the two window openings through his front and side
  walls; his attached garage has a low-pitched front-gable roof so the side window sees over it.
* Inside, `nav.setRoom(zone)` makes the room its own walkable floor; his window glass (the lit pane seen
  from the street) is hidden; outdoor sound is muffled (`audio.indoors`). Leaving reverses all of it.
* The phone is a small open flip phone with a canvas screen (VOICE RECORDER, the list of five
  recordings with dates and lengths, the one selected or playing). Recordings play through `audio.recording(i)` (band-limited "phone speaker", faint
  hiss) with captions timed to the audio (`RECS` in `chapter3.js`): durations 8.6, 9.0, 8.2, 9.4 and
  23.5 s; in the last, the bells at 7.6 s and 11.2 s and "There it is again." at 14.6 s match their
  captions exactly (checked).

## 5. The old bike, its bell, the evidence

* `dist/old-bike.js` `makeOldBike()` is the **one build** of the old bike: the prologue ending (the bike
  that was not there at the oak) now uses it too, so it is literally the same model: same frame
  (0x7a8a6e), swept bars, 0.30 m wheels, saddle and grips, plus rust specks, a cracked saddle, a rusted
  bell (`bellColor`), the `OAK HOLLOW TWP.` licence sticker (No 0417, year rubbed off) and the scratched
  initials (`other-bike-initials`). The bell is a new visible detail on the prologue model.
* At the gate it leans on the chain-link (`d3-*` phases only; hidden at night).
* **Broken bell:** "Try the bell" (F) animates the lever a few degrees and stops; the sound is
  `sfx('oldBell')`: a dull rusted click, no ring. It can be tried twice; if you do not, Jamie does.
* **Evidence:** two lanes of flattened grass blades and a tyre print in the mud by the gate, visible
  only in the day.

## 6. Tension and heartbeat

`dist/tension.js` (`createTension()`), reusable by later chapters. One value, 0 (calm) to 1 (panic),
that **the story authors**: it is never computed from distances to anything.

* `set(target,{rise,fall,hold})`, `jolt(level,{rise,hold})`, `ease(level,{fall})`, `reset()`. Rising is an
  eased approach with a capped rate (per second); falling is a slow exponential decay after an optional
  hold. Per-frame change never exceeds the authored rise rate (the simulation checks every frame: max
  rate 2.0/s, at the close bell).
* `heart`: bpm 64 → 152 (`rest + span·x^1.25`), heartbeat level 0 until tension 0.2, full by 0.75;
  breathing from 0.42 (and with exertion). A sprint adds breath, and heartbeat only once already afraid.
* Authored curve (night, measured in the simulation playthrough): home 0.04 → pond road 0.14 →
  "everything stopped" 0.30 → bike gone 0.38 → first bell 0.52 → second bell 0.60–0.62 → waiting at the
  culvert 0.66 → "Jamie?" 0.84 → "Guys?" 0.93 → the bell behind 1.0 (held 30 s) → the street light eases
  toward 0.42 slowly. In the day only small rises (the recorded bell 0.24–0.31, the old bike 0.22).
* **Heartbeat audio** (`audio.updateBody`): two soft low thumps ("lub-dub", sine 52 / 60 Hz, low-passed)
  scheduled beat by beat on the audio clock, not a loop, so there is no seam. Beat-to-beat tempo change
  is limited to −7 %/+7.5 % however fast tension rises; a dropped frame never bunches beats; silence when
  calm. Its own bus; not placed in the world (it comes from you). Breathing: band-passed noise in/out.
* **Body:** on foot only, a few millimetres of chest rise with the breathing, and above 0.7 a faint
  sway. Nothing when calm.

## 7. Adaptive captions

`dist/captions.js` (`createCaptionTone`) replaces the charcoal caption box (`style.css`: `#subtitle` has
no background or border). Text is warm off-white (#fff4e2) over dark scenes and charcoal (#1e1d1b) over
bright ones, with a soft edge of the opposite tone that strengthens where the background is mixed.

* **Measurement:** after a frame is drawn, a small strip behind the caption (≤ 224 × 40 drawing-buffer
  pixels) is copied into a WebGL2 pixel-pack buffer, a fence is set, and the result is read a frame or
  two later when the fence has signalled: no full-frame read, no stall. At most ~4–5 reads a second.
  WebGL1 falls back to a small synchronous read every 0.5 s. Until a measurement arrives (or without
  WebGL) an estimate from the scene light and view pitch stands in. Start over / jumps discard any
  pending read (a stale measurement from the previous scene was found and fixed in browser QA).
* **Choice:** WCAG relative-luminance contrast of each tone against the worst part of the strip (15th /
  85th percentiles), with a fade overlay accounted for. Switching needs a 1.25× contrast advantage held
  for 0.55 s, and the colour eases (τ 0.32 s): no flicker from police lights, flashlights or foliage.
* Only where the strip is so mixed that neither tone reaches 2:1 (a flashlit shirt at night, a figure
  against pale siding) does a faint radial glow of the opposite tone ease in behind the line (and out
  again). It is never a box.
* The captions setting still hides spoken captions (checked in the browser). Chapter Two's caption test,
  which asserted the old charcoal box, now checks the adaptive captions in the same eleven scenes.

## 8. Audio events (all synthesized; nothing recorded)

| Event | How |
|---|---|
| Night ambience | Existing layers (cicadas, wind, traffic, crickets, katydids) plus Chapter Three loops (air conditioners, a TV, a sprinkler, the transformer hum, the culvert). `chapter3.amb` scales traffic / life / insects / wind 1 → 0 by depth down the drive (wind keeps 45 %), latched while in the basin, restored on the street. |
| Bells | `audio.bell3(pos, gain, {tunnel})`: the ordinary bell, placed with an HRTF `PannerNode` where available (stereo fallback). Bell 1: 5 m inside the culvert, low-passed with two short echoes. Bell 2: up the bank, then the far corner 2.8 s later. The close bell: 1.15 m behind the camera, dry. Each fires once. |
| Alex's voice | `audio.voice(word, pos, {tunnel})`: a small formant synthesizer (periodic-wave source through three formant filters, fricative noise), a 12-year-old's pitch (≈ 230–320 Hz), rising like a question. Not pitch-shifted or reverberated beyond the pipe. "Jamie?" from 11.5 m inside the pipe; "Guys?" from behind the player (the candidate point most opposite the view, ≥ 8 m away). |
| Recordings | Five, through a phone-speaker chain (see §4). |
| Short sounds | `oldBell` (rusted click), `fence` (chain-link shaken), `chain` (chain on a pipe gate), `blinds`, `thud`, a dog far off. |

## 9. Companions

Reused system; no new behaviour type. Changes:

* `chapter3.js` `match()` keeps Jamie and Sam riding when you ride and walking when you walk (they brake
  to a stop from any speed, get off, and come after you).
* Scripted scenes: positions for each beat, look targets, Sam's step back from the pipe, the escape
  flight (they run ahead, slow and look back if you lag, never leave you), hands on knees at the end.
* At the empty gate, whoever is behind walks up beside you before the first line (it waits up to 5 s).
* `companions.js`: a companion on foot pressed against an obstacle (a parked car, a fence end) may now
  step along it (±1.6 rad) instead of standing still. Found by the full-run simulation: Jamie and Sam
  wedged against a car parked outside Alex's at night. The car is also gone at night now (the police
  have left).
* Old oak deadlock: unchanged and still covered (120-trial sweep).

Also fixed late: Chapter Three's per-run state is cleared completely on Start over, jumps and replays
(the bells heard and several waits used to survive into a second playthrough in the same session).

## 10. Checkpoints and QA jumps

Checkpoints (silent; labels known before they are reached, so Continue works after a reload):
`chapter3-start` "Where he turned, later", `c3-alex-house` "Alex's house", `alex-bedroom` "Alex's room",
`phone-recording` "His recordings", `neighbor-investigation` "Asking around", `service-access-day` "The
pond road", `old-bike` "The old bike", `night-start` "That night", `service-access-night` "The gate, at
night", `first-bell` "The first bell", `drainage-search` "In the basin", `alex-voice` "In the dark",
`escape` "Run", `chapter3-end` "Briarwood, after".

QA jumps (`lastLight.jump`), with the phase each lands in:

| Jump | Phase | | Jump | Phase |
|---|---|---|---|---|
| `chapter3-start` | `d3-corner` | | `night-start` | `n3-home` |
| `c3-alex-house` (alias `alex-house-day`) | `d3-street` | | `old-bike-gone` (alias `service-access-night`) | `n3-gate` |
| `alex-bedroom` | `d3-room` | | `first-bell` | `n3-bell` |
| `recording` (alias `phone-recording`) | `d3-phone` | | `c3-second-bell` (alias `drainage-search`) | `n3-search` |
| `neighbors` (alias `neighbor-investigation`) | `d3-neighbors` | | `alex-voice` | `n3-voice` |
| `service-access-day` | `d3-road` | | `close-bell` | `n3-close` |
| `old-bike` | `d3-oldbike` | | `escape` | `n3-run` |
| | | | `chapter3-end` | `n3-safe` |

`alex-house` and `second-bell` already name Chapter One and Chapter Two sections and keep doing so;
Chapter Three's are `c3-alex-house` and `c3-second-bell`.

## 11. Verification

Full details and numbers: [TEST_REPORT.md](TEST_REPORT.md). In short:

* **Simulation** (`npm test`, real modules, mocked renderer): **339 passed** — the Chapter Two release's 230
  (prologue, Chapter One, Chapter Two, the four playtest fixes, geometry, world continuity) all still pass,
  plus 109 for Chapter Three: a 35-check input-driven playthrough from the Chapter Two hand-over to the
  Chapter Three card, and 74 focused checks (20 jumps, 14 checkpoints and Continue, Start over from
  inside and jump-after-jump leaving nothing behind, tension, heartbeat scheduling, bells/voices/recordings as audio graphs, caption logic and
  asynchronous readback, 33 seeded randomized runs of the pond road, the fence gap and the escape).
  `ONLY=chapter3 node tests/verify.mjs` runs Chapter Three alone in about a minute.
* **Browser** (Chromium, WebGL via SwiftShader, Web Audio): 77 checks in `tests/chapter3-browser-only.mjs`, 434 in the full release suite, 0 errors. The Chapter Three pass plays
  Chapter Three with inputs from the hand-over to the end card with a capture per beat, renders every
  jump, measures the captions over nine backgrounds with the real readback, checks the captions
  setting, and renders the new sounds offline. The release suite (`npm run test:browser`) now runs the
  main walkthrough and both natural (no QA jump) runs from the prologue through Chapter Three.
* **Old oak**: the 120-trial randomized sweep and the captured failing configuration still pass.
* **Not done**: no human playtest, no human listening, no real-GPU frame-rate measurement.

## 12. Performance

Static world: **1,813,219 triangles / 986 meshes** (Chapter Two release 1,760,234 / 949): the basin,
the drive and Alex's room add about 53,000 triangles and 37 meshes. Per-frame submissions for
representative Chapter Three views are in [TEST_REPORT.md](TEST_REPORT.md): street views 450 draw calls
or fewer, the basin at night about 270–300, the heaviest is inside Alex's room (the street is still
drawn through his two windows: no occlusion/portal culling; a candidate optimisation is to hide distant
exterior cells while `nav.room` is set). The basin also costs views that merely face it from afar:
compared with the Chapter Two release's captures, up to about +42 draw calls / +53,000 triangles (for
example Chapter One's ride home on Oak Hollow); a distance or occlusion cull for the basin is a cheap
follow-up. All measurements are SwiftShader software rendering; no real-GPU frame rate was measured.

## 13. Known roughness (for Astra)

Visual:
* Alex's room is furnished but plain: flat colours, box furniture, no textures on posters beyond simple
  canvas art, no clutter on the floor beyond a few items; ceiling light is a disc. The window glass from
  inside is a faint transparent pane.
* The flip phone and its screen are simple; the recording pose is functional, not composed.
* The basin is geometric: retaining wall joints and stains are thin boxes, riprap is spheres, the trash
  rack is bars, slopes are a height grid with a few grass clumps; no erosion, litter or water staining.
* Chain-link renders as a diamond lattice from the shared fence builder; the peeled-back flap is one
  bent panel.
* The old bike's rust/sticker are small decals; its lean against the gate could be more natural.
* The glimpse figure and bike are very simple silhouettes (on purpose barely seen).
* At night, the player's flashlight at close range over-exposes a companion's shirt (existing flashlight
  model; noticeable in the basin).
* Neighbours stand in place with one gesture each.

Audio:
* Everything is synthesized. The formant voice is a rough approximation of a boy's voice saying one
  word; it is intelligible as a name/question in context but is the weakest element. **A recorded or
  much better synthesized voice is the single biggest audio improvement available.** Only "Jamie",
  "guys", "again" and a few recording words exist.
* Recordings are impressionistic (a game show is filtered noise and applause bursts).
* The heartbeat is two filtered sine thumps; real-world playback level depends on headphones/speakers.
* **No human has listened to any of it.** All audio checks are signal checks (scheduling, levels,
  finiteness, clipping) and offline renders (`docs/qa/chapter3/audio/*.wav`).

## 14. What Astra should polish

1. Alex's room: materials, lighting (warm lamp, window light), posters/calendar art, lived-in clutter;
   make the desk/phone moment a composed shot.
2. The phone: model and screen typography; perhaps a hand holding it.
3. The basin and outlet at night: concrete materials, water and silt in the mouth, wet riprap,
   vegetation density on the slopes, the trash rack, a real chain-link material; the transformer pole.
4. The old bike: rust and decal materials, cracked saddle, the bell's corrosion, the lean at the gate.
5. Night readability: flashlight falloff on nearby characters; the street-light pool at the end.
6. Alex's voice (recorded or better synthesis) and a mix pass of the heartbeat, bells and recordings
   with real listening.
7. Companion acting in the scare: Sam's step back, the turn to "Guys?", the flight.
8. Captions: final type treatment; the opposite-tone edge and the mixed-background glow.

## 15. Chapter Four room

Left open on purpose: the culvert (now with a far end that is just dark), what moved the bike, the
red glint, the voice. Chapter Four can enter the tunnel. Nothing in Chapter Three explains anything.
