# Prologue vehicles & street props — reconstruction report

**Branch** `claude/prologue-vehicles-street-props-benchmark`, started from `claude/prologue-roads-sidewalks-curbs-reconstruction`
at **`75f40efb5895f0d2d06d01490e84241a4dc660dc`** (verified before any change; that branch is untouched). Final commit: §15.
Nothing is merged into `main`. Without `?streetprops` the game is unchanged (proved below, vertex by vertex).
**Awaiting the creative director's review — nothing here is approved.**

**Evidence and its limits.** Every in-game image is the shipped renderer under **software WebGL** (Chromium + ANGLE
SwiftShader, **not a GPU**) at 1600 × 900, with all five visual benchmarks on (`?bikes&houses&vegetation&pavement&streetprops`).
Each before/after pair is **one camera and one frame**: only the benchmark's X key changes between the two images.
Riding-camera views are the gameplay camera placed by the QA hook; close-up and raised views are a **QA camera placed by
hand** beside the object (same renderer, light and shadows) and are labelled so. The two Blender images in §10 are
offline Cycles renders, labelled as such, and are not evidence of the game. Every performance number is a
software-renderer or file number; no real-GPU frame time has been measured.

<!-- RESULT:start -->
**Result.** All 54 parked cars and the parent's moving minivan are now six refined US-market family vehicles. Also
rebuilt in place: the 39 utility poles (hardware and 157 continuous wires), 27 cobra-head streetlights, 133 mailboxes,
8 hydrants, 89 bins, 13 hoops and Oak Hollow's 500 fence runs
(2,457 bays, 189 gates, 2,944 posts). Every object stands exactly where the
recorded procedural one stands; the default game's geometry, collisions, navigation and riding are identical (hashed
vertex by vertex and ride by ride). The street-props suite passes **38 of 38** checks
(`tests/streetprops-browser.mjs`, commit `495d571`). The regression suites
all pass.
There are 21 before/after pairs (§10), browsable in the [review gallery](https://claude.ai/artifact/CDWeAKYTnw6AAbSgTFUV6D).
<!-- RESULT:end -->

## 1. Source of truth

| | |
|---|---|
| Starting branch | `claude/prologue-roads-sidewalks-curbs-reconstruction` |
| Starting SHA | `75f40efb5895f0d2d06d01490e84241a4dc660dc` (`git rev-parse HEAD` before the branch was made) |
| Working branch | `claude/prologue-vehicles-street-props-benchmark` (new) |
| Final SHA | §15 |

Kept as they were: the bikes, houses, vegetation, lawn and pavement benchmarks (their files byte for byte), the story
through Chapter Eight, Aftermath I and II, the 2026 coda and the credits.

## 2. The ten supplied models: what was used, and what was refused

Every file was inspected (embedded metadata, loose-part analysis, texture sheets, Cycles renders) and its public record
fetched from the Sketchfab Data API on 2026-11-20 (kept in `assets/source/street/third-party/sketchfab-api/`). All ten
pages say CC BY 4.0; the decisions also weigh authorship and period plausibility. Full record:
[`assets/source/street/PROVENANCE.md`](../assets/source/street/PROVENANCE.md).

| Model | Verdict | Why |
|---|---|---|
| Generic passenger car pack — Comrade1280 | **Used** (6 of 10 bodies) | The author's own 2017 low-poly set (staff pick), "trademark claim proof". Its sedan, station wagon, minivan, SUV, crew-cab pickup and hatchback are 1997–2010 US family shapes; the coupe, sports car, city car and the off-roader (a seven-slot grille and "4X4" spare: one real make) are not used. |
| Utility Pole (PBR) — SLASH / RENDAR | **Used** (hardware and wood) | A real US distribution pole: double crossarm, pin insulators, braces, fused cutouts, two transformer cans. Used on the game's own 39 poles, not as independently placed poles. |
| Fire hydrant — Spellkaze | **Used** | An American dry-barrel hydrant made for a game by its author. Repainted the game's yellow. |
| Trash_cans — peyman.khaleghi | **Used** (cart, galvanized can) | The author's urban pack: a residential wheeled cart and a classic galvanized can (the two slatted park bins are municipal, not residential: not used). |
| Wooden Fence — DmitriyGDS | **Used** (board texture) | A rough board fence; its geometry is a rustic picket bay unlike Oak Hollow's fences, so only its board texture is used, on original fence geometry that follows the game's runs. |
| Basketball Hoop Scary Baboon — "ScaryBaboonRipper" | **Excluded** | The uploader's account name (and the file's "ScaryBaboonArchiver") says it was ripped from a game; no evidence of authorship or the right to relicense. Original hoops built instead. |
| AZLK Moskvich 2141 — Mona x Supercars | **Excluded** | A Soviet car on a 2011 American street; a replica of a trademarked car; game-database-style metadata; authorship not established. |
| Peugeot 406 — Mona x Supercars | **Excluded** | Peugeot left the US in 1991; same doubts as above; 67,656 triangles. |
| Home US Mailbox — Glowbox 3D | **Not used — the author's wish respected** | Its page: "NoAI: This model may not be used … as inputs to generative AI programs." This work is done by an AI agent, so the file was not imported (only its metadata and public record were read). Original mailboxes built instead. A person may review this (A-66). |
| Street Light — KMB3D | **Not used** | A slender modern davit pole with a flat luminaire: not a 2011 high-pressure-sodium cobra head. Original cobra heads built instead. |

## 3. Architecture: record, then replace in place

The same method as the house and vegetation benchmarks. With `?streetprops`, `world.js` gives the builders a record
(`W.sp`) and the street props are baked into batches, shadow proxies and line batches of their own (zones `sp:*`); the
geometry is not changed by a vertex (the flag only splits batches: proved in §11):

| Recorded | Where | What is recorded |
|---|---|---|
| 54 parked cars | `props.js` (Oak Hollow's driveways, the side streets' driveways and kerbs) | the car's group (its world matrix), kind, colour, where it stands |
| the parent's minivan | `props.js` wraps `world.car` | the moving car's group and parts (`ambient.js` drives it) |
| 39 utility poles, 157 wires | `furniture.js` | each pole's group, crossarm turn, transformer, guy; each wire's two poles, attachment, role, sag |
| 27 streetlights | `furniture.js` | the lamp's group and its lamp-level slot |
| 8 hydrants, 133 mailboxes, 54 bin sets | `furniture.js`, `props.js` | the group; the mailbox's style and colours; the bins' pair and colours |
| 13 hoops | `props.js`, `houses.js` | the curb hoop's group; each garage hoop's board, rim and pieces |
| 500 fence runs (2,646 bays, 2,944 posts) | `props.js` (Oak Hollow's runs) | each bay's two posts in street coordinates, style, height; side-yard runs flagged for a gate |

Recording reads values already chosen and never draws from a random stream, so the street is the same street.
`streetprops-assets.js` then places the authored set with exactly those matrices: one `InstancedMesh` per kind, LOD and
material (re-bucketed by distance as the camera moves; near LODs cast shadows), the wires as one ribbon mesh, and
`streetprops-benchmark.js` mounts it with the X / Z keys and the Prologue-only rule (as the pavement: from the night
chapters on, the originals return). Nothing is added to obstacles, navigation or the occupancy grid; no collision changes.

## 4. Vehicles (highest priority)

**Built by** `tools/blender/streetprops/build_vehicles.py` from the car pack (§2), exported to
`dist/assets/street/street.vehicles.glb` (geometry only; the atlases ship beside it).

| Type | Stands for | Length × width (mirrors) × height | Wheelbase · tyre radius | Tris LOD0 / 1 / 2 |
|---|---|---|---|---|
| sedan | the procedural `sedan` (2 in 3) | 4.80 × 2.14 × 1.48 m | 2.89 m · 0.335 m | 8,552 / 3,868 / 800 |
| hatchback | the procedural `sedan` (1 in 3: a compact) | 4.30 × 1.89 × 1.47 m | 2.63 m · 0.326 m | 8,238 / 3,785 / 789 |
| station wagon | `wagon` | 4.78 × 2.13 × 1.51 m | 2.87 m · 0.332 m | 8,412 / 3,829 / 798 |
| minivan | `van` (and the parent's moving minivan) | 5.05 × 2.05 × 1.94 m | 3.13 m · 0.348 m | 9,312 / 4,440 / 863 |
| SUV | `suv` | 4.90 × 2.20 × 1.85 m | 2.90 m · 0.399 m | 9,380 / 4,223 / 937 |
| crew-cab pickup | `pickup` | 5.50 × 2.20 × 1.81 m | 3.39 m · 0.399 m | 7,915 / 3,382 / 797 |

What was done to the pack's cars, and why:

- **Proportions and scale.** Each body is turned front to −Z (the game's front), its wheels' footprint centred, the tyres
  on the ground, the origin at the body's centre (as the procedural cars), and scaled uniformly (×1.06–1.10, the designer's
  proportions kept) to the length of a period US vehicle of its class. No car is longer than the procedural car it
  replaces (the pickup equals it), so none reaches further over a sidewalk (checked, §11).
- **Paint.** The pack's saturated toy colours (cyan, yellow, olive…) are gone: the build turns each painted panel into a
  neutral shading (0.5 = the panel's median, keeping its baked occlusion, panel lines and creases) and writes a paint mask
  from the pack's material-ID map. In the game every car takes a **restrained period paint** derived from the procedural
  car's own colour (silver, white, champagne/beige, slate, navy, blue-grey, sage, dark green, maroon, muted red; most
  with a little metallic flake), so the street keeps its colour balance. Material response: a clear coat (a sharp,
  Fresnel-weighted reflection of a small evening environment built from the game's own sky and fog colours, updated as
  the evening changes) over a paint roughness of 0.30; trim, gloss black, chrome, rubber and lamps from the pack's
  material IDs (chrome lightened: the pack's was a dark grey).
- **Age and wear, per car.** About a third kept, half average, the rest old: sun-faded, rougher tops on old cars; road
  film low on the body and round the wheel arches; summer dust on the hood, roof and trunk (all in the shader, seeded
  per car: no two cars alike).
- **Glass and cabins.** The pack's glass is a black 58 % alpha sheet over a black box. Now: a tinted glass that reflects
  the sky and turns more opaque at a glancing angle, and behind it a cabin you can read — front seats with headrests, a
  rear bench (two in the minivan), the dash and a steering wheel on the left (US).
- **Plates.** A rear plate on every car (generic, original: no real state's name, colours or graphics), found on the
  body by a ray from behind.
- **Wheels.** The pack's own tyres, rims and hub caps (four designs), with a little brake dust.
- **Standing on the ground.** The procedural cars are level and float or sink on sloping drives (by up to 9.3 cm). Each
  authored car on Oak Hollow is pitched and rolled onto the four contact points of the ground the riders use (all 42
  within 5 mm, §11). Side-street cars stand as the procedural ones do.
- **LODs.** LOD1 ≈ 45 %, LOD2 ≈ 10 % (collapse decimation; the cabin and plate drop out at LOD2, the glass turns
  opaque); switched at 26 m and 75 m; drawn to 420 m (the fog has them by then).
- **The parent's minivan** (`ambient.js`: it comes down Briarwood, turns onto Oak Hollow and pulls into its garage) is the
  authored minivan on the same group and the same path: its wheels turn with the game's, its headlamps are quads in the
  game's own lamp material (the game dims them as the engine stops), its glow sprites are the game's.
- **Branding:** none. The pack's designs are generic; plates are invented.

## 5. Utility poles and overhead wires

The game's network is kept: the same 39 poles (main line behind the left sidewalk, the junction pole, the two branch
lines), the same 114 spans, 42 service drops and the guy. On each pole:

| Piece | Source | Notes |
|---|---|---|
| Shaft | original geometry, the source pole's weathered-wood texture | tapered 0.33 → 0.23 m, 9.35 m above ground, 0.5 m buried; per pole: tone, creosote dark at the ground line, silvered higher on old poles; a ground-wire moulding up the back, an aluminium pole tag |
| Double crossarm, 4 pin insulators, V braces, bolts | SLASH / RENDAR | scaled so the crossarm is the game's 2.1 m; the insulator tops sit at 8.93 m, where the game's conductors are (8.95 m) |
| Transformer bank: lower arm, 2 fused cutouts, jumpers, can(s), brackets | SLASH / RENDAR | on the game's 15 transformer poles; rust toned down to aged galvanized |
| Secondary rack (2 porcelain spools) | original | the neutral and the service drops |
| Side pins | original | only where conductors run along a turned crossarm (the junction pole) |
| Guy guard and anchor | original | the yellow guard turned along the guy wire (the original stood vertical) |

**Wires** are redrawn on the same spans with the same sag formula, as one ribbon mesh: true thickness near the camera
(13–18 mm), never thinner than about a pixel far away (coverage fades instead of aliasing), lit by the sky with a glint
along the sun. Every wire is attached at both ends (§11). **Visual-only attachment changes** (A-62): the conductors meet
the insulator tops (±0.93 m, 8.93 m instead of ±0.85 m, 8.95 m); the neutral and the drops meet the secondary rack
below the transformers (6.80 / 6.62 m instead of 7.25 / 7.10 m on the pole's axis — at those heights they ran through the
cans); at the junction pole the along-arm conductors meet side pins 0.2 m off the pole (9.05 / 8.10 m instead of through
the arm). The house ends of the drops are exactly the game's. Wires carry no collision.

## 6. Streetlights

Original, on the game's own 27 lamps: a tapered steel pole on an anchor-bolt base cover, a mast arm on the game's own arm
path (one smooth curve through its three points, into a slip-fitter clamp), and a **cobra head**: a die-cast aluminium
housing lofted from the slip-fitter to its nose, a twist-lock photocell, and the **drop refractor** of a high-pressure
sodium luminaire. The refractor's material reads the game's own lamp levels (the uniform array `ambient.js` sets as each
lamp flickers on), with the original heads' colour ramp (orange as the lamp strikes, a warm white when up), so the light
schedule, the glow sprites, the light pools and the two local lights are exactly the game's (§11). No LED fixture.

## 7. Mailboxes, hydrants, bins

- **Mailboxes (original)**: a T1 rural box (rounded top, door with latch toward the street, red flag on its pivot) on the
  mount the procedural style already chose: white 4×4 post with a support arm and brace (31), stained 4×4 post with house
  numbers (45), black scroll post with a number plate (28), the brick column with a concrete cap, an inset door and brass
  numbers (29). The box keeps its recorded colour (black, blue-grey, red-brown or cream) through a paint mask.
- **Hydrants (Spellkaze)**: 0.88 m, the steamer nozzle where the procedural hydrant's was (along the street), the red repainted
  the game's chrome yellow with its chips, rust, grime and bolts kept (8).
- **Bins (peyman.khaleghi)**: the wheeled cart (1.0 m, handle and wheels on the side the procedural bins had them: along the street), tinted
  per household from the recorded colours (green, charcoal, grey-green; the second of a pair is recycling blue), its
  moulded recycling mark removed; about one single-bin household in four keeps an old galvanized can (82 carts, 7 cans).
  They stand where the procedural bins stood (at the curb by the driveway, trash day) — not moved toward the garages.

## 8. Hoops, fences, gates

- **Hoops (original)**: garage hoops with a 72 × 42 in board (shooter's square), an 18 in rim on its bracket and a net
  (cut-out cords), on two struts to the garage; an older 52 × 33 in steel board on the friend's garage; at the curb (d 253)
  a portable hoop — fillable base with wheels, three-section pole, extension arms, 54 in board — with its rim exactly at
  the procedural rim's place (the story's marks read `W.hoops`, unchanged). Hoops on the house benchmark's twelve lots are
  left to that benchmark (with `?houses`), so no lot ever shows two.
- **Fences (original geometry, DmitriyGDS board texture)**: all 500 of Oak Hollow's fence runs, bay by bay, each bay
  sheared between its own two posts on the ground (so the fence follows the slope with no gap and no step): privacy
  (dog-eared boards, two backer rails; stained, or weathered grey on about 45 % of runs), picket (pointed pickets, worn
  white paint), rail, chain link (cut-out mesh, galvanized top rail and posts); posts of the run's style with caps. On
  each side-yard run, the bay against the house is a **gate** (Z brace, strap hinges, latch) — 189 gates. Side-yard runs
  show their finished face (and the gate's hinges and latch) to the street, rails and brace toward the back yard; the
  other runs (between back yards) keep the face the run's direction gives them. The lookout's
  field fence and Briarwood's creek fences are left as they are (A-67).

## 9. Material integration with the other four benchmarks

One reflection environment for all street-props materials, built from the game's own hemisphere light, fog and sun
colours (the house benchmark's approach for its glass), rebuilt only when the evening's colours change. Paint, glass,
galvanized steel and porcelain get their reflections from it; wood, plastic and painted surfaces stay rough. Per-object
variation (tone, warmth, dullness with age, soil splash at the foot of anything in a lawn) keeps repeated props from
reading as copies. No global renderer setting was changed (tone mapping, exposure, shadows, fog are the game's).

<!-- MEASURED:start -->
## 10. Evidence

**21 before/after pairs** in `docs/qa/streetprops/browser/`: the 17 required views, with a second angle for
four of them. Each pair is one camera and one frame, with all five benchmarks on; the two images differ only by the X
key. `report.json` beside them holds each image's camera, game clock, draw calls, triangles and SHA-256.
**Review gallery** (the pairs side by side with a slider): https://claude.ai/artifact/CDWeAKYTnw6AAbSgTFUV6D. The same gallery is also in the offline package (`review-gallery/index.html`).

| # | Required capture | Pair(s) |
|---|---|---|
| 1 | A sedan | S01, S05 |
| 2 | A minivan or SUV | S02 (minivan); the SUV in S04 |
| 3 | A pickup or station wagon | S03 (pickup), S03b (wagon) |
| 4 | Three vehicle types together | S04 |
| 5 | Wheel and body close | S05 |
| 6 | Utility pole and wires | S06 |
| 7 | Transformer and insulators | S07 |
| 8 | A streetlight at golden hour | S08, S08b |
| 9 | A streetlight at dusk | S09 |
| 10 | A mailbox | S10 (also S11) |
| 11 | A hydrant | S11 |
| 12 | Bins | S12 |
| 13 | A basketball hoop | S13 (garage), S13b (portable) |
| 14 | A fence and gate | S14, S14b |
| 15 | A residential street | S15 |
| 16 | A wide view with all five benchmarks | S16 |
| 17 | The boys on their current bikes | S17 (current in-game placeholder characters) |

| Pair | What it shows | Camera | Game clock | Images | Draw calls (authored / original) | Triangles (authored / original) |
|---|---|---|---|---|---|---|
| **S01** | a sedan parked in a driveway | riding camera | AUGUST 21, 2011 7:43 PM | [authored](qa/streetprops/browser/S01-sedan-in-a-driveway--authored.jpg) · [original](qa/streetprops/browser/S01-sedan-in-a-driveway--original.jpg) | 563 / 552 | 1,065,072 / 1,037,669 |
| **S02** | a minivan in a driveway beside a house | riding camera | AUGUST 21, 2011 7:43 PM | [authored](qa/streetprops/browser/S02-minivan-beside-a-house--authored.jpg) · [original](qa/streetprops/browser/S02-minivan-beside-a-house--original.jpg) | 364 / 321 | 668,670 / 589,649 |
| **S03** | a pickup in a driveway | riding camera | AUGUST 21, 2011 7:47 PM | [authored](qa/streetprops/browser/S03-pickup-in-a-driveway--authored.jpg) · [original](qa/streetprops/browser/S03-pickup-in-a-driveway--original.jpg) | 538 / 539 | 1,081,879 / 1,058,709 |
| **S03b** | a station wagon in a driveway | riding camera | AUGUST 21, 2011 7:44 PM | [authored](qa/streetprops/browser/S03b-wagon-in-a-driveway--authored.jpg) · [original](qa/streetprops/browser/S03b-wagon-in-a-driveway--original.jpg) | 376 / 325 | 665,640 / 568,962 |
| **S04** | a wagon, a pickup and an SUV (and a sedan) parked down the street, at matched scale | riding camera | AUGUST 21, 2011 7:38 PM | [authored](qa/streetprops/browser/S04-three-vehicle-types-together--authored.jpg) · [original](qa/streetprops/browser/S04-three-vehicle-types-together--original.jpg) | 683 / 683 | 816,135 / 792,812 |
| **S05** | a close view of a car's front wheel, tyre, body paint and glass (QA close-up camera, 1.4 m from the wheel) | QA camera | AUGUST 21, 2011 7:37 PM | [authored](qa/streetprops/browser/S05-wheel-and-body-close--authored.jpg) · [original](qa/streetprops/browser/S05-wheel-and-body-close--original.jpg) | 740 / 737 | 931,555 / 923,672 |
| **S06** | a utility pole with its crossarm, transformer and the connected overhead wires | riding camera | AUGUST 21, 2011 7:44 PM | [authored](qa/streetprops/browser/S06-utility-pole-and-wires--authored.jpg) · [original](qa/streetprops/browser/S06-utility-pole-and-wires--original.jpg) | 495 / 468 | 871,815 / 809,075 |
| **S07** | the transformer, fused cutouts, pin insulators, crossarm braces and the secondary rack (QA close-up camera at 7.6 m) | QA camera | AUGUST 21, 2011 7:44 PM | [authored](qa/streetprops/browser/S07-transformer-and-insulators--authored.jpg) · [original](qa/streetprops/browser/S07-transformer-and-insulators--original.jpg) | 435 / 399 | 817,739 / 757,431 |
| **S08** | a cobra-head streetlight at golden hour (off, as the game's evening has it) | riding camera | AUGUST 21, 2011 7:43 PM | [authored](qa/streetprops/browser/S08-streetlight-golden-hour--authored.jpg) · [original](qa/streetprops/browser/S08-streetlight-golden-hour--original.jpg) | 493 / 488 | 776,505 / 733,228 |
| **S08b** | the cobra head: die-cast housing, photocell, drop refractor, mast arm (QA close-up camera) | QA camera | AUGUST 21, 2011 7:44 PM | [authored](qa/streetprops/browser/S08b-cobra-head-close--authored.jpg) · [original](qa/streetprops/browser/S08b-cobra-head-close--original.jpg) | 515 / 502 | 869,313 / 830,047 |
| **S09** | streetlights lit at dusk (the ride near the end of the street: the lamps have come on) | riding camera | AUGUST, 2011 AS YOU REMEMBER IT | [authored](qa/streetprops/browser/S09-streetlight-at-dusk--authored.jpg) · [original](qa/streetprops/browser/S09-streetlight-at-dusk--original.jpg) | 388 / 332 | 596,403 / 481,811 |
| **S10** | mailboxes beside a driveway (a white post, a brick column beyond) | riding camera | AUGUST 21, 2011 7:44 PM | [authored](qa/streetprops/browser/S10-mailbox-beside-a-driveway--authored.jpg) · [original](qa/streetprops/browser/S10-mailbox-beside-a-driveway--original.jpg) | 381 / 324 | 610,421 / 507,892 |
| **S11** | a fire hydrant in the parking strip near the curb (and a black scroll-post mailbox) | riding camera | AUGUST 21, 2011 7:43 PM | [authored](qa/streetprops/browser/S11-hydrant-near-the-curb--authored.jpg) · [original](qa/streetprops/browser/S11-hydrant-near-the-curb--original.jpg) | 408 / 370 | 693,417 / 636,050 |
| **S12** | the recorded wheeled carts at the curb beside a driveway, the garage behind (their existing place) | riding camera | AUGUST 21, 2011 7:41 PM | [authored](qa/streetprops/browser/S12-bins-beside-a-driveway--authored.jpg) · [original](qa/streetprops/browser/S12-bins-beside-a-driveway--original.jpg) | 499 / 484 | 926,392 / 873,307 |
| **S13** | a garage-mounted basketball hoop: backboard, rim, net, bracket (QA camera at the driveway's free-throw distance) | QA camera | AUGUST 21, 2011 7:47 PM | [authored](qa/streetprops/browser/S13-basketball-hoop-garage--authored.jpg) · [original](qa/streetprops/browser/S13-basketball-hoop-garage--original.jpg) | 333 / 268 | 785,978 / 691,178 |
| **S13b** | the portable hoop at the curb (d 253), as placed | riding camera | AUGUST 21, 2011 7:45 PM | [authored](qa/streetprops/browser/S13b-portable-hoop-at-the-curb--authored.jpg) · [original](qa/streetprops/browser/S13b-portable-hoop-at-the-curb--original.jpg) | 629 / 617 | 1,078,537 / 1,029,938 |
| **S14** | a side-yard gate (grey boards, strap hinges, latch) between the house and the stained privacy fence, its finished face toward the street (QA camera standing in the side yard) | QA camera | AUGUST 21, 2011 7:37 PM | [authored](qa/streetprops/browser/S14-wooden-fence-and-gate--authored.jpg) · [original](qa/streetprops/browser/S14-wooden-fence-and-gate--original.jpg) | 265 / 196 | 588,204 / 498,592 |
| **S14b** | back-yard and lot-line fences seen between houses from the sidewalk | riding camera | AUGUST 21, 2011 7:35 PM | [authored](qa/streetprops/browser/S14b-fences-from-the-street--authored.jpg) · [original](qa/streetprops/browser/S14b-fences-from-the-street--original.jpg) | 221 / 171 | 418,122 / 358,666 |
| **S15** | a residential street with its cars, poles, wires, lamps, mailboxes and bins | riding camera | AUGUST 21, 2011 7:48 PM | [authored](qa/streetprops/browser/S15-residential-street--authored.jpg) · [original](qa/streetprops/browser/S15-residential-street--original.jpg) | 691 / 703 | 1,208,155 / 1,181,628 |
| **S16** | a wide, raised view of Oak Hollow with all five benchmarks (QA raised camera, 13 m up) | QA camera | AUGUST 21, 2011 7:42 PM | [authored](qa/streetprops/browser/S16-oak-hollow-wide-all-five--authored.jpg) · [original](qa/streetprops/browser/S16-oak-hollow-wide-all-five--original.jpg) | 488 / 495 | 701,845 / 680,309 |
| **S17** | the boys on their bikes as the ride begins — CURRENT IN-GAME CHARACTER PLACEHOLDERS (the game's procedural figures on the authored ?bikes bicycles), not the unintegrated Phase 1A Blender characters | riding camera | AUGUST 21, 2011 7:42 PM | [authored](qa/streetprops/browser/S17-the-boys-on-their-current-bikes--authored.jpg) · [original](qa/streetprops/browser/S17-the-boys-on-their-current-bikes--original.jpg) | 688 / 694 | 986,183 / 955,092 |

The clock reads the game's own date line: every daytime pair is in the Prologue's evening (7:35–7:48 PM, August 21,
2011); S09 is later in the same ride, after the lamps come on. **Riding camera**: the gameplay camera, placed by the QA
hook. **QA camera**: placed by hand beside the object (S05, S07, S08b, S13, S14, S16), with the same renderer, light and
shadows. In S16 the bike stands under the raised camera.

**Blender inspection renders** (offline Cycles, **not** the game): `docs/qa/streetprops/blender/`
(`blender-vehicles-lineup--BLENDER-RENDER.jpg`, `blender-props-kit--BLENDER-RENDER.jpg`): the six cars at LOD0 in period
paints, and the prop kit. They show the models themselves, not how the game draws them.

## 11. Tests and performance

### 11.1 The street-props suite

`node tests/streetprops-browser.mjs` (Chromium + ANGLE SwiftShader, 1600 × 900): **38 passed, 0 failed**
(commit `495d571`; `docs/qa/streetprops/browser/report.json`).

| Part | Checks | What is proved |
|---|---|---|
| A | 3 | the default game fetches no street-props module or asset and has no `sp:` record, zone or line tag; its baseline: 3,672,619 merged triangles, 40,488 ground queries, 812 obstacles |
| B | 20 | the two GLBs and eight textures load (module 242 ms; page 26,679 ms in software); 54/54 cars on their records (x/z within 2 cm), tyres within 0.0051 m of the ground (the level procedural cars: up to 0.0934 m), none further over a sidewalk (0) or into a house margin (0) than the procedural car; every pole, lamp, mailbox, hydrant, bin, bay and post accounted for; 157 wires attached at both ends (0 detached, 0 primaries off an insulator); the merged geometry, shadow proxies and lines hash identical to A; 40,488 ground queries, obstacles, navigation shapes and three scripted rides identical; X and Z work; the moving minivan is authored, drives 21.57 m with its wheels turning; Chapter One shows the originals; no page errors |
| C | 4 | all five benchmarks load together without error; vegetation identical with and without `?streetprops`; the ride runs |
| D | 5 | the offline package with models runs `?streetprops` and all five from the embedded bytes, browser offline, with no network request; the default package fails loudly and substitutes nothing |
| E | 3 | 21 pairs, each one camera and one frame; cost per frame (below); no page errors |
| F | 3 | cost against the default game at eight riding cameras (below); no page errors |

### 11.2 Regressions (the existing suites)

| Suite | Result | Summary |
|---|---|---|
| game logic (`verify.mjs`, every chapter) | **818 passed, 0 failed** | `docs/qa/streetprops/regression/regression-verify.json` |
| house benchmark | **30 passed, 0 failed** | `docs/qa/streetprops/regression/regression-house-browser.json` |
| bike benchmark | **29 passed, 0 failed** | `docs/qa/streetprops/regression/regression-bike-browser.json` |
| character pipeline lab | **36 passed, 0 failed** | `docs/qa/streetprops/regression/regression-pipeline-browser.json` |
| vegetation benchmark | **74 passed, 0 failed** | `docs/qa/streetprops/regression/regression-vegetation-browser.json` |
| pavement benchmark | **30 passed, 0 failed** | `docs/qa/streetprops/regression/regression-pavement-browser.json` |
| main menu, offline package (final chapter) | **96 passed, 0 failed** | `docs/qa/streetprops/regression/regression-main-menu-package.json` |

`verify.mjs` reports one known DEV difference (`2/alex-bike`: a companion's bike position after a dev-scene switch). It is
reported, not asserted, and appears with the same values in the pavement branch's own run
(`docs/qa/pavement/regression/regression-verify.json`). The game-logic run was made before the last commits, which touch
only the street-props modules, assets, the suite and docs: the code of the default path is the same (runtime hashes in its
summary).

### 11.3 Cost

**Files.** `street.vehicles.glb` 4.46 MB, `street.props.glb` 1.87 MB, eight textures
3.47 MB on disk (2048² albedos, 1024² ORM and normal maps, a 512² cut-out). Offline package with every
benchmark's models: 166.7 MB; default package (no models): 12.9 MB.

**GPU textures** (estimated, RGBA8 with mipmaps): **≈ 86.7 MB**, anisotropy 16.

**Geometry at a riding camera** (the DEV label's count, B): cars 38,935 triangles in 26
instanced draws for 54 cars; props 96,505 triangles in
45 draws for 6,030 instances. LOD0 per car: 7,915–9,380 triangles (§4).

**Per captured frame** (E, all five benchmarks; authored against original in the same frame): draw calls
−12 to +69 per frame, triangles ×1.009 to 1.238. Over the 21 frames: 10,193 against
9,668 calls, 17,157,980 against
15,995,717 triangles.

**Against the default game** (F: eight riding cameras, `?streetprops` alone; fresh browsers: three cameras per browser for the default game, one per browser with the flag, which renders each camera in both X modes):

| Camera | Default game: calls · tris · ms | `?streetprops`, ORIGINAL | `?streetprops`, AUTHORED |
|---|---|---|---|
| C1 (d 40) | 308 · 645,869 · 1369 | 353 · 625,271 · 1474 | 350 · 647,603 · 1695 |
| C2 (d -232) | 433 · 732,825 · 1673 | 474 · 716,819 · 1483 | 472 · 739,366 · 1705 |
| C3 (d 128) | 302 · 742,317 · 1109 | 325 · 694,646 · 1059 | 355 · 758,070 · 1418 |
| C4 (d 380) | 474 · 1,025,149 · 2102 | 527 · 987,842 · 1930 | 515 · 1,014,369 · 2252 |
| C5 (d 76.5) | 184 · 432,150 · 807 | 228 · 435,032 · 1227 | 267 · 492,779 · 1162 |
| C6 (d -4.5) | 308 · 763,643 · 1231 | 320 · 691,875 · 1279 | 336 · 745,340 · 1522 |
| C7 (d 700) | 459 · 770,818 · 1809 | 513 · 761,278 · 1698 | 500 · 789,866 · 1972 |
| C8 (d 1032) | 194 · 254,594 · 667 | 211 · 251,565 · 1135 | 267 · 366,157 · 1139 |
| **Sum** | 2,662 · 5,367,365 · 10767 | 2,951 · 5,164,328 · 11285 | 3,062 · 5,553,550 · 12865 |

Authored against the default game: **draw calls ×1.15, triangles ×1.035, software frame
time ×1.195**. ORIGINAL under the flag already costs a little more than the default game in draw calls: the flag
bakes the street props into batches of their own (zones `sp:*`) so that X can hide them. Those smaller batches are also
frustum-culled one by one, so fewer triangles are drawn (the geometry is identical, §11.1). The frame time is the median of three renders on SwiftShader, on the CPU: it shows the relative
added work, not a GPU frame time.

**Load.** The street-props module builds its set in 242 ms after its files arrive. The world bake is
the game's own: the flag adds batch splits, not geometry. **Memory** in software rendering: see §13. No real-GPU number has
been measured.
<!-- MEASURED:end -->

## 12. How to rebuild, run and try it

```bash
pip install bpy==5.1.2 numpy pillow                           # Blender 5.1 as a Python module (headless)
python3 tools/blender/streetprops/street_textures.py           # the vehicle and prop atlases (numpy, Pillow)
python3 tools/blender/streetprops/build_vehicles.py            # street.vehicles.blend + .glb
python3 tools/blender/streetprops/build_props.py               # street.props.blend + .glb
cp assets/source/street/textures/{veh,props}_*.{jpg,png} dist/assets/street/
node tests/streetprops-browser.mjs                             # the suite (software WebGL; PARTS=A..F, VIEWS=S01,…)
python3 -m http.server -d dist 8000                            # then open http://localhost:8000/?streetprops
```

Open `?streetprops` (or `?bikes&houses&vegetation&pavement&streetprops`), New Game, ride. **X** swaps AUTHORED and
ORIGINAL in the same frame; **Z** steps the LOD (auto, 0, 1, 2). The DEV label (top-left) shows what loaded, the counts,
the cost and the attribution. Everything is deterministic (no randomness beyond fixed seeds; the same inputs give the same
files). Model-to-game mapping, attachment points and LOD distances: [art/STREET-PROPS-KIT.md](art/STREET-PROPS-KIT.md).

## 13. Known limitations and unresolved issues

- **No real GPU, no human ride.** Every frame and number here is software rendering, judged from still frames. Real-GPU
  frame time, motion (LOD switches, wire shimmer, the minivan arriving) and a person's ride are the next step.
- **Software-renderer memory.** With all five benchmarks on, this machine's software renderer holds memory frame after
  frame (it rises from about 6 GB to past its 14 GB limit within a few frames, with or without `?streetprops`, faster with
  it): the suite therefore renders at most three views per browser. Not a GPU number; it should be checked on hardware.
- **Texture memory** (≈ 87 MB uncompressed RGBA8 + mips) is in the range of the house (75 MB) and vegetation (157 MB)
  benchmarks; KTX2 compression (L-7) would cut it several times.
- **Not refined this pass (left procedural, A-67):** the yard toys and furniture, garden hoses, the pool, trampoline, swing
  set, shed and clothesline; the street signs and their posts; the lookout's field fence; Briarwood's creek fences and the
  side streets' fences; the police, works and later chapters' vehicles. The default-path code was frozen once the
  regression suites started, so these were not added.
- **Prologue only (A-68).** From the night chapters on, the originals show (by design, as the pavement).
- **The car pack is low-poly source material** (≈ 4–5k triangles a body): silhouettes and panel shading are good from the
  street; up close the wheel arches, mirrors and grilles stay simple, and the pack's baked occlusion is soft. The cabins are
  silhouettes, not modelled interiors. A hero car (if one is ever needed close to the camera) would want more.
- **Wires** have no shadow; drops end at the game's points on the houses (no house-side hardware, so as not to float
  beside the house benchmark's different walls).
- **Mailbox source.** The supplied mailbox was not used because of its author's no-AI request (§2); the original
  mailboxes are simpler than a scanned product would be. A person may import it if the request is judged not to apply
  (A-66).
- **Bins** stand where the procedural bins stood (at the curb by the driveway, handles along the street as before), not
  beside the garages; moving them would change the layout.

## 14. Decisions for the creative director (all OPEN in the approval register)

| ID | Decision |
|---|---|
| A-60 | Approve / revise / reject the vehicles, per type |
| A-61 | Paint and age policy (period colours, wear distribution, hatchback share) |
| A-62 | Utility hardware and the visual-only attachment changes (insulator tops, secondary rack below the transformers, side pins) |
| A-63 | Cobra-head HPS streetlights |
| A-64 | Mailboxes (four mounts), the hydrants' yellow, carts and galvanized cans |
| A-65 | Hoops, fences and side-yard gates |
| A-66 | Provenance decisions and the credits wording for the production swap |
| A-67 | The objects not refined in this pass |
| A-68 | Whether and when the street props become the default and carry the later chapters |

**Recommendation.** Ready for your visual review as a Prologue benchmark. In the captures the street reads as a lived-in
2011 suburb rather than a set of coloured blocks: the cars are period family vehicles in faded, varied paints, the poles
are wired hardware, the lamps are cobra heads. The game underneath is provably unchanged. I do not call it final-release
quality: it has been judged only in software-rendered stills, its GPU cost is unmeasured, the car pack's low-poly detail
shows up close, and the yard details are still procedural. Approve or adjust A-60 to A-66 after a ride on real hardware;
keep A-67 and A-68 for later.

## 15. Delivery

| # | Deliverable | Where |
|---|---|---|
| 1 | The branch | `claude/prologue-vehicles-street-props-benchmark`, pushed to `origin`; started from `75f40efb5895f0d2d06d01490e84241a4dc660dc`; **not merged into `main`**; the pavement branch untouched. The head commit is the one that adds this section (its SHA is given with the delivery and by `git ls-remote origin claude/prologue-vehicles-street-props-benchmark`). |
| 2 | The runtime (`?streetprops`) | `dist/streetprops-assets.js`, `dist/streetprops-benchmark.js`, `dist/assets/street/` (2 GLBs, 8 textures); the recording hooks in `world.js`, `props.js`, `furniture.js`, `houses.js`, `game.js` (inert without the flag) |
| 3 | Editable sources and build scripts | `assets/source/street/` (`.blend` files, atlases and their maps, the five used originals, the Sketchfab records, `SHA256SUMS`); `tools/blender/streetprops/` (textures, vehicles, props, inspection renders, gallery) |
| 4 | Provenance and credits | `assets/source/street/PROVENANCE.md`; `docs/THIRD_PARTY_ASSETS.md` (with the credits wording prepared for a production swap) |
| 5 | Model-to-game mapping, LODs, attachment points, rebuild | `docs/art/STREET-PROPS-KIT.md`; §12 |
| 6 | Review evidence | `docs/qa/streetprops/browser/` (21 same-frame pairs, `report.json`); the review gallery https://claude.ai/artifact/CDWeAKYTnw6AAbSgTFUV6D (private to its owner until shared), also `review-gallery/` in the package; Blender inspection renders in `docs/qa/streetprops/blender/` (labelled) |
| 7 | Tests | `tests/streetprops-browser.mjs`: 38 passed, 0 failed. Parts A–E ran at `495d571`; part F was re-run on the same `dist/` with one `?streetprops` camera per browser. The regression summaries are in `docs/qa/streetprops/regression/` (§11.2). |
| 8 | Performance | §11.3 (software renderer: draw calls, triangles, frame-time ratio, files, texture memory, load) |
| 9 | Offline playtest | `Last-Light-Prologue-Street-Props-Benchmark.zip`, 99,031,446 bytes, SHA-256 `cb73526788e159b0d16dca27a4e25394dcf3b49dacf586b7c5873439d6e772e0`: `Last-Light-Playtest.html` (the whole game with every benchmark's models embedded, entry SHA-256 `e7844b270410741bee6939bf8e62384d1f3d77b6790bf8a47253d0fb0c3e629d`), `STREETPROPS-README.txt`, this report, the review gallery, credits and licences. It was built from the `dist/` of `495d571`, which is identical in the head commit. The ZIP is not in git (`release/` is ignored). |
| 10 | Decisions awaiting you | A-60 to A-68 in `docs/art/ART-APPROVAL-REGISTER.md`, all OPEN (§14) |

**Stopped here for your review.** Nothing in this benchmark is approved, nothing is merged, and the default game is
unchanged.

