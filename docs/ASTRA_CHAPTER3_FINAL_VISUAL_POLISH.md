# Chapter Three — Astra visual polish

## Provenance and scope

- Repository: `GRothIsMonkey/Last_light`.
- Accepted source: `claude/chapter3-creature-chase` at **`6edcad0bb44426ba29da61fd83d2f35cc94fad5c`**.
- Work branch: **`codex/astra-chapter3-final-polish`**. The source branch and `main` are not modified or merged.
- Final runtime commit: **`797bf62382d5ad5760d13ecb1a4d70eb73cb1a38`**. Subsequent commits contain QA and documentation only. The delivered branch tip is obtained with `git rev-parse HEAD`; the delivery message records that exact SHA. An enclosing commit cannot embed its own hash.
- Runtime commits: `dabd63a` (environment/material foundation), `98ba16f` (characters, props, lighting, presentation and culling), `797bf62` (caption backing fix).
- Review/regression harness commit: `61b4177`; reviewed art and focused regression evidence: `2ee6aa0`; interruption-safe walkthrough checkpoints: `7b6c66e`; software-renderer capture deadlines: `eb18002`; final-runtime simulation and complete hand-over browser suite: `90eb6c0`. The final QA/documentation commit adds the DEV evidence and a manifest/evidence validation command.

This pass improves the existing Chapter Three, not its structure. No new story, characters, lore, Chapter Four, tunnel routes, chase phases, ending, or audio production. Existing controls, clue identities, interaction bounds, navigation dimensions, saves, chase timings and DEV scene starts are retained.

Changed runtime files: `dist/art-surfaces.js`, `dist/materials.js`, `dist/alex-room.js`, `dist/houses.js`, `dist/vegetation.js`, `dist/woods.js`, `dist/drain.js`, `dist/world.js`, `dist/chapter3-art.js`, `dist/chapter3-props.js`, `dist/game.js`, `dist/chapter3.js`, and `dist/captions.js`. New tests: `tests/chapter3-art-review.mjs`, `tests/chapter3-art-regression.mjs`, `tests/caption-backing.mjs`, `tests/chapter3-caption-wall.mjs`, and `tests/chapter3-evidence-check.mjs`. The existing `tests/chapter3-browser-only.mjs` also gains verified walkthrough checkpoints; it and `tests/dev-chapters-browser.mjs` allow longer screenshot completion on SwiftShader. This report, `TEST_REPORT.md`, `RELEASE_NOTES.md` and the `docs/qa/chapter3-astra-*` evidence are the documentation changes. Use `git diff --name-status 6edcad0bb44426ba29da61fd83d2f35cc94fad5c HEAD` for the complete capture-level file list.

## Visual priorities and changes

The priority was to make close-view surfaces and objects feel constructed and used, improve the transition from the ordinary daytime house to the drain, and retain enough light to read the pursuit without turning the drain into a bright corridor. This remains a procedural, stylized game; it is not a photoreal character rebuild.

See the [source/Astra visual comparison](qa/chapter3-astra-comparison.jpg) for matching bedroom, forest and old-bike views.

| Area | Implemented change |
|---|---|
| Material foundation | World-space, metre-scaled surface recipes for plaster, carpet, textile, wood, bark, road, mineral/concrete, leaf litter, painted siding, roof, lawn, oxidized metal and shallow water. Derivative filtering fades fine detail at distance. Existing shader hooks are composed, not discarded. |
| Alex's house and suburb | Chapter Three-only weathering of the original siding, roof, paving and grass palettes; hose reel, doorbell, drainage splashblocks and gutter/corner hardware at Alex's house. Original suburb layout and architectural identity retained. |
| Bedroom | Draped bedding with folds and hems, cloth clothes/jeans, carpet/plaster/wood finishes, refined chair/casters, rounded ceiling light, fan grille, shoe laces, drawers/outlets/door details, and raised controller controls. Window key and sky-bounce lights are attached only while in the room. |
| Phone and helmet | Rounded flip-phone shell, hinge, controls and earpiece; original recorder and screen interaction retained. Room/tunnel helmet shares the same red shell/stripe identity, now smoother with inner foam, pads, straps and buckle. |
| NPCs | Fabric response on mom and the existing neighbours, plus ground contact. No new NPCs, dialogue, face rigs or bespoke acting system. |
| Jamie and Sam | Smoother, differentiated heads and hair/cap profiles; readable facial details; tapered shirt geometry, collars, hems and pocket/seam details; textile surfaces; restrained, differently phased breathing/head-roll layered over the accepted animation. No replacement locomotion, IK, voice or facial performance. |
| Bicycles | Smoother tyres/rims, Sam's tread, seat rails, brake hardware and bottom brackets. Existing fit, grip/pedal reach, wheel contacts, riding and remount logic retained. |
| Old bike | Sage colour/identity retained; faded paint chips, restrained oxidation, dirty chain links, stitched saddle, detailed broken bell, rougher materials and hardware. Existing scratches/clue, catch-light behaviour and relocation preserved. |
| Access road | Worn aggregate response, irregular softer ruts, leaf interruptions and less ruler-like shoulders. Route shape and colliders unchanged. |
| Forest | Branching near pines and leaf-card canopies instead of the largest simple cones/blobs, richer bark/roots and shrubs, more varied leaf texture and ground litter. Distant simplified foliage remains; this is not a new streaming vegetation engine. |
| Portal and tunnel | Concrete pores, board-form traces, runoff/dampness, mineral variation, ties, bolt hardware, irregular spalls/rebar and physical gate hinges/latch/anchors. Existing openings, route, bend positions and chase gate mechanics retained. |
| Water | Muted shallow muddy water, bounded transparency, no depth writing, small irregular animated ripples/normal detail; avoids the early prototype's evenly striped water. Not screen-space reflections, refraction or fluid simulation. |
| Flashlight and exposure | Neutralized drain torch, broader low-level spill and reduced close-person blowout. Slightly more retained ambient detail with lower exposure compensation. Darkness and distance still obscure the tunnel; it is not uniformly illuminated. |
| Alex-like lure | The existing human figure gets Alex's refined head and shirt silhouette and a ground contact. Human scale, clothes, blocking, reveal rules and final road withdrawal remain unchanged. No monster features added. |
| Creature integration | Ground-contact shadow and improved surrounding light/materials. Model, textures, skeleton, original/runtime GLBs, scale, procedural gait, reveal, pursuit and animation code remain byte-identical to source. |
| Chase/escape/final figure | Better readable concrete/water, gate fittings, old-bike detail and contact grounding support the accepted far/side/near pursuit and exit. Final human silhouette and road lighting are preserved; no camera forcing or new reveal logic. |
| Captions | Existing adaptive tone/edge system retained, with an earlier, stronger response from its temporary soft backing over mixed flashlight backgrounds. The backing fades away again on clear backgrounds. Browser checks exercise bright/dark backgrounds, settings and actual frame sampling. No permanent black subtitle box added. |

### Iteration fixes

Actual rendered images, not only metrics, were reviewed during the pass. Fixes included bedding intersection, cap/head seam and side-hair bulk, hidden controller controls, overly periodic water, rectangular-looking damage patches, and misplaced fan/shoe detail parents. Shader compile faults found during iteration (a reserved GLSL identifier and a collision with an inherited shader variable) were corrected before final QA. The new visual-review harness also now turns on-foot views with the game's facing API; its left/right views are genuine alternate views.

The first complete hand-over walkthrough reached the ending successfully, but its later flashlight-wall caption fixture failed: measured text contrast 1.96:1, halo 0.90, backing response only 0.11. The backing now begins responding before contrast falls below 2:1. The same rendered fixture passes with response 0.68, a transparent background and zero border. Six focused checks also verify light/dark text, the borderline case, and fading the backing away. The failed frame is retained in `qa/chapter3-astra-issues/`; no existing browser assertion was relaxed.

## Culling and complexity

- Woods batching cells: near **160 → 70 m**, far **240 → 120 m**. Tunnel cells: **100 → 50 m**. Smaller cells trade more possible batches for better spatial rejection.
- Bedroom has an independent `alex-room` zone and a shorter room view/scenery range; unrelated exterior shadow batches no longer dominate an interior frame.
- Shadow-only forest proxies are distance-culled too. Deep drain rejects all non-tunnel static batches and external shadow proxies; the sky stays hidden there.
- Distance-mask updates are cached until the camera moves 0.5 m or its region/range changes. Normal renderer frustum culling still runs every rendered frame, including when turning in place.
- Material/character swaps restore on leaving Chapter Three. A focused browser regression checks original object references and light/contact cleanup, not just story state.
- Some representative draw counts increase: added detail and smaller batches cost draws. Reduced submitted triangles in a particular view are not proof of faster hardware rendering; shader cost also increased.

Final browser static inventory: **2,723,522 triangles in 1,361 merged meshes**. The source capture measured **2,514,058 triangles / 1,161 meshes**: +209,464 triangles (+8.3%), +200 batches. This is the entire baked static world, not everything submitted in a frame, and excludes dynamic actors/props. The mocked simulation reports 1,333 meshes because its material/DOM environment differs; use the browser inventory for rendered comparisons.

Representative matching base views at 1440 × 900, from each art-review report. These are submitted frame inventories, including renderer passes, not unique asset triangle counts or FPS. Scene jumps start before the event; in particular, the creature and final-lure rows are setup views, not a claim that the reveal is already fully visible. Natural walkthrough captures separately show the actual events.

| View / scene key | Source triangles | Final triangles | Source draws | Final draws |
|---|---:|---:|---:|---:|
| Bedroom / `alex-bedroom` | 852,437 | 329,120 | 522 | 195 |
| Suburb / `c3-alex-house` | 912,370 | 644,888 | 284 | 320 |
| Forest / `c3-forest-deep` | 479,522 | 427,332 | 63 | 94 |
| Tunnel mouth / `c3-tunnel-entrance` | 508,138 | 401,084 | 230 | 307 |
| Deep tunnel / `c3-tunnel-deep` | 60,281 | 100,337 | 122 | 167 |
| Creature setup / `c3-creature-advance` | 50,520 | 54,033 | 59 | 63 |
| Chase far / `c3-creature-far` | 99,219 | 132,661 | 114 | 161 |
| Chase near / `c3-creature-near` | 570,218 | 568,586 | 190 | 260 |
| Forest escape / `c3-road-escape` | 626,562 | 621,553 | 94 | 136 |
| Final-road setup / `c3-final-lure` | 357,293 | 387,828 | 118 | 158 |

Measured in Chromium using **ANGLE/Vulkan SwiftShader (software renderer)**. No real-GPU frame rate or final performance conclusion is claimed. See the [final 114-frame gallery](qa/chapter3-astra-art/index.html), [final inventory](qa/chapter3-astra-art/report.json), and [source inventory](qa/chapter3-astra-baseline/report.json). Six source images are retained alongside the source report for before/after review; historical gallery files elsewhere are not counted as final QA.

Actual event views from the natural, muted hand-over walkthrough (not just scene-start setups):

| Event capture | Triangles | Draws |
|---|---:|---:|
| [Creature at the lip](qa/chapter3-astra-walkthrough/c3-n29-that-is-not-alex.jpg) | 38,403 | 41 |
| [Far pursuit](qa/chapter3-astra-walkthrough/c3-n32-it-is-coming.jpg) | 55,437 | 89 |
| [Side pursuit](qa/chapter3-astra-walkthrough/c3-n35-out-of-the-wall.jpg) | 58,208 | 89 |
| [Near pursuit and relocated bike](qa/chapter3-astra-walkthrough/c3-n38-right-behind-them.jpg) | 307,396 | 249 |
| [Gate](qa/chapter3-astra-walkthrough/c3-n39-it-claws-at-the-gate.jpg) | 418,953 | 276 |
| [Treeline glimpse](qa/chapter3-astra-walkthrough/c3-n43-it-at-the-treeline-ahead.jpg) | 620,481 | 146 |
| [Final Alex-like road figure](qa/chapter3-astra-walkthrough/c3-n45-him-in-the-road-ahead.jpg) | 429,216 | 138 |

## Verification and evidence

Reports include SHA-256 manifests of the 55 top-level runtime files. The final simulation, full browser runs and targeted caption-wall report describe `797bf62`. The completed art sweep and restoration regression describe `98ba16f`: every file matches the final runtime except the explicitly recorded caption-backing fix. Their geometry/material/culling results remain applicable. The evidence validator permits only that exact old caption hash in those two reports and rejects any other discrepancy. The creature assets have separate immutable hashes below. This preserves the original evidence rather than silently rewriting its manifests.

The final full simulation completed **551 checks** with no failures. It includes three Chapter Three playthroughs in one session, 24/24 randomized chases, all 58 DEV scene starts, 46 natural-state comparisons with zero differences, and chapter/scene switching with zero leaks. Creature animation measurements across 915 frames recorded zero floating offset and zero visible jumps; the median speed error was 0.004 m/s. The direct scripted chase took 52.8 s, with a 3.2 s gate hold and maximum FOV 71°. These checks establish geometry/state invariants, not subjective animation quality.

| Completed gate | Result | Evidence |
|---|---|---|
| Full simulation, including Chapters 0–2 and repeated Chapter Three progression | **551 passed** | [Simulation report](qa/chapter3-astra-simulation/report.json) |
| Chapter Two hand-over → complete muted Chapter Three, then all 34 jumps, Continue, captions and audio hooks | **83 passed; 109 captures** | [Browser report](qa/chapter3-astra-walkthrough/chapter3-browser-report.json), [gallery](qa/chapter3-astra-walkthrough/index.html) |
| Real DEV clicks: chapter starts, 10 key natural-state scene comparisons, chapter/scene switching, non-QA selector, then complete muted Chapter Three from DEV | **142 passed; 74 captures** | [DEV report](qa/chapter3-astra-dev/dev-chapters-browser-report.json) |
| Multi-angle art review | **114 captures; zero JS/shader errors** | [Art gallery](qa/chapter3-astra-art/index.html) |
| Earlier-chapter art restoration, room/contact/torch cleanup, deep culling and water limits | **13 passed; 6 captures** | [Restoration report](qa/chapter3-astra-regression/report.json) |
| Exact flashlight-wall caption regression | **1 passed; 1 capture** | [Caption report](qa/chapter3-astra-caption/report.json) |
| Caption backing and fade-out unit cases | **6 passed** | [Unit results](qa/chapter3-astra-caption/unit-checks.txt) |
| Evidence manifests and immutable creature assets | **55 runtime files checked across six reports** | [Evidence validation](qa/chapter3-astra-evidence.json) |

Both complete browser walkthroughs reached `n3-end` with the sound off, all 36 phase entries in order, and no story-state jumps during the walkthrough. Each recorded a 56 s escape, a 3.2 s gate hold, far/side/near pursuit at 21.1 / 14.1 / 8.3 m, a 19.8 m treeline glimpse and a 14.3 m final road figure. Maximum companion gap was 21.0 m. Two explicitly labelled review-camera views supplement the natural views; the camera is restored afterward. The DEV browser chapter and scene switching reports contain **zero leaks**, and their natural-state comparisons contain **zero differences**.

There are **304 QA captures** in the six Astra evidence folders: 114 art + 109 main browser + 74 DEV + 6 restoration + 1 caption regression. The DEV report's frame array has 73 entries; its separate normal-mode selector screenshot makes 74. The caption regression image is also separate from a frame array. Six source-reference images, the comparison sheet and recorded failure diagnostics are excluded from 304. Visual review covered all 114 art views, the earlier 61-view complete walkthrough and all 6 restoration shots, plus full-resolution close-ups. The final runtime was spot-checked again in the bedroom, flashlight-wall fixture, nine chase/discovery views, earlier-chapter DEV scenes and the final road figure. This does not claim that every one of the 304 final captures was individually inspected at full resolution.

Chromium **153.0.8010.0**, ANGLE/Vulkan **SwiftShader** throughout; **zero JavaScript or shader errors in the completed browser reports**. No real-GPU FPS was measured. Audio hooks passed, with an empty offline-render list; production/listening work remains deferred. The original full release browser suite was not rerun.

### Reproduction

Run from the repository root with Node and Playwright available. Set `BROWSER_PATH` to an installed Chromium executable; the tests default to software rendering. This environment resolved Playwright from `CODEX_PRIMARY_RUNTIME_NODE_MODULES`.

```bash
DEV_NATURAL_OUT=docs/qa/chapter3-astra-dev/natural-snapshots.json npm test
node tests/caption-backing.mjs
node tests/chapter3-caption-wall.mjs
QA_OUTPUT=docs/qa/chapter3-astra-regression node tests/chapter3-art-regression.mjs
ART_VIEWS=all QA_OUTPUT=docs/qa/chapter3-astra-art node tests/chapter3-art-review.mjs
QA_OUTPUT=docs/qa/chapter3-astra-walkthrough node tests/chapter3-browser-only.mjs
DEV_NATURAL=docs/qa/chapter3-astra-dev/natural-snapshots.json QA_OUTPUT=docs/qa/chapter3-astra-dev node tests/dev-chapters-browser.mjs
node tests/chapter3-evidence-check.mjs
```

Run expensive browser suites sequentially on a memory-constrained machine. An earlier overlapping run exhausted memory/timed out and did not constitute a passing walkthrough; only completed final reports count. No gameplay assertions were relaxed to make this pass succeed.

A subsequent sequential run hit the 120 s screenshot deadline on the opening card, before the natural walkthrough advanced. Its diagnostic capture is retained in `qa/chapter3-astra-issues/opening-capture-timeout.jpg`; the machine recorded no OOM event. Both walkthrough harnesses now allow 300 s for screenshots on SwiftShader. Resolution, rendering, state comparisons and gameplay assertions are unchanged.

The shared `tests/chapter3-browser.mjs` frozen-view capture helper was also made more efficient: it synchronizes the actual GPU readback, requires a fresh frame sample, and applies the same twelve 0.15 s caption-settling updates without redrawing the identical view twelve times. Story state remains paused during this operation, as before. The moving-background caption fixtures still render every frame and keep their original assertions. This change affects the offline QA harness only, not the game or a performance claim.

The hand-over harness writes `walkthrough-checkpoint.json` after the complete natural walkthrough. If a later fixture is interrupted, `C3_RESUME_RUN=docs/qa/chapter3-astra-walkthrough/walkthrough-checkpoint.json` can resume the subsequent checks with the same `QA_OUTPUT`. It rejects changed runtime hashes, missing captures or recorded errors; this reuses a completed walkthrough rather than substituting scene jumps for it.

### Preserved creature provenance

The source and runtime files, creature code and attribution remain unchanged. See [THIRD_PARTY_ASSETS.md](THIRD_PARTY_ASSETS.md).

| File | SHA-256 |
|---|---|
| `assets/source/creature/smily_horror_monster.glb` | `85c2969d61e1c0bcad4934be43a070be4d80384d6924455f509e11584def0529` |
| `dist/assets/creature/creature.glb` | `e86b69df95ce1a96519f0eb720f3dc58cb15d07f3848e35c5f8891047add51b3` |

## Known roughness and human judgment

- Human faces/bodies remain medium-poly and stylized beside the supplied creature. Limbs, hands and inherited poses are not a high-end character-animation overhaul. The small breathing/head changes do not eliminate every stiff gesture or foot-placement issue.
- The creature still uses the accepted procedural locomotion layered on its supplied idle, not authored motion capture or terrain IK. Automated contact/heading checks pass; naturalness under close, free-camera scrutiny needs human judgment.
- Some surrounding neighbourhood trees, simple props and distant foliage keep their original simplified silhouettes. Not every asset was remade. Some side openings retain dark authored backings rather than navigable interiors.
- Water is a shallow translucent surface without true scene reflections, and the new contact shadows are soft projected approximations. Review oblique water views and contacts around sloped/uneven ground on hardware.
- Several improvements add shader work and/or draw calls. No FPS claim is made. Real-GPU profiling, memory checks, shadow quality, shader portability and extended free exploration remain necessary.
- Human playtesting should judge bedroom brightness, dark-screen legibility, captions on mixed backgrounds, flashlight spill versus horror, near/side pursuit readability, gait, companion warmth, the old-bike clue/relocation, exit visibility and whether the final figure unmistakably reads as Alex-like rather than the monster. Also inspect culling while freely turning and riding beyond the scripted path.
- Both browser walkthroughs are input-driven game simulations using the QA stepping clock, not a person playing in real time. The DEV test also checks its selector in ordinary non-QA mode. Screenshots and automated checks cannot certify subjective horror pacing or every visual angle.
- Audio is deliberately deferred. Existing trigger compatibility only; no new voices, sourcing, heartbeat tuning, offline/HRTF renders or listening claims.
- The several-hour full release browser suite is not rerun in this pass. Earlier chapters are covered by the complete simulation, rendered DEV starts/switching and focused art restoration checks.

## Publication contract

After QA/documentation is committed, attempt one normal push of `codex/astra-chapter3-final-polish`. If terminal GitHub authentication is unavailable, stop; do not reconstruct or rewrite commits. Deliver the exact clean branch as `Last-Light-Chapter3-Astra-Final-Portable-Git-Repository.zip`, containing a real standalone `.git` directory and complete connected history, with origin `https://github.com/GRothIsMonkey/Last_light.git`. The delivery message is authoritative for push outcome, final SHA and ZIP checksum.
