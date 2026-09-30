# Last Light — final polish verification

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
