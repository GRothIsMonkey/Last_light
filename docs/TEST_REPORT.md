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
