# Last Light — Full-Game Visual Reconstruction Roadmap

Part of the [Final Art Bible](../LAST-LIGHT-FINAL-ART-BIBLE.md). Source audit base: `c646a862b272c987b0a0b9aea690ddfc859ddda7`.

**This roadmap starts after the narrative draft is complete** (Aftermath II, the 2026 coda, final credits and the redesigned title screen are being built separately). No phase may begin until its dependencies are met. No full-game rollout happens before the creative director approves the Phase One benchmark.

---

## 0. Rules for every phase

1. Work on a dedicated branch per phase (e.g. `art/phase1-prologue-benchmark`), started from the latest accepted integrated branch; never rewrite other sessions' branches; never merge into `main` without the creative director.
2. Do not change story, dialogue, puzzles, encounter logic, saves, chapter transitions, the menu/settings implementation or audio as part of art work. If an art change needs a gameplay adjustment (e.g. an interaction radius), document it and get the owning session's agreement.
3. Every recurring entity comes from the registry (bible §21) once it exists; until then, from the single current builder.
4. Every phase ends with: automated suites green (§11), in-game captures (QA §2), performance report on named hardware, a human review, and an approval entry.
5. Keep earlier chapters playable at every commit.

---

## Phase 0 — Source inspection, canonicalization and baselines

**Goal:** turn this bible's audit into a verified source map, resolve canon conflicts, establish reference images and a real hardware baseline.

| Item | Deliverable | Test / evidence |
|---|---|---|
| 0.1 Run the current build on real GPUs | Hardware baseline: FPS (median, 1% low), frame time, draw calls, triangles, GPU memory for 30 representative scenes (the QA list) on at least: one integrated GPU laptop, one mid-range discrete desktop, one upper-mid desktop | `docs/art/baselines/hardware-<date>.md` + JSON; browsers named; settings named |
| 0.2 Confirm SUSPECTED audit items (F-23, F-24) | Updated audit | Captures/logs |
| 0.3 Canonical source map | For every recurring entity: current builders, data, chapters, sockets, contact tests | `docs/art/SOURCE-MAP.md` |
| 0.4 Resolve canon conflicts | Approval register items A-01…A-23 decided or explicitly deferred | Register updated with decisions and dates |
| 0.5 Reference images | Approved character sheets (Character canon §2.2), creature sheets, the oak, the bikes, house kit style frames; originals with provenance | `docs/art/references/` + `PROVENANCE.md` |
| 0.6 Loader/packaging spike | Vendored GLTFLoader (r160), meshopt, KTX2 + Basis transcoder proven in the served build **and** the offline package; license records | A test glb (original, trivial) loads in both; package hashes; memory peak measured |
| 0.7 Lighting profile extraction | Current lighting code expressed as named profiles (no visual change) | Pixel-diff captures before/after identical within tolerance |
| 0.8 Registry scaffold (data only) | `dist/art/registry.js` with IDs for every recurring entity pointing to current builders | Unit test: every human/creature/landmark/signature prop in every chapter resolves to an ID |

**Gate 0 (creative director):** canon decisions, reference images, hardware baseline accepted.

---

## Phase 1 — Controlled visual benchmark: the Prologue summer neighborhood

**Goal:** one representative slice at final quality, proving the style, the pipeline and the performance before anything else changes.

**Scope:** Oak Hollow Drive from the start to the Briarwood junction (≈ d −50 to 620) plus the lookout and the oak; golden hour → sunset.

| Deliverable | Detail |
|---|---|
| The four boys | Hero meshes (approved sheets), shared child skeleton driven by the pose contract, hair, clothing, hands, faces with morph targets mapped from `faces.js` channels |
| Their bicycles | Hero bikes matching `rig.js` anchors; spokes, chain, cables, reflectors, bell |
| First-person body and hands | Hero hands; bike grips, bell reach |
| Houses | Story houses (Jamie's is outside the range; include the car house at d 522, the hoop house at d 153, and ≥ 8 ordinary lots) built from the new modular kit with interiors behind windows |
| Street | Shared materials on roads, curbs, sidewalks; decals (patches, oil, chalk); storm inlets; poles with continuous wires; signs; mailboxes |
| Vegetation | Street-tree species kit (≥ 6 variants per species near the route), shrubs, lawns with variation and edges, the lookout field grass, **the hero oak** |
| Props | Yards with deliberate storytelling sets; vehicles (≥ 4 period-generic models) |
| Lighting | `lgt.prologue.golden`, `.sunset`, `.blue-hour` as data; contact shadows; post stack (tone map + restrained bloom) |
| Animation | Group ride, the Alex departure (bell twice, wave), stopping, dismount, push, idle at the lookout |
| Camera | Ride camera, on-foot camera at the lookout |
| Performance | Measured on the Phase 0 hardware at Low/Medium/High |

**Acceptance criteria (all required):**

1. The four boys look distinct and believable; each passes the distinctness matrix (Character canon §3.5) and the human lineup test.
2. Faces match the approved sheets (landmark overlay within tolerance, QA §5).
3. Clothing reads as fabric with seams and folds; no slab/tube reads at gameplay distance.
4. Bikes are convincing at the bike-close camera and in motion (wheel rotation, steering, chain).
5. Houses have architectural depth (roofs, trims, windows with interiors) — the construction checklist passes.
6. Trees are substantially better: species read, no clones in view, real silhouettes at sunset.
7. Golden hour is beautiful: sun rake, soft long shadows, warm/cool balance, depth haze.
8. The world no longer looks crudely procedural (primitive-appearance checklist passes).
9. Performance meets the Medium profile on the mid-range machine and Low on the integrated machine.
10. Real gameplay captures (not review cameras only) support every claim, with equivalent before/after pairs.

**Gate 1 (creative director): approve the benchmark** (including the material benchmark A-35, tone mapping A-24, FOV A-42 and post defaults A-43). If not approved, iterate Phase 1; do not start Phase 2.

---

## Phase 2 — Master asset library and shared systems

**Depends on:** Gate 1.

| Deliverable | Detail | Tests |
|---|---|---|
| Final four boys | All wardrobe and condition variants needed by Ch1–Ch8 and A1; the uncapped Jamie; the cursed-behavior variant for doubles (A-14) | Identity tests across chapters, DEV starts, Continue |
| Recurring adults | Adult skeleton (`rig.human.adult`); Reyes, Brandt, the three mothers (separate identities), the fathers, the protagonist's mother, Mrs. Lange, the Hendersons, Lily (child), Mrs. Pruitt, Mr. Davis; secondary bases | Contact tests (CPR, embraces, carry) re-run; adult proportion check |
| One facial system for all humans | Retire `chapter6Appearance` / `portrait` / `adultFace` swaps; one face driver | Story `face:'…'` lines all resolve |
| Bicycles | All five canonical bikes with story states | Anchor test vs `BIKE`/`STYLES`; state persistence tests |
| Architecture kit | Four styles, roofs, garages, porches, windows/doors, trims, interiors-behind-glass, damage-state pieces | Construction checklist automation (roofs on walls, wires end at houses, doors not into walls) |
| Material library | `mat.*` families replacing the seven current systems; one GLSL detail chunk | Same-material-across-chapters capture test |
| Vegetation | Species kits, seasonal states, the oak with its states | Clone check; oak silhouette test from story vantages |
| Lighting | All profiles in `LIGHTING-AND-COLOR-SCRIPT.md` §8 seeded from Phase 0 extraction | Night-readability measurements |
| Animation | Shared families (bible §7.1) | Foot-slide, hand-contact, blend tests |
| Signature props | One builder each (Environment guide §10); photograph pipeline (render-to-texture) | Single-builder test; photo-matches-model test |
| Registry | Fully populated with approved entries | Unregistered-entity test |

**Gate 2:** library review (sheets vs in-game), performance at Medium with the full library loaded.

---

## Phase 3 — Chapters One to Six

**Depends on:** Phase 2. Order: Ch1 → Ch2 → Ch3 → Ch4 → Ch5 → Ch6 (each a sub-gate).

Priorities: geographic consistency; character continuity; environmental realism (Briarwood, Alex's house and room, the creek and easement, the pond road and basin, the drains, Old Mill Road and downtown, Pine Ridge and the camp, Sam's house, the Mill Creek works); interior quality; underground atmosphere; lighting profiles; gameplay readability (flashlight, captions, prompts).

Chapter-specific musts: Ch1 police lights and the cruiser; Ch2 the morning street with searchers and flyers, the memory reconstruction; Ch3 drains (wet concrete, water, brick, grates, flashlight), the smiling creature's first appearance (A-27 decided); Ch4 Main Street lights dying in a line, TVs, the Lyric; Ch5 the reservoir, dock, camp cabins, lamps and carried lights, the double Jamie; Ch6 the storm, the works, Gate 2B, the two Sams.

Do not rewrite accepted story beats. Tests per chapter: full input-driven simulation (`tests/chapterN-sim.mjs` via `verify.mjs`), browser walkthrough, DEV scenes, identity tests, captures, performance.

---

## Phase 4 — Chapter Seven

**Depends on:** Phase 3 (or at least Phase 2 + Ch6, since Ch7 builds on Ch6's state).

Upgrade: the hunter (authored GLB on the existing adapter, perception origin preserved, all semantic states), Mrs. Lange, Jamie (taken), Sam's house interior (his room), Old Mill Court and the Langes' (No. 5), the green-door house, night lighting, close-range horror staging, flashlight readability, environmental detail.

Tests: `ONLY=chapter7` targeted checks including the adapter GLB load and fallbacks, stealth, chase, abduction (Jamie's feet in the `grab` socket), full chapter run; captures of every DEV scene listed in the hunter asset guide §7.

---

## Phase 5 — Chapter Eight

**Depends on:** Phase 4.

The major cinematic horror reconstruction: the colossal Presence (hero sculpt; skyline scale floor; underground limbs), the terrifying sky (catastrophe profile), convincing destruction (kit damage pieces driven by `DAMAGE_MAP`, the trench, Summerfield, the fires), the underground complex (1908/1958/1974 kits), hunter consistency (both hunters; A-26), the made things (A-28), human emotional acting (the reunion, Jamie's death, Alex's death, the last ride).

Hard requirements: the Presence remains unmistakably enormous from every evaluation camera (Creature bible §7.6); destruction is physically convincing; deaths readable and still; contact tests green.

Tests: `ONLY=chapter8` full run (35 checks today), `tests/art-contacts.mjs` (65), `tests/recovery-state.mjs` (16), Presence screen-coverage measurement, captures.

---

## Phase 6 — Aftermath I

**Depends on:** Phase 5.

Apply the shared style to: the school and shelter (credible crowd density with the shared crowd system, realism tier per A-37; medical area; volunteers; families; cots, blankets, supplies, the missing-person boards); evacuees and story adults; the damaged town in September and October (`dmg.D`, `dmg.E`); homes, the garage, bedrooms, the kitchen (evening lighting), the nurse's room; memorials (vigil candles, Alex's pictures — rendered photographs); the October environments; the final departure (car interior, the truck).

Preserve the progression of disaster recovery (no regenerating houses). Tests: `ONLY=aftermath1` (58 today), cap-variant runs, state tests, captures, performance in the full gym.

---

## Phase 7 — Aftermath II and the 2026 coda

**Depends on:** those chapters existing in the main workflow and the creative director's story approval; Phase 6.

Adult protagonist and adult Sam (age-progressed from approved 2011 identities: A-20, A-21); the 2021 rebuilt Oak Hollow from the same plans (`dmg.F`, A-32); natural 2021 vehicles and details; peaceful, reflective lighting (`lgt.a2.*`); the 2026 room (`lgt.2026.desk-night`; A-36): the computer showing *Last Light* (the Prologue's golden street on the monitor), the photographs, Sam's notebook, Jamie's cap only where the save's possession continuity permits, objects with their 2011 identities aged 15 years; natural camera movement. **No new supernatural content. Jamie and Alex have no living adult versions.** Do not invent scenes not in the approved story.

---

## Phase 8 — Menu and interface integration

**Depends on:** the accepted menu/settings implementation (built separately); Phase 7.

Make the title screen, settings, chapter selection, credits, loading states, HUD, captions and interaction prompts cohesive with the final visual identity (type, color, motion, backgrounds rendered from the game's own scenes). Inspect the accepted implementation first; do not redo it independently. Add the visual settings the bible requires (graphics preset, brightness, reduced shake, reduced flashing, grain, FOV where supported) through that implementation's structure, coordinated with its owners.

---

## Phase 9 — Complete visual QA and final approval

Full-game visual consistency review; character identity checks (every chapter, transition, DEV start, Continue); environment continuity (geography and damage states walked on the original routes); lighting review against the color script; animation review; performance on all profiles and named hardware; quality-preset testing; screenshot comparison (equivalent cameras, labeled); human playtesting (full Prologue-to-coda run on an ordinary desktop GPU with sound); final creative-director approval.

---

## 10. Dependency graph

```
Phase 0 ──► Gate 0 ──► Phase 1 ──► Gate 1 ──► Phase 2 ──► Gate 2 ──► Phase 3 (Ch1→Ch6)
                                                                         │
                                                                         ▼
                                     Phase 8 ◄── Phase 7 ◄── Phase 6 ◄── Phase 5 ◄── Phase 4
                                        │       (needs A2/2026 built
                                        ▼        by main workflow)
                                     Phase 9 ──► Final approval
```

Parallelism allowed after Gate 2: environment kits for later chapters (Ch8 underground kits, A1 shelter) may be modeled while Phase 3 integrates earlier chapters, provided integration order stays as above.

---

## 11. Test inventory to run at every phase exit (current suites)

| Suite | Command (current) | What it covers |
|---|---|---|
| Base simulation and world regressions | `npm test` (`node tests/verify.mjs`); `QUICK=1` skips geometry sweeps | World continuity, houses, wires, trees, props, render budget, characters and bikes, menus, riding, full playthrough chains |
| Per-chapter | `ONLY=chapter4 …`, `ONLY=chapter5 …`, `ONLY=chapter7 CHECKS_ONLY=1 …`, etc. via `verify.mjs` | Each chapter's input-driven run and checkpoints |
| Browser | `npm run test:browser` (`tests/browser.mjs`) and chapter browser scripts | Chromium walkthroughs and captures (software GL in CI) |
| Art regression | `tests/art-rework.mjs` (55 checks per the Astra report) | Models, expressions, resets, sockets, finite geometry |
| Contacts | `tests/art-contacts.mjs` (65) | CPR cycle, oak embrace, death state, final ride |
| Recovery state | `tests/recovery-state.mjs` (16) | Damage map, triangle cuts, October cleanup, crowd, replay |
| Package | `tests/art-package.mjs`, `tests/*-package-browser.mjs` | Offline package embedding and hashes |

New suites to add (QA doc): identity consistency, single-builder props, registry resolution, construction checklist, foot-slide/hand-contact, night readability, Presence coverage, performance capture.

---

## 12. Session assignment guidance

| Work | Suitable session | Must read |
|---|---|---|
| Phase 0 baselines and registry scaffold | Technical art session | Bible, audit, asset plan |
| Phase 1 benchmark | Combined technical + art session (one owner) | Everything |
| Character library | Character/technical art session | Bible, character canon, asset plan |
| Environment kits | Environment art session | Bible, environment guide, lighting script |
| Chapter integration (3–6) | Chapter sessions (Claude/Astra), one chapter at a time | Bible + the area docs + the chapter's handoff |

Every session writes a handoff listing: entities touched (by ID), approvals used, tests run with results, captures, performance numbers, remaining limitations — and does **not** claim visual success from automated tests alone.
