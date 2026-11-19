# Prologue roads, sidewalks, curbs & driveways — pavement reconstruction report

**Branch** `claude/prologue-roads-sidewalks-curbs-reconstruction`, started from
`claude/prologue-grass-lawn-ground-repair` at **`ec34db3a59646beb8b4be1d2aeeda77354a1f5d2`** (verified before any
change; that branch is untouched). Final commit: in the table below; nothing is merged into `main`.
Without `?pavement` the game is unchanged (proved below, vertex by vertex).

**Evidence and its limits.** Every in-game image is the shipped renderer under **software WebGL** (Chromium + ANGLE
SwiftShader, **not a GPU**), from the game's own riding camera placed by the QA hook (a review camera, not a person's
playthrough), at 1600 × 900. Each before/after pair is **one camera and one frame**: only the O key's mode changes.
No Blender render and no concept image is used anywhere in this report. Every performance number is a software-renderer
or file number; no real-GPU frame time has been measured.

**Result.** With `?pavement` the roads, gutters, curbs, sidewalks, driveway aprons, driveways, front walks, the two
junctions, the side streets and the cul-de-sac render as physically based asphalt and concrete (CC0 photogrammetry
micro-structure + Last Light's own layout-driven wear), in the running game, with **O** comparing against the original
in the same frame. The geometry, every gameplay query, collisions and the riding are the default game's — proved vertex
by vertex and query by query — except two documented visual-only fixes (soil faces closing the step beside driveway
aprons; the cul-de-sac bulb tessellated so it no longer sinks below the ground). Pavement suite: **30 passed, 0 failed**.
Shown in the Prologue only; Chapter Eight's damage cuts the same materials.

## 1. Source of truth

| | |
|---|---|
| Starting branch | `claude/prologue-grass-lawn-ground-repair` |
| Starting SHA | `ec34db3a59646beb8b4be1d2aeeda77354a1f5d2` (`git rev-parse HEAD` before the branch was made) |
| Working branch | `claude/prologue-roads-sidewalks-curbs-reconstruction` (new) |
| Final SHA | __FINAL_SHA__ |

Kept as they were: the bikes, houses, vegetation, old oak, lawn and grass benchmarks (their files byte for byte), the
story through Chapter Eight, Aftermath I and II, the 2026 coda and the credits.

## 2. What was wrong with the original pavement

Read from the source (`streets.js`, `houses.js`, `furniture.js`, `materials.js`, `art-surfaces.js`) and seen in the
"original" half of every pair:

| Surface | Original treatment | What it looked like |
|---|---|---|
| Asphalt | One mid-grey colour; `roadwear`: three value noises (0.65, 46 and 130 cycles/m) and a sine "fissure" | A smooth grey rubber sheet; no aggregate, no binder, no wear by use. Large soft blotches. |
| Patches | 30 random rectangles of a darker grey laid on the road as decals (polygon offset) | Floating rectangles with no seam, anywhere across the lanes. |
| Cracks | 44 one-pixel `THREE.Line`s, 2–3 m long, wandering | Thin wiggly lines, aliased, the same width at every distance; up close they read as drawn loops. |
| Gutter, curb, sidewalk, driveway | One flat colour each × a 6-cycle/m and a 0.5-cycle/m noise (±6 %) | Smooth beige plastic. |
| Sidewalk joints | A 14 mm × 3 mm dark box laid on top of the walk every 1.52 m | Floating dark bars; no groove, no tooled edge. |
| Driveway joints | One-pixel lines | Aliased lines, gone at distance. |
| Manhole covers | A flat brown disc | A disc. |
| Driveway aprons | The apron runs from 3.5 cm (gutter) to 15 cm (walk) beside a lawn at 12 cm; the curb drops at each cut | An open step: the base ground showed through as a **brown wedge** beside every apron (pre-existing seam). |

## 3. What was built (materials and geometry)

**Architecture (the Art Bible's "keep the procedural sweeps, shared materials").** The road, gutter, curb, sidewalk,
driveway and walk geometry is exactly the procedural geometry of `streets.js` / `houses.js`. With `?pavement` the same
meshes are built with their own pavement materials and **carry their street coordinates through the bake**:

- `uv`: metres across / along the surface — lateral offset and distance `d` on the streets; the profile offset and `u`
  (or the arc length round the corners and the bulb) on curbs and walks; across / out-from-the-curb on driveways;
- `pv` (4 floats): the along direction in the world, the curb-cut factor (with the handedness), and a row/id (which
  street and side; which driveway).

`world.js`'s baker now carries `uv` and `pv` for materials that ask for them (`userData.pvUv`); nothing else in the bake
changes, and no default material asks. Batches stay merged by material and 110 m cell.

**One material per surface kind** (`dist/pavement-surfaces.js`): asphalt, gutter, curb, walk, driveway, house walk,
cast iron. Each wraps the surface's ORIGINAL treatment (the exact `roadwear` / `concrete` shader the default game uses)
and adds the reconstruction behind one shared uniform. So:

- the **O key** shows ORIGINAL and RECONSTRUCTED in the same frame (the original's old decal patches, crack lines and
  joint bars are kept in batches of their own and shown only in ORIGINAL);
- the **same material objects** stay in the merged world, so Chapter Eight's ground cuts (`chapter8-ruin.js cutWorld`
  patches every merged material once) cut the pavement like anything else.

**A street layout map** (2048 × 8 texels, one per metre along each side of Oak Hollow Drive, Briarwood and Summerfield)
is built from the real plan: driveway cuts (133), storm inlets (16), where cars can park at the curb, junction mouths,
front-yard trees within 17 m of the street (106). A 256 × 1 table holds each driveway's condition, whether a car parks
there, and whether children live there (a hoop, a friend's house). The shader reads both, so wear follows use.

**Geometry: two localized changes, both visual only** (no gameplay height, collision, navigation or lawn changes; every
other vertex in the world is the default game's, §11):

1. **Soil faces at the driveway aprons.** Thin faces closing the open step beside every driveway apron and at the
   lowered curb in front of it (30 batches, 8,384 triangles, no shadow proxy of their own). Before, the base ground
   showed through as a brown wedge.
2. **The cul-de-sac bulb, tessellated.** The default bulb is one fan of triangles up to 11 m long, which cannot follow
   the yards' relief: on the left half of the bulb its asphalt sat up to 4 cm *below* the street's ground, about 5 cm
   under the surface the riders and the game stand on (191 of 13,125 survey rays). With `?pavement` the same outline is
   built as rings every 1.4 m from the centre at the same `roadCrown` heights, so the visible asphalt now lies where
   the game always placed it (0 of 13,125). Same material and shader as the rest of the asphalt; no shadow (as
   asphalt).

## 4. Asphalt

| Layer | What and how | Scale |
|---|---|---|
| Aggregate, binder, pits | CC0 photogrammetry (Poly Haven *Asphalt 07*): stone aggregate in dark binder. Albedo used as **detail** (its own broad variation and colour cast removed, 30 % of the stone-to-stone hue kept), normal map, height, roughness, AO | 2.5 m tile, 1024² (410 px/m); stones 3–12 mm |
| Tiling | Two samples in **world metres** — 2.5 m, and 3.4 m turned 37° — blended by their height and a slow selection field (no visible period; no stretch at bends) | — |
| Resurfacing sections | Overlaid in pieces of ~170 m: ±3.75 % tone and ±15 % aggregate exposure per section | 120–230 m |
| Broad variation | Two fbm layers, a few percent | 6–22 m |
| Traffic | Two wheel paths per lane (darker, smoother, less aggregate), the oil-drip line between them; round the bulb, a turning loop | lanes at ±2.2 m (±1.9 on side streets) |
| Crown seam | The paving pass joint at the crown: a hairline crack for about half its length, rubberized sealant in ragged runs | 3.5 mm crack; 4.5–6.5 cm sealant |
| Transverse cracks | About one 7 m cell in three; wandering, partial or full width; 60 % sealed | 3–5 mm crack; 5–6.5 cm sealant |
| Utility patches | A saw-cut service patch from the curb in front of about one lot in four or five; a rounded-square repair round each manhole. Darker, younger, finer; a fine ragged sealed seam | 0.9–1.4 m × 1.3–3.9 m; 1.5 m |
| Edge | The last 15–55 cm by the gutter: dustier, coarser, raveled (lost stones) | — |
| Oil | Where cars park (layout map), sparse, irregular | 0.3–0.5 m |
| Shape | Gentle depressions (normal only) | ~1 m |
| Roughness | 0.88–0.97 (wheel paths −0.06; patches 0.86; sealant 0.82; oil 0.74) — dry asphalt stays rough; no puddles | — |
| Distance | Mipmaps + 16× anisotropy; lines are box-filtered to their pixel coverage and cracks fade out by 5 cm footprint | — |

**Cast-iron covers** (the existing manholes): rim, ring, waffle bosses, two pick holes; tops polished by tires
(metallic 0.55, roughness 0.42), rust and grit in the recesses.

**Foundation for later chapters (dormant):** each surface computes where water would stand (wheel paths, the gutter
edge and flow line, shallow depressions); a `wet` parameter (0 in the Prologue, never changed) would darken porous
surfaces and smooth the low places. No rain or catastrophe state is implemented.

## 5. Concrete (sidewalks, curbs, gutters, driveways, walks)

All concrete shares one CC0 photogrammetry set (Poly Haven *Gravel Concrete 04*: fine aggregate, small exposed stones,
pores), 2 m tile, 1024² (512 px/m), sampled in world metres at two scales (or triplanar on the curb face), then:

| Sidewalk | |
|---|---|
| Panels | 1.52 m (the existing joint positions), each with its own tone (±3 %), warm/cool shift and age; stretches of ~30 m poured together; 6 % newer replaced panels (lighter, crisper) |
| Finish | Broom striations across the walk (fine 2–4 mm and broader 1–2 cm strokes, faded before they would shimmer); tooled **edger margins** 3–4.5 cm round each panel and 7–8.5 cm along the long edges (smoother, lighter) |
| Joints | Tooled control joints 7 mm wide with rounded lips (normal) and a dark core (occlusion); an expansion joint (13 mm, dark filler) every tenth panel — in the surface itself, no floating bars |
| Imperfections | ~5 % of panels cracked (hairline), tannin stains under trees, a few old dark spots, soil at the lawn edge, grass in some joints by the lawn, a **heaved panel** near some large front-yard trees (tilted shading and a lit riser at its joint — shading only: no height or collision change), tire wear where the walk crosses a driveway |

| Curb | |
|---|---|
| Profile | The original rounded profile (face, nose, top, back) — shading follows it |
| Finish | Triplanar concrete (smoother: 55 % normal), joints every 3.04 m, the nose worn lighter with aggregate showing and small chips, grime up the face from the gutter, soil and a little green on the lawn side, tire scuffs and more chips at the driveway cuts |

| Gutter pan | |
|---|---|
| Finish | Smoother, darker concrete; joints every 3.04 m with the curb; a darker flow line by the curb with sediment, more near the storm inlets; the lip joint with the asphalt; a few leaves (mostly dry; more near trees and inlets); scuffs where cars cross into driveways |

| Driveways | |
|---|---|
| Slabs | The apron (to 1.65 m), under the walk, then control joints every 3.4 m from 6.35 m (the original joint positions); a centre joint on double drives; tooled margins along the edges; broom finish across |
| Per household | Condition from kept to old (≈ 32 % kept, 48 % average, 20 % old): joint darkness, cracks, discolouration; tire tracks (one car, or two on a double drive); oil under the car where one parks, faint old stains on worn drives; ball scuffs and faint rained-on chalk where children live |
| Front walks | The same concrete, joints every 1.2 m |

## 6. Curbs, gutters and driveway cuts — what changed at the cut

The cut geometry (the curb's height scale, the apron's profile) is the original. At each cut the shading adds tire
scuffs and chips on the lowered curb, tire wear across the gutter and the walk, and the soil face closes the open step
beside the apron (§3).

## 7. Intersections, side streets and the cul-de-sac

The side streets use the same materials in their own frames (their own seam, cracks and patches: hashes are seeded per
street). Round the junction corners and the bulb the curb and walk use arc length, so joints stay radial and panels
stay 1.52 m along their centre line. The asphalt's micro-structure is in world metres, so there is no seam where the
main road, the corner fans, the side streets and the bulb meet; the side street's paving joint at the main curb line is
drawn. In the cul-de-sac the wheel paths become a turning loop (no drip line: cars do not park there), the crown seam and
transverse cracks stop, and the edge follows the real curb (the straight line, the reverse curve and the bulb). The
bulb's asphalt is tessellated so it no longer sinks below the ground (§3). The story's chalk, the bench, the swing, the
oak and the lookout grass are untouched.

## 8. Lawn boundary compatibility

No lawn, grass, tree, oak or plant geometry or material was changed. The repaired lawn's masks read the world's ground
queries (`surfaceY`, `authoredY`), which are identical with and without `?pavement` (§11), and the lawn builds the same
cells in the same chunks (part C). The soil faces sit below the lawn's edge, inside the step the lawn never covered.

## 9. Before/after evidence

Every row is **one camera and one frame** in the running game (game-renderer captures; the gameplay riding camera
placed by the QA hook; **software WebGL**, SwiftShader; 1600 × 900; commit `c30d2c1`). Only the O key's mode changes
between the two images. The clock is the game's own HUD. P12, P17, P19, P20 and P22 were taken with
`?bikes&houses&vegetation&pavement` (the authored bikes, refined houses, authored vegetation and repaired lawn on in
both halves; only the pavement changes). The camera pose of each is in `qa/pavement/browser/report.json`.

A browsable version with a compare slider: the review gallery (published link in the delivery message; the same page is
`review-gallery/index.html` inside the ZIP).

| View | Camera | Scene and light | After | Before |
|---|---|---|---|---|
| **P01** asphalt directly beneath the player while riding | riding camera (QA placement) | AUGUST 21, 2011  7:42 PM · golden hour | [reconstructed](qa/pavement/browser/P01-asphalt-beneath-the-bike--reconstructed.jpg) | [original](qa/pavement/browser/P01-asphalt-beneath-the-bike--original.jpg) |
| **P02** the road looking forward from bicycle height | riding camera (QA placement) | AUGUST 21, 2011  7:42 PM · golden hour | [reconstructed](qa/pavement/browser/P02-road-ahead-from-the-bike--reconstructed.jpg) | [original](qa/pavement/browser/P02-road-ahead-from-the-bike--original.jpg) |
| **P03** a long view down Oak Hollow Drive | riding camera (QA placement) | AUGUST 21, 2011  7:46 PM · golden hour | [reconstructed](qa/pavement/browser/P03-long-view-down-oak-hollow--reconstructed.jpg) | [original](qa/pavement/browser/P03-long-view-down-oak-hollow--original.jpg) |
| **P04** a close asphalt detail: a repaired manhole, a sealed crack | riding camera (QA placement) | AUGUST 21, 2011  7:43 PM · golden hour | [reconstructed](qa/pavement/browser/P04-asphalt-close-detail--reconstructed.jpg) | [original](qa/pavement/browser/P04-asphalt-close-detail--original.jpg) |
| **P05** asphalt meeting the concrete gutter pan | riding camera (QA placement) | AUGUST 21, 2011  7:44 PM · golden hour | [reconstructed](qa/pavement/browser/P05-asphalt-meets-gutter--reconstructed.jpg) | [original](qa/pavement/browser/P05-asphalt-meets-gutter--original.jpg) |
| **P06** sidewalk concrete (riding camera on the walk, eye about 1.5 m) | riding camera (QA placement) | AUGUST 21, 2011  7:42 PM · golden hour | [reconstructed](qa/pavement/browser/P06-sidewalk-from-standing-height--reconstructed.jpg) | [original](qa/pavement/browser/P06-sidewalk-from-standing-height--original.jpg) |
| **P07** sidewalk joints from close range | riding camera (QA placement) | AUGUST 21, 2011  7:42 PM · golden hour | [reconstructed](qa/pavement/browser/P07-sidewalk-joints-close--reconstructed.jpg) | [original](qa/pavement/browser/P07-sidewalk-joints-close--original.jpg) |
| **P08** the curb face from bicycle height | riding camera (QA placement) | AUGUST 21, 2011  7:42 PM · golden hour | [reconstructed](qa/pavement/browser/P08-curb-face-from-the-bike--reconstructed.jpg) | [original](qa/pavement/browser/P08-curb-face-from-the-bike--original.jpg) |
| **P09** a driveway curb cut from street level | riding camera (QA placement) | AUGUST 21, 2011  7:43 PM · golden hour | [reconstructed](qa/pavement/browser/P09-driveway-curb-cut--reconstructed.jpg) | [original](qa/pavement/browser/P09-driveway-curb-cut--original.jpg) |
| **P10** a complete residential driveway | riding camera (QA placement) | AUGUST 21, 2011  7:43 PM · golden hour | [reconstructed](qa/pavement/browser/P10-a-whole-driveway--reconstructed.jpg) | [original](qa/pavement/browser/P10-a-whole-driveway--original.jpg) |
| **P11** the sidewalk passing a driveway | riding camera (QA placement) | AUGUST 21, 2011  7:43 PM · golden hour | [reconstructed](qa/pavement/browser/P11-sidewalk-passing-a-driveway--reconstructed.jpg) | [original](qa/pavement/browser/P11-sidewalk-passing-a-driveway--original.jpg) |
| **P13** the Briarwood Lane junction | riding camera (QA placement) | AUGUST 21, 2011  7:51 PM · sunset | [reconstructed](qa/pavement/browser/P13-briarwood-intersection--reconstructed.jpg) | [original](qa/pavement/browser/P13-briarwood-intersection--original.jpg) |
| **P14** the Summerfield Road junction | riding camera (QA placement) | AUGUST 21, 2011  7:55 PM · sunset | [reconstructed](qa/pavement/browser/P14-summerfield-intersection--reconstructed.jpg) | [original](qa/pavement/browser/P14-summerfield-intersection--original.jpg) |
| **P15** the curved cul-de-sac curb | riding camera (QA placement) | AUGUST, 2011  AS YOU REMEMBER IT · dusk at the cul-de-sac | [reconstructed](qa/pavement/browser/P15-cul-de-sac-curb--reconstructed.jpg) | [original](qa/pavement/browser/P15-cul-de-sac-curb--original.jpg) |
| **P16** the cul-de-sac asphalt and the lookout | riding camera (QA placement) | AUGUST, 2011  AS YOU REMEMBER IT · dusk at the cul-de-sac | [reconstructed](qa/pavement/browser/P16-cul-de-sac-and-lookout--reconstructed.jpg) | [original](qa/pavement/browser/P16-cul-de-sac-and-lookout--original.jpg) |
| **P18** the streetlight at d 1115 on the pavement, end of the evening (after the call at the lookout, night 0.7) | riding camera (QA placement) | AUGUST, 2011  AS YOU REMEMBER IT · end of the evening (after the call) | [reconstructed](qa/pavement/browser/P18-streetlights-at-dusk--reconstructed.jpg) | [original](qa/pavement/browser/P18-streetlights-at-dusk--original.jpg) |
| **P21** the game's flashlight on the pavement at the end of the evening (QA lighting test: the flashlight light switched on in the Prologue, after the call) | riding camera (QA placement) | AUGUST, 2011  AS YOU REMEMBER IT · end of the evening (after the call) | [reconstructed](qa/pavement/browser/P21-flashlight-on-the-pavement--reconstructed.jpg) | [original](qa/pavement/browser/P21-flashlight-on-the-pavement--original.jpg) |
| **P12** the sidewalk and the repaired lawn | riding camera, with `?bikes&houses&vegetation` | AUGUST 21, 2011  7:43 PM · golden hour | [reconstructed](qa/pavement/browser/P12-sidewalk-and-lawn-boundary--reconstructed.jpg) | [original](qa/pavement/browser/P12-sidewalk-and-lawn-boundary--original.jpg) |
| **P17** golden-hour shadows across the road | riding camera, with `?bikes&houses&vegetation` | AUGUST 21, 2011  7:45 PM · golden hour | [reconstructed](qa/pavement/browser/P17-golden-hour-shadows--reconstructed.jpg) | [original](qa/pavement/browser/P17-golden-hour-shadows--original.jpg) |
| **P19** a wider scene with the refined houses and vegetation | riding camera, with `?bikes&houses&vegetation` | AUGUST 21, 2011  7:43 PM · golden hour | [reconstructed](qa/pavement/browser/P19-houses-trees-and-pavement--reconstructed.jpg) | [original](qa/pavement/browser/P19-houses-trees-and-pavement--original.jpg) |
| **P20** the boys' bicycles with all four upgraded systems | riding camera, with `?bikes&houses&vegetation` | AUGUST 21, 2011  7:42 PM · golden hour | [reconstructed](qa/pavement/browser/P20-the-boys-bikes-and-all-four--reconstructed.jpg) | [original](qa/pavement/browser/P20-the-boys-bikes-and-all-four--original.jpg) |
| **P22** a driveway apron and the repaired lawn | riding camera, with `?bikes&houses&vegetation` | AUGUST 21, 2011  7:43 PM · golden hour | [reconstructed](qa/pavement/browser/P22-curb-cut-with-the-repaired-lawn--reconstructed.jpg) | [original](qa/pavement/browser/P22-curb-cut-with-the-repaired-lawn--original.jpg) |

Also: `P23-aftermath1-damage-with-the-flag--as-played.jpg` / `--forced-on.jpg` (Aftermath I with `?pavement`: as played
the label says "outside the Prologue: original surfaces shown"; the second frame forces the reconstruction on for the
test only — the fenced trench lies beyond this camera, so the material-level check in §11 is the proof that the damage
cuts the pavement, not this frame).

**What the pairs show (my reading, for review):**
- *Asphalt (P01–P05, P13, P14, P17).* The original is a smooth grey sheet with long looping one-pixel "cracks"; the
  reconstruction shows stone aggregate in binder at the right scale, darker wheel paths and the oil line, the crown's
  sealed seam, sparse sealed transverse cracks, patches with fine saw-cut seams, a cast-iron cover in a repaired
  surround, and golden-hour glare along the road toward the sun.
- *Concrete (P05–P11).* The original is flat beige with dark bars laid on top; the reconstruction shows broom-finished
  panels with tooled margins and real joints, per-panel tone and age, a curb with joints, worn nose and grime at its
  base, a gutter pan with its flow line and a few leaves, and the driveway's apron, slabs and tire wear.
- *Cohesion (P12, P17, P19, P20, P22).* Beside the repaired lawn, the refined houses, the authored trees (their dappled
  shadows) and the authored bikes the street no longer reads as the most primitive surface in the frame.
- *Night (P18, P21).* Under the streetlight and the flashlight the aggregate reads; the original stays a flat smear.

## 10. Performance and memory

All numbers are **software rendering** (Chromium + ANGLE SwiftShader) or file sizes. **No real-GPU frame time has been
measured**; do not read these as GPU benchmarks.

**Files and memory**

| | |
|---|---|
| Textures | 6 × 1024² JPEG (asphalt and concrete: albedo detail, normal, height/roughness/AO), **5.6 MB** on disk |
| GPU texture memory (estimate, RGBA8 + mips) | **~32 MB** (6 × 5.3 MB); the layout map 64 KB, the driveway table 1 KB |
| Shader programs | one per surface kind (asphalt, gutter, curb, walk, driveway, walk path, cast iron); 88 programs in the page in all |
| Merged batches | 2,395 against the default 2,225 (+170): each concrete kind is its own batch per 110 m cell (they shared one before), the soil faces and the bulb have their own, and the old decals keep their own batches for the comparison |
| Triangles added | 8,384 (soil faces) + 1,470 (the tessellated bulb, replacing the default fan's 98) — the rest of the geometry is the default game's |
| Loading | textures load in 41 ms from a local server after the world is built (part B); the world build itself is the default game's (the flag adds the attributes and the layout map) |
| Offline package | `Last-Light-Playtest.html` 153.6 MB with every benchmark's models (+5.6 MB of pavement textures as base64 ≈ +7.5 MB) |

**In the same frame (the suite's pairs; reconstructed vs. the pavement build's ORIGINAL mode)**: 2–21 *fewer* draw calls
and up to 1.7 % fewer triangles in reconstructed mode, because the original's decal patches, joint bars and crack lines
are hidden in it. Against the **default game** at the same cameras:

__COST_TABLE__

**What a GPU will pay (not measured here):** the asphalt reads six textures (two scales of three maps) and evaluates
about a dozen noise lookups per pixel; concrete the same; the curb nine texture reads (triplanar). Over a street that
covers a large part of the screen, that is the main new fragment cost. The next measurement is real hardware.

## 11. Regression tests

Every suite ran **alone** (one browser at a time) on the final code, software WebGL.

**The pavement suite** — `node tests/pavement-browser.mjs` → `docs/qa/pavement/browser/report.json`: **30 passed, 0 failed**.

| Area | Check | Result |
|---|---|---|
| Default game | without `?pavement` no pavement module or texture is fetched; no pavement material, attribute or layout; 379 shadow proxies as accepted; no page errors | pass |
| Textures | six load, 1024², tiled, trilinear mipmaps, 16× anisotropy, linear data; real-world scale 410 / 512 px/m | pass |
| Coordinates | every pavement batch (200) has finite `uv` and a unit along-direction; on Oak Hollow Drive the asphalt's `uv` is the street's own (0 cm error over 770 samples) | pass |
| UV stretch | micro-structure in world metres (none); street-coordinate features at most 4.75 % off true length at the asphalt edge on the tightest bend | pass |
| **Geometry** | every vertex of every merged batch, shadow proxy and line batch hashed at 1 mm: **identical** to the default game (3,672,521 triangles), but for the soil faces and the bulb (reported separately) | pass |
| **Gameplay** | `surfaceY`, `rideable`, `groundY`, `authoredY` at 30,848 street points identical; obstacles (812), navigation shapes and 105 driveway openings unchanged | pass |
| **Riding** | a scripted ride over a driveway cut onto the walk and one into a plain curb: identical path, speed and wheel height | pass |
| Junctions and bulb | 13,125 rays from above over both junctions and the cul-de-sac: no gap, nothing below the street's ground, nothing more than 3.5 cm off the authored height away from curbs and surface edges (the default game: 191 rays in the bulb below the ground — fixed, §3) | pass |
| Comparison | O swaps reconstructed / original (shader, old decals, joint bars, crack lines) in one frame | pass |
| Captures | 22 pairs, each one camera and one frame | pass |
| Cost | in every pair, no more draw calls and at most 1 % more triangles than the original mode | pass |
| Shaders | no page error anywhere (every pavement program compiles and links) | pass |
| Prologue only | active in the Prologue; inactive in Chapter One (state `c1-ride`) | pass |
| Chapter Eight | in Aftermath I the reconstruction is inactive and Chapter Eight's ground cuts are installed on all eight pavement material programs (`…|c8cut`) | pass |
| Four benchmarks | `?bikes&houses&vegetation&pavement` loads (lawn mode C); riding works; no errors | pass |
| **Lawn** | the repaired lawn builds the same cells in the same chunks with and without `?pavement` (6 chunks: 106/89/96/120/119/112 cells) | pass |
| Offline package | `PLAYTEST_MODELS=1` embeds the six textures and both modules; from disk with the browser offline, `?pavement` loads from the embedded bytes, no network request, no error | pass |
| Default package | `?pavement` fails loudly ("not embedded … package with PLAYTEST_MODELS=1") and substitutes nothing | pass |

**The existing suites** (each against its accepted result; outputs in scratch, summaries in
`docs/qa/pavement/regression/`):

__REGRESSION_TABLE__

**Boundaries kept.** Untouched: story, dialogue, departures, chapters, Chapter Eight's destruction, Aftermath I and II,
the 2026 coda and credits, bicycle controls and steering, movement, camera, collisions (proved above), house positions,
street and sidewalk routes, driveway access, curb heights, character and bike models, vegetation and the oak, sky,
lighting, audio, menus, saves. Outside the new files (`pavement-surfaces.js`, `pavement-benchmark.js`, the textures and
tools), the changes are all behind the flag: `game.js` (the flag, the import, the Prologue predicate),
`world.js` (`uv`/`pv` carried for materials that ask; tagged line batches; the layout lists), `streets.js`
(pavement materials, coordinates, soil faces, the bulb), `houses.js` (driveway and walk coordinates and materials),
`furniture.js` (inlet and manhole records, cast-iron covers, the old decals' own batches), `vegetation.js` (front-yard
tree records), `props.js` (which driveways have a car).

## 12. Asset provenance and licences

| Asset | Licence | Where |
|---|---|---|
| Poly Haven *Asphalt 07* (Charlotte Baglioni), 2K JPEG set | CC0 1.0 | originals `assets/source/road/polyhaven/asphalt_07/` |
| Poly Haven *Gravel Concrete 04* (Dimitrios Savva), 2K JPEG set | CC0 1.0 | originals `assets/source/road/polyhaven/gravel_concrete_04/` |
| Runtime textures `dist/assets/pavement/*.jpg` | derived from the above | `tools/materials/roads/build_pavement_textures.py` (deterministic; hashes in `pavement-textures.json`) |
| Shader, layout map, cast-iron covers, all wear | original Last Light work | `dist/pavement-surfaces.js` |

Provenance and SHA-256 sums: `assets/source/road/PROVENANCE.md`, `assets/source/road/SHA256SUMS`;
`docs/THIRD_PARTY_ASSETS.md` credits both authors. No CC BY material, no external runtime dependency, no CDN request.

## 13. Known limitations and unresolved issues

- **No real GPU.** Every frame and number is software rendering. The fragment cost is real (§10); its frame time on the
  reference hardware is the next measurement, together with the other three benchmarks.
- **Prologue only.** The reconstruction is off from the night chapters on (by design, until approval): Chapter One's
  night, Chapters Two to Eight, Aftermath I/II and the coda show the original surfaces. Carrying it through the story
  (rain, the storm, the damage, the 2021 repaving) is a later decision (A-59); the wet-state foundation exists but is
  dormant and untested on screen.
- **Riding camera only.** "Sidewalk from standing height" (P06) is the riding camera on the walk (eye about 1.5 m); the
  Prologue's on-foot camera exists only at the lookout.
- **Streetlights.** Before the call the evening is still bright and the lamps' light on the pavement is faint by the
  game's own lighting design; P18 is therefore taken after the call. The lamps themselves were not changed.
- **Fine features at distance.** Hairline cracks fade out by design beyond about 5 cm of pixel footprint (to avoid
  shimmer); sealant bands and patches stay visible. In motion this was judged only from still frames in software;
  temporal shimmer on a real GPU at speed has not been reviewed by a person.
- **Root heave and chips are shading.** Heaved panels, chipped edges and lips are normal/colour effects; no panel is
  actually displaced (collision heights untouched by design).
- **Side faces.** The thin vertical faces (the driveway skirts, the side-street end curbs, the walk's edge bevels) use
  generic coordinates and read as plain concrete.
- **House walks** carry the concrete and joints but not the sidewalk's per-panel ageing.
- **The soil faces** are a minimal fix of a pre-existing seam; flared concrete apron wings would be the fuller answer
  (A-58).
- **Aftermath I evidence.** The damage frame (P23) shows the fenced street, not the trench itself; the proof that the
  damage still cuts the pavement is the material-level check (§11).
- **The comparison's ORIGINAL** is drawn inside the pavement build: identical shaders and geometry to the default game
  except the tessellated bulb (a few centimetres higher on the left of the bulb, where it now meets the ground) and the
  soil faces at the aprons.

## 14. How to try it

```bash
python3 -m http.server -d dist 8000
```

Open `http://localhost:8000/?pavement` (or `?bikes&houses&vegetation&pavement`), New Game, ride. **O** swaps
RECONSTRUCTED and ORIGINAL in the same frame. The DEV label (top-left) shows what loaded and its cost.

Offline: unzip `Last-Light-Prologue-Pavement-Reconstruction.zip`, open `Last-Light-Playtest.html` in desktop Chrome or
Edge, add `?bikes&houses&vegetation&pavement` to the address (instructions in `PAVEMENT-README.txt`).

Rebuild the textures: `python3 tools/materials/roads/build_pavement_textures.py` (numpy, Pillow).
Run the checks: `node tests/pavement-browser.mjs` (about an hour in software rendering).

## 15. Decisions for the creative director (all OPEN in the approval register)

| ID | Decision |
|---|---|
| A-54 | Approve / revise / reject the reconstructed pavement, per surface |
| A-55 | Asphalt age and colour (oxidised mid-grey overlay, sparse sealed cracks and patches) |
| A-56 | Sidewalk character (tooled panels, broom finish, a few cracks, heaved panels near large trees) |
| A-57 | Driveway individuality (condition per household, oil under the cars, chalk and ball scuffs where children live) |
| A-58 | The two visual-only geometry changes (soil faces at aprons; the tessellated bulb) |
| A-59 | Whether and when the pavement becomes the default and carries the later story states |

**Recommendation.** The pavement is ready for your visual review as a Prologue benchmark: in every pair it reads as
aggregate asphalt and poured concrete rather than coloured polygons, it holds together with the bikes, houses, lawns
and trees, and the game underneath is provably unchanged. I do not call it final-release quality: it has been judged
only in software-rendered stills, its GPU cost is unmeasured, and the night and motion behaviour need a person riding it
on real hardware. Approve or adjust A-54 to A-58 after that ride; keep A-59 for later.
