# Last Light — Visual QA and Acceptance Standards

Part of the [Final Art Bible](../LAST-LIGHT-FINAL-ART-BIBLE.md). Source audit base: `c646a862b272c987b0a0b9aea690ddfc859ddda7`.

**Commandment 10: real gameplay is the final visual authority.** This document defines what evidence a visual delivery must include and how it is accepted.

---

## 1. Evidence hierarchy

| Rank | Evidence | Counts as acceptance? |
|---|---|---|
| 1 | Human review of the playable build on real GPU hardware, with sound, by the creative director | **Yes (required for gates)** |
| 2 | In-game captures from the shipped renderer on real GPU hardware, gameplay cameras | Supporting; required in every delivery |
| 3 | In-game captures from the shipped renderer under software WebGL (Mesa/SwiftShader) | Supporting; must be labeled "software" |
| 4 | Review-camera captures (QA cameras outside the player) | Supporting; must be labeled "review camera" |
| 5 | Automated tests (simulation with a mocked renderer, geometry checks, contact checks) | Necessary, never sufficient |
| 6 | Geometry exports / turntables / offline renders (e.g. Mesa/ModernGL renders of exported meshes) | Supporting only; must state what is omitted (textures, shaders, shadows, post) |
| 7 | Concept art, generated images, reference images | **Never evidence of implementation** |

Every report states which ranks it contains. Past reports correctly disclosed that WebGL was unavailable in the preview browser and that hardware FPS was not measured (`ASTRA-FULLGAME-ART-REWORK.md`, `VISUAL_RECOVERY_REPORT.md`); that standard of disclosure is mandatory.

---

## 2. Required in-game capture set

Captured from the playable build at the listed entry (DEV scene ids from `dist/dev-chapters.js` where they exist; "confirm" = locate the exact entry in Phase 0). Each capture at 1920×1080, Medium and High profiles, gameplay camera unless the item says close-up (then add a labeled review camera too). Items from unimplemented chapters stay **PLANNED** until those chapters exist.

| # | Capture | Entry | Status |
|---|---|---|---|
| 1 | Prologue street at golden hour | Prologue `group-ride` | Implemented |
| 2 | All four boys together | Prologue `group-ride` (stopped) / `lookout` | Implemented |
| 3 | Individual faces of Jamie, Sam and Alex (close) | Prologue `alex-departure`, `jamie-departure`, `sam-departure` + review camera | Implemented |
| 4 | Bicycles and the player's hands | Prologue riding; bell ring | Implemented |
| 5 | Normal residential architecture | Prologue, d 150–550 | Implemented |
| 6 | Storm drain | Ch3 `c3-tunnel-deep` | Implemented |
| 7 | Industrial underground environment | Ch6 works (confirm) / Ch8 `c8-gallery` | Implemented |
| 8 | Chapter Seven hunter encounter | Ch7 `c7-reveal` (stairs), stealth scenes | Implemented |
| 9 | Mrs. Lange | Ch7 `c7-lange-scare` | Implemented |
| 10 | Chapter Eight complex | Ch8 `c8-gallery`, `c8-wing` | Implemented |
| 11 | The four-friend reunion | Ch8 `c8-reunion` | Implemented |
| 12 | Presence skyline reveal | Ch8 `c8-surface` | Implemented |
| 13 | Maximum-scale Presence composition | Ch8 `c8-street` / `c8-trench` (looking north) | Implemented |
| 14 | Apocalyptic sky | Ch8 `c8-surface` (wide) | Implemented |
| 15 | Destroyed Oak Hollow | Ch8 `c8-street`, `c8-yard` | Implemented |
| 16 | Jamie's death | Ch8 `c8-jamie-death` | Implemented |
| 17 | Alex's death | Ch8 `c8-oak` | Implemented |
| 18 | Final bicycle ride | Ch8 `c8-ride` | Implemented |
| 19 | Aftermath I shelter | A1 `a1-arrive`, `a1-gym` | Implemented |
| 20 | Jamie's mother | A1 `a1-jamie-mom`, `a1-porch` | Implemented |
| 21 | Alex's parents | A1 `a1-alex-parents` | Implemented |
| 22 | September destroyed neighborhood | A1 `a1-return` | Implemented |
| 23 | Jamie's vigil | A1 `a1-memorial-jamie` | Implemented |
| 24 | Alex's memorial | A1 `a1-memorial-alex` | Implemented |
| 25 | October cleanup | A1 `a1-weeks` | Implemented |
| 26 | Final 2011 departure | A1 `a1-goodbye`, `a1-road-out` | Implemented |
| 27 | Adult Sam in 2021 | Aftermath II | **PLANNED** |
| 28 | Rebuilt Oak Hollow | Aftermath II | **PLANNED** |
| 29 | The 2026 room | 2026 coda | **PLANNED** |
| 30 | Final credits presentation | Credits (separate work) | **PLANNED** |

Per-phase deliveries capture the subset their phase touches plus #1–#5 (regression of the benchmark).

---

## 3. Capture protocol

- **Renderer:** the shipped game, unmodified except for the documented `?qa` hook (`window.lastLight`: `start`, `step`, `look`, `walkTo`, `place`, `render`, `state`, chapter `jump`s).
- **Hardware:** name the GPU, driver, browser and version, OS, resolution, profile, pixel ratio.
- **State:** scene entry, story time, flags (e.g. cap possession), damage state, profile id.
- **Camera:** record position, yaw, pitch, FOV; reuse them for before/after.
- **No HUD overlays added** by the capture tool; real captions/prompts may appear and are noted.
- **Labels:** gameplay camera / review camera; hardware / software; profile; commit SHA.
- **Integrity:** store PNG hashes and the JSON metadata next to the images (the `render-summary.json` format of the visual-recovery report is a good template).

---

## 4. Before-and-after standards

- Equivalent camera positions (same recorded transforms), equivalent scene states, equivalent time of day, matching framing, correct labels, genuine game rendering on both sides.
- Same profile, resolution and hardware on both sides.
- No dramatic camera-angle changes that disguise unchanged geometry; no added fog/post on one side only.
- Generated concept art is never used as an "after".
- If a capture had to be retaken after a correction, both the intermediate and final are kept and labeled (the visual-recovery report did this for the skyline scale).

---

## 5. Character identity tests

### 5.1 Automated (to build in Phase 0–2)

For every `chr.*` ID, in every chapter, at chapter start, after each chapter transition, from every DEV start that shows the character, and after Continue:

| Check | Pass condition |
|---|---|
| Identity geometry | Hash of the identity meshes (head, body, hands, hair) equals the registry hash for that age variant |
| Skeleton | Same rig ID, bone names, bone lengths (per age variant) |
| Materials | Same parameters per material slot (color, roughness, maps) except declared condition layers |
| Wardrobe | Matches the declared wardrobe variant for that scene/date |
| Attachments | Declared set only (e.g. Jamie's cap on/off per state; Brandt's cast) |
| Sockets | All required sockets present and finite |
| Animation sockets | Grip/look/feet targets resolve |
| No chapter mutation | No module replaced geometry/material on a registered person (spy on `geometry`/`material` setters in the test harness) |

### 5.2 Face-landmark test

A fixed portrait camera (front, three-quarter) per character per chapter; landmark positions (pupils, inner/outer eye corners, nose tip and base, mouth corners, chin, ear tops) projected to screen; differences ≤ 1% of face height between chapters for the same age variant and expression.

### 5.3 Human lineup test (each milestone)

Five reviewers unfamiliar with the build see the four boys from the Prologue, then unlabeled captures from a later chapter (including a double from Ch6) and must match each to its Prologue counterpart. Pass: ≥ 90% correct matches; any systematic confusion is a defect.

### 5.4 Age-progression test (Aftermath II)

2011 and 2021 heads at matched scale with landmark overlay: eye-line ratios, nose-base and mouth-corner relationships consistent with normal growth; lineup test of adult Sam among three distractor adults: ≥ 80% correct.

---

## 6. Primitive-appearance checklist (every visible asset at its gameplay distance; hero assets also at close-up)

- [ ] No stacked cylinders/capsules read as limbs, poles, trunks.
- [ ] No visible geometry intersections (sleeve through arm, hair through cap, prop through hand, house through ground).
- [ ] No spheres as eyes, noses, ears or facial features.
- [ ] No helmet hair; strands at the silhouette.
- [ ] No rectangular clothing slabs; seams, hems, folds visible.
- [ ] No repetitive identical trees in one view.
- [ ] No flat black windows (interior depth or curtains).
- [ ] No empty buildings where the player looks in.
- [ ] No floating details (signs, gutters, wires, props).
- [ ] No unconvincing joints (gaps at shoulders, wrists, knees).
- [ ] No torus/primitive "grins" or pasted facial features on creatures.
- [ ] Silhouettes are irregular where nature is irregular.

## 7. Geography and damage-state continuity tests

- Every lot and story location has the same world position in every chapter (automated: compare against `layout.js`/`town-plan.js` coordinates).
- For each chapter/date, each `DAMAGE_MAP` lot reports the declared `dmg.*` state; no regeneration between states; replaying an earlier chapter resets to `dmg.A` (extend `tests/recovery-state.mjs`).
- Human walk: the original routes in Ch8, A1 September and A1 October, checking that what was broken stays broken, cleared lots stay cleared, and protected routes stay open.
- 2021: each lot rebuilt or kept per the approved `dmg.F` plan.

## 8. Presence scale test

From each evaluation camera (Creature bible §7.6), compute the silhouette's angular height and width and frame coverage. Pass: not less than the values measured on the approved reference build (record them in Phase 0 from the current r 138 skyline); and human confirmation that the player must look up to see its upper anatomy from street level.

## 9. Night readability test

At default brightness, Medium profile, sRGB monitor: measure the 5th-percentile luminance of the walkable area within 8 m (≥ ~2% of white, Lighting script §3), companion silhouettes within 10 m, and the visibility of interactable story objects within 3 m when prompted. Deliberate darkness beats must be listed with their duration.

## 10. Animation and contact tests

- Foot slide ≤ 2 cm per step at walking speed for people, ≤ 3 cm for creatures.
- Hand-to-socket distance ≤ 1 cm during holds (cap, notebook, camera, flashlight, handlebars, another hand).
- No self-penetration above a 1 cm threshold at play distance (sampled poses).
- Death stillness: zero blink, breath and micro-motion channels after the death event (extend `tests/art-contacts.mjs`).
- Blend durations ≥ 0.15 s except hits.

## 11. Performance acceptance

- Measured on the Phase 0 hardware set, per profile, for the scenes in §2.
- Pass: the profile's targets (bible §20.2) for median frame time; 1% lows not below 70% of target fps; no hitch > 100 ms during play except chapter loads; GPU memory within budget.
- Loading: chapter transition loads ≤ 10 s on the mid machine (PROPOSED; measure baseline first).
- Offline package size within the Asset plan §6 target.
- Report measured numbers; never estimate hardware FPS from software rendering.

## 12. Defect severity

| Severity | Examples | Rule |
|---|---|---|
| S1 Blocker | Identity changes without a story reason; a dead character blinks; the Presence shrinks; story-critical object unreadable; crash/regression | Must fix before the gate |
| S2 Major | Primitive-appearance checklist failures on hero assets; contact failures in key scenes; night readability failures; damage-state regressions; performance below profile target | Must fix or be explicitly waived by the creative director |
| S3 Minor | Background clones, minor intersections at unusual viewpoints, small lighting inconsistencies | Logged; fixed in Phase 9 at the latest |
| S4 Polish | Nice-to-have refinements | Optional |

## 13. Human acceptance and sign-off

Each gate review records: build (branch, SHA, package manifest hash), hardware, profile, scenes reviewed, findings by severity, decisions, and the creative director's verdict (APPROVED / APPROVED WITH CONDITIONS / NOT APPROVED) in `ART-APPROVAL-REGISTER.md` with the date. A gate without that entry is not passed.

**A successful automated test suite is not equivalent to successful visual art.**
