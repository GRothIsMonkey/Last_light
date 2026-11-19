# Prologue roads, sidewalks, curbs & driveways — pavement reconstruction report

**Branch** `claude/prologue-roads-sidewalks-curbs-reconstruction`, started from
`claude/prologue-grass-lawn-ground-repair` at **`ec34db3a59646beb8b4be1d2aeeda77354a1f5d2`** (verified before any
change; that branch is untouched). Final commit: see §15 and the commit log; nothing is merged into `main`.
Without `?pavement` the game is unchanged (proved below, vertex by vertex).

**Evidence and its limits.** Every in-game image is the shipped renderer under **software WebGL** (Chromium + ANGLE
SwiftShader, **not a GPU**), from the game's own riding camera placed by the QA hook (a review camera, not a person's
playthrough), at 1600 × 900. Each before/after pair is **one camera and one frame**: only the O key's mode changes.
No Blender render and no concept image is used anywhere in this report. Every performance number is a software-renderer
or file number; no real-GPU frame time has been measured.

__RESULTS_SUMMARY__

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

**Geometry added — the only one:** thin soil faces closing the open step beside every driveway apron and at the lowered
curb in front of it (30 batches, 8,384 triangles, no shadow proxy of their own). Visual only: no height, collision or
lawn changes. Every other vertex in the world is the default game's (§12).

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
drawn. In the cul-de-sac the wheel paths become a turning loop, the crown seam and transverse cracks stop, and the edge
follows the real curb (the straight line, the reverse curve and the bulb). The story's chalk, the bench, the swing, the
oak and the lookout grass are untouched.

## 8. Lawn boundary compatibility

No lawn, grass, tree, oak or plant geometry or material was changed. The repaired lawn's masks read the world's ground
queries (`surfaceY`, `authoredY`), which are identical with and without `?pavement` (§12), and the lawn builds the same
cells in the same chunks (part C). The soil faces sit below the lawn's edge, inside the step the lawn never covered.

__CAPTURES__

__PERF__

__TESTS__

## 13. Asset provenance and licences

| Asset | Licence | Where |
|---|---|---|
| Poly Haven *Asphalt 07* (Charlotte Baglioni), 2K JPEG set | CC0 1.0 | originals `assets/source/road/polyhaven/asphalt_07/` |
| Poly Haven *Gravel Concrete 04* (Dimitrios Savva), 2K JPEG set | CC0 1.0 | originals `assets/source/road/polyhaven/gravel_concrete_04/` |
| Runtime textures `dist/assets/pavement/*.jpg` | derived from the above | `tools/materials/roads/build_pavement_textures.py` (deterministic; hashes in `pavement-textures.json`) |
| Shader, layout map, cast-iron covers, all wear | original Last Light work | `dist/pavement-surfaces.js` |

Provenance and SHA-256 sums: `assets/source/road/PROVENANCE.md`, `assets/source/road/SHA256SUMS`;
`docs/THIRD_PARTY_ASSETS.md` credits both authors. No CC BY material, no external runtime dependency, no CDN request.

__LIMITS__

## 15. How to try it

```bash
python3 -m http.server -d dist 8000
```

Open `http://localhost:8000/?pavement` (or `?bikes&houses&vegetation&pavement`), New Game, ride. **O** swaps
RECONSTRUCTED and ORIGINAL in the same frame. The DEV label (top-left) shows what loaded and its cost.

Offline: unzip `Last-Light-Prologue-Pavement-Reconstruction.zip`, open `Last-Light-Playtest.html` in desktop Chrome or
Edge, add `?bikes&houses&vegetation&pavement` to the address (instructions in `PAVEMENT-README.txt`).

Rebuild the textures: `python3 tools/materials/roads/build_pavement_textures.py` (numpy, Pillow).
Run the checks: `node tests/pavement-browser.mjs` (about an hour in software rendering).

__DECISIONS__
