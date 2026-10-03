# Last Light — Astra Chapter Two final polish

The Chapter Two polish is complete on `codex/astra-chapter2-final-polish`. The prologue, Chapter One, Claude's Chapter Two story, and their history remain intact. The implementation is frozen; the following commit contains documentation and refreshed QA evidence only.

| Revision | Identity |
|---|---|
| Claude Chapter Two source branch | `claude/optimistic-tesla-obxiv5` |
| Exact source commit | `3384204a42872ad0d3592b6647441582cb48531b` |
| Chapter One ancestor | `9c4b57698efeb7137de8a292b7662dac97a9a2d0` |
| Tested implementation commit | `f9ef319d31b01f27a07ec8639c5db3106ce0f04f` |
| Release branch | `codex/astra-chapter2-final-polish` |

The release commit is the commit containing this report. All 41 runtime-file hashes match the simulation, browser, morning-route report and [QA manifest](qa/manifest.json). The manifest identifies the implementation independently of this documentation commit. No Chapter Three content, merge to `main`, or hosting deployment is part of this release.

## Dialogue and morning navigation

Spoken captions use warm-white 22 px type, a compact charcoal backing, a separate speaker label and a short final fade. They remain enabled by default. **Show dialogue captions** affects spoken lines; objectives and interaction prompts stay visible. Captions were checked against the oak, dark road, police lights, both friends' houses, creek, easement, bike, search, bright morning and memory scenes, including sky/asphalt views and 1280 × 720 and 700 × 900 layouts.

The morning objective now says **Go back to where Alex turned.** Its persistent note is **Briarwood. Where he left us last night.** At the corner it becomes **Remember Alex leaving.**, with a distinct **F — Remember** prompt. The interaction works on foot or from a stopped bicycle without requiring precise facing. Looking away, lingering and returning do not consume it. After 12 seconds nearby, Jamie gives one reminder: “Try to remember exactly what he did.” The prompt remains after that line finishes.

An additional input-driven oak-to-Briarwood route checked the objective, six approach segments, the stopped-bike prompt and entry into the memory. Its nine screenshots are in the gallery. This is a scripted first-time-style review, not an independent test with an uninformed human participant.

## Environment, evidence and staging

- **Easement and culvert:** irregular tire tread, a pressed lane through bent weeds, channel seams, chipped headwall edges, runoff stains, aggregate, tide marks, interior collars and storm debris. The tunnel recedes into darkness. Geometry corrections keep its opening clear, continue the water/channel bed under the hill and close gaps around the roof cap. A daylight diagnostic supplements the actual night views.
- **Alex's bicycle:** the same recognizable prologue bicycle remains beside the culvert. Fine mud deposits follow the actual wheels and frame. A continuous chain and dropout hardware refine the shared bikes. The broken clip retains the matching jagged reflector sliver, and inspection aims at its actual mount.
- **Second bell:** the existing deep-culvert sound and story timing remain. Jamie and Sam turn toward the mouth with slightly staggered reactions, and Sam moves closer. The found bicycle does not ring.
- **Police, search and Dad:** tape sags between tied stakes; searchers pause and attend to specific places; flashlight cones settle toward evidence and people; Dad uses a restrained bracing gesture. These changes reuse the existing light budget. Visible beam cones are not all separate physical spotlights.
- **Morning:** clearer haze and restrained daylight preserve the same neighborhood. Neighbors face one another, a volunteer attends to a flyer, and taped missing-person notices carry a small illustrated likeness of the fictional Alex with readable, contained text.
- **Memory:** warmth comes from scene lighting, fog and exposure. Alex's coasting legs and torso support the glance toward the creek. The original memory sequence, return to the player's morning position and Chapter Two ending remain.

## Validation

| Gate | Final result |
|---|---:|
| Full simulation and geometry checks | **230 passed** |
| Chromium/WebGL/Web Audio checks | **311 passed** |
| Supplemental morning-route checks | **10 passed** |
| JavaScript, console and shader errors | **0** |
| Continuous prologue-to-Chapter-Two-ending browser runs | **2 passed** |
| Chapter Two QA jumps | **10 checked** |
| Chapter Two checkpoints / Continue labels and reload registration | **7 checked** |
| Randomized old-oak departure trials | **120 passed; 0 deadlocks** |
| Rendered captures / contact sheets | **343 / 18** |
| Audio signal cases, included in browser checks | **40 passed** |

The browser walkthroughs advance the real game clock and use movement, steering, look and interaction inputs. Neither uses a QA jump within its complete story run. The second adds lingering, turning around, oblique approaches, flashlight toggles and leaving the memory corner before returning on foot. The separate diagnostic, checkpoint and art captures do use QA jumps; they are not presented as natural walkthroughs.

Simulation covers the full geometry and story suite, all Chapter Two beats, memory restrictions, Continue, Start over from within a memory and replay reset. Browser checks cover the corresponding rendered progression, long waits, wrong-way travel, alternate approaches, title/Continue and UI settings. Existing prologue and Chapter One regression coverage remains.

Claude's four playtest fixes remain verified: stable fan/chatter behavior at 5 seconds, 15 minutes and one hour; upright outward-facing flag; all 13 correctly oriented hoops; and companions departing from the old oak. The added reproducible sweep uses four seeds and varies starting positions, headings, wait times and turn direction. The slowest departure was **4.4 seconds**; the largest final friend gap was **2.3 m**.

All 18 refreshed contact sheets were inspected, with full-resolution checks of representative Chapter Two scenes, captions, faces, hands, bicycle/reflector, flag, hoops, flashlight, tape, flyer and memory views. Intermediate art review corrected an accidentally sealed culvert aperture, water/terrain spikes, gaps around the culvert cap, detached wheel dirt and clipped flyer text. Final captures and reports come from the frozen implementation. No known progression blocker remains in this validation.

## Performance and audio limits

| Measurement | Result |
|---|---:|
| Static world triangles / meshes | **1,760,234 / 949** |
| Change from Claude Chapter Two | **+1,085 triangles / +1 mesh** |
| Maximum captured draw calls | **578** |
| Triangles in that frame (`natural-1-c2-11-police-flashlight`) | **930,501** |
| Maximum captured triangle count (`angle-above-police`) | **955,683** |
| Allocated scene mesh / triangle instances, including invisible objects | **1,899 / 2,285,582** |
| Unique geometry buffers | **271,634,244 bytes (259.1 MiB)** |
| Material textures | **16** |

Static geometry remains below the existing normal limits of 4 million triangles and 1,500 meshes. Those static limits are distinct from the full scene inventory, which includes hidden memory actors and alternate geometry. The browser is Chromium 141.0.7390.37 with ANGLE/SwiftShader software rendering. These are complexity and allocation measurements, **not a real-GPU frame-rate claim**; laptop/GPU FPS remains unmeasured.

All 40 OfflineAudioContext renders contain finite, non-clipping signals; the largest absolute peak is 0.14938. This includes fan, culvert bell/loops, police/night, morning and muffled memory cases. New MP3 listening copies, an indexed reel and an [audio review page](qa/audio-review.html) are provided. **No perceptual listening has been performed.** Tone, balance and fatigue still need a human listening pass.

## Evidence and reproduction

- [Test report](TEST_REPORT.md), [release history](RELEASE_NOTES.md), [visual gallery](qa/visual-review.html), [manifest](qa/manifest.json).
- [Simulation report](qa/simulation-report.json), [browser report](qa/browser-report.json), [morning-route report](qa/memory-usability-report.json).
- `npm test` runs the complete simulation suite; omit `QUICK=1` for final verification.
- `npm run test:browser` runs the main browser suite. `node tests/memory-usability-browser.mjs` runs the supplemental route. Both accept `BROWSER_PATH` and `QA_OUTPUT`; the main suite accepts `SOFTWARE_GL=1`.
- Serve `dist/` over HTTP to play. It remains editable, ready-to-serve source with no build step or remote runtime dependencies.

The earlier [structural handoff](ASTRA_CHAPTER2_HANDOFF.md) is retained as historical design documentation. This report supersedes its pending-polish notes and old morning-objective wording.
