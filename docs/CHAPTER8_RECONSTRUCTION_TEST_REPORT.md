# Chapter Eight reconstruction: test report

Branch `claude/chapter8-major-reconstruction`. What was run, on what, and what it showed. **No human playtest has been
done.** Every result below is automated: scripted inputs in the project's headless test harness (`tests/verify.mjs`:
real Three.js scene graph and full game updates with a mocked WebGL renderer and DOM), and headless Chromium on
SwiftShader (software rendering on this container's CPU) for captures and measurements. Timings called "bot minutes"
are simulated game time taken by a scripted player that waits for every line of dialogue; they are not human times.

## 1. How to run it

```
ONLY=chapter8 FROMCARD=1 node tests/verify.mjs                  # Chapter Eight by input, from Chapter Seven's end card
ONLY=chapter8 FROMCARD=0 FROM=surface TO=street node tests/verify.mjs   # one stretch (segments: bikes field shaft gallery corridor
                                                                         #  wing retrieval alex reunion truth breach surface street
                                                                         #  staging op oak ride)
ONLY=chapter3|chapter4|chapter5|chapter6|chapter7|companions|dev node tests/verify.mjs   # the earlier chapters' own suites
QUICK=1 DEV_KNOWN=2/alex-bike node tests/verify.mjs              # the base suite (Prologue to Chapter Six, DEV selector)
node tests/chapter8-baseline.mjs   /  node tests/chapter8-after.mjs # the fifteen before/after captures
DEFS=tests/chapter8-street-defs.mjs node tests/chapter8-dev-shots.mjs   # street captures (also -finale-defs)
node tests/chapter8-perf.mjs                                     # per-moment cost on SwiftShader
```

## 2. Chapter Eight, played by input

**Chapter Eight from Chapter Seven's end card, by input, in one run: 35 checks passed, 0 failed**, ending on the Chapter
Eight card (`ONLY=chapter8 FROMCARD=1`, final code). Bot minutes by segment:

| bikes | field | shaft | gallery | corridor | wing (Sam) | retrieval (Jamie) | Alex | reunion | truth | breach | surface | street | staging | op | oak + walk | ride |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2.16 | 1.49 | 0.85 | 32.35 → **4.47** | 1.74 | 4.76 | 7.24 | 4.51 | 6.65 | 1.93 | 2.24 | 4.97 | 5.99 | 0.89 | 4.39 | 4.90 | 3.29 |

Along the way the scripted player was caught once in the gallery and once at the gates (both retried from their
checkpoints), and the chapter's own checks fail it on purpose at the barrier and the escape.

**The gallery number.** The draft's QA measured 31.6 bot minutes there; the first full run of this build measured
32.35. The game's stealth in the gallery is now bounded (Reyes draws the hunter off up the shaft once you have the
receipt and the film, or after 3.5 minutes), so a timeline was taken (`DEBUG8`): the hunter was gone after about four
minutes, and the rest was the scripted player's own sneak steps each running to their 150-second limit with nothing
hunting, and its hold on the projector not targeting it. With the bot fixed to walk and use things once nothing is
hunting (as a player would), the gallery is **4.47 bot minutes** (10 checks passed): the hunt starts at 1.1 min, one
catch and retry, the receipt at 2.1, the film done at 3.9, Reyes draws it off, the corridor door at 4.5. The other
segments above are from the run before that bot fix; they did not use the steps that were fixed except where a
hunter was gone, so they are, if anything, slightly long. The rescues (wing 4.8, retrieval 7.2, Alex 4.5) and the
reunion (6.7) are now each longer than the gallery, which is the balance the brief asked for. None of this is a
human time.

How this full run was reached: the first full run (before the fixes below) passed its first sections and then failed
from the crew room on, because arriving there by walking in from Alex's escape left you standing inside the crew
room's door when it shut (nowhere walkable: you could not move). Fixed in the scene, plus a chapter-wide safety net
(if the world changes under you and your spot is no longer walkable, after a moment you are moved to the nearest place
that is; it did not need to fire in the passing runs). The stretches were then re-run naturally (Alex → reunion: all
passed; breach → surface → street: 16 passed, 0 failed) before this full run.

Stretches run on their own while building (latest runs; all checks passed):

| Stretch | Checks | Bot minutes |
|---|---|---|
| surface → street (`FROM=surface TO=street`) | 15 passed, 0 failed (incl. the chapter's general checks) | surface 5.46, street 5.74 |
| operation → ride (`FROM=op TO=ride`) | 14 passed, 0 failed | op 4.09, oak + walk 4.90, ride 3.28 |

What the scripted player does in the rebuilt stretches (each is a `check` in `tests/chapter8-sim.mjs`):

- **Surface:** waits through the opening, walks down the drive, gets down behind the car in 1116's drive when the made
  thing comes (it fails you if it sees you first; the run's first attempts were caught until the beat was re-timed),
  walks the near lawns crouched with the light off past the trench while the second hunter searches the far side,
  holds F on Mrs. Pruitt's awning, walks on to the limb.
- **Street:** reaches in for Lily, walks her to the car, holds F on the jack, runs off the lawn when it heaves (staying
  on it fails you), goes to the side yard, runs at the hunter while it has Jamie, kneels, holds his hand, picks up his
  cap, walks south past the police car and the Kowalskis' to Summerfield.
- **Operation → end:** the gates, the drain gate, the ports, Line Two, the three pins (Brandt hurt at the last), the
  ladder; at the top lifts the lid with Sam (hold F) and pulls Alex out (hold F); at the oak sits, takes his hand, looks
  at Sam, stays, gets up; walks down past the trench to the bikes; rides to the look back; looks back; the end card.

Failures it can produce and recovers from: `c8-surface` (seen before you hide), `c8-trench` (seen on the near lawns),
`c8-garage` (on the lawn when it goes), plus the draft's own (`c8-barrier`, `c8-escape`, …); the chapter's checks also
fail you on purpose at the barrier and the escape and verify you come back to the right checkpoint.

## 3. DEV starts and the grief state

- All **49** DEV Chapter Eight scenes start in a Chapter Eight phase, on their feet, somewhere walkable (check
  `every DEV Chapter Eight scene starts (49 scenes)`).
- Entering after Jamie's death sets `C.grief.jamie`; entering the walk or the ride sets both (`griefFor`): measured on
  DEV entry to **The Last Ride**: grief `{jamie:true, alex:true}`, player grief level 1.0, Sam's crying weight 0.65
  within the first seconds (`after-finale/ride-sam.jpg`), the line "Two bikes." in the opening.
- The clock is set on every street entry (an early DEV capture showed 10:44 PM on the 26th; fixed).

## 4. Faces, emotion and sound

- **A bug that made all of it invisible was found and fixed:** Chapter Eight's reset switched off the shared character
  presentation (faces) and nothing turned it back on. Probed directly: Sam's face `enabled:false`, crying weight 0 while
  his expression was "crying". After the fix the same probe reads `enabled:true`, crying weight 0.83 → 0.97 over four
  seconds. The oak captures show tear tracks and red eyes (`after-finale/oak-sit.jpg`, `after/alex-death.jpg`).
- Crying, sobbing, sniffing, gasping and shaking-breath sounds exist (synthesized in `dist/audio.js`) and are triggered
  by the faces' state; the test harness counts the calls (`C.sounds`). **No one has listened to them.** The container
  has no audio output; audio quality, mix and whether they help or hurt the scenes are unverified.
- No voice acting exists; every line is a caption.

## 5. The sky, the skyline, the creatures, the destruction

Looked at in captures from the cul-de-sac, the Hendersons', Sam's and the south end (`after-street/sky-*.jpg`), and in the
walk and ride at dawn (`after-finale/walk-*.jpg`, `ride-*.jpg`). Creatures placed: two made things and the second hunter
together (`made-three.jpg`), a made thing up close (`made-grin.jpg`). The trench, the leaning house, the Kesslers' and
the Hendersons' yard persist through the walk and the ride (`walk-trench.jpg`, `ride-back.jpg`).

Creature count: at most 7 creature models (2–4 active at once in the street; the far ones only placed), plus the
chapter's own hunter; none simulated beyond a short route, a sight check and a rush, and the far ones update at a lower
rate. No path-search cost (they do not route; they walk set lines and rush, sliding along what they cannot cross).

## 6. Performance and memory (SwiftShader; not real hardware)

`tests/chapter8-perf.mjs`, one fresh headless Chromium per moment (1280×720, SwiftShader on this container's 4 CPUs).
`update` is the game's own per-frame JavaScript update (ms); `render` is SwiftShader's software rasterising (ms) and
says nothing about a GPU. 60 frames per moment after warming up.

| Moment | update median / p95 | render (software) median / p95 | draw calls | triangles | creatures shown |
|---|---|---|---|---|---|
| Title (before Chapter Eight) | 0.6 / 2.0 | 8.8 / 32.9 | 373 | 634,146 | 0 |
| The trench (street coming apart, second hunter, skyline) | 3.4 / 22.7 | 37.2 / 147.4 | 789 | 1,062,513 | 3 |
| The limb on the Kesslers' (all the street's pieces, fires, smoke) | 5.7 / 38.0 | 51.7 / 161.8 | 871 | 1,135,269 | 3 |
| The side yard (the hunter dragging Jamie) | 4.0 / 28.7 | 23.5 / 139.6 | 293 | 565,006 | 0 |
| Away from it (made things following, far fires) | 2.1 / 22.2 | 24.6 / 134.6 | 1,159 | 1,181,975 | 2 |
| The breach under the court | 1.0 / 16.1 | 7.9 / 59.8 | 206 | 202,924 | 0 |
| The oak (Alex) | 1.9 / 10.9 | 8.1 / 44.0 | 194 | 191,814 | 0 |
| The last ride (the wrecked street) | 1.6 / 5.4 | 14.1 / 50.0 | 966 | 867,391 | 0 |

All eight moments ran without errors or crashes (`docs/qa/chapter8-reconstruction/perf.json`).
What this does and does not say:
- The game's own update stays a few milliseconds per frame in the heaviest street moments, with p95 spikes of
  16–38 ms on this (shared, busy) container CPU. Spikes of that size would show as hitches on a slow machine; whether
  they happen on a real desktop was not measured.
- The street's heaviest moments draw about 0.8–1.2 thousand calls and over a million triangles. That is heavy for
  integrated graphics. **No frame rate on real hardware was measured.**
- **Memory.** The JS heap is about 1.15–1.25 GB in every moment, including the title. That is **not** new: the rejected
  draft's commit measured the same way gives 1109.8 MB at the title and 1114.4 MB at the street; this build 1140.3 MB
  and 1146.1 MB (about +30 MB). The game builds every chapter at load. Running several software-rendered browsers and
  full-game simulations at once exhausted this container's memory during testing (the kernel killed processes);
  measured one at a time, nothing crashed and the heap stayed flat in the side yard (no leak).
- Page load in headless SwiftShader: about 35 s (the draft: about the same).

## 7. Regression: the earlier chapters

Each earlier chapter's own suite, run on this build (exit code 0 = every check passed):

| Suite | Result | Wall time |
|---|---|---|
| `ONLY=chapter3` | 156 checks passed | 391 s |
| `ONLY=chapter4` | 35 checks passed | 119 s |
| `ONLY=chapter5` (incl. the repaired escape) | 81 checks passed | 199 s |
| `ONLY=chapter6` (incl. Gate 2B) | 80 checks passed | 197 s |
| `ONLY=chapter7` (incl. the hunter, the notebook and the end-card transition) | 94 checks passed | 287 s |
| `ONLY=companions` | 8 checks passed | 55 s |
| `ONLY=dev DEV_KNOWN=2/alex-bike` (DEV starts of every chapter vs natural arrival; switching) | 327 checks passed; one known difference reported | ~6 min |
| base (`QUICK=1`: Prologue to Chapter Six played through, then the DEV comparison) | BASE_RESULT | ~22 min |

**The known Chapter Two DEV difference (`2/alex-bike`) persists.** It is the scene-switching check: starting
`2/alex-bike` after other DEV scenes in one session leaves Alex's companion bike at a different place than a clean start
(`companions.1.b.x` −1.4 vs 115.139, `b.z` −17 vs −511.484, heading 0 vs −0.398). The same suite run on the rejected
draft's own commit (`c496d53`, in a separate worktree, without any change) fails with exactly the same numbers, so it
predates this work and is not caused by it. To keep it from hiding anything new, the DEV checks now take
`DEV_KNOWN=2/alex-bike`: a listed difference is printed and kept in the report instead of stopping the run, so every
scene compared after it and the switching and Start-over checks still run (they all pass). Without `DEV_KNOWN` the suites
still fail on it, as before.

Chapter Eight's own suite also enters Chapter Seven and Chapter Six afterwards and checks they start clean (no complex,
no ruin, no Alex companion; Chapter Six's drawdown gate demonstration), and that the earlier chapters' clues Chapter Eight
pays off still exist.

## 8. Captures inspected

All of `docs/qa/chapter8-reconstruction/after/`, `after-street/`, `after-finale/` were looked at one by one; the review
and the problems found by looking are in `docs/qa/chapter8-reconstruction/VISUAL_REVIEW.md`.

## 9. Not done / not verified

- A human playtest; a run on real hardware (frame rate, GPU memory); listening to the sound.
- The offline package and the hosted build are checked by opening them in headless Chromium (see §10), not by a person.

## 10. Package and hosted build

- **Offline package**: `PLAYTEST_CHAPTER=8 node tools/package-playtest.mjs <folder>`, built from commit `2f3a941`
  (clean tree; `dist/` identical to the last code commit `e92d191`, which the full run and the regression suites tested).
  One file, `Last-Light-Chapter8-Playtest.html` (9,712,582 bytes, SHA-256
  `31cb67a3abb53c2475456f84a34cf3ac0b454071ed6e4e2f8cd4d04d0bb42988`), 125 modules, plus `START-HERE.txt`, the
  licences and `manifest.json` (branch, commit, per-file source hashes). Zipped: `Last-Light-Chapter8-Reconstruction-
  Playtest.zip` (4,171,093 bytes, SHA-256 `131371908d6b5a74825ee2e302d34fb3265ccf7ec34dc34351cb917d9817b4e1`).
  `tests/chapter8-package-browser.mjs` opened it from disk in headless Chromium: **6 of 6 checks passed** (Chapter Eight
  entered through the real DEV controls; WebGL renders; the embedded creature loads without a server; later scenes
  start from their jumps; no HTTP(S) requests; no JavaScript errors), report in
  `docs/qa/chapter8-reconstruction/package-browser-report.json`.
- **Hosted build** (a private claude.ai artifact; only its owner can open it until it is shared): the same `dist/` files,
  with the one host-only change the earlier hosted builds also had (artifacts do not serve `.glb`, so the creature model
  is served as base64 text, `assets/creature/creature.glb.txt`, read by a host-only copy of `creature.js`; the
  repository's files are unchanged) and the page title "Last Light Chapter Eight". Checked before publishing by
  serving that exact set locally in headless Chromium: the DEV start of **The Last Ride** lands in the ride with both
  deaths' grief set, the creature loads, no errors. Not played through by a person.
