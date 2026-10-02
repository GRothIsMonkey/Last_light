# Last Light — Chapter Two structural pass: verification

Input `codex/astra-chapter1-final-polish` at `9c4b57698efeb7137de8a292b7662dac97a9a2d0`; branch `claude/optimistic-tesla-obxiv5`. Both full reports below were recorded against the same `dist/` (their `runtimeHashes` are identical and match the committed files).

| Gate | Result |
|---|---:|
| Full simulation/geometry checks (`npm test`, `tests/verify.mjs`) | **226 passed** (Chapter One baseline: 156) |
| Browser/WebGL/Web Audio checks (`tests/browser.mjs`) | **238 passed** (baseline 184) |
| Rendered captures | **264** (baseline 219) |
| Audio signal cases | **40 passed** (baseline 35) |
| JavaScript / console / shader errors | **0** |
| Static world triangles | **1,759,149** (baseline 1,716,635) |
| Merged/static world meshes | **948** (baseline 935) |
| Scene mesh instances incl. invisible (memory cast, Chapter Two actors, LODs) | 1,888 |
| Scene triangle instances incl. invisible | 2,281,621 |
| Unique geometry buffers | 258.6 MiB |
| Renderer | Chromium 141.0.7390.37 / SwiftShader (software) |
| Real-GPU FPS | Not measured |

**What is covered**

* **Simulation.**
  * The full story, prologue → Chapter One → Chapter Two, played through with inputs (walking by
    heading and W, riding with the QA autopilot, F where prompted). Chapter Two alone takes 9.7
    minutes of game time.
  * 19 Chapter Two story checks: transition, disagreement, gap, evidence, bike, inspection, second
    bell, police, search, sent home, dawn, morning, oak, corner, memory, return, realization, end
    card, phase order.
  * 33 focused Chapter Two checks:
    * the found bike is Alex's prologue bike (geometry and colors)
    * reflector continuity
    * the bike's placement
    * the culvert is not explorable
    * the bell's position and tunnel graph
    * the police jump
    * morning world unchanged, plus daylight
    * search activity and flyers
    * old bike gone
    * companions riding again
    * memory limits
    * Start over from inside a memory
    * all 10 QA jumps, including the night and morning setup
    * all 7 checkpoints with Continue and labels after reload
  * 17 human-playtest regression checks.
* **Browser.**
  * The same story in Chromium/WebGL, continuing from the input-driven Chapter One run, with 24
    Chapter Two captures.
  * Every Chapter Two QA jump, lingering 150 s in four places, the wrong way at night, an alternate
    approach to the bike, sprint/jump/flashlight in the easement, Continue from a Chapter Two
    checkpoint.
  * Bug-fix captures (flag, curbside and garage hoops) and close-ups (the bike, the culvert mouth,
    neighbors, the empty place where the old bike was).
  * All Chapter One checks retained. The two natural Chapter One runs now end at the hand-over into
    Chapter Two.

**Old-oak follow:** the deterministic runs are in `simulation-report.json`
(`oak follow runs`). Natural leaving sets both friends off in 0.2–2.1 s; the captured failing
configuration in 2.3–4.0 s. A separate 120-trial randomized sweep had 0 stuck runs, with every
friend setting off within 2.8 s.

**Audio:** signal-only. Every clip is finite, unclipped and audible; new clips cover the culvert
bell, the culvert/channel loops, the fixed bedroom fan, the morning search and the muffled memory.
The fan/chatter fix is also checked over 5 s, 15 min and 1 h of simulated time. **No perceptual
listening has been done**; a person needs to listen ([audio review](qa/audio-review.html)).

**Rendered review:** the contact sheets and the Chapter Two frames were reviewed at full size for
structural mistakes. That review caught and fixed:

* evidence half-buried or blocky
* the bike buried in the channel slope
* friends standing inside the bike
* grass poking through the channel lining
* the officer's entrance accidentally disabled
* a volunteer's foot lifted onto a porch step
* an unreadable memory glance

This is not the art pass ([gallery](qa/visual-review.html)).

Representative rendered frames (1440 × 900, default medium quality):

| Capture | Triangles | Draw calls | Active lights |
|---|---:|---:|---:|
| c2-02-same-creek-moments-later | 632,414 | 286 | 8 |
| c2-04-easement-at-night | 632,175 | 283 | 6 |
| c2-06-flattened-weeds | 727,468 | 345 | 6 |
| c2-09-broken-reflector | 741,767 | 274 | 8 |
| c2-10-second-bell-culvert | 740,604 | 320 | 6 |
| c2-11-police-flashlight | 927,340 | 579 | 6 |
| c2-12-tape-adults-dad | 698,795 | 356 | 7 |
| c2-15-morning-home | 716,654 | 363 | 2 |
| c2-16-morning-street-search | 838,953 | 415 | 2 |
| c2-18-oak-morning | 99,447 | 150 | 2 |
| c2-19-briarwood-corner | 678,699 | 364 | 2 |
| c2-20-memory-evening | 851,293 | 478 | 2 |
| c2-21-memory-alex-stops-and-looks | 752,308 | 349 | 2 |
| c2-23-back-in-the-morning | 681,652 | 373 | 2 |

Heaviest frames this run: **angle-above-police** at 954,626 triangles, and **c2-11-police-flashlight** at 579 draw calls. Both are well inside the updated guidance (about 600–700k triangles and about 300 draw calls ordinary; about 4M triangles / 1500 meshes in the static world normal). The old 1.7M/900 limits are obsolete and are not treated as failures.

---

# Last Light — Astra Chapter One final verification

Input `claude/relaxed-heisenberg-gv002b` at `ed471c04b34bc083da10bdc876f20419246a08e6`; final branch `codex/astra-chapter1-final-polish`. Game/test commit `ec67022c9dfd99ede3d4de206b751e9fce93509a`. Both complete suites passed against the same runtime hashes. See [ASTRA_CHAPTER1_FINAL_RELEASE.md](ASTRA_CHAPTER1_FINAL_RELEASE.md) for changes and limits.

- **156 full simulation checks**, including the original world/prologue/story regressions, movement, stamina, jump, crouch, flashlight, Sam-first redirect and all six Continue checkpoints.
- **184 browser checks**, **219 rendered captures**, **35 audio signal cases**, **0 JavaScript/console/shader errors**.
- Two complete prologue-to-Chapter-One-ending runs and replay using normal movement/interaction inputs, with no QA jumps or coordinate placement inside those runs. The route controller uses authored coordinates, so this is not a blind human usability test.
- Existing 11 QA jumps, lingering, off-script travel, menu/settings, caption visibility, pointer lock, title, returning home/idle transition and reset coverage preserved.
- Companion formation range and per-step continuity/local player spacing; officer and Dad approach from curb, driveway and porch-side; supported climb and every sampled position along Jamie's new house-to-bike path; mother’s handset orientation; finite scene inventory.
- All final contact sheets plus high-risk full-size frames reviewed. [Gallery](qa/visual-review.html); [audio listening page](qa/audio-review.html).

Validated game/test commit: `ec67022c9dfd99ede3d4de206b751e9fce93509a`. The publication commit adds documentation and QA assets; the manifest's runtime hashes bind both full test reports to the exact shipped payload.

| Gate | Final result |
|---|---:|
| Full simulation/geometry checks | **156 passed** |
| Browser/WebGL/Web Audio checks | **184 passed** |
| Rendered gameplay/inspection captures | **219** |
| Audio signal cases | **35 passed** |
| JavaScript / console / shader errors | **0** |
| Static world triangles (excluding duplicate shadow proxies) | **1,716,635** |
| Merged/static world meshes | **935** |
| Scene triangle instances, including invisible dynamic objects/LODs | 2,006,303 |
| Unique geometry attribute/index buffers in the scene | 237.9 MiB |
| Renderer | 153.0.8010.0 / SwiftShader |
| Real-GPU FPS | Not measured |

Representative rendered frames, default medium quality:

| Capture | Triangles | Draw calls | Active lights |
|---|---:|---:|---:|
| 03-group-ride | 632,375 | 364 | 2 |
| c1-03-police-passing | 605,470 | 278 | 5 |
| c1-06-briarwood-police-scene | 414,715 | 301 | 4 |
| c1-09-jamie-window | 656,321 | 293 | 4 |
| astra-jamie-night-road | 769,980 | 450 | 4 |
| astra-sam-night-road | 342,096 | 189 | 4 |
| astra-sam-garage-side-exit | 901,283 | 549 | 4 |
| c1-17-creek-flashlight | 395,267 | 326 | 7 |
| astra-reflector-detail | 455,793 | 147 | 6 |
| astra-bell-look-toward-trees | 587,873 | 262 | 6 |

Across all captures: **71,673–912,204 triangles**, **57–549 draw calls**. Counts include inspection cameras, unusual angles, shadow passes and story close-ups; they are not a uniform gameplay benchmark. The Sam side-door view back along the street is a 549-call outlier, above the complex-scene guidance. Several broad neighborhood views also exceed the ordinary 300-call target. These remain a hardware-profiling limitation, not a claim of measured smooth performance. Static totals remain well inside the revised normal targets.

Night captures have **0 shadow-casting lights**; daytime uses one. Peak renderer allocations across captures: 1305 geometry objects, 15 textures, 73 programs. Buffer inventory is CPU attribute/index storage, including shadow proxies and alternate geometry; it is not measured GPU VRAM.

Evidence: [visual review gallery](qa/visual-review.html), 10 contact sheets, [audio review](qa/audio-review.html), and the two machine-readable test reports. Runtime SHA-256 hashes match between both tests and `dist/`.


## Reproduce

`npm test` runs the full suite. `BROWSER_PATH=/path/to/chromium SOFTWARE_GL=1 npm run test:browser` runs the rendered suite when Playwright is installed. Omit SOFTWARE_GL for your hardware-backed environment. `QA_OUTPUT` selects the output folder. `node tests/focused-browser.mjs` and `node tests/scene-browser.mjs` are targeted iteration runners; their counts are not added again to the final combined total.

The browser reports contain runtime hashes. Compare them to `docs/qa/manifest.json` before attributing this validation to a changed payload. Generated WAV files are reproducible and excluded from Git; compact MP3 listening copies and a reel are retained. No human listening, real-GPU FPS or cross-browser/touch validation is claimed.

---

## Historical verification below

The following reports describe earlier source states; their counts and old budget limits do not supersede the current report above.

# Last Light — Chapter One verification

Branch `claude/relaxed-heisenberg-gv002b`, based directly on `codex/astra-last-light-final-polish` at `9520b4f1d72759b27ac823671bdefae19ce27e55`. The baseline (102 simulation, 115 browser checks) was run before editing. See [ASTRA_CHAPTER1_HANDOFF.md](ASTRA_CHAPTER1_HANDOFF.md) for the change record and [qa/manifest.json](qa/manifest.json) for content hashes.

## Results

| Gate | Result |
|---|---|
| Simulation and geometry (`npm test`, full sweeps) | **136 passed** |
| Chromium / WebGL / Web Audio (`npm run test:browser`, SwiftShader) | **152 passed** |
| JavaScript, console and shader errors | **0 reported** |
| Rendered captures | **171** (43 for Chapter One: story beats, every QA jump, lingering, unusual angles) |
| Audio signal cases | **34 passed** (11 new night sounds): finite, non-silent, peak below 0.95 |
| Full Chapter One playthrough, by autopilot, in both suites | Passed |
| QA jumps (11), Continue, lingering, riding off script, replay from mid-chapter | Passed |

Machine-readable evidence: [simulation-report.json](qa/simulation-report.json), [browser-report.json](qa/browser-report.json), [errors.json](qa/errors.json).

## Chapter One coverage

**The simulation suite** (`tests/verify.mjs`) rides Go home into the chapter and on through it with an autopilot that presses W and A/D. Walking places the walker where a player would stand. It checks:
- the transition: both last memory lines, including “I thought I remembered everyone.”, the chalk plain in the fade, and the ride home resuming at d ≈ 840;
- 20–40 s of quiet before the siren (measured: **25.2 s**);
- the police car passing you after you cross Briarwood (measured: at d 538.4, **4.46 m** away, never over 15 m/s), braking and turning onto Briarwood behind you;
- your head following the car, the siren going quiet before the title, the title card coming and going, then the objective;
- every line of the officer conversation as written, and Alex's bike absent with the garage hook empty;
- the Jamie window sequence (joke, then concern), his window closed again, and Jamie riding with you;
- Sam's window via pebbles, his big garage door staying shut, and his exit through the side door with his bike;
- the oak memory lines;
- the companions never hidden and never left behind on the retrace;
- the police stop, the creek and the reflector prompt;
- “That’s his.” / “Why would he come back here?” as the last lines, then the end card;
- every phase in order, and no non-finite positions anywhere.

**Separately, the simulation suite checks:**
- all 11 QA jumps land in their phase with the night set up;
- checkpoints are saved silently, and Continue appears only in the title menu;
- 90 s lingering on Briarwood starts nothing;
- riding away when the siren starts: the car still arrives and the title still comes;
- replay from mid-chapter restores the prologue completely.

**The prologue checks are kept and updated:**
- Alex leaves first and out of sight: when he goes, his position is outside the view frustum and occluded, at 147.7 m;
- Jamie and Sam still go home believably;
- the idle fade now wakes into the ride home.

**The browser suite** (`tests/browser.mjs`):
- plays the same natural route from Go home, with captures at each beat (`qa/c1-*.jpg`);
- renders every QA jump (`qa-jump-*`), 150 s lingering in four places (`linger-*`), and unusual angles: up, down, behind, and above the police scene and the creek (`angle-*`);
- checks Continue on the title;
- records the night's synthesized sounds (`qa/audio/*.mp3`, [audio-review.html](qa/audio-review.html)).

## Measurements

| Measurement | Result |
|---|---:|
| Full world triangles | 1,676,763 (limit 1.7 M) |
| Merged world meshes | 897 (limit 900) |
| World build | about 6 s (mocked renderer, Node) |
| Draw calls, all captured views | 58–462 |
| Draw calls, Chapter One views | at most about 430 |
| Triangles, Chapter One views | at most about 780 k |

## Not covered

- Real-GPU frame rate.
- Touch devices and non-Chromium browsers.
- Human playtesting.
- Perceptual listening: nobody has listened to the sounds.

Rendered review was of representative frames at full size during development, not a full contact-sheet pass.

---

# Earlier: final polish verification (historical)


Release branch: `codex/astra-last-light-final-polish`, directly descended from Claude's `59c647220e80d12da0d205b1562d483cc5bdb7f3`. See [ASTRA_FINAL_RELEASE.md](ASTRA_FINAL_RELEASE.md) for changes and [qa/manifest.json](qa/manifest.json) for the exact verified content hashes. The baseline passed 92 simulation and 84 browser checks before editing.

## Results

| Gate | Result |
|---|---|
| Simulation and geometry | **102 passed** |
| Chromium / WebGL / Web Audio | **115 passed** |
| JavaScript, console and shader errors | **0 reported** |
| Rendered captures | **130**: 129 at 1440 × 900, one title at 1280 × 720 |
| Audio signal cases | **23 passed**: finite, nonzero, peak below 0.95 |
| Returning-home and idle endings | Passed |
| Replay / return to title | Passed |
| Whitespace / patch integrity | `git diff --check` passed |

Machine-readable evidence: [simulation-report.json](qa/simulation-report.json), [browser-report.json](qa/browser-report.json), [errors.json](qa/errors.json). No mocked-renderer check is presented as a browser render or hardware benchmark.

## Simulation coverage

`node tests/verify.mjs` (the implementation of `npm test`) loads the actual game modules and Three.js geometry with a mocked DOM and WebGL renderer. The full run includes the slow geometry sweeps; `QUICK=1` is not the release gate.

- Route continuity, roof/asphalt orientation, extended neighborhood and horizon coverage, both side streets and populated backgrounds.
- Closed shells on 22 sampled houses, windows on all 28 sampled open side walls, inward-opening front doors, garage depth and clear entrances.
- Ground-height rays at navigable locations, excluding solid obstacle footprints such as tree bases. The existing 6 cm tolerance remains; the measured maximum is 3.7 cm. This avoids treating a non-navigable tree surface as walking ground.
- Clear sidewalks, driveway cuts, tree placement, anchored sagging power spans and house drops, and static geometry limits.
- Bike style differences, full crank cycles, hand/grip and pedal IK, fixed limb lengths, walking contact, first-person body visibility and head shadow handling.
- Title/settings persistence, pause, pointer-lock fallback, head-look limits, bounded speed/steering, fatigue, individual friend surge timing and formation recovery.
- Two full story runs, all departures, open/close sequences, neighborhood reset, reflection scheduling and caption settings.
- Walking, swing, bench, chalk, distant call, returning home, idle fade, ending freeze and replay.
- New regressions: both visible sidewalk edges, blocked yards, left/right curb ascent/descent with both wheels, bounded lateral motion, speed-scaled impacts and settling, individual grounded stopping feet, actual bell wrist/lever movement, added clue/contact reset and utility-pole clearance around signs.

## Browser and rendered review

Command: `QA_OUTPUT=docs/qa BROWSER_PATH=<chromium> SOFTWARE_GL=1 npm run test:browser`.

Chromium **153.0.8010.0**, ANGLE/SwiftShader. Playwright drives the real page through keyboard input, pointer lock and deterministic `?qa` stepping. Tests cover real shaders, audio initialization from a user gesture, title panels, pause/settings, pushing, both ending paths and replay. Diagnostic cameras and placements are used for close-up geometry and contact inspection; they are not all normal gameplay viewpoints.

The 130 captures were reviewed using contact sheets, with full-size inspection of representative views and the reported problem areas. Coverage includes:

- title, controls, settings, credits, pause, contextual prompts and ending card;
- main ride, changing evening light, four-frame pedaling/surge/departure sequences;
- first-person steering, braking, hard pedaling, stopping, dismount/remount and bell before/press/return;
- front/side friend portraits, mother, all three stopping poses and key house entrances;
- six house types from front corner, side and back corner, street gaps, yards, junctions and lookout;
- every printed sign face, including both directions of street-name blades;
- eight curb cases: left/right, up/down, slow/normal, each asserting front and rear contact;
- swing, bench, chalk, AR, oak carving, old bike, fifth chalk child and Go home prompt.

The last review caught utility-pole occlusion at Summerfield and an asynchronous resize clearing the laptop QA canvas. Sign placement now selects a clear location along the same curb arc, protected by a regression check. The laptop capture waits for the actual resize. Gameplay overlays are hidden on the title to avoid their fade-out appearing over the menu. Earlier review also corrected sign texture mixing/post overlap, cable joins and garment shoulder gaps.

There is no independent human playtest, exhaustive resolution matrix, physical touch-device test or non-Chromium certification in this report.

## Measured behavior and budget

| Measurement | Final result |
|---|---:|
| Full world triangles | 1,621,465 |
| Merged world meshes | 893 |
| Existing budget | <1,700,000 triangles / <900 meshes |
| Uninterrupted W-held ride | 240 s |
| Full interaction test playthrough | 4.91 min |
| Ride plus idle finale | approximately 5.8 min |
| Maximum push speed | 6.27 m/s |
| Slowest remaining friend during departures | 4.23 m/s |
| Largest friend movement per simulated frame | 0.267 m |
| Maximum hand/grip error | 0.0164 m |
| Maximum pedal-target error | 0 m in sampled crank cycles |
| Maximum navigable ground mismatch | 0.037 m |
| Pole spans / house drops | 114 / 41 |
| Level horizon / gap backdrop coverage | 96.9% / 100% |

Per-view render ranges and world-build time are recorded in the manifest from the final reports. Submitted triangles include shadow work and depend on camera direction; total static-world triangles count all cells. The budget is close enough to its mesh limit that future material additions should be measured.

Static geometry remains merged by spatial cell/material, with distant unshadowed content and culling. Texture identity is now part of the material key. Quality settings still control pixel ratio and shadow resolution. SwiftShader validates rendering, but its frame rate does not establish real laptop/GPU performance; no hardware FPS claim is made.

## Audio

Real OfflineAudioContext renders cover pedaling/rolling, grass, coasting, steps, bell, curb, sprinkler, ball/rim, doors, garage, bicycle drop, kickstand, car, dog, swing, birds, call, early/late ambience and ending chord. All 23 clips are finite, nonzero and unclipped under the signal gate. Peak, RMS and maximum adjacent-sample jump are retained in the browser report.

The [audio review page](qa/audio-review.html), individual MP3s and combined reel are refreshed from those renders. No perceptual listening verdict is claimed. In particular, the call remains synthesized rather than recorded voice acting. Signal checks cannot establish emotional tone, realism or the absence of distracting artifacts.

## Remaining limits

- Perceptual audio review, real-GPU FPS and physical mobile performance are unverified.
- Art is stylized procedural geometry. Close-up anatomy, hair, joints and distant houses remain simplified.
- Fine original chalk and the small bicycle AR mark are angle/resolution dependent.
- Side streets are scenery beyond their rideable mouths; deep lawns remain blocked.
- Outside-player QA cameras can show the intentionally hidden first-person head; the in-game camera cannot.

These limits are recorded alongside the completed scoped polish release. Historical structural findings remain in [ASTRA_HANDOFF.md](ASTRA_HANDOFF.md) and Git history.
