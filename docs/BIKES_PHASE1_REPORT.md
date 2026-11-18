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

## 4. One decision for the creative director: the front-fork offset (A-50)

rig.js's front axles all sit **behind** the steering axis: Jamie's by 39 mm, Sam's 12, Alex's 35, the protagonist's 12. A real fork puts the axle ahead of the steering axis (the fork offset, 25–50 mm on bikes like these). Building forks to rig.js's numbers would mean legs raked backwards, which no bicycle has, and which reads as wrong in exactly the side views the Prologue is full of.

So the authored bikes keep every rig.js anchor **except the front axle**, which sits a real offset ahead of the axis (Jamie 30 mm, Sam 40, Alex 45, the protagonist 40). Pivot, rake, grips, saddle, bottom bracket, rear axle, crank length and pedal offset are exactly rig.js's (measured: 0 mm; §6). The wheelbases grow 5–8 cm. `G.front` is used by nothing but the placement of the front wheel (checked: no gameplay, collision or riding code reads it), so in the benchmark `bike-assets.js` moves the front-wheel group to the authored axle while a bike is upgraded and back on `restore()`. Trail comes out at 44–54 mm, normal for these bikes.

**Recommendation:** keep the authored axle and, at the production swap, change `front` in `rig.js STYLES` (one number per style) so procedural and authored agree.

## 5. In the game

| Piece | What it does |
|---|---|
| `dist/bike-assets.js` | Upgrades one of the game's own rig.js bikes **in place**: each authored part (in the GLB's rest pose) is hung under the group rig.js already animates (`frame`, `steer`, `frontWheel`, `rearWheel`, `crank`, `pedals[i]`, `kickPivot`, `bell.lever`), with a wrapper holding the inverse of that group's rest transform. So `poseBike()`, `ridePose()`, the companions, the first-person body and the bell keep driving it with no change to any of them. The procedural meshes are only hidden; `restore()` puts the bike back. It checks the GLB's recorded anchors against rig.js and refuses (loudly) if any differs by more than 2 mm. LOD by camera distance (0–14 m, 14–36 m, beyond; with hysteresis). |
| `dist/bike-benchmark.js` + a 3-line guarded hook in `dist/game.js` | `?bikes` upgrades the protagonist's bike and Jamie's, Sam's and Alex's under their riders, in the running Prologue. **B** switches authored ↔ procedural in the same frame (an honest before/after), **N** forces a LOD, **J** turns the bikes' reflections off. A DEV label says what loaded; on failure it says so and the procedural bikes stay (nothing is substituted). Without `?bikes` nothing is imported. |
| Reflections (A-47) | The game has no environment map, so authored metal looks dark there. The benchmark gives **the bike materials only** a small prefiltered golden-hour sky (PMREM), its intensity following the scene's hemisphere light as the Prologue darkens. Nothing else in the game changes. Off with **J** for comparison. |
| `dist/bike-lab.html` | The Bike Lab: the game's renderer settings and Prologue light values; lineup, the four authored bikes beside their rig.js bikes, riders on the authored bikes under the real `ridePose`, the protagonist's first-person eye, forced LODs; contact measurements on screen. |
| `dist/asset-library.js` | Four entries registered (`bike.*`). |
| `tools/package-playtest.mjs` | With `PLAYTEST_MODELS=1` the offline package embeds the bikes (it already embedded everything in `dist/assets/`) and now also writes `Last-Light-Bike-Lab.html`. |
| `tools/assets/validate-glb.mjs` | A `bike` profile: per-LOD budgets, the moving parts, the anchor record, front toward glTF +Z, tyres on the ground, wheel radius = rig.js's. |
| `tools/blender/ll_export.py` | The export guard now checks the objects of the scene that ships (the REF scene may hold untouched references). |

Not changed: the story, the route, the characters and their animation, the riding and camera code, the menu, Chapter Eight, audio, saves.

## 6. Measured

### 6.1 The files (`node tools/assets/validate-glb.mjs <glb> --profile bike`; reports in `docs/qa/bikes-phase1/validate-bike.*.json`)

| | LOD0 | LOD1 | LOD2 | Materials | Textures | GLB | Of which textures | GPU textures (est., RGBA8 + mips) |
|---|---|---|---|---|---|---|---|---|
| `bike.jamie` | 18,920 | 5,238 | 1,244 | 3 | 9 × 1024² | 7,170,512 B | 5.1 MB | 48 MB |
| `bike.sam` | 23,178 | 6,418 | 1,942 | 3 | 9 × 1024² | 7,812,648 B | 5.1 MB | 48 MB |
| `bike.alex` | 20,484 | 5,942 | 1,916 | 3 | 9 × 1024² | 6,940,636 B | 4.7 MB | 48 MB |
| `bike.player` | 22,078 | 6,524 | 2,100 | 3 | 9 × 1024² | 7,539,324 B | 5.0 MB | 48 MB |

All four: **0 errors**; Khronos glTF Validator 2.0.0-dev.3.10: **0 errors, 0 warnings**. Front toward glTF +Z, tyres on y = 0, wheel radius equal to rig.js's.

**Against the targets** (LOD0 15–20k, LOD1 ~5k, LOD2 ~1k): Jamie is inside them at LOD0. Alex is 2 % over at LOD0. Sam (+16 %) and the protagonist (+10 %) are over on purpose: Sam's knobby tread is modelled blocks (the tread is his bike's silhouette) plus a triple crankset and a suspension fork; the protagonist's cockpit is what the first-person camera looks at most (levers, shifter, bell, cables, reflector). LOD1 is 5.2–6.5k and LOD2 1.2–2.1k: the far levels keep the frame, wheels and bars as real geometry rather than cards, so they sit above the ~1k figure. All three levels can be pushed down further if real-GPU numbers ask for it.

**Texel density** at runtime (1024²): frame paint ≈ 1,300–1,500 px/m, hardware ≈ 850–950 px/m, tyres and soft parts ≈ 1,000–1,100 px/m (bible §5.2: bikes 512–1,024 px/m; first-person bars 1,024–2,048).

**Colour** (frame texels measured against the canonical rig.js colours, sRGB): Jamie 175,85,59 vs `b2553a` 178,85,58; Sam 77,125,140 vs `4d7f8f` 77,127,143; Alex 137,141,62 vs `8a8f3f` 138,143,63; the protagonist 95,142,145 vs `5f8f93` 95,143,147.

### 6.2 In the browser (`node tests/bike-browser.mjs` → **29 passed, 0 failed**; software WebGL)

| Check | Result |
|---|---|
| Anchors vs rig.js (BB, saddle, grips, pivot, rake, rear axle, wheel radius, crank, pedal offset) | **0 mm** on all four; front axle moved 70 mm (Jamie) / 53 / 82 / 53 mm (A-50) |
| Wheels turn about their axles | wheel-centre drift < 0.01 mm while turning |
| Pedals on rig.js's pedal points at every crank angle | < 0.01 mm (Jamie, Sam, Alex); 5 mm (the protagonist's resin pedals, whose reflectors make them slightly asymmetric) |
| Steering turns the bars about the raked axis | the grip surface stays on rig.js's grip point (0.9–1.7 cm from it = the grips' own radius) at 0, +0.3, −0.35 rad |
| Kickstands | deployed foot 0.2 cm into / 0.4 cm above the ground (rig.js's 0.30 m leg sank 1.6 cm on Jamie's low BMX pivot: his leg is 1.7 cm shorter) |
| Bell | the striker swings with game.js's lever animation (5.4 mm); the dome sits 0.8–0.9 cm from rig.js's bell point, where the first-person hand reaches; Space rings it in the game (lever to −0.4 rad) |
| Materials | `MeshStandardMaterial`, sRGB base colour, linear normal and ORM, one ORM image for occlusion/roughness/metal, single-sided, fog on |
| LOD | the lineup of four: LOD0 84,664 triangles, LOD1 24,126, LOD2 7,206 (75 / 75 / 69 draw calls) |
| In the Prologue | `?bikes` upgrades all four (loaded in 1.6 s, software); 6 s of pedalling moves the player 21.5 m with the friends riding the authored bikes (Alex 6.6 m away LOD0, Jamie 13.3 m LOD0, Sam 15.5 m LOD1); after B (procedural) and back the ride continues; no errors; no request leaves the local server; without `?bikes` none of the new files is fetched |
| Cost, same frame | authored 204 draw calls / 472,633 triangles vs procedural 196 / 448,075 (+8 calls, +24.6k triangles for four bikes, LOD as the camera sees them) |
| Load | read 48–80 ms and parse (with image decode) 128–158 ms per bike, served; Bike Lab ready in 1.4 s |
| Offline package | `PLAYTEST_MENU=1 PLAYTEST_MODELS=1` package 55.0 MB (game) / 54.8 MB (Bike Lab page); both load the four bikes from the embedded bytes with the browser offline and make no network request. The default package (12.6 MB; +37 KB of new modules, inert without `?bikes`) says FAILED and keeps the procedural bikes |

### 6.3 Riders on the bikes (the game's current procedural boys, rig.js `ridePose`; Bike Lab, 3 s of riding)

| | Measured | Reading |
|---|---|---|
| Hands to grip surface | −1.4 to −1.6 cm | the hands close round the grips (correct for a grip) |
| Nearest shoe surface to the pedal top | 5.5 to 6.3 cm | from `ridePose` (ankle 6.2 cm above and 5 cm behind the pedal point), **independent of the bike**: the same on rig.js's bikes |
| Pelvis to saddle top | −2.3 (Sam) to −4.9 cm (Jamie) | the procedural pelvis capsule reaches 9 cm below the saddle anchor, so it sinks into any saddle (more into rig.js's, whose top is ~3 cm higher) |

The bikes put grips, pedals and saddle exactly on rig.js's anchors, so these offsets belong to the rider's pose, not to the bikes. They were left alone (no animation was rewritten to hide anything). They need re-tuning together with Astra's characters (A-48: socket-driven hands, re-tuned ankle offset, sit-bone height).

## 7. Art review

**Do the four look like one team's work?** Yes. In the lineups and the side-by-side views the same tube language, weld beads, wheel construction (36 spokes, nipples, rims with brake tracks), chain, hardware finishes and wear model run through all four, and the textures sit at the same density. Jamie's BMX, which carries the harvested parts, does not stand out from the other three: the harvested pieces were re-textured by the same library.

**Are the silhouettes distinct?** Clearly, at gameplay distance: Jamie's tall BMX bars, pad and pegs; Sam's suspension fork, bottle and knobby tread; Alex's cantilever stays, swept bars, rack and cream walls; the protagonist's riser bar, rigid fork and slim tyres. Sam's and the protagonist's frame colours are close (both canonical blue-greens), so they are told apart by silhouette rather than colour.

**Scale.** The bikes are built on the game's anchors, so they fit the game's 1.53 m riders exactly: grips, saddle and pedals are where the boys already put their hands, seat and feet. Real kids' sizes otherwise: 22- and 24-inch wheels, 22.2 mm bars, kids' saddles and cranks.

**Materials.** Under the Prologue's light the painted frames read as gloss enamel with a little orange peel; chrome and alloy read as metal only with an environment to reflect, so the benchmark gives the bike materials a small golden-hour sky (A-47; **J** compares). Without it the chrome is dark, as the Phase 0A report predicted for any authored metal. Tyres read as matte rubber with tread and lettering; grips and saddles as rubber and vinyl. Wear is restrained: Jamie's bike shows scuffed pegs and bar ends, a dropped-on-the-left side, worn grips and a touch of chain rust; Sam's and Alex's are clean and kept; the protagonist's is in between.

**First person.** The protagonist's cockpit is the most-seen object in the game. From the real eye: black riser bar and stem, the chrome bell under the left thumb, two-finger levers, the thumb shifter, cables routed to the frame, the white reflector on its bracket below. It holds up at that distance; textures are 1024², so very close inspection (the screen filled by the bell) is where a 2048² hardware atlas for this bike alone would help.

**Against the current world.** In the same frames, the bikes are now the most finished objects in the Prologue: the houses are flat-coloured procedural boxes with drawn windows, the trees are low-poly clumps, and the boys are procedural figures. **That gap is the environment's and the characters' to close** (the bible's Prologue benchmark: houses with depth and interiors, species trees, the four boys at final quality). The bikes were not lowered to meet it.

**Known compromises.**
- Alex's bell stands 2.5 cm above his low swept bar on a short post, because rig.js's bell point (where the first-person hand reaches) is above the bar there.
- The chain guard on Alex's cruiser is a flat plate; the chain is static (it does not run round the sprockets yet).
- The cream-wall tyres on Alex's cruiser are period-correct for a 2011 kids' cruiser but are the most "old-fashioned" element; they are one texture band to remove if they read too vintage.
- Sam's and the protagonist's LOD0 budgets are over the target (§6.1).

## 8. Images

All in `docs/qa/bikes-phase1/`. Blender renders are Cycles with the ACES 1.3 view (the game's tone curve) and are **offline renders, not the game**; game captures are **software WebGL**.

| What | Files |
|---|---|
| Each bike, six views (front ¾, rear ¾, side, two close mechanical details, golden hour on its stand) | `blender/bike.<id>--front34.jpg`, `--rear34.jpg`, `--side.jpg`, `--detail-*.jpg`, `--golden-hour.jpg` (24 images) |
| The four together at one scale | `blender/lineup--four-bikes-side-profile-common-scale.jpg`, `blender/lineup--four-bikes-golden-hour.jpg` |
| The Sketchfab original (its own textures, untouched), same light and cameras as Jamie's | `blender/source--sketchfab-bmx-original--front34.jpg`, `--side.jpg` (compare with `blender/bike.jamie--front34.jpg`, `--side.jpg`) |
| Procedural (rig.js) vs authored, **same frame, same camera** in the running Prologue | `browser/game-prologue-review-{jamie,sam,alex}-{authored,procedural-same-frame}.jpg`, `browser/game-prologue-first-person*-{authored,procedural-same-frame}.jpg` |
| The real first-person camera | `browser/game-prologue-first-person-authored.jpg`, `browser/game-prologue-first-person-looking-down-authored.jpg` |
| The group in the Prologue (review camera, LODs in play) | `browser/game-prologue-group-review-camera-authored.jpg` |
| Bike Lab (game renderer settings) | `browser/lab-lineup*.jpg` (incl. forced LOD0/1/2), `browser/lab-compare*.jpg` (procedural beside authored), `browser/lab-riders.jpg`, `browser/lab-fp.jpg` |
| Offline packages | `browser/package-offline-bike-lab.jpg`, `browser/package-offline-game-prologue-bikes.jpg`, `browser/package-default-bikes-fail-loudly.jpg` |

## 9. How to see it

- **In the game (served):** `python3 -m http.server 8000 --directory dist`, open `http://localhost:8000/?bikes`, start the ride. **B** authored ↔ procedural, **N** LOD, **J** reflections.
- **Bike Lab (served):** `http://localhost:8000/bike-lab.html` (drag to orbit; buttons for the views; `?only=jamie` for one bike).
- **Offline:** `PLAYTEST_MENU=1 PLAYTEST_MODELS=1 node tools/package-playtest.mjs <folder>`, then open `Last-Light-Playtest.html?bikes` or `Last-Light-Bike-Lab.html`. The approved Prologue is unchanged without `?bikes`.
- **Rebuild a bike:** `python tools/blender/bikes/build_bike.py -- --bike bike.sam` (bpy 5.0.1 module, Python 3.11; ~6 min each). Gallery: `python tools/blender/bikes/render_gallery.py`.
- **Tests:** `node tests/bike-browser.mjs` (29 checks), `GLTF_VALIDATOR_DIR=<dir with gltf-validator> node tools/assets/validate-glb.mjs dist/assets/bike/bike.jamie.glb --profile bike`.

## 10. Regression

| Suite | Result |
|---|---|
| `QUICK=1 DEV_KNOWN=2/alex-bike node tests/verify.mjs` | **818 passed, exit 0** — identical to the accepted baseline (818), same known `2/alex-bike` DEV difference (`docs/qa/bikes-phase1/regression-verify-quick.json`) |
| `node tests/pipeline-browser.mjs` (Phase 0A: lab, game, offline packages) | **36 passed, 0 failed** — identical to Phase 0A (36) (`docs/qa/bikes-phase1/regression-pipeline-browser.json`) |
| `node tests/bike-browser.mjs` | 29 passed, 0 failed |

<!-- §10.1 -->

## 11. Not verified, and what comes next

- **No real GPU.** Every frame and timing here is software rendering. FPS, GPU memory and frame time with the four bikes need a run on the Phase 0 reference hardware (A-45). Texture memory is estimated (≈ 48 MB per bike uncompressed; KTX2, L-7, would cut it several times).
- **No human review yet.** The approval (A-49) needs the creative director in the game with `?bikes`.
- **Astra's characters are not in these images.** The riders are the game's current procedural boys. No visual match to Astra's Jamie is claimed; the final character-and-bicycle review comes when her models are approved.
- **Not done:** a running chain (static now); the story-state variants (Alex's broken reflector and evidence tag, Jamie's bike on its side, the chain-off bike in Aftermath I); the production swap across chapters (waits for A-49 and A-50); the 1958 Meadowlark.
- **Blender:** built with Blender 5.0.1 as a headless module; the files open in the Blender application (EXPORT and REF scenes), which was not itself run here.

