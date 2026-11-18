# Last Light: Phase 1, the Four Boys' Bicycles (visual benchmark)

Branch `claude/prologue-four-bikes-visual-benchmark`, from the accepted Phase 0A foundation `0fbb3ecb70669a04bcf6adbb5bc11fed5403797d`. Not merged into `main`. **Awaiting creative-director approval (ART-APPROVAL-REGISTER A-49, A-50).** Nothing in the story uses these bikes: they appear only with `?bikes` in the game and in the Bike Lab, and the production swap waits for approval.

**Evidence and its limits (VISUAL-QA-ACCEPTANCE §1).** This report contains Blender renders (rank 6: offline Cycles, not the game), in-game captures from the shipped renderer under **software WebGL** (rank 3: Chromium + ANGLE SwiftShader, **not a GPU**), labelled review-camera captures (rank 4) and automated checks (rank 5). **No real-GPU measurement and no human review has happened yet** (ranks 1–2). Those are the next step, and any performance number below is a software-renderer number.

<!-- §1 onward: written from the measured results -->

## 1. What was built

| | Jamie — `bike.jamie` | Sam — `bike.sam` | Alex — `bike.alex` | The protagonist — `bike.player` |
|---|---|---|---|---|
| Type | Youth BMX, 22-inch wheels | Youth mountain bike, 24-inch | Youth cruiser, 24-inch | Youth hybrid, 24-inch (rig.js `road-kid`; A-30's recommendation) |
| Frame | Rust red `0xb2553a`; compact BMX frame with head-tube gussets, chromoly-size tubes | Steel teal `0x4d7f8f`; sloping oversized alloy-style frame | Olive green `0x8a8f3f`; cantilever frame (curved top tube, stays sweeping into the down tube), brass head badge | Teal-gray `0x5f8f93`; diamond frame, slightly sloping top tube |
| Fork, steering | Straight BMX fork; top-load stem*; 2-piece chrome BMX bars with crossbar and blue pad (the rig.js pad colour); flanged grips | Suspension fork (silver stanchions, black lowers, arch); riser stem; flat bar; twist shifters | Curved painted fork; chrome quill stem; swept chrome bars; cream grips; chrome dome **bell** | Curved rigid fork; riser stem; black riser bar; two-finger levers; thumb shifter; **bell**; white front reflector |
| Drive | 3-piece cranks; 36-tooth guard sprocket*; 16-tooth driver | Triple 42/32/22 with plastic guard; 7-speed cassette; front and rear derailleurs | One-piece chrome crank; 36-tooth ring; coaster hub (brake arm on the chainstay); chain guard | 36-tooth ring with plastic guard; 7-speed cassette; rear derailleur |
| Brakes | Rear U-brake* with lever* and cable | V-brakes front and rear | Coaster brake (no levers or cables: a clean cruiser cockpit) | V-brakes front and rear |
| Wheels | ISO 457 black double-wall rims, 36 spokes 3-cross, street tread | ISO 507 silver double-wall, 36 spokes, knobby tread (modelled blocks) | ISO 507 chrome single-wall, 36 spokes, cream-wall balloon tyres | ISO 507 silver rims with machined brake tracks, 36 spokes, semi-slick tyres, amber spoke reflectors |
| Extras | Four pegs, top-tube and bar pads, pivotal seat*, platform pedals* | Water bottle and cage, quick-release seat collar | Rear rack, the red rear reflector (rig.js `REFLECTOR`: radius 4.9 cm, `0x8a1a14`, on its taped bracket), sprung brown saddle | Seatpost red reflector, resin pedals with amber reflectors |
| Wear (one shared model) | The most: scuffed pegs and bar ends, the left side scuffed from being dropped on the lawn, grip ends worn, a touch of chain rust | Light, maintained | Light | Moderate, everyday |

\* geometry from the supplied Sketchfab model (§3).

All four keep a kickstand at rig.js's pivot. The game parks every bike on one (companions, chapters), so even the BMX has a rear-mount youth kickstand, as kids' BMX bikes of 2011 commonly did.

## 2. How (one art team, not four marketplaces)

Everything is built by one set of scripts in `tools/blender/bikes/` on Blender 5.0.1 (the `bpy` module, headless) and exported through the Phase 0A path (`tools/blender/ll_export.py`).

- **The game's anchors are the source of truth.** `node tools/assets/bike-anchors.mjs` reads `dist/rig.js` and `dist/cast.js` and writes `anchors.json`: wheel radius, axles, bottom bracket, crank length, pedal offset, saddle, grips, steering pivot and rake, the bell and its lever pivot, the kickstand pivot, and the rear-reflector size. The designs are written against those numbers in the game's own bike frame and converted to Blender's axes at the end (BLENDER-PIPELINE.md §3).
- **One kit** (`bike_kit.py`, `bike_parts.py`) for every bike: tubes with real diameters and TIG-weld beads where they meet, filleted bends, lathed rims/tyres/hubs/grips/bells, plates with chamfers, spoke sets laced 3-cross, chains wrapped round the real sprockets and derailleur pulleys, lofted saddles. Real component sizes throughout (½-inch chain pitch, ISO rim diameters, 22.2 mm bars, 3/8-inch axles).
- **One texture library** (`bike_textures.py`) for every bike. The builder packs each material's UV islands into a 2048² atlas at one texel density, bakes utility maps from the bike's own geometry with Cycles (position, normal, part id, metric pattern UVs, 5 cm occlusion, edges), and synthesizes base colour, ORM and tangent-space normal maps from one finish library (painted steel, chrome, alloy, anodized and black-painted parts, zinc, rubber, vinyl, plastic, reflector prisms) and one wear model (edge chips, contact scuffs, dust settling on top and low, cavity grime). Each bike only sets its colours, decals and how much wear it shows. Runtime textures are 1024², downsampled from the 2048² authoring size.
- **Three materials per bike** (painted frame, bare hardware, soft parts), nine textures, all `MeshStandardMaterial` in the game.
- **Moving parts are separate**, exactly as rig.js animates them: frame, steer, front and rear wheel, crank, both pedals, kickstand, bell lever (Alex, protagonist), chain. Each in three LODs.
- **Brands are invented** (REDTAIL, NORTHLINE, Cloverdale, EASTWIND; tyres DURALINE), lettered with DejaVu fonts. No real manufacturer appears anywhere.

## 3. The Sketchfab BMX

"Bmx Bike" by Mitchell (https://skfb.ly/oUoKB), **CC BY 4.0** (checked on the model page: "CC Attribution", downloadable, no further terms in the description). Full record: `docs/THIRD_PARTY_ASSETS.md`. The original is kept byte for byte (`assets/source/bike/third-party/sketchfab-bmx-bike-mitchell/bmx_bike.glb`, SHA-256 `11f3c4b6…c950`).

Inspected first: 118,300 triangles, two double-sided materials with six 2048² textures, units of about 1.7 mm. It is a modern freestyle BMX, well modelled for a game but **six times the hero-bike budget** (each wheel 22.5k triangles, the chain 21k, bolt heads 11.9k), **proportioned for a 20-inch adult BMX** that cannot sit on Jamie's anchors (its wheelbase-to-wheel-radius ratio is 3.88; Jamie's rig.js bike is 3.31), and **its textures carry real brand marks**.

So it was used where it helps and nowhere else. Seven BMX-specific components (the guard sprocket, platform pedals, pivotal seat, top-load stem, brake lever assembly and U-brake arms) were converted to metres, decimated (for example the stem 6,604 → 960 triangles), given new UVs, **re-textured by our own library** (none of its textures is used), and fitted to Jamie's anchors (the stem re-angled from the source's 20.5° head angle to the game's 16.4°). Measuring the harvested sprocket gave 36 teeth, so Jamie's chain and 16-tooth driver were built to match it. Everything else on Jamie's bike — frame, fork, bars, grips, cranks, pegs, pads, wheels, tyres, chain — comes from the same kit as the other three bikes, so that his BMX does not look like it came from a different source than his friends' bikes.

<!-- §4 onward appended from the measured results -->
