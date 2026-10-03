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
