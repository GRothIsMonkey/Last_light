# Last Light: Graphics Architecture, as Inspected for Phase 0A

Part of the [Final Art Bible](../LAST-LIGHT-FINAL-ART-BIBLE.md) work. Inspected on `claude/final-art-phase0-blender-foundation`, from the accepted commit `274d29e08f4ba1727a135f138e4e78377605059a`. This is a description of the current code, not a proposal. The proposals are in [BLENDER-PIPELINE.md](BLENDER-PIPELINE.md) and the [Asset Production Plan](ASSET-PRODUCTION-PLAN.md).

---

## 1. Renderer, lighting, materials

| Item | What the code does (`dist/game.js` unless named) |
|---|---|
| Library | Three.js **r160**, one vendored file `dist/three.module.js`, byte-identical to npm `three@0.160.0` `build/three.module.js` (SHA-256 `76dea815…d61a495`, checked in this phase). No build step: `dist/` is served as-is, ES modules with relative imports. |
| Renderer | `WebGLRenderer({antialias:true})`, `outputColorSpace = SRGBColorSpace`, `toneMapping = ACESFilmicToneMapping`, exposure 1.16 (it drifts with time of day and chapter, 1.02–1.4), `shadowMap.type = PCFSoftShadowMap`. No post-processing (no EffectComposer); grain and vignette are CSS layers over the canvas. |
| Lights | One `HemisphereLight` (0xe8e3d3 / 0x68675d, 2.0) and one shadow-casting `DirectionalLight` "sun" (0xffd09b, 2.7, 2048² shadow map, ±60 m ortho box that follows the player). Colours and intensities are re-lerped every frame by time of day, memory, storm, cave and catastrophe states. Local lights are scene-specific: 22 `PointLight`s in 19 modules, 6 `SpotLight`s in 5 (the flashlight, police lights). |
| Environment | **No environment map anywhere** (`scene.environment`, PMREM: 0 uses). Image-based reflections do not exist, so a fully metallic PBR material shows only its direct-light highlights and is otherwise dark. Authored metal (bikes, the watch on the probe) needs an environment map before it looks right (§7, L-6). |
| Sky and fog | A `ShaderMaterial` sky dome (dusk/night/day/storm/apocalypse uniforms, procedural clouds) and `FogExp2`. Standard materials take the fog by default; an authored glTF material does too (checked). |
| Materials | `MeshStandardMaterial` throughout (411 constructions in 88 modules); no `MeshPhysicalMaterial`. Most surfaces use **vertex colours** on merged geometry plus small `onBeforeCompile` shader additions (33 in 23 modules: cloth weave, wetness, catch-light, wear). 13 custom `ShaderMaterial`s (sky, water, glows). |
| Textures | Almost none from files. `CanvasTexture` (29: signs, flyers, documents, photographs, screens) and `DataTexture` (12: noise, masks). The only image-file textures in the game are the creature's three JPEGs inside its GLB. |
| Quality settings | Low/Medium/High in the settings menu change pixel ratio, shadow map and some detail; no texture-resolution tiers yet. |

## 2. Characters

| Item | What the code does |
|---|---|
| Construction | `rig.js createPerson(spec)`: a person is **separate rigid meshes**, not a skinned mesh. Pelvis, torso, neck, head, and per side a sleeve, upper arm, forearm, hand, thigh, shin, sock and shoe, each its own `Mesh` under one `Group`. Since the art rework, the four boys' parts get continuous sculpted geometry from `astra-anatomy.js boyModel()` (loft-based heads, fitted eyes, hair silhouettes, cloth), still one rigid mesh per segment. Adults: `people.js createActor()` = `createPerson` + `adult-art.js refineAdult` / `adult-sculpt.js` heads. |
| Who is who | `cast.js CAST` (face numbers, hair, build, clothes, bike, riding style) for the boys, Jamie's mother and a generic kid; adults are specs in `people.js` and the chapter cast files (`chapter6-cast.js`, `chapter7-cast.js`, `aftermath2-actors.js` …). |
| Skeleton | **There is no bone hierarchy.** Shared segment lengths `rig.js BODY` (`hip .085, thigh .38, shin .37, ankle .065, torso .44, shoulder .155, upper .25, fore .23, neck .07, head .105, stand .80`) give a 1.53 m child; adults are the same body uniformly scaled 1.10–1.22. |
| Pose | The **pose contract**: a 35-float array (`rig.js P`): root position, yaw, lean, roll, twist, head yaw/pitch, both hand targets, both foot targets, both foot pitches, knee and elbow poles. Generators: `standPose`, `walkPose`, `sitPose`, `ridePose`, `pushPose`, `dismountKeys`, `addWave`; `blendPose` and Catmull-Rom `samplePose` blend any two poses. |
| IK | `applyPose()` solves two-bone IK (`solveIK`) for arms and legs from those targets, then **places each rigid mesh between its solved joints**. Hand orientation = forearm + a fixed curl. Joint positions are kept in `person.joints` (head, headQ, wrists, elbows, knees, ankles) for gameplay. |
| Animation | Entirely procedural. Clips are code (pose generators and keyframed pose arrays), not data. Companions (`companions.js`, `companion-brain.js`), actors (`people.js`), chapter acting modules (`chapter8-acting.js`, `aftermath1-acting.js` …) all produce pose arrays. |
| Faces | `faces.js createFace()`: brows and mouth are small meshes whose **vertices are rewritten** each change; an expression is a few numbers (`browY, tilt, knit, smile, open, wide, teeth, lids`, plus `cry, red, tremble, sob` for Chapter Eight); 30 named expressions in `EXPRESSIONS`; text-timed lip movement for captions (`speechKeys`). Blinks: lid spheres scaled (`blinkPerson`). No morph targets. |
| Attachments and contacts | By rigid part: `physical.js handFrame(person, side)` and `torsoFrame(person)` read `person.parts.lhand / rhand / torso` world transforms; held props are placed from those frames. Caps, flashlights, cameras, the bell, notebooks and photographs are attached this way or placed from `person.joints`. Riding contacts come from the pose: hands at `gripPos(steer)`, feet at `pedalPos(crank)` offsets in `ridePose`. |
| First person | The player's own body is `createPerson({firstPerson:true})`; its head and neck are on layer 1 (shadow only); the camera sits in the head. |

## 3. Bicycles

`rig.js createBike(spec)`: four bike styles (`road-kid`, `bmx`, `mtb`, `cruiser`) with their own frame geometry (`bikeGeometry`: wheel radius, bottom bracket, saddle, grip, steering pivot, rake). Each bike is a handful of **merged, vertex-coloured rigid assemblies**: frame, steering (fork, bars, grips, bell), two wheels, crank and two pedals, kickstand. `poseBike()` turns wheels, crank and steering; `pedalPos()` and `gripPos()` give the contact points the rider's pose uses. `old-bike.js` builds the 1983 bike. No textures.

## 4. Environments

Procedural throughout. `layout.js` and `town-plan.js` plan the streets and lots; `streets.js`, `terrain.js` and `route.js` sweep roads, curbs, sidewalks and ground; `houses.js`, `town-houses.js`, `furniture.js`, `props.js`, `vegetation.js` and the chapter modules build everything else from primitives, lofts and extrusions. `world.js` **merges static geometry by material and spatial cell** and gives the sun merged shadow proxies on layer 1. Repeated small things use `InstancedMesh` (12 uses in 5 modules). Each chapter builds its own places (`chapter5-*`, `pine-*`, `chapter6-*`, `chapter7-*`, `chapter8-*`, `aftermath*`) when it starts.

## 5. Asset loading before this phase

- **One** external model: the Chapter Three creature, `dist/assets/creature/creature.glb` (Bento, CC BY 4.0, [THIRD_PARTY_ASSETS.md](../THIRD_PARTY_ASSETS.md)).
- It is read by a **custom single-purpose reader**, `dist/creature-asset.js`: one skinned mesh, one primitive, one skin, one material, linear animation channels. It throws on anything else: multiple meshes or primitives, multiple materials, morph targets, step or cubic interpolation, sparse accessors and extensions are all unsupported. Its own comment says it covers "exactly what that asset uses".
- `creature.js` fetches the bytes (same-origin) or, in the offline package, reads a Blob URL the packager injects (`globalThis.__LL_CREATURE_URL__`); the packager patches that one URL expression in `creature.js` and fails if it changes.
- `chapter7-creature.js` has an adapter that can read a future hunter `.glb` through the same reader.
- **No three.js addons were vendored**: no `GLTFLoader`, `SkeletonUtils`, `DRACOLoader`, `KTX2Loader` or `MeshoptDecoder`.

## 6. The offline package (`tools/package-playtest.mjs`)

- Embeds every `dist/*.js` module as base64, makes a Blob URL for each and installs an **import map** (`last-light/<file>.js`), rewriting every `'./x.js'` string in the modules to `'last-light/x.js'`. Only **top-level** `dist/*.js` files are packaged, so subfolders of modules would not be.
- Embeds `style.css`, `fonts.css` and the creature GLB; writes `manifest.json` with SHA-256 for every packaged source file; copies `THREE-LICENSE.txt` and `THIRD_PARTY_ASSETS.md`.
- Dynamic `import('./x.js')` works through the same import map.
- Before this phase it **could not carry any other binary asset**: the creature was hard-wired.

## 7. What had to change before Blender models could replace procedural geometry

| # | Limitation | Status after Phase 0A |
|---|---|---|
| L-1 | No general glTF loader (the custom reader rejects multi-mesh, multi-material, morph targets, multiple clips) | **Removed.** r160 `GLTFLoader` vendored (`dist/three-addons-gltf-loader.js` + `three-addons-buffer-geometry-utils.js`), only its import paths changed. |
| L-2 | No way to place several copies of a skinned model without duplicating it | **Removed.** r160 `SkeletonUtils.clone` vendored; `asset-library.js` caches each file once and clones instances that share geometry, materials and textures; one skeleton per copy (the loader's per-primitive skeletons are merged). |
| L-3 | The offline package could embed only the creature | **Removed.** `PLAYTEST_MODELS=1` embeds every model under `dist/assets/` (except the creature, which is always embedded) as Blob URLs in `globalThis.__LL_ASSETS__`, hashed in the manifest. |
| L-4 | No skeleton or bone names; the pose contract drives rigid parts only | **Bridged for the probe.** `asset-pose.js drivePose()` drives a skinned skeleton named per the plan from the same 35-float pose, with the same IK and lengths (0 mm joint error measured). Scenes still talk to `person.parts`; a "person facade" for skinned characters is Phase 1 work (BLENDER-PIPELINE.md §9). |
| L-5 | Faces are vertex-rewritten meshes; no morph targets | **Bridged for the probe.** Shape keys load as morph targets; `asset-library.js faceWeights()` maps the `faces.js` expression channels onto ARKit-style shape-key names. Lip sync (`speechKeys`) to visemes is not yet mapped. |
| L-6 | No environment map: authored metal and glossy materials lack reflections | **Open.** Not changed in this phase: adding one changes the look of the whole game. Needs a decision and a lighting pass (LIGHTING-AND-COLOR-SCRIPT). |
| L-7 | No compressed textures or meshes (KTX2/Basis, meshopt); images are PNG/JPEG inside the GLB | **Open.** Fine for the probe (2.3 MB); hero characters at 2048² need KTX2 to keep the package and GPU memory in budget (Asset Plan §5.2, §6). |
| L-8 | `physical.js` hand/torso frames, `person.joints` and per-part shadow/visibility switches assume rigid parts | **Open.** Sockets exist on the new skeleton (`socket_grip_l/r`, `socket_cap` …); the facade that maps them onto `person.parts` and `person.joints` is Phase 1. |
| L-9 | The packager only packages top-level `dist/*.js` | Kept. The vendored addons are top-level files named `three-addons-*.js`. |
