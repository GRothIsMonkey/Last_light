# Prologue environment repair & supporting cast — report

**Branch** `claude/prologue-environment-repair-supporting-cast`, started from `claude/prologue-neighborhood-details-benchmark` at
**`716fc6bfacae1166f45826905475b7cb1d2409e0`** (that branch's verified remote head; it and the five earlier benchmark branches
are untouched). Final commit: §15. Nothing is merged into `main`. Without `?envrepair` and `?supportcast` the game is unchanged
(proved vertex by vertex and frame by frame, §11). **Awaiting the creative director's review — nothing here is approved;
A-22 stays open.**

**Evidence and its limits.** Every in-game image and recording is the shipped renderer under **software WebGL** (Chromium +
ANGLE SwiftShader, **not a GPU**) at 1600 × 900, with all eight flags on (`?bikes&houses&vegetation&pavement&streetprops&details&envrepair&supportcast`).
A before/after pair is **one camera and one frame**: only the benchmark's own key changes between the two images (`'` for the
repairs, `;` for the cast). Recordings are rendered frame by frame at a fixed game step and play back in real time. Images
and films named `--BLENDER-RENDER` are offline Cycles renders of the editable .blend files, **not the game**. Jamie in every
in-game image is **the existing procedural Jamie, a placeholder**, not Astra's Phase 1B character (not integrated here).
Every performance number is a software-renderer or file number; no real-GPU frame time has been measured.

<!-- RESULT:start -->
## Result

- **What was built.** Two opt-in DEV benchmarks for the Prologue. Both are off by default, and the default game is unchanged (§11).
  - **`?envrepair`** fixes the six benchmarks' neighbourhood:
    - chain link that no longer vanishes with distance (A-82);
    - Briarwood creek's last primitive planting, replaced from the vegetation library (A-83);
    - repaired trampolines, swing sets, big wheels and wagons, fitted to the lawn (A-84);
    - 932 light contact shadows (A-85).
  - **`?supportcast`** adds two original Blender-authored characters, each driven by the game's own controller, unchanged:
    - Jamie's mother, `chr.jamie-mother`: 50,714 triangles, an adult rig in Astra's bone naming, 30 face keys, six clips (A-78, A-79, A-81);
    - the driveway basketball kid, `chr.hoop-kid`: 25,002 triangles (A-80).
- **Tests.**
  - This pass's suite: ⟦SUITECOUNT⟧.
  - The seven existing browser suites pass: 267 checks, 0 failed.
  - `verify.mjs` stops at a DEV chapter check that fails identically on the starting commit, so the failure is not from this pass (§11).
- **Cost.** With both flags on top of the six benchmarks there are +3.7% draw calls and +2.9% triangles over six riding cameras. These figures come from software WebGL; no GPU was measured (§12).
- **Evidence.**
  - 20 same-frame before/after pairs.
  - Six in-game recordings, including the mother's complete scene and a 146-second combined ride.
  - 30 Blender renders, three of them a same-scale lineup with Jamie's Phase 1A model, and 11 Blender motion clips.
  - The consistency audit.
  - All of it is in the review gallery (⟦GALLERY⟧) and in `docs/qa/envrepair-supportcast/`.
- **Not done or not claimed.**
  - Compatibility with Astra's `player1b&friends1b` is not tested.
  - The mother is over the 30–40k triangle budget and has no LOD.
  - The supporting cast is drawn off screen (§12).
  - The full list is in §14.
- **Open decisions.** Nothing is approved. A-78 to A-86 are open in the approval register, and A-22 (the mother's canonical identity) stays open.
<!-- RESULT:end -->

## 1. Source of truth and parallel work

| | |
|---|---|
| Start | `claude/prologue-neighborhood-details-benchmark` @ `716fc6b` (the six benchmarks: bikes, houses, vegetation, pavement, street props, details) |
| This branch | `claude/prologue-environment-repair-supporting-cast` (new) |
| Astra's work, read only | `codex/astra-phase1b-protagonist-animation` @ `66e3f4b` (rig and export conventions: bone names, `instantiate()`, ARKit keys); `codex/astra-phase1a-jamie-sketchfab-redesign` @ `42340fe` (Jamie's design report; it holds no .blend); Jamie's editable Phase 1A source `chr.jamie.a12.blend` as carried on the 1B branch (git blob `67490e2027801ec08190307cd8580392842eeea8`), opened read-only for the lineup only |
| Not touched | the four boys' models, controllers and animations; `friends.js`, `cast.js`, `rig.js`, `faces.js`, `astra-anatomy.js` (Astra's `player-1b.js` is not on this branch); Chapter Seven's and Aftermath I's mother; the old oak and its tire swing; the departure sequence; any dialogue, caption, voice or sound |

Read before changing anything: the two previous reports, the approval register, the character canon, the environment style
guide, the roadmap, the visual-consistency audit, and `friends.js`, `cast.js`, `ambient.js`, `rig.js`, `faces.js`,
`adult-art.js`, `adult-sculpt.js`, `people.js`, `chapter7-cast.js`, the Aftermath I cast, the six benchmarks' runtimes and the
asset pipeline. What was found that matters here:

- Jamie's mother in the Prologue is `createPerson(CAST.mom)`: the child rig × 1.13 (≈ 1.73 m) with the rig's primitive head;
  from Chapter Seven she is a different person derived from Alex's mother (canon §4.3, A-22).
- Her scene is `friends.js updateMom`: active at ride distance 681 (`FORMATION.jamie.leaveAt − 15`); she starts **2.3 m inside**
  the front wall (`door.inside`); the door opens in 0.6 s while she stands there; she walks out 0.9 m past the threshold
  (`door.outside`) and 0.55 m along; on the porch she turns to the street, looks at Jamie and makes the small wave (`addWave`
  weight `smooth(t/.7)·(1−smooth((t−1.6)/.8))·0.45`); when Jamie is inside she walks back to `door.inside`, is hidden, and
  the door closes 0.15 s later with its slam. She has **no line** (`story.js` has only Jamie's "That's my mom. I gotta go.").
- The hoop kid is `createPerson(CAST.kid)` in `ambient.js updateKid`: dribble (0.52 s bounces), shot (ball released at 0.35 s,
  rim at 1.4 s), the ball back off the rim in 1.3 s, and while the boys pass (`distance` within 26 m before to 6 m after him)
  he holds the ball at his hip and looks at them.
- The street props' chain link (`streetprops-assets.js cutoutMaterial`) uses the plain 0.5 alpha test; the details kit's
  (`details-assets.js`) adds the coverage-preserving dither (the details report's own deferred item).
- Briarwood creek's brush is `vegetation.js shrub` (two green balls), its reeds are flat three-triangle blades, its mud and wet
  patches 9-sided discs and its algae flattened balls (`creek.js`); none is recorded by `?vegetation`, whose tree record also
  stops 95 m from Oak Hollow, before most of the creek's trees.

<!-- BODY:start -->
## 2. What was built

| Flag | What it does | Runtime | Assets |
|---|---|---|---|
| `?envrepair` | four targeted repairs to the six benchmarks' Prologue neighbourhood: chain link that keeps its coverage at a distance, Briarwood creek's last primitive vegetation, the play equipment and toys, contact shadows under grounded objects | `dist/envrepair.js` | `dist/assets/envrepair/envrepair.kit.glb` (1.49 MB) |
| `?supportcast` | Jamie's mother and the driveway basketball kid as authored, rigged Blender characters driven by the game's own controllers | `dist/supportcast.js` | `dist/assets/chr/chr.jamie-mother.glb` (8.36 MB), `dist/assets/chr/chr.hoop-kid.glb` (3.78 MB) |

Both flags are opt-in, Prologue only, and independent of each other. Each has a key that swaps the repaired/authored version
for the original in the same frame (`'` and `;`), and a DEV label in the corner. Without the flags nothing of either is
fetched, built or drawn (§11).

## 3. Chain link that no longer vanishes (A-82)

**Problem.** The street props' chain link (`streetprops-assets.js cutoutMaterial`) cut its wire with a plain 0.5 alpha test.
The wire is thinner than a texel once the tile is minified, the mipmapped alpha drops below 0.5, and whole fences disappear
at 20–40 m and shimmer in and out while riding.

**Repair.** The details kit's coverage rule, applied to the same material through a guarded `onBeforeCompile` (its own
program cache key, so no other cutout material is affected): up close the usual 0.5 test; once the tile is minified the
threshold becomes a fixed screen-space dither on the mip-averaged alpha, so the fence keeps its real average coverage (a
faint grey screen, as chain link reads at a distance) without turning opaque. Same draws, same geometry, no new texture. The
street-props branch is untouched; the patch is applied at runtime and removed by `'`.

**Evidence.** Pairs E01–E03 on Oak Hollow's longest rear-lot run (39 bays, the back of the lots, 33.5 m from the street's
centre line), from inside one back yard because the lot-line and side-yard fences block every longer view: E01 straight on
at 2.5 m, E02 straight on at 7 m, E03 across the yard from one corner, looking along about 25 m of the run at a grazing
angle. Recordings V01 (original and repaired): the same back yard, a QA camera pulling back from 2.5 m to 8 m and then
sliding to the corner to look along the run, on one path in both modes. Up close (E01) the two are identical by
construction; the difference grows with distance and angle (E03 and the end of V01: the original's far wire is gone, posts
and top rail only; the repaired one keeps a faint grey screen). From the street the rear runs are mostly hidden by the
houses, which is why no riding-camera view is used for this repair.

## 4. Briarwood creek's vegetation (A-83)

**Problem.** The creek strip down Briarwood Lane still carried the original procedural planting: 28 brush clumps (two
green spheres each), 197 reed clumps of flat three-triangle blades, 39 hard-edged nine-sided mud and wet patches and 42
flattened-sphere algae. `?vegetation` never recorded them, and its tree record stops 95 m from Oak Hollow, before most of
the creek's 38 trees.

**Repair.** `creek.js` now records those objects (guarded by `W.er`: no random draw moves, so the street is the same) and
`envrepair.js` replaces them from the vegetation library itself: its natural shrubs (large near the grate, medium and small
along the fences), its grasses (280 clumps in place of the 197 reed clumps), its street trees for the 38 creek trees (the
vegetation benchmark's species rule), soft-edged ground patches (damp silt, wet mud) and translucent algae along the
channel's edges. Same materials, wind and LODs as `?vegetation`. Terrain, channel, culverts, bridge, railing, fences and
their openings, the path, the clue, every collider and every sightline used by the chapters are untouched (the suite
hashes them). Chapter Two and Chapter Three are not rebuilt; the repair is Prologue-only like the other benchmarks.

Without `?vegetation` the plants are skipped (the label says so) and only the ground patches are repaired.

**Visibility in the Prologue.** The playable Prologue only sees the creek from Oak Hollow at the Briarwood junction, about
90 m down the lane (pair E13). The close views E04–E05 are QA cameras on the bank.

## 5. Play equipment and toys (A-84)

The details kit's trampolines, swing sets, big wheels and wagons, the items the details report flagged as thin, are swapped
for repaired pieces from `envrepair.kit.glb` built in Blender (`tools/blender/envrepair/build_envrepair_kit.py`), in the same
places and colours:

| Piece | Repairs | Triangles LOD0 / 1 / 2 (details kit before) |
|---|---|---|
| Trampoline | 45 mm W-legs with T-sockets, a base U on plastic feet, enclosure poles clamped to the legs with straps, 36 mm pad foam | 8,228 / 4,212 / 1,306 (3,420 / 1,560 / 708) |
| Swing set | 48 mm legs on plastic feet, hangers and shackles, seats 9 mm thick, chain clips | 2,744 / 1,640 / 860 (1,232 / 672 / 217) |
| Big wheel | moulded body with rounded edges, tread ribs on the front wheel, pedal blocks on their cranks, axle caps | 3,520 / 1,748 / 512 (1,410 / 1,012 / 291) |
| Wagon | tray walls with a rolled rim, hub caps, the handle's yoke | 2,232 / 1,160 / 391 (1,510 / 790 / 229) |

**Grounding.** Each instance is moved by the difference in its lowest contact, and the trampolines and swing sets are fitted
to the lawn under their feet (a least-squares plane through the terrain heights at each foot, tilt at most 6°, lifted so the
lowest foot touches). On slopes the old pieces sank up to 0.21 m into the lawn. The suite measures every foot of the 23
trampolines and 19 swing sets against the terrain under it: the repaired ones sink 0 m and float 0 m (its limits are 5 cm and
3 cm). The old oak's tire swing is not touched; no toy is added or removed.

## 6. Contact shadows (A-85)

The sun's shadow map (about 5 cm texels in the yards) cannot draw the contact itself, so small things looked set down on the
lawn rather than on it. `envrepair.js` adds one instanced, multiply-blended soft blob per grounded object, 932 in all: parked
cars, lawn and porch chairs, grills, toys, play-equipment feet, mailboxes, bins, hydrants, pole and lamp bases, sheds. They
are light (multiply, not black), not tone-mapped, fade out between 28 and 55 m, cost one draw call, and change no light,
material or shadow setting. The parked cars that drive off (`data.dynamic`) get none.

## 7. Consistency audit (Part A.5)

`tests/envrepair-audit-views.mjs` rides the Prologue with all eight flags and takes the riding camera's view to both sides
every 60 m (contact sheets in `docs/qa/envrepair-supportcast/audit/`). Findings:

**Method.**
- Forty views of the riding camera with all eight flags: every 60 m from 0 to 1,140 m, looking to both sides, at the game's own time of day for each distance (`audit-sheet-01…04.jpg`).
- The same-frame pairs and the recordings (§13).
- Measurements where a view raised a question.

| # | Where | Finding | Origin | Status |
|---|---|---|---|---|
| 1 | Parked cars, at dusk (900 m left, the E09b sedan) | **No float.** At dusk the cars can look lifted off the drive, so they were measured: the lowest point of each tyre, the lowest vertex in each quarter of the model, against the drive under it is 0.5–0.9 cm above the drive on all 42 parked cars along Oak Hollow. The impression comes from the dusk light, which leaves no dark line where the tyre meets the drive. The contact shadow is deliberately light, and at dusk the sun no longer helps. | street props, lighting | measured; nothing to repair. A stronger contact under tyres is a possible refinement (A-85). |
| 2 | Driveway cuts, close by (0 m left) | Where a lawn meets a driveway apron, the lawn's cut edge shows as a dark vertical face a few centimetres high. It is visible only close up. | terrain and pavement | pre-existing; noted, not changed. |
| 3 | Curb inlets (120 m right, 480 m right) | The storm-drain inlets are flat dark plates lying on the gutter, with no grate or depth. They read as a dark slot at riding speed, and as a plate from a stop. | pavement (16 inlets) | pre-existing; noted. |
| 4 | Jamie's mother and the hoop kid beside the four boys (V02, V04) | The two authored supporting characters have textured clothing, hair and faces. The four boys are still the procedural placeholders, so next to each other the difference in finish is plain. This is expected until Astra's Phase 1B characters arrive: the brief keeps the boys out of this pass. | this pass vs. the procedural boys | expected; for A-86 and Astra's handoff. |
| 5 | Play equipment and toys (120 m right, 360 m right, 960 m left, E06–E08c) | In scale with the houses, fences and bikes, and on the lawn in every view. The suite measures 0 m float and 0 m sink at every trampoline and swing-set foot. | this pass | consistent. |
| 6 | Chain link from the street | The rear-lot runs are hidden by the houses from the riding camera. The side-yard and lot-line runs show as a faint screen, and no run vanished in these stills. Shimmer needs motion: see V01. | this pass | consistent. |
| 7 | Dusk (720 m on) | Lit windows, porch lights and street lamps carry the scene, and nothing introduced here brightens or darkens it. The contact shadows fade with the sun's strength as designed. | the game | consistent. |
| 8 | The lookout and the old oak (1,140 m, E11) | Unchanged: the oak, its tire swing and the hopscotch are the game's own and the details kit's. | the game | untouched. |
| 9 | DEV label (found while auditing) | The supporting-cast label read "chr.jamie-mother vundefined": her GLB's scene carried the asset id without the version. | this pass | **fixed**: the scene now carries the rig's full tags (GLB, .blend and build script), and the suite checks it. |

No major inconsistency was found that this pass introduced. The two pre-existing items (2, 3) are small and belong to the pavement and terrain passes.

## 8. Jamie's mother (`chr.jamie-mother`, A-78, A-79, A-81)

### 8.1 Who she is (proposal; A-22 stays open)

`docs/art/JAMIE-MOTHER-IDENTITY.md` records the proposal: late thirties, 1.64 m, Jamie's warm medium-light skin and warm
brown eyes, a soft oval face of her own (not Alex's mother's and not a modified Jamie), natural brown hair pulled back into a
practical mid-height ponytail, the Prologue's muted red T-shirt, bootcut jeans and dark slip-on canvas shoes. The open
questions between the Prologue and Chapter Seven/Aftermath I (hair and eye colour, face, wardrobe, head size) are listed
there and are **not** resolved here.

### 8.2 The model

Built entirely by script in Blender 5.1.2 (`tools/blender/supportcast/build_jamie_mother.py` and its modules
`chr_head.py`, `chr_body.py`, `chr_hair.py`, `chr_tex.py`, `chr_rig.py`); editable source
`assets/source/chr/jamie-mother/chr.jamie-mother.blend`.

| | |
|---|---|
| Head | an implicit (signed-distance) head of ellipsoids and cones sampled on a quad grid and relaxed onto the surface; almond eye openings with lid margins, a mouth seam with a lip interior, ears; 22,882 triangles with the yoke |
| Eyes | sclera, iris and cornea; lashes as cards |
| Hair | a shell from the head grid (its edge sinks under the skin, so the hairline is a smooth crossing) with clump ribbons combed to the elastic, the elastic and an 18-card ponytail on a three-bone chain; 9,774 triangles |
| Body and clothes | lofted skin for the arms, hands (five fingers, nails) and neck; the T-shirt (rib neckband, set-in short sleeves, turned hem), jeans (waistband, the break on the shoe), canvas shoes; 15,498 triangles |
| Textures | baked from 3D noise on the mesh (no UV-space streaks): head albedo 2048², normal 1024², body, eyes, hair (cards atlas and a tileable shell), jersey, denim, canvas; 15 textures |
| Total | **50,714 triangles**, 10 draw calls, 8.36 MB GLB (above the 30–40k target for a supporting character: no LOD yet, §14) |
| Measurements | stature 1.637 m (1.646 m to the top of the hair), head 0.213 m (**7.68 heads**; the canon proposes 7.3–7.6), eyes 1.536 m, shoulder joints 0.332 m apart |

**Rig** (`rig.human.adult`): 65 bones, 60 deforming, named after Astra's Phase 1B protagonist rig (`root, hips, spine_01,
spine_02, chest, neck, head, clavicle_*, upperarm_*, lowerarm_*, forearm_twist_*, hand_*`, three joints per finger,
`thigh_*, calf_*, foot_*, toe_*`) plus `jaw`, `eye_l/r`, `phys_ponytail_01-03`, `socket_grip_*`, `socket_head_top`,
`socket_chest`. Weights are chain-based (arc length along each limb with blend widths, four influences, normalised); the
sleeves follow the arm chain. **Face**: 30 ARKit-named shape keys (blinks, squints, wide eyes, brows, smile, frown, stretch,
press, cheek, sneer, pucker, funnel, upper-up, lower-down, close, puff, jaw open) so `asset-library.js faceWeights()` drives
them.

**Expressions built** (renders `portrait-*`): neutral, warm smile, calling, attentive, mild expectation, blink. Grief is
not built or animated.

**Clips** (NLA, exported as glTF animations): `idle_breathe` 4.0 s loop, `walk` 1.2 s loop (1.30 m stride), `door_open`
0.6 s, `porch_wave` 2.4 s, `porch_wait` 8.0 s loop, `apose`.

### 8.3 Her scene (the game's controller unchanged)

`friends.js updateMom` stays the source of truth: when she appears, where she walks, which way she faces, when she goes back
in, when the door closes and its sounds. `supportcast.js` reads its state each frame, hides the procedural meshes inside the
controller's group (the group keeps the controller's visibility, so no duplicate body or shadow), places the authored root on
the group's own transform and samples the clips at the controller's clock:

| Brief | What she does | Driven by |
|---|---|---|
| A. In the doorway | she starts 2.3 m inside the front wall, out of sight | `mode 'waiting'` |
| B. The door opens | anticipation: weight shift and a lifted hand while the game swings the door in 0.6 s. **No hand on the handle**: she is 2.3 m away and the door opens itself; forcing contact would mean moving her or changing the door's timing, which the brief forbids | `mode 'opening'` → `door_open` |
| C. Walking out | the walk with its phase taken from the distance she actually moves (1.30 m per cycle) and foot IK onto the porch and steps (`MAIN.project` + `world.groundY`) | `mode 'out'` → `walk` |
| D. Looking at Jamie | eyes ±0.45 rad, head 0.55 and neck 0.35 rad of turn toward the placeholder Jamie's head, damped | `mode 'porch'` |
| E. Calling | a small wave in the game's own wave window (`addWave` timing kept) and a **silent** call: her mouth shapes a short call between 0.05 and 1.15 s with no sound and no caption. She has no line in `story.js`; Jamie's "That's my mom. I gotta go." is unchanged | `porch_wave` + face keys |
| F/G. Waiting | weight shifts, a hand to the hip, blinks; after 6 s a mild expectation (brows, a small press of the lips); nothing ominous | `porch_wait` |
| H. Following him in, the door | when Jamie is inside she walks back to `door.inside` and is hidden; the controller closes the door 0.15 s later with its slam | `mode 'in'` → `walk` |

The ponytail swings on three damped springs.

**Evidence.** Blender renders (front, side, back, three-quarter, A-pose, the six expressions, profile, ponytail, hands,
clothing, walk, wave, waiting posture), the same-scale lineup with Jamie's Phase 1A model (§8.4), clips 1–7 (idle, door,
walk, turn, call-and-wave, wait, return) and a face clip, all `--BLENDER-RENDER`; in game, pairs S01–S02 and the complete
scene V02 (Jamie in it is the existing procedural Jamie, a placeholder).

### 8.4 Beside Jamie

`render_lineup.py` appends Jamie's Phase 1A model (Astra's `chr.jamie.a12.blend`, read only, nothing saved back) next to
her at the same scale: her crown at 1.642 m, Jamie's cap at 1.566 m. **Limits of that comparison:** Jamie's 1A model is
a Sketchfab-based design pass with its own shading; it is not the game's current Jamie nor Astra's Phase 1B character; the
two are rendered under one light only for scale and family resemblance.

## 9. The driveway basketball kid (`chr.hoop-kid`, A-80)

The anonymous neighbour of `CAST.kid` (not Lily Henderson, not one of the four), kept where and as he was: same driveway,
same colours (warm brown skin, short dark hair, the off-white ringer tee with red trim, knee-length blue shorts, white
socks, off-white sneakers). Built with the same modules at child proportions (1.50 m): 25,002 triangles, 3.78 MB, the same
65-bone naming and 30 face keys. Clips: `dribble` (normalised to the controller's 0.52 s bounce), `shoot` (release at the
controller's 0.35 s), `catch`, `hold`, `idle`.

`ambient.js updateKid` is unchanged: the dribble, the shot, the ball's flight and timing, the bounce back and the look at the
boys. `supportcast.js` plays the matching clip at the controller's own phase, puts his right hand on the ball the controller
places (two-bone IK) and keeps his feet planted (foot IK). Read-only access through one getter (`ambient.hoopKid`).

**Background life.** No pedestrian or event was added. Apart from the four boys, Jamie's mother and the hoop kid are the
Prologue's only people (`ambient.js`'s parent coming home is a car), so with `?supportcast` every adult and child the
Prologue shows besides the boys is authored. The audit (§7, item 4) notes how the pair sits beside the procedural boys.

## 10. Integration

- `dist/game.js` (about 18 lines), `dist/ambient.js` (one getter), `dist/asset-library.js` (three entries), `dist/world.js`
  (`opts.envrepair` → `W.er`, the `er:` zone prefix), `dist/creek.js` (guarded records), `dist/vegetation-assets.js` (three
  `export` keywords). Every line is inert without its flag; the handoff (`docs/ENVREPAIR_SUPPORTCAST_HANDOFF.md`) lists them.
- Not touched (`git diff` against the starting commit lists only the files above):
  - `friends.js`, `cast.js`, `rig.js`, `faces.js`, `astra-anatomy.js`, `people.js` and the adult and later-chapter casts; the suite
    compares these with the starting commit.
  - The four boys' assets, `story.js`, every sound and caption.
  - Astra's Phase 1B files (`player-1b.js` and the rest) are not on this branch at all.
- Review build: `index.html?bikes&houses&vegetation&pavement&streetprops&details&envrepair&supportcast`. Keys: `'` repairs,
  `;` cast.
- With Astra's work: `…&player1b&friends1b` was **not tested** here (that code is not on this branch). The handoff explains
  what `friends1b` must keep (`friends.mom` and its fields, `updateMom`) and how to point her gaze at the 1B Jamie.

## 11. Tests and regressions

### 11.1 This pass (`node tests/envrepair-supportcast-browser.mjs`)

⟦SUITE⟧

### 11.2 Existing suites (regressions)

All of these ran on this branch's final runtime: nothing in `dist/` changed after `7fc71d6`, before the first of them
started. The browser suites use software WebGL, with `SHOTS=0`, which skips their screenshots, and `PARTS=A,B,C,D` where the
suite has parts. Logs and reports are in `docs/qa/envrepair-supportcast/regression/`.

| Suite | Result | Notes |
|---|---|---|
| `tests/verify.mjs` (headless game: world geometry, riding, characters, interface, chapters, ending, replay) | **stops at its last block**, the DEV chapter selector check (`dev-chapters-sim.mjs:227`, "2/alex-bike": Alex's bike after a DEV jump to Chapter Two at (115.1, −511.5) instead of (−1.4, −17)). Every check before it passes. | **Pre-existing.** The starting commit `716fc6b` fails the same check with the same values (`verify-at-start-716fc6b.log`). Nothing in this pass touches the chapters or the DEV selector. |
| `tests/pipeline-browser.mjs` | 36 passed, 0 failed | |
| `tests/bike-browser.mjs` | 29 passed, 0 failed | |
| `tests/details-browser.mjs` | 36 passed, 0 failed | |
| `tests/streetprops-browser.mjs` | 32 passed, 0 failed | |
| `tests/vegetation-browser.mjs` | 74 passed, 0 failed | |
| `tests/pavement-browser.mjs` | 30 passed, 0 failed | |
| `tests/house-browser.mjs` | 30 passed, 0 failed | |

No regression was introduced. The one failure in the headless verification is the starting commit's own.

## 12. Performance

All frame times are **software WebGL** (Chromium + ANGLE SwiftShader on 4 CPU cores, not a GPU): they show relative CPU-side
cost and are noisy (a median of three renders). No real-GPU measurement was made. Triangle counts are not a proxy for speed.

Measured by `node tests/envrepair-supportcast-perf.mjs` (`docs/qa/envrepair-supportcast/perf.json`, at commit 0cacb35): the six
benchmarks (`?bikes&houses&vegetation&pavement&streetprops&details`) against all eight flags, in one fresh page each, at six
riding cameras, 1600 × 900. Each frame time is the median of three renders; the cast's update time is the mean of 120
calls of `__supportcast.update` at that camera.

| Camera | Draw calls | Triangles | Frame ms (software) | JS heap MB | Textures | Cast update ms |
|---|---|---|---|---|---|---|
| C1 hoop kid | 621 → 652 (+31) | 962,199 → 972,221 (+10,022) | 86.8 → 76.3 | 1,856 → 1,737 | 74 → 96 | 0.037 |
| C2 yards | 612 → 665 (+53) | 1,074,794 → 1,098,063 (+23,269) | 40.6 → 36.5 | 1,570 → 1,737 | 76 → 98 | 0.168 |
| C3 chain link | 708 → 751 (+43) | 1,228,176 → 1,222,712 (-5,464) | 11 → 14.8 | 1,563 → 1,626 | 79 → 101 | 0.001 |
| C4 Briarwood junction | 601 → 602 (+1) | 971,114 → 982,442 (+11,328) | 19 → 10.5 | 1,567 → 1,630 | 83 → 105 | 0.001 |
| C5 Jamie's porch (scene running) | 634 → 625 (-9) | 914,315 → 976,481 (+62,166) | 17.2 → 15.4 | 1,562 → 1,623 | 92 → 133 | 0.287 |
| C6 lookout | 317 → 328 (+11) | 454,530 → 516,227 (+61,697) | 29.2 → 36.2 | 1,550 → 1,645 | 94 → 135 | 0.075 |
| **All six cameras** | **3,493 → 3,623 (+3.7%)** | **5,605,128 → 5,768,146 (+2.9%)** | 203.8 → 189.7 | | | |

**Loading.** Page to first frame: 34.7 s with the six, 34.4 s with all eight (the difference is inside the noise of
one run). `?envrepair`'s own setup 3.7 s (the kit GLB, the creek replacement, 932 contact-shadow instances);
`?supportcast`'s 1.8 s (the two GLBs read and parsed in parallel: the mother 8.36 MB, read 253 ms, parsed
953 ms; the kid 3.78 MB, 318 ms and 273 ms). The ride starts while they load; until then the original
people are drawn.

**Reading it.**
- **Draw calls.** The repairs and the cast add 31–53 draw calls at C1–C3, and nearly none at C4–C6.
  - The play-equipment swap adds no draws: it replaces the geometry inside the details kit's own instanced meshes.
  - The contact shadows are one instanced draw.
  - The other new draws are the creek's replacement planting where it is in view, and the characters, at 10 draws each plus their shadow-map draws, while the game shows them.
  - At the porch (C5) the authored mother replaces the procedural mother's meshes, which drew more: a net change of −9.
- **Triangles.** They rise by 62k at the porch (+6.8%, her 50.7k with the rest of the scene) and by 62k at the lookout (+13.6%, see below). Over the six cameras the rise is 2.9%.
- The frame times move in both directions by more than the change can explain: C1 is the first view after loading, and
  C4 went from 19 to 10 ms. They are not a measure of either flag's cost, and the eight-flag total is lower than the six's.
- The cast's per-frame update (clip sampling, IK, gaze, springs) is at most 0.29 ms, measured at the porch while the scene runs.
- **Off-screen characters are still drawn.**
  - At C6, the lookout, Jamie's mother is still "visible": the QA jump skipped the end of her scene. Her 10 draws and 50.7k triangles are drawn 340 m behind the camera.
  - The cause is `asset-library.js`, which turns frustum culling off for every skinned mesh. That library is shared with Astra's characters, so this pass did not change it.
  - In play this costs little: she is out only while the group is at her house, and the hoop kid only while the ride is within 140 m of him.
  - A cull sphere in `supportcast.js` is the obvious next step (§14).
- **The numbers are software WebGL**, Chromium and ANGLE SwiftShader on the container's CPU. No GPU frame time was measured, and these say nothing about one.

## 13. Evidence

**Review gallery:** ⟦GALLERY⟧ (private until shared). Everything in it is in `docs/qa/envrepair-supportcast/`:

In-game images and films carry the label "in game · software WebGL" and were rendered with all eight flags. Those marked
`--BLENDER-RENDER` are offline Cycles renders of the editable .blend files, not the game. Wherever Jamie appears in the
game he is the existing procedural Jamie, a placeholder.

| Folder | What | Files |
|---|---|---|
| `browser/` | **Same-frame pairs.** One camera and one frame, and only the benchmark's own key changes between the two images: `'` for the repairs, `;` for the cast. Cameras and subjects are in `captures.json`. | E01–E03 chain link (2.5 m, 7 m, a 25 m run at a grazing angle) · E04–E05 the creek's planting · E06–E08c trampolines, the net, the big wheel, the wagon, the swing set · E09–E09b grounding and contact shadows · E10 the riding view · E11 the lookout and the old oak (unchanged) · E12 the whole street · E13 the creek from Oak Hollow · S01–S02 Jamie's mother · S03–S04 the hoop kid |
| `browser/detail/` | Enlarged crops of the pairs whose difference is small in the full frame (made by the gallery script) | 10 |
| `video/` (in game) | **Recordings.** Rendered frame by frame at a fixed game step, so they play in real time. | V01 the chain link in motion, original and repaired (one back yard: from 2.5 m to a grazing view along the run) · V02 Jamie's mother's complete scene · V03 the hoop kid at his driveway (from the driveway's side, the hoop in frame; the street's utility pole, nearer the camera, crosses his left arm at moments: the sight-line test that chose the spot did not catch it, and S03 is the unobstructed close view) · V03b riding past him · V04 the combined ride from the hoop kid's street to past Jamie's house (146 s) |
| `video/*--BLENDER-RENDER.mp4` | **Motion clips** of the authored characters | Mother: idle, door, walk, turn, call-and-wave, wait, return, face. Kid: dribble, shoot, catch. Each with a still |
| `blender/` | **Model renders** | Mother: front, side, back, three-quarter, A-pose; neutral, smile, calling, attentive, expectant, blink, profile; ponytail, hands, clothing, walk, wave, waiting posture. The **same-scale lineup** with Jamie's Phase 1A model (front, three-quarter, heads) and `lineup-heights.txt`. Kid: front, back, three-quarter, neutral portrait, dribble, shoot, follow-through, catch, hold |
| `audit/` | Contact sheets of the consistency audit (§7) | `audit-sheet-01…04.jpg`: 40 views |
| `tests/report.json` | This pass's suite (§11.1) | |
| `perf.json` | The performance run (§12) | |
| `captures.json` | Every pair and recording: camera, subject, renderer, commit, size and SHA-256 | |

## 14. Provenance, limitations, decisions

**Provenance.** Every model, texture and animation here is original, generated by the scripts in `tools/blender/` (Blender
5.1.2) and in the runtime modules; no Sketchfab model, scan, ripped asset, likeness or third-party character was used and no
generated image was presented as 3D. `PROVENANCE.md` sits beside each source (`assets/source/chr/jamie-mother/`,
`assets/source/chr/hoop-kid/`, `assets/source/envrepair/`). Jamie's Phase 1A model was opened read only for the lineup and
is not shipped. `docs/THIRD_PARTY_ASSETS.md` is unchanged (nothing new from a third party).

**Known limitations**
- **Jamie's mother**
  - She is 50,714 triangles with no LOD: the brief asked for 30–40k. A LOD set, or a lighter hair shell, is the next step if she is kept.
  - She measures 7.68 heads tall, against the canon proposal's 7.3–7.6.
  - Her hands are simplified: five fingers that read as a slightly mitten-like hand at the porch distance, with a simple thumb.
  - Her hand never touches the door handle (§8.3 B).
  - The hairline is a gentle edge with a slight scallop behind the ear in close-ups.
  - A tiny dark dot sits at one mouth corner in the closest portrait.
  - Her skin reads paler under the Blender review lights than in the game.
- **The hoop kid**
  - With both arms raised for the shot, a small gap shows at the sleeve's armpit.
  - He shares the mother's modules, so the same hand simplification applies.
- **Gaze.** On the porch the angle between her head's direction and Jamie's head has a median of 18.8° and a 90th percentile of 37.3°. That is inside the suite's limits (20° and 40°), but she lags when he moves quickly, because the neck and head are damped.
- **Chain link**
  - The coverage rule is a screen-space dither. At a distance it keeps the fence as a faint, fixed grey screen rather than true wire.
  - The dither is fixed to the screen. While the camera moves, the fence slides through a stationary stipple, which reads as a fine grain slightly busier than the original. In V01 the fence band changes about 12% more from frame to frame (mean change 10.7 against 9.6 per frame, out of 255), and no stretch of fence vanishes or pops.
  - From the street most rear-lot chain link is hidden behind the houses, so in the riding camera the repair mostly shows at side yards and gaps.
- **Off-screen characters are drawn** (§12): the shared asset library turns frustum culling off for skinned meshes. A cull sphere in `supportcast.js` is the next step.
- **Riding view.** E10, the riding camera, shows little change: the repairs are small at riding distance by design.
- **Not tested**
  - `player1b&friends1b`, Astra's unfinished Phase 1B, is not on this branch.
  - No GPU frame times exist: every number here is from software WebGL.
- **Scope.** Contact shadows are blobs, not ambient occlusion. Nothing here touches the game's lighting.

**Decisions for the creative director** (all OPEN in `docs/art/ART-APPROVAL-REGISTER.md`): A-78 the mother's identity,
A-79 her performance, A-80 the hoop kid, A-81 the adult rig as a reference, A-82 chain-link coverage, A-83 the creek, A-84
play equipment, A-85 contact shadows, A-86 whether either becomes the default and reaches the later chapters. A-22 (the
mother's canonical identity across chapters) stays open.

## 15. Delivery

⟦DELIVERY⟧
<!-- BODY:end -->
