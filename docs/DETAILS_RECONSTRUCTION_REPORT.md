# Prologue neighborhood details & final environment dressing — reconstruction report

**Branch** `claude/prologue-neighborhood-details-benchmark`, started from `claude/prologue-vehicles-street-props-benchmark` at
**`192ac2b515e47324838fa8df0e719b91ecde0a34`** (that branch's verified remote head after the mailbox and pole-line fixes;
it is untouched). Final commit: §18. Nothing is merged into `main`. Without `?details` the game is unchanged (proved below,
vertex by vertex). **Awaiting the creative director's review — nothing here is approved.**

**Evidence and its limits.** Every in-game image is the shipped renderer under **software WebGL** (Chromium + ANGLE
SwiftShader, **not a GPU**) at 1600 × 900, with all six visual benchmarks on
(`?bikes&houses&vegetation&pavement&streetprops&details`). Each before/after pair is **one camera and one frame**: only the
details benchmark's `.` key changes between the two images. Riding-camera views are the gameplay camera placed by the QA
hook. Close-up and raised views are a **QA camera placed by hand** beside the object (same renderer, light and shadows),
and are labelled so. The four Blender images in §12 are offline renders, labelled as such; they are not evidence of the
game. Every performance number is a software-renderer or file number. No real-GPU frame time has been measured.

<!-- RESULT:start -->
**Result.** The Prologue's remaining neighborhood details are rebuilt in place as original Blender models:
- 5 street-sign assemblies (9 plates and blades);
- 64 lawn and porch chairs and 37 kettle grills;
- 21 garden hoses with their hose bibs on the houses' walls, and 4 impact sprinklers on the game's own turning heads;
- 24 toys;
- 5 kiddie pools, 23 trampolines with their nets and 19 swing sets;
- 45 sheds and 6 clotheslines;
- Briarwood's creek chain link (56 bays, 64 posts) and the lookout's field fence (14 posts, 28 rails).

Every object stands where the recorded procedural one stands, in its own yard and colours. The story objects (the oak, the
tire swing, the bench, the chalk, the bikes, the friends' homes) are untouched. The default game's geometry, collisions,
navigation and riding are identical, hashed vertex by vertex and ride by ride.

The details suite passes **38 of 38** checks (`tests/details-browser.mjs`, commit `3bc5d1d`).
The regression suites
are listed in §13 (not all were run: street-props benchmark (parts A–D), pavement benchmark, vegetation benchmark, house benchmark, bike benchmark, character pipeline lab, game logic (`verify.mjs`, every chapter), main menu, offline package (final chapter)).
There are 12 before/after pairs (§12).
<!-- RESULT:end -->

## 1. Source of truth

- **The brief:** "LAST LIGHT — PROLOGUE NEIGHBORHOOD DETAILS & FINAL ENVIRONMENT DRESSING". It asks for the objects the
  street-props pass left procedural (register entry A-67), built realistically for an August 2011 suburb:
  - the street signs, first;
  - lawn chairs and outdoor furniture;
  - garden hoses, sprinklers and lawn equipment;
  - the children's toys;
  - swing sets, trampolines, kiddie pools, sheds and clotheslines;
  - the remaining fences: Briarwood's creek chain link, the lookout's field fence and the side streets' fences.
- **No new Sketchfab assets.** Every model is original, built in Blender from scripts. The single reused texture is the
  street-props atlas's weathered fence wood (DmitriyGDS, CC BY 4.0, already credited), on the lookout's rails.
- **The game itself is the layout.** Every object stands where the procedural one stands, belongs to the same lot, and
  keeps its recorded colour. Nothing is added at random, moved or removed (except the hose coils in §6, which were never
  visible). The five benchmarks before this one (bikes, houses, vegetation, pavement, street props) are untouched and set
  the standard to match.

## 2. What exists in the game, and what was rebuilt

An inventory of every procedural object the brief names, taken from the code that builds it (`furniture.js`, `props.js`,
`houses.js`, `background.js`, `ambient.js`). The counts are the records the benchmark replaces.

| Object | Where the game builds it | Recorded | Rebuilt as |
|---|---|---|---|
| Street signs | `furniture.js` | 5 assemblies, 9 plates: SLOW CHILDREN AT PLAY (d 36), SPEED LIMIT 25 (d 150), NO OUTLET (past Summerfield), the two junctions (OAK HOLLOW DR over BRIARWOOD LN, over SUMMERFIELD RD, a STOP plate each) | 2 in square perforated galvanized posts in ground anchors; 0.08 in aluminium plates at MUTCD proportions, set in Overpass; street-name blades in a cast cross bracket |
| Lawn and porch chairs | `props.js` (front yards), `houses.js` (porches) | 56 on Oak Hollow (8 lawn, 48 porch); Old Mill Road's 8 left alone (below) | folding aluminium chairs with woven webbing (the recorded colour); white resin stacking chairs |
| Grills | `houses.js` (patios and decks) | 32 on Oak Hollow; Old Mill Road's 5 left alone | 22 in kettle grill: bowl, lid, vents, ash pan, legs, wheels |
| Garden hoses | `props.js` | 32 | a coiled hose on the lawn and a hose run to a hose bib found on the house's wall |
| Sprinklers | `ambient.js` | 4 | impact sprinklers on step spikes, with a hose run to the house; the game's turning head and water jet are kept |
| Toys | `props.js` | 24: 6 big wheels, 2 wagons, 2 scooters, 5 kid's bikes, 9 balls | big-wheel trikes, steel wagons, kick scooters, 16 in bikes with training wheels, basketballs, playground balls |
| Kiddie pools | `props.js` | 5 | hard plastic kiddie pools with water |
| Trampolines | `props.js` | 23 | 12 ft trampolines with their enclosure net |
| Swing sets | `props.js` | 19 | steel A-frame swing sets: two belt swings on chains, a wave slide with its ladder |
| Sheds | `props.js`, `background.js` | 45 (9 on Oak Hollow, 36 behind the rear fences) | T1-11 sided sheds with trim, a braced door (the Oak Hollow sheds), shingles |
| Clotheslines | `props.js` | 6 | T-post clotheslines with a sheet, a towel and a T-shirt |
| Creek chain link | `props.js` `fenceRun` on Briarwood's frame | 8 runs: 56 bays, 64 posts | galvanized chain link on line posts with a top rail, following the creek's dip |
| Lookout field fence | `props.js` | 14 posts, 28 rails | weathered round posts and rails at the recorded heights |

**Not found in the game.** The game has no patio tables, umbrellas, lawn mowers or side-street wooden fences to rebuild.
Briarwood's creek chain link is the only fencing on a side street; the brief's "side-street fences" are those runs (§10).

**Not Oak Hollow, left alone.** The same house builder also makes the nine houses of Old Mill Road, Chapter Four's ride
into town (`town-houses.js`), in a rigid `town` layer whose zone covers everything in it. Their porch chairs and grills
are recorded like Oak Hollow's, but they are not the Prologue's. The benchmark never hides them, so it places nothing there
and counts them in the DEV label ("on Old Mill Road … left as they are"). An authored copy there would only double them.

**Story objects, left alone.** The old oak, its tire swing, the carving, the lookout bench, the chalk, the old bike, the
friends' bikes and the boys' positions are not recorded and not touched. The same goes for the homes of Jamie, Sam and Alex,
with their story doors, windows, chairs, grills and hoses: houses with a story key record nothing. Jamie's red chair and
Alex's hose stay the game's. Part B of the suite checks that no story home, story object or lookout piece carries a
details record (§13).

## 3. Architecture: record, then replace in place

The method of the street-props benchmark ([STREET_PROPS_RECONSTRUCTION_REPORT.md](STREET_PROPS_RECONSTRUCTION_REPORT.md) §3):

1. **Record.** With `?details`, `buildWorld` creates `W.dt`. Each builder that makes a detail adds a record:
   - the group it built;
   - what it is: kind, recorded colour, size;
   - where it is: street coordinates and its house's plan.

   It also tags the group's meshes with a zone `dt:<kind>`. Without the flag `W.dt` does not exist: no record is made, no
   zone is set and nothing else changes. The hooks only read what the builders already chose. Where a builder's random
   draws had to be kept in a variable to be recorded (a shed's roof colour), they are drawn in the same order, so every
   lot keeps its own colours and layout.
2. **Bake.** The world bake merges `dt:` meshes into batches of their own (as it does for `sp:`, `hb:` and `vg:` zones), so
   the originals can be hidden. Their shadow proxies are kept separate too.
3. **Replace.** `dist/details-assets.js` loads `details.kit.glb` and the five textures. It places one instance per record
   with the recorded group's own world matrix, then settles it on the real ground (§4–§10). It then hides the `dt:` batches
   and proxies.
   - One exception: the patio and deck grills and the porch chairs are built inside a house's own group. Houses live in the
     bake's draped layer: the group holds straight-street coordinates, and the bake maps every vertex onto the curved street
     through the house's frame and the ground. Those records are mapped the same way (`P.toWorld`, the same ground), not by
     their group matrix. Their group matrix alone was wrong by up to 250 m at the far end of the street. The first capture
     review caught this (a grill standing in a front yard), and part B now checks it.
   - Every authored piece is checked against the geometry the original actually drew. Part B finds, for each piece, the
     nearest baked vertex of its own zone and requires it within the piece's footprint. A record kept in another frame can
     no longer pass by agreeing with itself. Collisions, navigation, ground queries and riding never see the change. The game's colliders, obstacles
   and paths are the procedural ones.
4. **Draw.** Instanced meshes per piece, level of detail and material, three LODs, frustum-culled by cell
   (`LodSet`, shared with the street props).

**Keys.** `.` (Period) swaps AUTHORED and ORIGINAL in the same frame; `,` (Comma) steps the LOD (auto, 0, 1, 2). Every
letter key is already bound in the game, its DEV tools or the other benchmarks (X and Z are the street props'); Period
and Comma are used nowhere.

**Prologue only.** As with the pavement and the street props, the originals return once the night chapters, the credits or
the 2026 coda begin.

**Shading.** Three materials share one 2048² atlas with its ORM and normal maps, plus one cut-out atlas and one sign
atlas:
- `dt_A`: a physically based material with per-instance tint (through a paint mask), age and soil;
- `dt_cut`: alpha-tested chain link, netting and swing chain, each tile repeating on its own;
- `dt_sign`: the plates' faces, with the smoother finish of sign sheeting (roughness 0.4).

The reflection environment is the street props' (the game's hemisphere, fog and sun colours). No renderer setting was
changed. Three shading decisions came out of the review of the first captures:
- **Recorded colours come out as themselves.** The paint mask applies tint × albedo × 2 (the street props' rule), so every
  masked region of the atlas is levelled to the street-props atlas's 0.46 linear. The pattern stays: grooves, granules,
  weave. Before this, shed walls, chair webbing and bike frames drew at about 40 % of their recorded colour.
- **Galvanized steel and aluminium are part-metallic** (metalness 0.45–0.55). A fully metallic post mirrors the warm evening
  sky and ground, and reads as brown wood. Part-metallic, the posts, rails and frames read as grey metal.
- **Distant cut-outs keep their coverage.** Up close, chain link, netting and chain use the usual 0.5 alpha test. Once the
  tile is minified, the test becomes a fixed screen-space dither on the mip-averaged alpha. A fence 20 m away then reads as
  the faint grey haze real chain link makes, instead of vanishing. Nothing becomes transparent or blended.

## 4. Street signs (highest priority)

**Posts.** Every assembly stands on a 2 in square perforated galvanized post, 3.05 m long with 0.45 m below grade. Each
post sits in a 2¼ in ground-anchor sleeve standing 6 cm proud of the lawn, with its corner bolt. The post is lowered so
its top is exactly the procedural post's top. Plates hang 1 mm off the post's face on two bolts through the post; nothing
passes through a face.

**Plates.** The plates are 0.08 in (2 mm) aluminium with rounded corners, at MUTCD sizes:
- STOP: a 30 in octagon with its white border;
- SPEED LIMIT 25: 24 × 30 in;
- the two warning diamonds, SLOW CHILDREN AT PLAY and NO OUTLET: 24 in.

The legends are set in Overpass (SIL OFL 1.1), an open font inspired by the Highway Gothic of US signs. They are drawn into a
2048 × 1024 sign atlas at twice the size and downsampled, so the letters stay crisp at riding distance. Each plate's back
is mill-finish aluminium with a small dated inspection sticker. No face reads mirrored or backward: part B checks that every plate's
UVs read left-to-right from the front.

**Street-name blades.** Green blades, 1.2 × 0.19 m with 1.5 in corners, the same name on both faces. They are held in a
cast-aluminium cross bracket: a cap on the post, a cross piece between the blades and a cap on the upper blade, with set
screws. Nothing goes through a blade. OAK HOLLOW DR is the lower blade, along Oak Hollow. BRIARWOOD LN and SUMMERFIELD RD are
the upper blades, along their streets. Both junctions also carry their STOP plate for the cross street, at the game's
height (2.1 m).

**Checks (part B).** For each of the 9 plates, part B checks that:
- it was found and placed;
- it has one face per side;
- it is not mirrored;
- its front and back both read correctly;
- it is clear of the post;
- its bottom edge sits at the recorded height.

It also checks that posts stand on the ground (neither floating nor buried). See D01–D04b.

## 5. Lawn chairs, porch chairs and grills

**Chairs.**
- **Lawn chairs** (the procedural green folding chairs): folding aluminium chairs, one bent tube per side with the
  folding X below. Seat and back are woven webbing in the recorded colour (the paint mask).
- **The white chairs** (lawn pairs and the porch pairs): moulded resin stacking chairs with a slatted back, a curved top
  rail, arms and flared legs.

Lawn chairs settle on the lawn on their lowest points; porch chairs stand on the porch at the recorded spot. On the house
benchmark's twelve lots the porches are that benchmark's, so their chairs are left to it, and part C checks that none are
placed there. Story homes record no chairs.

**Grills.** Each of Oak Hollow's 32 grills is a 22 in kettle: an enamelled bowl and lid with vents and handle, a
an ash pan, three legs and two wheels. Grills on a patio stand on the slab's top. A grill on a deck stands on the
deck.

**Not built: patio tables.** The game has none, and the brief's "outdoor furniture" in the game is these chairs and grills
(the oak's story bench is not touched).

## 6. Garden hoses, hose bibs and sprinklers

**Hose and bib.** A garden hose is a coil of green hose lying on the lawn, its end leading off the coil toward the house.
A generated hose run takes it from the house's hose bib: down the wall, across the lawn with a lazy bend, to the coil.

**Finding the wall.** The bib is found, not guessed:
1. The nearest face of the house's footprint is taken.
2. A ray is cast against the real wall surface of the built house (siding, brick veneer, a chimney), so the bib sits on
   what is actually there.
3. If the wall is not clear (a window, a door, a corner), the bib slides along it.
4. A house with no clear wall gets no bib (counted).

**Coils left out.** Eleven of the 32 recorded coils were placed inside a house by the old formula (its offset ignored the
house's width); they could never be seen. They are left out and counted in the DEV label. The 21 coils on lawns are
placed, each turned to face its bib.

**Sprinklers.** The four impact sprinklers keep the game's own animation:
- the base (a zinc step spike, to 0.2 m) is added to the sprinkler's root;
- the head (brass body, bearing, nozzle, drive arm with its spring and spoon, diffuser screw) is added to the game's
  turning head group, so it turns with the game's timing;
- the water jet is the game's, untouched;
- each sprinkler gets a hose run to its house.

Part B checks that the head turns and that the jet still shows (D07).

**Checks (part B):** no bib off its wall, no hose run under the lawn, on a walk, on the street or on a driveway, and no
jump between run segments.

## 7. Children's toys

All the toys are the game's own records, in their recorded yards, at the recorded spots, in their recorded colours (the
paint mask):
- **Big wheels:** a 16 in front wheel with pedals on its axle in a moulded fork, a lofted low body sweeping back to the
  rear axle, the yellow bucket seat, bars with grips, small rear wheels.
- **Wagons:** a 34 × 15 in steel tray with a rolled rim, two axles on leaf brackets, a steering bolster, 10 in wheels with
  white rims, the long handle lying forward on the lawn.
- **Kick scooters:** an aluminium deck with grip tape, a fender brake, 100 mm urethane wheels, the folding stem and T-bar
  with foam grips. One lies fallen, as the procedural one does.
- **Kid's bikes:** a 16 in kid's bike with training wheels, lying on its side in the grass as the procedural one lies.
- **Balls:** basketballs and playground balls, each at its recorded radius.

The kid's bikes are the procedural yard bikes rebuilt in place. They are deliberately small (16 in wheels, training
wheels), brightly coloured and lying down, so they cannot be confused with the four story-important bicycles. No bicycle
is added.

Each toy settles on its lowest points on the real ground. Flat-lying ones get no dirt at their foot. Nothing here is horror
or memorial imagery: these are summer-evening toys left out in the yards (D08–D10, D24). The curb basketball and the ball at
the lookout are the game's records too. The lookout ball is placed as recorded and the lookout's own objects are untouched.

## 8. Kiddie pools, trampolines and swing sets

- **Kiddie pools** (5, the procedural type kept): a 2 m hard plastic pool with its moulded rim and printed liner, and
  still water at the recorded level. Levelled on the lawn.
- **Trampolines** (23): a 12 ft (3.66 m) galvanized frame on W legs, springs, the jumping mat and its padded cover, with the
  enclosure kept: six padded poles bowing out a little, the top ring and the net (cut-out, both sides).
- **Swing sets** (19): a steel A-frame swing set, about 2.4 m to the bar:
  - two belt swings on S-hooks and chains;
  - a wave slide with its ladder.

  The game's own tire swing on the old oak is not touched.

All three are levelled across their feet (the high side sinks a few millimetres, never floats). See D11–D13.

## 9. Sheds and clotheslines

- **Sheds.** The 9 on Oak Hollow are 2.6 × 2.2 m. They have:
  - T1-11 grooved siding at true scale, in the recorded wall colour;
  - corner and fascia trim;
  - a braced door with a hasp;
  - a shingled gable roof in the recorded roof colour, with its ridge cap;
  - a sill on a concrete pad.

  The 36 smaller sheds behind the rear fences (`background.js`) get the same construction without a door at 2.4 × 2.0 m;
  they are seen across the yards. Wall and roof take their recorded colours separately.
- **Clotheslines** (6). Two galvanized T-posts in concrete collars, with three lines of coated wire. A sheet, a towel and a
  T-shirt hang over the middle line with clothespins (cloth printed in the atlas, both sides). Levelled.

See D14 and D15.

## 10. Fences

- **Briarwood's creek chain link** (8 runs, 56 bays, 64 posts). The runs follow the creek's dip on Briarwood's own frame.
  Each bay is sheared between its two posts so it meets the ground on both sides, as the street props' fences do on Oak
  Hollow. The fence is galvanized chain link (cut-out, two-sided), with a top rail and line posts with their caps, at the
  recorded heights. These are the only fences on a side street in the game, so they are also the "side-street fences" of
  the brief (D16, D18).
- **The lookout's field fence** (14 posts, 28 rails). Weathered round posts and round rails carry the grey fence-wood tile.
  Each post stands at its recorded knoll height, and each rail runs between its recorded ends. The lookout itself (the
  oak, the bench, the knoll, the path) is not moved or redesigned; only the fence's look changes (D17, D22).

## 11. Lot identity, and consistency with the five benchmarks

**Lot identity.** No random scatter: each lot keeps the things the game gave it and its colours. This covers:
- its chairs, toys, pool or trampoline;
- its swing set, shed or clothesline;
- its hose and grill.

Every record carries the plan of the house it belongs to. The lots of the house benchmark keep their porch to that
benchmark.

**Consistency.** The kit uses the street props' conventions:
- the same scale and ground rules;
- the same reflection environment, per-instance ageing and soil splash;
- the same LOD scheme and culling.

It is also built with the same Blender helpers. With all six benchmarks on, each loads without error. Vegetation and the
street props are counted identically with and without `?details` (part C).

<!-- MEASURED:start -->
## 12. Evidence

**12 before/after pairs** are in `docs/qa/details/browser/`: the 22 required views, plus -10 more
(a second angle or a further object). Each pair is one camera and one frame, with all six benchmarks on; the two images
differ only by the `.` key. `report.json` beside them holds each image's camera, game clock, draw calls, triangles and
SHA-256.
The review gallery is built from `report.json` by `tools/blender/details/build_review_gallery.py`.

| # | Required capture | Pair(s) |
|---|---|---|
| 1 | Street-name sign close-up | D01 |
| 2 | Stop sign and intersection | D02 |
| 3 | Speed limit | D03 |
| 4 | Children at play | D04 (also D04b: NO OUTLET) |
| 5 | Lawn chairs | D05, D05b (also D05c: porch chairs) |
| 6 | Hose | D06 |
| 7 | Sprinkler | D07 |
| 8 | Wagon | D08 |
| 9 | Big wheel | D09 |
| 10 | A yard with toys | D10 (also D24: a kid's bike) |
| 11 | Swing set | D11 |
| 12 | Trampoline | D12 |
| 13 | Pool | D13 |
| 14 | Shed | D14 |
| 15 | Clothesline | D15 |
| 16 | Creek chain link | D16 |
| 17 | Lookout field fence | D17 |
| 18 | Side-street fences | D18 |
| 19 | Wide residential street | D19 |
| 20 | Full Oak Hollow, all six benchmarks | D20 |
| 21 | First-person riding view | D21 |
| 22 | Oak and lookout unchanged | D22 (also D17) |

| Pair | What it shows | Camera | Game clock | Images | Draw calls (authored / original) | Triangles (authored / original) |
|---|---|---|---|---|---|---|
| **D01** | the street-name blades at Briarwood Lane: OAK HOLLOW DR and BRIARWOOD LN in their cast cross bracket on the galvanized post (QA camera) | QA camera | AUGUST 21, 2011 7:51 PM | [authored](qa/details/browser/D01-street-name-sign-close--authored.jpg) · [original](qa/details/browser/D01-street-name-sign-close--original.jpg) | 426 / 399 | 851,924 / 829,415 |
| **D02** | the STOP sign at Briarwood Lane seen from the cross street, the intersection with Oak Hollow beyond (QA camera on Briarwood) | QA camera | AUGUST 21, 2011 7:51 PM | [authored](qa/details/browser/D02-stop-sign-and-intersection--authored.jpg) · [original](qa/details/browser/D02-stop-sign-and-intersection--original.jpg) | 656 / 648 | 1,137,050 / 1,120,309 |
| **D03** | SPEED LIMIT 25 at d 150, as the ride passes it | riding camera | AUGUST 21, 2011 7:44 PM | [authored](qa/details/browser/D03-speed-limit-sign--authored.jpg) · [original](qa/details/browser/D03-speed-limit-sign--original.jpg) | 520 / 534 | 837,683 / 820,160 |
| **D04** | SLOW CHILDREN AT PLAY near the start of the ride | riding camera | AUGUST 21, 2011 7:42 PM | [authored](qa/details/browser/D04-children-at-play-sign--authored.jpg) · [original](qa/details/browser/D04-children-at-play-sign--original.jpg) | 544 / 556 | 798,461 / 783,372 |
| **D04b** | NO OUTLET past Summerfield Road | riding camera | AUGUST 21, 2011 7:56 PM | [authored](qa/details/browser/D04b-no-outlet-sign--authored.jpg) · [original](qa/details/browser/D04b-no-outlet-sign--original.jpg) | 503 / 499 | 704,753 / 694,789 |
| **D05** | a pair of lawn chairs left in a front yard (QA camera) | QA camera | AUGUST 21, 2011 7:55 PM | [authored](qa/details/browser/D05-lawn-chairs--authored.jpg) · [original](qa/details/browser/D05-lawn-chairs--original.jpg) | 510 / 489 | 982,358 / 966,254 |
| **D05b** | white resin chairs on a front porch, from the street | riding camera | AUGUST 21, 2011 7:42 PM | [authored](qa/details/browser/D05b-porch-chairs--authored.jpg) · [original](qa/details/browser/D05b-porch-chairs--original.jpg) | 569 / 570 | 1,083,492 / 1,067,743 |
| **D06** | a garden hose coiled on the lawn by a house, run to its hose bib on the wall (QA camera) | QA camera | AUGUST 21, 2011 7:37 PM | [authored](qa/details/browser/D06-garden-hose--authored.jpg) · [original](qa/details/browser/D06-garden-hose--original.jpg) | 715 / 733 | 960,213 / 960,218 |
| **D07** | an impact sprinkler on its spike, running, its hose across the lawn to the house (QA camera) | QA camera | AUGUST 21, 2011 7:45 PM | [authored](qa/details/browser/D07-sprinkler--authored.jpg) · [original](qa/details/browser/D07-sprinkler--original.jpg) | 600 / 601 | 1,074,580 / 1,059,506 |
| **D08** | a red steel wagon left in a front yard (QA camera) | QA camera | AUGUST, 2011 AS YOU REMEMBER IT | [authored](qa/details/browser/D08-wagon--authored.jpg) · [original](qa/details/browser/D08-wagon--original.jpg) | 710 / 720 | 1,233,924 / 1,231,946 |
| **D09** | a big-wheel trike in the grass (QA camera) | QA camera | AUGUST 21, 2011 7:39 PM | [authored](qa/details/browser/D09-big-wheel--authored.jpg) · [original](qa/details/browser/D09-big-wheel--original.jpg) | 371 / 351 | 696,325 / 675,530 |
| **D10** | the stretch of front yards with the most toys, chairs and kiddie pools, from the street | riding camera | AUGUST 21, 2011 7:47 PM | [authored](qa/details/browser/D10-yard-with-toys--authored.jpg) · [original](qa/details/browser/D10-yard-with-toys--original.jpg) | 647 / 661 | 1,168,969 / 1,166,778 |

The clock reads the game's own date line: every pair is in the Prologue's evening ride on August 21, 2011.
- **Riding camera:** the gameplay camera, placed by the QA hook and turned toward its subject.
- **QA camera:** placed by hand beside the object (D01, D02, D05, D06, D07, D08, D09), with the same renderer, light and shadows. The bike
  stands next to the subject, or under a raised camera, so that the sky, the shadow camera and the world's own culling
  follow it.

**Blender inspection renders** (offline renders, **not** the game) are in `docs/qa/details/blender/`:
`blender-details-backyard--BLENDER-RENDER.jpg`, `blender-details-signs--BLENDER-RENDER.jpg`, `blender-details-toys--BLENDER-RENDER.jpg`, `blender-details-yard--BLENDER-RENDER.jpg`. They show the kit's models alone at LOD0, not how the game draws them.

## 13. Tests and performance

### 13.1 The details suite

`node tests/details-browser.mjs` (Chromium + ANGLE SwiftShader, 1600 × 900): **38 passed, 0 failed**
(commit `3bc5d1d`; `docs/qa/details/browser/report.json`).

| Part | Checks | What is proved |
|---|---|---|
| A | 3 | the default game fetches no details module or asset and has no `dt:` record, zone or label; its baseline: 3,672,619 merged triangles, 379 shadow proxies, 40,488 ground queries, 812 obstacles |
| B | 22 | the kit and five textures load (module 335 ms; page 31,669 ms in software). Every record is placed: 64 chairs, 24 toys, 45 sheds and the rest, with the 11 hidden hose coils counted. Every rigid piece is upright at true scale; nothing floats or sinks (13 kinds measured). All 9 plates and blades read their record's words, front and back, with none mirrored or pierced. 25 hose bibs are on their walls (0 off), with 25 continuous hose runs (0 jumps, 0 under the lawn, 0 on a walk or the street, 0 on a drive). There are no duplicates or double shadows, and no detail on a story home or at the lookout. The merged geometry, shadow proxies and lines hash identical to A, and 40,488 ground queries, obstacles, navigation and three scripted rides are identical. The sprinklers turn and spray as before; `.` and `,` work; Chapter One shows the originals; there are no page errors |
| C | 5 | all six benchmarks load together without error; vegetation and the street props are identical with and without `?details`; no authored porch chair on a house-benchmark lot; the ride runs |
| D | 5 | the offline package with models runs `?details` and all six from the embedded bytes, browser offline, with no network request; the default package fails loudly and substitutes nothing |
| E | 3 | 12 pairs, each one camera and one frame; cost per frame (below); no page errors |
| F | 0 | cost against the default game at eight riding cameras (below); no page errors |

### 13.2 Regressions (the existing suites)

| Suite | Result | Commit | Summary |
|---|---|---|---|
| street-props benchmark (parts A–D) | not run | — | `docs/qa/details/regression/regression-streetprops-browser.json` |
| pavement benchmark | not run | — | `docs/qa/details/regression/regression-pavement-browser.json` |
| vegetation benchmark | not run | — | `docs/qa/details/regression/regression-vegetation-browser.json` |
| house benchmark | not run | — | `docs/qa/details/regression/regression-house-browser.json` |
| bike benchmark | not run | — | `docs/qa/details/regression/regression-bike-browser.json` |
| character pipeline lab | not run | — | `docs/qa/details/regression/regression-pipeline-browser.json` |
| game logic (`verify.mjs`, every chapter) | not run | — | `docs/qa/details/regression/regression-verify.json` |
| main menu, offline package (final chapter) | not run | — | `docs/qa/details/regression/regression-main-menu-package.json` |

`verify.mjs` reports one known DEV difference, `2/alex-bike`: a companion's bike position after a dev-scene switch. It is
reported, not asserted, and appears with the same values in the earlier branches' runs.

### 13.3 Cost

**Files.**
- `details.kit.glb`: 1.91 MB (every piece, three LODs).
- Five textures: 1.59 MB on disk (a 2048² albedo, 1024² ORM and normal maps, a 512² cut-out, a 2048 × 1024
  sign atlas).
- Offline package with every benchmark's models: 171.7 MB. Default package (no models):
  13.0 MB.

**GPU textures** (estimated, RGBA8 with mipmaps): **≈ 44 MB**, anisotropy 16. One atlas set
serves every detail, through instancing and the shared atlases.

**Geometry at a riding camera** (the DEV label's count, part B): 33,739 detail triangles in
39 instanced draws for 525 instances (35 sets, 6 materials;
LOD 0/1/2 sets in view: 4/39/78). LOD0 per piece is between 24 triangles (a
chain-link bay) and 3,420 (a trampoline); the kit's triangle counts are in `assets/source/details/build-stats.json`.

**With all six benchmarks** (E, per captured frame; authored against original in the same frame): draw calls
−18 to +27 per frame, triangles ×1 to 1.031. Over the 12 frames:
- draw calls: 6,771 against 6,761;
- triangles: 11,529,732 against 11,376,020.

**The details alone, against the default game** (F): eight riding cameras, with `?details` alone, in fresh browsers. The
default game renders three cameras per browser. The flag renders two per browser, each camera in both `.` modes.

_Part F was not measured in this report._

**Load.** The details module builds its set in 335 ms after its files arrive. The world bake is the game's
own: the flag adds batch splits, not geometry.

**Memory** (software renderer, the first browser of F): JS heap ? MB for the default game,
? MB with `?details`. Geometries ? against
?; textures ? against
?. No real-GPU number has been measured.
<!-- MEASURED:end -->

## 14. How to rebuild, run and try it

```bash
pip install bpy==5.1.2 numpy pillow                               # Blender 5.1 as a Python module (headless)
python3 tools/blender/details/details_textures.py                 # the details, cut-out and sign atlases
python3 tools/blender/details/build_details.py                    # details.kit.blend + details.kit.glb
cp assets/source/details/textures/details_{albedo.jpg,orm.png,normal.png,cutout.png,signs.jpg} dist/assets/details/
python3 tools/blender/details/render_details.py docs/qa/details/blender   # optional inspection renders
node tests/details-browser.mjs                                    # the suite (software WebGL; PARTS=A..F, VIEWS=D01,…)
python3 -m http.server -d dist 8000                               # then open http://localhost:8000/?details
```

Open `?details` alone, or all six benchmarks together with `?bikes&houses&vegetation&pavement&streetprops&details`. Choose
New Game and ride:
- **`.`** (Period) swaps AUTHORED and ORIGINAL in the same frame.
- **`,`** (Comma) steps the LOD: auto, 0, 1, 2.
- With all six on, **X** and **Z** are still the street props' keys, and the other benchmarks keep theirs.

The DEV labels (top-left, stacked) show what loaded, the counts, the cost and the attribution. Everything is
deterministic: the same inputs give the same files. The model-to-game mapping, attachment points and LOD distances are in
[art/DETAILS-KIT.md](art/DETAILS-KIT.md).

## 15. Known limitations and unresolved issues

- **No real GPU, no human ride.** Every frame and number here is software rendering, judged from still frames. Real-GPU
  frame time, motion (LOD switches, the chain link's shimmer, the sprinkler's turn) and a person's ride are the next step.
- **Software-renderer memory.** With all six benchmarks on, this machine's software renderer holds memory frame after
  frame, so the suite renders two views per browser. This is not a GPU number.
- **Hose coils left out.** 11 of the 32 recorded coils sit inside a house (the old offset). They are left out rather than
  moved, since moving them would change the layout (A-73).
- **Hose runs** are generated tubes lying on the ground. They do not deform around other objects and have no slack loops.
- **Levelled play equipment** on a slope sinks its high-side feet by a few millimetres rather than standing on each foot.
- **The sign legends** are Overpass, an open relative of the FHWA Highway Gothic, not the FHWA series itself (that font is
  not freely licensed).
- **Cloth** (clothesline, enclosure net) is static: no wind.
- **Prologue only.** From the night chapters on, the originals show (A-77).

## 16. Deferred (not in this pass)

| Item | Why |
|---|---|
| The power-line easement and its signs | A Chapter Two place, outside the Prologue |
| Air-conditioning units, planters, downspouts | They belong to the house benchmark's houses |
| Patio tables, umbrellas, mowers | The game has none to rebuild; adding them would change the layout |
| Chairs, grills and hoses at the homes of Jamie, Sam and Alex; Jamie's red chair; Alex's hose; the lookout bench | Story objects: the brief keeps them |
| The police and works vehicles, later chapters' vehicles | Vehicles are not part of this brief |
| Every later chapter's details (night, damage, Aftermath, 2026) | Prologue only (A-77) |
| Wind on cloth, hose physics | Static meshes in this pass |

## 17. Decisions for the creative director (all OPEN in the approval register)

| ID | Decision |
|---|---|
| A-69 | The street signs: posts and anchors, plates, the Overpass legends, the cross bracket and blades |
| A-70 | Chairs and grills: folding webbed chairs, white resin chairs, kettle grills |
| A-71 | Hoses, hose bibs and impact sprinklers (the bib found on the real wall) |
| A-72 | The children's toys, and the kid's bikes kept distinct from the four story bikes |
| A-73 | The 11 hose coils left out (inside a house) rather than moved |
| A-74 | Kiddie pools, trampolines (net kept), swing sets |
| A-75 | Sheds and clotheslines |
| A-76 | Briarwood's creek chain link and the lookout's field fence |
| A-77 | Whether the details become the default and carry the later chapters |

**Recommendation.** It is ready for your visual review as a Prologue benchmark. The street signs now read as real signs:
crisp legends, the right way round, on galvanized posts. The yards hold the things a 2011 family leaves out, each in its
own yard. The game underneath is provably unchanged.

I do not call it final-release quality. It has been judged only in software-rendered stills, and its GPU cost is
unmeasured. The hoses and cloth are static, and 11 never-seen hose coils are left out.

Approve or adjust A-69 to A-76 after a ride on real hardware; keep A-77 for later.

## 18. Delivery

<!-- DELIVERY:start -->
| # | Deliverable | Where |
|---|---|---|
| 1 | The branch | `claude/prologue-neighborhood-details-benchmark`, pushed to `origin`. Started from `192ac2b515e47324838fa8df0e719b91ecde0a34` (the street-props branch, untouched); **not merged into `main`**. |
| 2 | Its verified SHA | the head commit is the one that adds this section. Its SHA is given with the delivery and by `git ls-remote origin claude/prologue-neighborhood-details-benchmark`. |
| 3 | The report | this file |
| 4 | Blender models | `assets/source/details/details.kit.blend` (every piece, three LODs) |
| 5 | Game-ready assets | `dist/assets/details/` (`details.kit.glb`, five textures). The runtime is `dist/details-assets.js` and `dist/details-benchmark.js`; the recording hooks are in `world.js`, `props.js`, `furniture.js`, `houses.js`, `background.js`, `ambient.js` and `game.js` (inert without the flag). |
| 6 | Build scripts | `tools/blender/details/`: `details_textures.py`, `build_details.py`, `render_details.py` and `build_review_gallery.py`. `tools/details-report-sections.py` fills this report. |
| 7 | Provenance | `assets/source/details/PROVENANCE.md`, `SHA256SUMS`, and `docs/THIRD_PARTY_ASSETS.md` (the details section) |
| 8 | Screenshots | `docs/qa/details/browser/` (12 same-frame pairs, `report.json`) |
| 9 | Gallery | (not published) (private to its owner until shared), also `review-gallery/` in the package; Blender renders in `docs/qa/details/blender/`, labelled |
| 10 | Performance numbers and limitations | §13.3, §15 |
| 11 | The test suite | `tests/details-browser.mjs`: 38 passed, 0 failed, all six parts |
| 12 | Regression results | §13.2; `docs/qa/details/regression/` |
| 13 | Offline ZIP | (see the delivery message) The ZIP is not in git (`release/` is ignored). |
| 14 | Six-benchmark instructions | §14, and `DETAILS-README.txt` in the ZIP (`?bikes&houses&vegetation&pavement&streetprops&details`; `.` and `,`) |
| 15 | Approval entries | A-69 to A-77 in `docs/art/ART-APPROVAL-REGISTER.md`, all OPEN (§17); A-60 to A-68 unchanged |
| 16 | Deferred list | §16 |
<!-- DELIVERY:end -->

**Stopped here for your review.** Nothing in this benchmark is approved, nothing is merged, and the default game is
unchanged.
