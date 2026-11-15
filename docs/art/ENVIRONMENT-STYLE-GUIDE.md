# Last Light — Environment Style Guide

Part of the [Final Art Bible](../LAST-LIGHT-FINAL-ART-BIBLE.md). Covers suburban construction, architecture, streets, interiors, vegetation, the old oak, bicycles, vehicles, props, underground and industrial spaces, geography and environmental storytelling. Source audit base: `c646a862b272c987b0a0b9aea690ddfc859ddda7`.

**The world should feel like a real, lived-in American suburb in August 2011** — a mid-sized township with an older downtown (Main Street, the Lyric), 1950s–1990s residential streets, a creek in a concrete channel, storm drains and township works underneath, woods and a reservoir park to the north.

---

## 1. One Oak Hollow: geographic source of truth

The layout must not be moved by art work. CURRENT SOURCE files:

| Place | File(s) | Key coordinates / facts |
|---|---|---|
| Oak Hollow Drive (the ride), cul-de-sac, lookout | `dist/layout.js`, `route.js`, `terrain.js`, `streets.js` | Road from d −430 to 1140; bulb at d 1142 r 11; lookout bounds d 1121–1171, field fence at d 1173 |
| Briarwood Lane | `layout.js` `JUNCTIONS[0]` | Leaves at d 595 to the right; bends right past the creek at u≈100 |
| Summerfield Road | `layout.js` `JUNCTIONS[1]` | Leaves at d 870 to the left |
| Lots | `layout.js` | First row every 29 m from d −427 to 1116 both sides; cross-street lots per junction |
| Jamie's house | `FRIEND_HOMES.jamie` | d 791, right side; colonial; door `0x7a2f2a`; walls `0xc6b28c`; stoop; near garage; the red chair on the porch (STORY) |
| Sam's house | `FRIEND_HOMES.sam` | d 994, left side; ranch with side gable; walls `0x9ea9a2`; far garage with working door and side door ("blue garage trim", `chapter7-house.js`) |
| Alex's house | `SIDE_HOMES.alex` | Briarwood u 127, right; colonial; door `0x2f3d55`; porch; working door and garage with an empty bike hook; his window looks toward the creek |
| The car house, the hoop house | `FRIEND_HOMES.car`, `.hoop` | d 522 left; d 153 left |
| The Hendersons' / the Kesslers' | `chapter8-town.js` `houseAt(1025.9,1)` / across | ≈ d 1026 right / left |
| The Kowalskis' corner, Summerfield intersection | `chapter8-ruin.js` | Burns to a frame (Ch8); cleared lot (October) |
| Houses 1052, 1081 | `chapter8-town.js` | 1052 leans into the trench; 1081 loses porch and roof |
| The old oak | `layout.js` `LOOKOUT.oak` | d 1162, lat 7.6 |
| Bench, tire swing, chalk | `LOOKOUT.bench/.swing/.chalk` | d 1166 lat −4.2; d 1161.5 lat 5.2; d 1149.5 lat −1.4 |
| Creek, culvert, easement | `layout.js`, `creek.js`, `easement.js` | Concrete storm channel under Briarwood; easement behind the yards with the big culvert and the 1974 plated opening |
| Pond road, detention basin | `woods.js`, `basin.js` | Past the end of Briarwood (Ch3) |
| Storm drains | `drain.js`, `chapter3-art.js` | Ch3 |
| Old Mill Road, downtown, Main Street | `town-plan.js`, `town-build.js`, `town-houses.js` | Ch4 |
| Pine Ridge Park, reservoir, Camp Whippoorwill | `pine-plan.js`, `pine-build.js`, `pine-camp.js`, `far-land.js` | Ch5 |
| Mill Creek works (Gate 2B etc.) | `chapter6-works.js` | Ch6 |
| Old Mill Court and the lane | `chapter7-court.js` | Ch7 (three identical copies of the lane by design) |
| Isolation works under the court | `chapter8-complex.js` | Ch8 Acts I–IV |
| Oak Hollow Elementary (shelter) | `aftermath1-places.js` | Aftermath I; stands on its own ground (world hidden) |

**Rule:** any new geometry for a place is placed by these plans. A new house model on Jamie's lot keeps the lot, setback, style family, door color family, garage side and interactable positions unless the creative director approves a change.

Planned: Aftermath II (~2021) rebuilt Oak Hollow, the 2026 room. Both must use the same plans (§12).

---

## 2. Suburban architecture

### 2.1 Vocabulary (CURRENT SOURCE `houses.js`, keep and raise)

Four styles — **ranch** (34%), **colonial** (34%), **cape** (16%), **front-gable** (16%) — with hip, side-gable and front-gable roofs, attached one- or two-car garages either side, porch/portico/stoop, dormers, chimneys, brick veneer (full front or wainscot), shutters, AC units, decks and patios. Palette `dist/palette.js` `HOUSE`. This is the right vocabulary for a 1960s–1990s Midwestern/Northeastern township; the reconstruction improves construction, not variety for its own sake.

### 2.2 Construction rules (binding)

| Element | Rule |
|---|---|
| Proportions | Ground-floor plate 2.4–2.7 m; second floor 2.4 m; ridge heights by roof pitch (ranch 4/12–5/12, colonial 6/12–8/12, cape 10/12–12/12). Doors 0.91 × 2.03 m; garage doors 2.74 × 2.13 m (single), 4.88 × 2.13 m (double) |
| Roofs | Overhang 0.3–0.45 m eaves, 0.15–0.3 m rakes; fascia, soffit with vents, gutters on eaves only, downspouts at corners reaching splash blocks; ridge caps; flashing at chimneys and dormers; roofs sit **on** walls (no gaps, no floating) |
| Windows | Placed by rooms (bedrooms upstairs, kitchen at rear/side, bath small and high); stacked vertically on colonials; trim/casing, sills, mullions (period 6-over-6, 6-over-1, or 1-over-1); glass with reflection and **interior depth** (an interior card or parallax room behind every window: curtains, blinds, a lamp, a ceiling) — no flat black rectangles |
| Doors | Panels, frame, threshold, knob/handle hardware, storm door on many houses; no door opening into a wall; dynamic doors match their static mesh |
| Siding | Lap siding with visible courses and corner boards; brick with mortar depth; shingles on capes possible |
| Foundations | Exposed 0.2–0.5 m concrete/block above grade; grade follows terrain (houses are draped, `world.js`) |
| Porches | Posts with bases and caps, railings with balusters at code height (0.9 m), steps with risers ≤ 0.19 m, porch lights by the door |
| Utilities | Meter on a side wall, service drop from the nearest pole to the house (wires end at the house, never in air), AC condenser on a pad, hose bib, dryer vent |
| Garages | Panel doors with windows on some, interior depth when open: shelves, bikes, tools, a car or clutter |

### 2.3 Variation without chaos

Variation axes: style, roof, garage side/size, porch type, siding color (palette), door/shutter colors, brick use, landscaping, yard objects, maintenance level (fresh paint vs chalky, tidy vs overgrown). Not allowed: random window grids, inconsistent window types on one facade, mismatched eras on one house, tiny houses beside oversized ones on equal lots.

### 2.4 Interior depth

| Visibility | Treatment |
|---|---|
| Entered (story homes, the Langes', the shelter, the works) | Authored rooms with correct furniture proportions (counter 0.91 m, table 0.76 m, chair seat 0.45 m, bed 0.5–0.6 m, doorknob 0.9 m), ceiling fixtures, baseboards, outlets, light switches, period electronics |
| Seen through windows near the route | Interior cards or parallax interiors with lamp state synced to `litMaterial` schedules |
| Far | Window emissive patterns only at night; curtains and blinds by day |

---

## 3. Streets and infrastructure

| Element | Standard |
|---|---|
| Road width | Residential 8.4–9.4 m curb to curb (CURRENT: curb face at 4.7 m from center = 9.4 m); crowned; gutter pans |
| Curbs | Barrier curbs with rolled driveway cuts (CURRENT: real curb up/down handling in `ride-contact.js`); curb ramps at corners |
| Sidewalks | 1.5 m (CURRENT walk 6.35–7.85 m = 1.5 m) concrete panels with control joints every 1.5 m, expansion joints, root heave in older stretches, chalk |
| Planting strip | Grass strip between curb and walk with street trees |
| Storm drains | Curb inlets with cast iron grates/hoods every 90–120 m, stamped `OAK HOLLOW TWP.` (original mark); manhole covers in the road (`LINE 4` covers in Ch8) |
| Utility poles | Wood poles every 35–45 m on one side, crossarms, insulators, transformers on some, guy wires at corners and ends, **continuous wires** (CURRENT `furniture.js` power network: spans, drops, guys tested in `verify.mjs`) |
| Streetlights | 2011: cobra-head **high-pressure sodium** (amber) on poles or mast arms; photocells (lights come on one by one at dusk — Ch4 uses this) |
| Signs | Green street-name blades (`OAK HOLLOW DR`, `BRIARWOOD LN`, `SUMMERFIELD RD`), stop signs, speed limit 25, children-at-play; posts meet the ground; no sign penetrated by its pole |
| Mailboxes | Curbside post mailboxes, varied (standard, decorative, brick) |
| Markings | Minimal on residential streets (none or faded center line); crosswalks near the school and downtown |
| Wear | Patches, crack sealant, oil stains in driveways, tire polish in lanes, leaves in gutters |

---

## 4. Material response tables (detail for bible §5.1)

Each family: dry/wet base value shift, roughness, normal strength, weathering inputs.

| Family | Dry | Wet (rain/flood/hose) | Weathering inputs | Must avoid |
|---|---|---|---|---|
| `mat.wood.raw` | Grain-directed albedo variation ±12%, roughness .8–.95 | Value −20%, roughness −.3 | Gray patina by sun exposure, end-grain dark, splits, nail rust bleed | Uniform brown; grain across the board |
| `mat.wood.painted` | Paint color ±4%, brush streak normal | Slight darkening at bare chips | Chipping at edges/steps, dirt in recesses, mildew low on north sides | Perfect new paint everywhere |
| `mat.siding.vinyl` | Course shadow lines, corner boards, J-channel | Streaks below windows | Chalky fade on south/west sides, green algae on north bottoms | Flat walls with drawn lines |
| `mat.brick` | Per-brick hue/value ±10%, mortar recessed 6–10 mm | Darkens unevenly (mortar first) | Efflorescence, chipped corners, soot (fires) | Tiled texture repeating every meter |
| `mat.concrete` | Aggregate, pits, formwork lines (works), broom finish (walks) | Darker bands, puddles in low spots, sheen | Mineral runoff under outlets/joints, rust stains below steel, moss in shade, spalling, structural cracks along joints/corners | Random crack decals across structural members |
| `mat.asphalt` | Fine aggregate normal, value variation, patches, sealant snakes | Roughness .15–.35, reflections of lights, puddles in ruts | Tire polish, oil, lane wear, raveling at edges | Uniform gray plane; mirror-wet everywhere |
| `mat.roof.shingle` | Tab rows, granule variation, dark streaks | Darker, slight sheen | Moss north side on older roofs, curled tabs, missing tabs (rare) | Flat dark slabs |
| `mat.metal.*` | Painted: chips at edges to primer/rust; galvanized spangle; stainless brushing | Water beading darkens, rust activates | Rust from bolts and joints streaking down; handle wear | Flat gray "metal" with no wear |
| `mat.glass` | Reflection, slight green/gray edge tint, dirt at corners | Droplets/streaks (rare) | Dust film on garages and abandoned buildings; cracks (damage states) | Opaque black; perfectly clear and invisible |
| `mat.foliage` | Per-instance hue ±6%, back-light transmission | Darker, specular glints | Season: Aug green → Sep tired → Oct turning | Uniform cloned clusters |

---

## 5. Trees, plants and ground

### 5.1 Trees (all species)

CURRENT SOURCE `vegetation.js`: maple (default), oak, birch, pine, young; LODs `full` (airy leaf cards), `mid`, `far`; every crown hangs from a branch that grows from the trunk; trunks flare into the ground; trees placed whole.

Standards:

- **Species language** for a 2011 Midwestern/Northeastern suburb: red/silver/sugar maple (street trees), white and pin oak, honey locust, linden, birch (yards), spruce and white pine (yards/woods), crabapple/redbud (ornamentals). Pine Ridge: pine forest.
- **Structure:** trunk taper (diameter halves over ~5–8 m), branch hierarchy (trunk → scaffold limbs → branches → twigs), branch angles per species, irregular crown, gaps and dead twigs, root flare and surface roots on old trees, bark per species.
- **Foliage:** leaf cards clustered on twigs (not floating blobs), varied orientation, alpha-tested with soft edge dithering, back-light transmission, per-tree hue variation.
- **Shadows:** dappled shadow on Medium+ (alpha-tested shadow casting); simplified on Low.
- **Wind:** trunk sway (low amplitude, 0.1–0.3 Hz), branch sway, leaf flutter; stronger in storm (Ch6) and catastrophe (Ch8 fire draft).
- **Night:** silhouettes with recognizable species shape against the sky; no blob crowns.
- **No clones:** within one view, no two identical trees at the same rotation and scale; use at least 6 variants per species near the route.

### 5.2 Grass, lawns, plants

- Lawns: cut height variation, mowing stripes on some, weeds (clover, dandelion) on others, brown patches in late August heat, bare paths where kids cut across, edged lawns vs ragged edges by owner.
- Groundcover around foundations and fences; mulch beds with shrubs (boxwood, yew, hydrangea, hostas in shade); tall grass and wildflowers in the lookout field and easements (CURRENT tall grass reads as "spiky cones", `ASTRA_HANDOFF.md` §5 — replace).
- Seasonal states: August (green, a little tired), September (dusty, some yellowing), October (turning orange/brown, leaves in gutters, raked piles), 2021 (matured: street trees larger, new plantings on rebuilt lots).
- Distance: grass blades near the camera (≤ 15 m), textured ground beyond, with color continuity at the transition.

---

## 6. The old oak — `lm.old-oak` (master specification)

| Field | Specification |
|---|---|
| Location | Oak Hollow Drive lookout, d 1162, lat 7.6 (`LOOKOUT.oak`), on the knoll beyond the cul-de-sac bulb, near the field fence (d 1173) |
| Species | White oak (PROPOSED; CDA A-29a): broad spreading crown, massive low limbs, plated pale-gray bark |
| Age / scale | PROPOSED: 150–200 years; trunk diameter 1.2–1.5 m at chest height; first major limbs at 3–4 m; crown spread 22–28 m; height 18–22 m. CURRENT SOURCE: procedural `veg.tree(… kind:'oak', size:1.35, landmark:true)` — landmark multiplies width ×1.5, trunk height ×1.5 (≈ 6.5 m to the crown branching), 8 main branches; the visual recovery made it "taller, broader" |
| Silhouette | Asymmetric: the heavier low limb reaches **toward the swing side** (lat 5.2) and carries the tire swing; a second great limb arches over the bench side; a dead stub high on the field side (PROPOSED). The silhouette must be unique in the game and readable from the barricade in Aftermath I (currently "one tree among the trees" at 124 m — must be fixed by silhouette, not by a marker) |
| Trunk details | Root flare with exposed roots on the knoll; the **`AR` carving with healed bark lips at a child's height** (STORY CANON, `ending.js`; Annie Rowan, 1958 — not Alex); old scars; moss on the north side |
| Associated objects | Tire swing on the low limb (rope, tire, worn dirt below it); bench at d 1166; `JSA` chalk and faint `AR` chalk on the path at d 1149.5 (Prologue/Ch2); the old bike lying under it after the call (Prologue) |
| Story moments | Prologue end; Ch1 regroup; Ch2 morning (the old bike gone); Ch4 ending ("It was scared." "Of what?"); Ch6 oak talk; Ch7 the lane behind it; Ch8 surface reveal from the oak at 5 AM; **Alex's death sitting against its trunk**; Aftermath I seen behind the fence |
| States | `dmg.A` summer full leaf; Ch8 night under the red deck: silhouetted, ash on leaves, not destroyed (PROPOSED — keep it standing; CDA A-29b whether limbs are damaged); September: behind the restricted line, a few leaves turning; October: orange-brown; 2021: the same tree, larger by a little, the carving still there, perhaps a memorial marker (CDA, must be story-approved) |
| Visibility | From the cul-de-sac bulb, from the Ch8 surface lookout, from the barricade (Aftermath I), and in Alex's prints ("The oak. Aug.") — the print must show this tree |
| Rule | Built once; every chapter uses the same instance (CURRENT: one instance in the world bake — keep); the tire swing limb mesh must be the tree's own limb, not a separate cylinder near it (CURRENT: separate cylinder in `ambient.js`) |

---

## 7. Lived-in detail and environmental storytelling (2011)

Every visible yard tells something about who lives there. Use a deliberate set per lot (not random scatter): kids' bikes and scooters, sidewalk chalk, a basketball hoop (the hoop kid), lawn chairs, garden hoses (sprinklers in the Prologue), sports gear, family cars, open garage doors with clutter, porch decorations (flags, wreaths, potted plants), recycling and trash bins on collection day, garden beds, a kiddie pool, a grill on the deck.

Period accuracy (2011):

| Allowed | Not allowed |
|---|---|
| Flip phones, early smartphones (2010–2011 designs, no notch), landline phones, answering machines (the Langes' is 1974–1983 era), CRT and early flat TVs, DVD/Blu-ray, Wii/PS3/Xbox 360 era consoles, desktop PCs with LCD monitors | Notched phones, smart speakers, video doorbells, LED bulbs everywhere, 2015+ car designs, e-scooters, modern charging cables |
| Cars from ~1995–2011 (sedans, minivans, SUVs, pickups) | Cars from after 2011 |
| Sodium streetlights | LED streetlights (2021 may have them — see §12) |

Documents and paper are story objects: flyers (MISSING), the Courier (1974, 1988, 1991), the 1958 plan, the 2009 map, Procedure 7, Ruth Ann Carver's 1979 book, the anchor board — consistent typography per era (newsprint, township stencils, typewriter, ballpoint).

---

## 8. Bicycles — hero assets

### 8.1 Construction standard

Frame tubes at real diameters (steel kid bikes: top tube 25–28 mm, down tube 28–32 mm; BMX chromoly 25–32 mm), correct geometry (CURRENT `rig.js` `BIKE` and `STYLES` define contact points — **any new bike mesh must keep these anchor points**: wheel radius, front/rear axle, bottom bracket, crank length, pedal offset, saddle, grips, steering pivot and rake). Spoked wheels with hubs, rims, valve stems, tires with tread; handlebars, stem, grips, brake levers with cables routed along the frame, calipers (or BMX U-brake/no brake per style), chain on chainring and cog, crank arms, pedals with reflectors, saddle and post, reflectors front/rear/wheel, kickstands where appropriate. Steering rotates the fork about the rake axis; wheels rotate at the speed of travel; the chain moves with cadence.

### 8.2 Canonical bikes

| ID | Owner | Style | Frame (CURRENT) | Bars | Wheel R | Extras | Story states |
|---|---|---|---|---|---|---|---|
| `bike.protagonist` | Protagonist | road-kid (CDA A-30: exact type — "road-kid" geometry with riser bars reads as a 24" hybrid/MTB-lite) | `0x5f8f93` teal-gray | Riser | 0.31 | Bell, reflector | Chain off/fixed by Sam (Aftermath I); upside down on the driveway |
| `bike.jamie` | Jamie | BMX | `0xb2553a` rust red | BMX | 0.29 | Pegs, pad | Dropped on the lawn (Prologue); down in the grass (Ch7); on its side in the gutter (Ch8/A1); at his mother's porch rail (A1) |
| `bike.sam` | Sam | MTB | `0x4d7f8f` steel teal | Flat | 0.32 | Bottle, knobby | Walked out with the protagonist's (A1) |
| `bike.alex` | Alex | Cruiser | `0x8a8f3f` olive green ("the green cruiser") | Swept | 0.31 | Rack, **bell**, rear reflector, brown saddle `0x5a3a28`, cream grips | Rear reflector broken out of its clip (Ch1 clue); found by the culvert (Ch2); evidence tag on the seat post (Ch8); back on its two garage hooks (A1) |
| `bike.meadowlark` | Annie Rowan (1958), "the old green bike" | 1950s "Meadowlark" (original brand) | Old green, rusted bell (silent) | — | — | `A.R.` cut in the frame | Under the oak (Prologue), gone (Ch2), at the pond road gate (Ch3), in Mason's window (Ch4), licence No. 0417 (Ch8). One build: `dist/old-bike.js` (keep) |

Brand marks on all bikes are original (no real manufacturers).

---

## 9. Vehicles

Cars, pickups and minivans from ~1995–2011, original designs that read as period-typical (no real badges). Required: panel gaps, glass with interior (seats, dash, steering wheel, headrests), wheels with tires and rims, lights (head, tail, indicator), mirrors, license plates (original format), wipers, door handles, underbody shadow. CURRENT `props.js` `makeCar` is one solid body with a glass block above the window line (`AFTERMATH1_VISUAL_REVIEW.md`: "the car was solid inside"). Police cruisers (`patrol-art.js`): period Crown-Victoria-like silhouette without the trademark, light bar, push bar, township livery. Emergency vehicles: fire engine, ambulance, rescue truck (`chapter6-cast.js` `rescueTruck`), utility bucket truck, excavator (A1), moving truck (A1), school bus (A1). Damage states: crushed, burned, in the hole (Summerfield), on the pole.

---

## 10. Signature object registry

One builder per object; colors and states listed are the identity. CURRENT builders verified in source.

| ID | Object | Identity | Current builder(s) | Issue | Rule |
|---|---|---|---|---|---|
| `prop.jamie-cap` | Jamie's blue cap | Blue (CURRENT worn `0x2d4a7a`), six panels, curved brim, top button, small pale front badge; worn backwards riding (STORY) | Worn: `astra-anatomy.js`; dropped in Ch7: `chapter7.js` `c7-jamies-cap` (`0x1e2f6a`); Ch8 grass: `chapter8-street.js` `c8-jamie-cap` (`0x2e4a7a`, sphere + box); A1: `aftermath1-scenes.js` `a1-jamie-cap` (`0x2d4a7a`); A1 drawings: `aftermath1-props.js` | **Four 3D builders, three blues** | One builder producing worn/held/lying variants; possession per save (`lastlight.aftermath1.cap`) |
| `prop.tommy-cap` | T. Lange's damp cap (1974) | Older, darker blue `0x1a3a7a`, period shape, name inside | `chapter7-lange.js` `lange-cap` | Must stay distinguishable from Jamie's | Separate ID, different crown/brim shape |
| `prop.alex-bell` | Alex's bicycle bell | Chrome dome bell with lever on his swept bars; rings twice | `rig.js` bike extras (`bell-lever`) | Also rendered close up in A1 (`act3/bikes-bell`) | Part of `bike.alex`; close-up LOD |
| `prop.alex-camera` | Alex's digital camera | Compact 2011 point-and-shoot (original design) | `alex-camera.js` `makeCameraModel` + `dressCamera` used by Ch4–Ch6 and A1 | Good: shared | Keep shared builder |
| `prop.sam-notebook` | Sam's notebook | Spiral notebook; the names `ALEX / JAMIE / SAM` in the protagonist's writing; Sam's aunt's number, his dad's e-mail and "RULE 6. WRITE BACK" inside the back cover; a torn-out page (Line Four) | `chapter6-props.js` `sam-notebook`; `chapter7-house.js` `sam-notebook`; `aftermath1-record.js` `a1-notebook`; pages `chapter7-props.js` `notebookPage` | Suspected separate meshes (verify identical dimensions/cover) | One builder; pages as textures with state |
| `prop.photo.*` | The photographs | Sunday at the oak (four bikes); the three at Alex's door; Jamie's wallet/school picture; Alex's school portrait; the photo-booth strip (four frames, four boys, one helmet); the group photo in Sam's room; Alex's last picture (three at the fire from the trees) | Ch7 group photo `chapter7-house.js` (render of studio models); A1 `aftermath1-props.js` canvas drawings | Two depiction methods | Render from canonical models (Character canon §7) |
| `prop.tour` | Tour de Oak Hollow materials | The poster (Sam keeps it), "Your Tour shirt" (iron-on letters) | `chapter7.js` (`lookTour`), A1 props | Verify one design | One design |
| `prop.flashlight` | The flashlight(s) | Jamie's spare (Ch1); Sam's three (Ch5) | `on-foot.js` `player-flashlight`; Ch5 `chapter5-props.js` `flashlightMesh` swaps the torch during Ch5 presentation | Torch mesh swapped per chapter | One builder; Ch5 swap retired |
| `prop.reflector` | Alex's broken rear reflector | Red reflector broken out of its clip (`REFLECTOR {r .049, color 0x8a1a14}`) | `rig.js`, `creek.js` | — | Keep |
| `prop.documents.*` | Maps and investigation documents | 1958 plan, 2009 map, Brandt's 1959 sheet, Procedure 7, Mason's slip, licence card 0417, the Couriers, the 1991 flyer, Ruth Ann's book, Reyes's notebook, the county's list | `chapter7-props.js`, `chapter8-props.js`, `chapter8-scenes.js`, `aftermath1-props.js` | Typography per era | Shared paper material, era typefaces |
| `prop.memorial.*` | Memorial objects | Candles in jars, Jamie's easel picture, notes on the step, Lily's drawing of Biscuit, Alex's portrait and print boards, flowers | `aftermath1-memorial.js`, `aftermath1-places.js` | Pictures are canvas drawings | Render-based pictures |
| `prop.sunday-print` | The Sunday print from Alex's father | A print of Sunday at the oak | `aftermath1-*` | — | Same image as `prop.photo.sunday` |
| `prop.2026.*` | Items carried into 2026 (planned) | Sam's notebook, the Sunday print, Jamie's cap **only if the save says the protagonist kept it** | — | — | Must reuse the 2011 builders, aged 15 years |

---

## 11. Underground and industrial environments

### 11.1 Eras (STORY CANON)

| Structure | Era | Character |
|---|---|---|
| Line Two | **1908 brick** | Arched brick barrel, lime mortar, efflorescence, brick spalling, iron step irons |
| Line Four, the isolation structure | **1958–1959**, with **1974** work and 1991 revisions | Cast concrete with formwork marks, steel columns, crane rail, catwalks, valves, gates, bulkheads; 1974 paint (institutional green/cream), 1974 radio; 1991 calendar |
| Ch3 storm drains, the outfall | Township storm sewer (dates per Ch3) | Concrete box culvert, headwall, wingwalls, apron, riprap |
| Mill Creek works (Ch6) | Township works | Gates (Gate 2B: rack, pawl, broken brake), switchgear room, gallery speaker, Line 4 drawdown gate (1959) |

### 11.2 Construction rules

- Coherent structure: every tunnel has a profile (circular, arched, box) built consistently; joints at real intervals (pipe sections 2.4 m; cast segments 3–6 m); supports and hangers carry pipes and cables; drains slope; water collects at low points.
- Water: standing water with reflections, flow in channels, drips from joints, wet bands at high-water lines, mineral stalactites from old leaks.
- Light: flashlight-driven; sparse working fixtures (cage lights, fluorescents) with hum and flicker; emergency lamps; darkness has shape (bounce from wet surfaces).
- Mechanical coherence: every valve has a stem and a handwheel; every gate has guides, a rack or chain, a counterweight (story: the hatch's counterweight arm is gone); cables enter boxes through glands.
- Connection to the surface: manholes (MH-12, 1959), ladders, service wells, gratings under the yards — the underground must sit under the real street plan.
- Scale: the 1958 construction gallery is "long, high"; the main chamber is vast; scale cues (a person, a door, a ladder) in every wide shot.

### 11.3 Main Street, Pine Ridge, the camp

- Main Street (Ch4): older two-story commercial buildings (brick, storefront glass, awnings, signs that light), the Lyric with marquee and blade sign, Mason Cycle & Sport, the library with microfilm, the video store, the laundromat, Depot Street alley.
- Pine Ridge Park / reservoir / Camp Whippoorwill (Ch5): pine forest, gravel lot with brown sign and yellow gate, dock, beach, closed 1991 camp cabins (Owl, Wren…), lodge, pump house, Valve Vault 3 (lid bent up from underneath). Same material library as Oak Hollow (pine materials currently separate: `pine-materials.js` — merge).

---

## 12. Geographic continuity and damage states

### 12.1 Shared sources (CURRENT SOURCE)

- `dist/catastrophe-district.js` `DAMAGE_MAP`: 15 authored lots; 13 damaged at the surface reveal, 2 more collapse with the across-street strike; October clears two condemned shells to foundations; named story homes and routes protected.
- `dist/chapter8-town.js`: the storm-line trench ≈ d 1047–1095 (a car in it; pole at 1067 down across it; water main open), 1052 leaning, 1081 porch/roof gone, Kesslers' shell, Hendersons' yard into the ground.
- `dist/chapter8-ruin.js`: Summerfield crater with a car; Kowalskis' burned frame; the pole down at their end; real triangle cuts from the merged world (`cutWorld`) and its shadow proxies.
- `dist/aftermath1-street.js`: September fence below Summerfield with an escort gate, crater fenced, ROAD CLOSED line at the trench, searchers' paint (`8/27 · OHFD · 0`), UNSAFE/RESTRICTED placards, plywood, excavator, bucket truck; October fence at Summerfield shut, crater filled with gravel and plated, Kowalskis' frame gone (cleared lot), the pole opposite the protagonist's house replaced, paint fading.

### 12.2 State definitions

| State | Buildings | Roads | Vegetation | People/vehicles | Atmosphere |
|---|---|---|---|---|---|
| `dmg.A` (Aug 21–26, 2011) | Intact | Intact | Summer | Residents, sprinklers, kids | Clear / evening haze |
| `dmg.B` (Aug 27, ~2:20–6:20 AM) | Torn-open walls, broken roof structures with exposed framing, shattered windows, fallen porches, crushed garages, fire damage, collapses | Displaced asphalt, the trench, fractures, exposed pipes and water main, fallen poles, crushed cars, collapsed Summerfield intersection | Ash, scorched, broken limbs | Residents fleeing, Reyes's car, emergency vehicles at Summerfield | Red deck, smoke, embers, dust |
| `dmg.C` (Aug 27 dawn) | As B, fires dying | As B | As B | Responders | Smoke over town, sky receding to brown |
| `dmg.D` (Sept 1–6) | As C, settled; plywood, placards, search paint | Fenced crater, ROAD CLOSED at the trench, standing water in the trench, dead wire on the ground | Dusty, some yellow | Escorts, gas crew, excavator, bucket truck | Clear late-summer, dusty |
| `dmg.E` (Oct 15) | Two shells cleared to foundations; Kowalskis' lot cleared; others still damaged | Summerfield filled and plated; fence at Summerfield shut | Orange/brown, leaves raked below Summerfield | Surveyor, Reyes's car, normal life below Summerfield | Clear autumn, low sun |
| `dmg.F` (~2021, planned) | Rebuilt or replaced on the same lots; some newer house designs (2012–2016 construction) where houses were lost; survivors repainted/re-sided; the Hendersons' and Kesslers' lots rebuilt (CDA what stands there) | Repaved, with a visible seam/patch line where the trench was; new curbs; LED streetlights possible; replaced poles | Mature street trees (10 years), new plantings on rebuilt lots noticeably younger | Normal life | Peaceful |

### 12.3 Rules

- Damage is driven by the map; never hand-place a "random" broken house.
- No house regenerates between states without a recorded reason (cleared ≠ rebuilt).
- Protected story routes and interactables (Sam's house, Jamie's porch, Alex's garage, the barricade, the oak) remain accessible as the chapters require.
- 2021 must let the player recognize where the destruction was: a newer row of houses where the trench took 1047–1095, the patch in the road, the replaced pole, younger trees, a memorial if the story approves (CDA A-32).
- Replaying an earlier chapter resets to `dmg.A` (CURRENT: damage geometry resets on replay — keep and test).

---

## 13. Environment consistency matrix (verified; implemented vs planned)

| Location | Status | Primary source | Material system | Quality notes | Consolidation |
|---|---|---|---|---|---|
| Oak Hollow Drive (Prologue–Ch2, Ch6–Ch8, A1) | Implemented | `world.js`, `houses.js`, `streets.js`, `vegetation.js`, `props.js`, `furniture.js`, `background.js` | `materials.js` `surfaceMaterial` + `art-surfaces.js` | The benchmark street; houses sound but simple trims, flat lawns, cone grass, solid cars | Phase 1 benchmark |
| Briarwood Lane / Alex's house / creek / easement | Implemented | `layout.js`, `creek.js`, `easement.js`, `alex-room.js` | `materials.js` | Alex's room "furnished but plain" (Ch3 handoff) | Phase 3 |
| Pond road / basin / woods / storm drains (Ch3) | Implemented | `woods.js`, `basin.js`, `drain.js`, `chapter3-art.js`, `chapter3-props.js` | `materials.js` + Ch3 patches | Astra Ch3 polish | Phase 3 |
| Old Mill Road / downtown / Main Street (Ch4) | Implemented | `town-plan.js`, `town-build.js`, `town-houses.js`, `town-props.js`, `town-life.js`, `presence.js` | `chapter4-surfaces.js`, `chapter4-textures.js` | Old Mill lots reuse `houses.js` architecture (good) | Phase 3, merge materials |
| Pine Ridge / reservoir / camp (Ch5) | Implemented | `pine-*.js`, `far-land.js`, `chapter5-*.js` | `pine-materials.js` (separate) | "Ultra visual" Astra pass | Phase 3, merge materials |
| Sam's home / Mill Creek works (Ch6) | Implemented | `chapter6-home.js`, `chapter6-works.js`, `chapter6-domestic.js`, `chapter6-storm.js` | `chapter6-kit.js` + `art-surfaces.js` | Rebuilt home and industrial atmosphere | Phase 3 |
| Sam's house inside / Old Mill Court / the Langes' / green-door house (Ch7) | Implemented | `chapter7-house.js`, `chapter7-court.js`, `chapter7-interiors.js`, `chapter7-rooms-art.js`, `chapter7-street-art.js`, `chapter7-finishes.js` | `chapter7-build.js` `mat` | Strong night lighting needed | Phase 4 |
| Isolation works under the court (Ch8) | Implemented | `chapter8-complex.js`, `astra-environment.js` | `art-surfaces.js` | Pipes, cables, grates added; some angles extremely dark | Phase 5 |
| Oak Hollow catastrophe (Ch8) | Implemented | `chapter8-town.js`, `chapter8-ruin.js`, `catastrophe-district.js`, `structural-cuts.js`, `chapter8-street.js` | `materials.js` | Real triangle cuts, framing, debris; authored collapses (no physics) | Phase 5 |
| School shelter (A1) | Implemented | `aftermath1-places.js`, `shelter-crowd.js` | Local | 96 instanced evacuees + story actors | Phase 6 |
| Memorial locations (A1: Jamie's lawn vigil, Alex's pictures in the gym) | Implemented | `aftermath1-memorial.js` | Local | Pictures are drawings | Phase 6 |
| Aftermath I neighborhoods (Sept/Oct) | Implemented | `aftermath1-town.js`, `aftermath1-street.js`, `aftermath1-detail.js` | `materials.js` | Persistent damage verified by `tests/recovery-state.mjs` | Phase 6 |
| Homes, garage, bedrooms, kitchen, car (A1) | Implemented | `aftermath1-places.js`, `aftermath1-leaving.js` | Local | Kitchen "lit like morning"; car interior simple; truck a box | Phase 6 |
| Aftermath II rebuilt Oak Hollow (~2021) | **Planned (not implemented)** | Must derive from `layout.js` + `dmg.F` | Shared library | — | Phase 7 |
| 2026 room | **Planned (not implemented)** | New | Shared library | — | Phase 7 |
