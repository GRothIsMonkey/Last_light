# Last Light: Blender Character Pipeline (Handoff for Astra)

Part of the [Final Art Bible](../LAST-LIGHT-FINAL-ART-BIBLE.md). It puts the [Asset Production Plan](ASSET-PRODUCTION-PLAN.md) §3–§7 into practice and supersedes it where the two differ (§13). It was established and proven in **Phase 0A** (`claude/final-art-phase0-blender-foundation`) with an original technical test figure, `tst.pipeline-probe`. **No final character has been made with it yet.** Identities, proportions and looks come from [CHARACTER-CANON.md](CHARACTER-CANON.md) and need approval in [ART-APPROVAL-REGISTER.md](ART-APPROVAL-REGISTER.md).

What exists and what was verified is in [../PHASE0A_PIPELINE_REPORT.md](../PHASE0A_PIPELINE_REPORT.md). How the game draws people today is in [PHASE-0A-GRAPHICS-ARCHITECTURE.md](PHASE-0A-GRAPHICS-ARCHITECTURE.md).

---

## 0. The path in one picture

```
assets/source/chr/<id>/chr.<id>.<age>.blend        (Astra: sculpt, retopo, UV, bake, texture, rig, skin, shape keys, clips)
        │  blender chr.<id>.<age>.blend --background --python tools/blender/ll_export.py -- --out dist/assets/chr/chr.<id>.<age>.glb
        ▼
dist/assets/chr/chr.<id>.<age>.glb                 (glTF 2.0 binary, everything embedded)
        │  node tools/assets/validate-glb.mjs dist/assets/chr/chr.<id>.<age>.glb --profile chr.child
        ▼
dist/asset-library.js  ASSETS['chr.<id>.<age>']    (one line registers it; loaded once, instanced many times)
        │  instantiate() · play(clip) · drivePose(pose) · setExpression(face) · attach(socket, prop)
        ▼
the game (served dist/, or the offline package built with PLAYTEST_MODELS=1)
```

## 1. Tools

| Tool | Version | Notes |
|---|---|---|
| Blender | **4.2 LTS or newer** (4.4+ recommended for slotted Actions) | Verified in Phase 0A with **Blender 5.0.1** as a Python module (`pip install bpy`, headless, Linux). The full Blender application, and Blender 4.2/4.5, have not been run on this pipeline yet (§12). |
| glTF exporter | The one bundled with Blender ("Khronos glTF Blender I/O") | Verified: v5.0.21. No add-ons needed. |
| Export script | `tools/blender/ll_export.py` | The only supported export path: fixed settings plus checks that refuse a wrong scale, unapplied transforms or unapplied modifiers. |
| Validator | `tools/assets/validate-glb.mjs` | The game's own rules plus the Khronos glTF Validator (`npm i gltf-validator`, Apache-2.0, development only, never shipped). |
| Reference build | `tools/blender/build_pipeline_probe.py` | Builds the probe from nothing: a worked example of every rule below in code. Open `assets/source/tst/pipeline-probe/tst.pipeline-probe.blend` to see the result. |

## 2. Files and folders

```
assets/source/chr/<id>/                  one folder per identity (jamie, sam, alex, protagonist, …)
  chr.<id>.<age>.blend                   the working file; age = a12 (2011), a22 (2021), a27 (2026)
  textures/chr.<id>.<age>__<map>.<ext>   source textures at 2× runtime size (basecolor, normal, orm, …)
  refs/                                  approved references only (Character Canon)
  PROVENANCE.md                          who made what, when, from which references; tools; any third-party input
dist/assets/chr/chr.<id>.<age>.glb       the runtime file the game loads (the only file the game reads)
```

Inside the `.blend`:

- Scene **`EXPORT`** (make it the active scene when exporting): the export armature and the meshes that ship, nothing else. `ll_export.py` exports the active scene only.
- Scene **`REF`** (any other name): turnarounds, sculpt high-polys, bake cages, lights, cameras, control rigs. Never exported.
- Collections inside `EXPORT` are free (`body`, `head`, `hair`, `clothes`, `props`), but every mesh in `EXPORT` ships.
- Object names: `chr.<id>.<age>:<part>` (`chr.sam.a12:body`, `:head`, `:hair`, `:shirt`). The armature object is named `chr.<id>.<age>`.
- Custom properties on the **armature object** (they become glTF `extras` and the game checks them):

| Property | Example | Required |
|---|---|---|
| `ll_asset_id` | `chr.sam.a12` | yes; must match the file name |
| `ll_asset_version` | `3` | yes; integer, +1 for every exported change (§11) |
| `ll_rig` | `rig.human.child` / `rig.human.adult` | yes |
| `ll_license` | `Original work for Last Light (Roth Studios).` | yes |
| `ll_source` | `assets/source/chr/sam/chr.sam.a12.blend` | yes |

## 3. Scale and orientation

| Rule | Value |
|---|---|
| Units | Metric, **Unit Scale 1.0**, 1 Blender unit = 1 m. |
| Up | Blender **+Z**. |
| Front | The character **faces −Y**: Front view (numpad 1) looks at the face. |
| Left | The character's left side is **+X** (bones `*_l` on +X). |
| Ground | Soles on **Z = 0**; the armature's origin at the world origin, between the feet. |
| Transforms | Applied on every exported object: location 0, rotation 0, scale 1 (Ctrl+A). `ll_export.py` refuses otherwise. |
| Modifiers | Only **Armature** may remain on exported meshes. Apply mirror, subdivision etc. before adding shape keys. `ll_export.py` refuses otherwise. |

The exporter converts to glTF's +Y up and **+Z front**. The game's front is −Z, so `asset-library.js` turns every instance half a turn about Y. Do **not** pre-rotate the model in Blender to compensate. The validator checks that the face points +Z in the file and that `hand_l` is on +X.

## 4. Skeleton (`rig.human.child`, `rig.human.adult`)

### 4.1 Bone names (fixed; lower_snake_case; the validator requires them)

Body: `root, hips, spine_01, spine_02, chest, neck, head, jaw, eye_l, eye_r, clavicle_l/r, upperarm_l/r, lowerarm_l/r, hand_l/r, thigh_l/r, calf_l/r, foot_l/r, ball_l/r`.

Fingers (hero characters; the `chr.child` / `chr.adult` profiles require them): `thumb_01–03_l/r, index_01–03_l/r, middle_01–03_l/r, ring_01–03_l/r, pinky_01–03_l/r`.

Sockets: **non-deforming** bones (uncheck *Deform*) that the game attaches things to and measures contacts with. Exact names:

| Socket | Parent | Where | Used for |
|---|---|---|---|
| `socket_grip_l`, `socket_grip_r` | `hand_l/r` | centre of the closed fist, where a handlebar or flashlight would sit; points forward | handlebars, flashlight, Alex's camera, notebook, held props (`physical.js handFrame` today) |
| `socket_cap` | `head` | on the crown where a cap sits | Jamie's cap |
| `socket_head_top` | `head` | top of the skull | height checks, hats, framing |
| `socket_eye_cam` | `head` | between the eyes, on the face surface | the first-person camera (protagonist) |
| `socket_chest` | `chest` | front of the chest | the radio (Reyes), a held-to-chest prop |
| `socket_back` | `chest` | between the shoulder blades | backpack (Alex's, Sam's bag) |
| `socket_hip_l`, `socket_hip_r` | `hips` | outside of each hip | pocket and belt props |

Other bones are allowed (e.g. `phys_*` for runtime secondary motion, `twist_*` correctives). Control and mechanism bones (IK targets, poles, custom shapes) **do not belong in the export armature**: rig with them, then bake (§10.3).

### 4.2 Proportions: match the pose contract

The game poses everyone with `rig.js` (35 IK numbers; see the architecture doc §2). For the existing scenes to drive a new character unchanged, its **joint positions must match `rig.js BODY`**. Rest pose (Blender coordinates, metres; the probe uses exactly these):

| Joint | Position (X, Y, Z) | From `rig.js` |
|---|---|---|
| Pelvis (head of `hips`) = pose root | (0, 0, 0.845) | root; standing root `BODY.stand` + hip drop |
| Hip joints (heads of `thigh_l/r`) | (±0.085, 0, 0.815) | `BODY.hip`, 3 cm below the root |
| Knees (heads of `calf`) | (±0.09, ~0, 0.435) | `BODY.thigh` 0.38 |
| Ankles (heads of `foot`) | (±0.09, ~0.01, 0.065) | `BODY.shin` 0.37, `BODY.ankle` 0.065 |
| Neck base (head of `neck`) | (0, 0, 1.285) | root + `BODY.torso` 0.44 |
| Shoulders (heads of `upperarm`) | (±0.155, +0.01, 1.24) | `shoulderPos`: torso − 0.045, 1 cm back |
| Elbows | 0.25 from the shoulder | `BODY.upper` |
| Wrists (heads of `hand`) | 0.23 from the elbow | `BODY.fore` |
| Head centre | ≈ (0, −0.01, 1.43–1.44) | neck + 0.6 × `BODY.neck` + `BODY.head` |

Arms rest in an **A-pose, 40° below horizontal** (the bridge does not need any particular rest angle, but skinning and shape keys are cleaner from a relaxed A-pose). Legs straight, feet forward.

Individual heights (Character Canon §3.5: Sam 1.50, protagonist 1.52, Alex 1.54, Jamie 1.55 m) are **not yet supported by the pose contract**, which uses one `BODY` for all four. Until Phase 1 extends `asset-pose.js` to read each skeleton's own limb lengths (it already measures them, `bindPose().lens`), make all four boys on these joint positions and vary build, head and silhouette, not limb length. Adults (`rig.human.adult`, same names): the game currently scales the child body by 1.10–1.22. Model adults at their true size with the same names; the adult `BODY` table is Phase 1 work.

### 4.3 Skinning

- At most **4 influences** per vertex (the exporter keeps the 4 largest; more is a validator error). Weights normalized.
- Bone roll: any consistent roll. The pose bridge measures each bone's rest direction and bend side itself, so it does not depend on roll.
- No scale keys and no non-uniform bone scale in clips (squash and stretch breaks the IK bridge).
- One armature and one skin per character. Everything that moves with the body (eyes, teeth, tongue, hair, clothes, watch) is skinned to it: rigid pieces at weight 1.0 on one bone.

## 5. Mesh, topology and budgets

| Asset | LOD0 triangles | Materials | Textures (runtime) |
|---|---|---|---|
| Hero boy, 2011 (body + head + hair + clothes) | **35–45k** | ≤ 5 (skin, eyes, hair, cloth, shoes) | 2048² head, 2048² body atlas, 1024² hair |
| First-person hands and arms | 12k | 2 | 2048² |
| Hero adult (incl. a22/a27 boys) | 30–40k | ≤ 5 | as above |
| Secondary human | 15k | ≤ 4 | 1024² shared atlases |

(Asset Plan §9; aspirational until measured on hardware: Phase 0A measured software rendering only.) LOD1/LOD2 are Phase 1 decisions (separate files `…​.lod1.glb` or meshes named `:lod1`).

Topology for deformation: quads on everything that bends; three edge loops across elbows, knees, wrists, fingers and the waist; shoulder and hip loops that follow the muscle; concentric loops around the eyes and mouth (shape keys need them); no n-gons anywhere that deforms. Triangulation happens at export. Keep separate mesh objects few: each object × material is a draw call (the probe: 12 primitives = 12 draw calls per copy).

UVs: non-overlapping in the 0–1 square for baked maps; consistent texel density (bible §5.2); one UV map per mesh (`UVMap`). A second UV set only if a material needs it.

## 6. Materials and textures

Use the **Principled BSDF only**, wired as the glTF exporter recognizes. Anything procedural (Noise, Musgrave, ramps) does not export: bake it into images.

| Map | Blender wiring | Colour space | Format in the GLB |
|---|---|---|---|
| Base colour | Image Texture → Base Color | sRGB | JPEG (q 90) or PNG |
| Normal | Image Texture (Non-Color) → Normal Map node (Tangent Space) → Normal; the node's Strength becomes `normalTexture.scale` | Non-Color | **PNG** (JPEG blocks show in the lighting; the validator warns) |
| ORM | one Image Texture (Non-Color) → Separate Color: **G → Roughness, B → Metallic** (R = AO) | Non-Color | PNG |
| Occlusion | the R of the same ORM image through a glTF Material Output (Settings) group, if used | Non-Color | (same image) |
| Alpha (hair cards, lashes) | Base Color alpha → Alpha; blend mode **Alpha Clip** (exports `alphaMode MASK`) | — | PNG |

The **source image format is kept** (`export_image_format AUTO`): save colour maps as `.jpg` and normal/ORM maps as `.png` in `textures/`. Normal maps are **OpenGL (+Y up)**, Blender's own convention. Power-of-two sizes only; author at 2× and downsample. Material names follow `mat.<family>/<asset>[.<part>]` (`mat.skin/chr.sam.a12`, `mat.fabric.cotton/chr.sam.a12.shirt`).

Known render-side limits (they are not authoring errors; see the report): the game has **no environment map**, so metal and very glossy surfaces look darker than in Blender's viewport (L-6). Skin has no subsurface scattering in `MeshStandardMaterial`, so judge skin in the game, not in Eevee/Cycles.

## 7. Faces: shape keys

Shape keys on the **head mesh only** (morph targets cost per vertex; keep the body free of them). Basis = neutral face, mouth closed, eyes open. Names are ARKit-style, case-sensitive; `Left`/`Right` are the **character's** left/right.

### 7.1 Required set (hero faces; the `chr.child` validator profile checks it)

`jawOpen, mouthClose, mouthSmileLeft/Right, mouthFrownLeft/Right, mouthStretchLeft/Right, mouthPressLeft/Right, mouthPucker, mouthFunnel, browInnerUp, browDownLeft/Right, eyeBlinkLeft/Right, eyeSquintLeft/Right, cheekSquintLeft/Right, noseSneerLeft/Right`.

Recommended in addition (Asset Plan §4.3): `browOuterUpLeft/Right, mouthUpperUpLeft/Right, mouthLowerDownLeft/Right, mouthLeft, mouthRight, cheekPuff`, and visemes `viseme_aa, viseme_E, viseme_I, viseme_O, viseme_U, viseme_PP, viseme_FF, viseme_TH, viseme_kk, viseme_SS` for lip sync.

### 7.2 How the story's faces drive them

Every `face:'…'` line in the story uses `faces.js EXPRESSIONS` (smile, open, wide, tilt, knit, browY, lids …). `asset-library.js faceWeights()` maps those channels to shape keys, so existing scenes keep working:

| `faces.js` channel | Shape keys |
|---|---|
| `smile` > 0 / < 0 | `mouthSmileLeft/Right` / `mouthFrownLeft/Right` |
| `open` | `jawOpen` |
| `wide` > 1 / < 1 | `mouthStretchLeft/Right` / `mouthPucker` |
| `tilt`, `browY` | `browInnerUp` |
| `knit` | `browDownLeft/Right` |
| `lids` | `eyeBlinkLeft/Right` |
| `cry, red, tremble, sob` (Chapter Eight) | not yet mapped: tear strips and wet/red material weights (Asset Plan §4.3), Phase 1 |

The mapping is a starting point, tuned in Phase 1 against the approved faces. A misnamed key **throws** (`setMorph`); it never silently does nothing.

### 7.3 Jaw, eyes, lids

- Large jaw motion (screams, sobbing, acting clips): the `jaw` bone. Speech and expression: the `jawOpen` key, authored with the jaw bone at rest.
- Gaze: `eye_l`/`eye_r` bones (eyeballs skinned 1.0 to them). Eyelids follow with `eyeBlink*`/`eyeSquint*` keys.
- A shape-key Action and a bone Action with the **same name** become **one clip** in the game (the probe's `talk`): on Blender 4.4+ use one Action with a slot for the armature and a slot for the head's shape keys, each pushed to an NLA track (see `build_pipeline_probe.py`).

## 8. Hair and clothing

- **Hair:** sculpted shell plus alpha-clipped cards for the silhouette edge; skinned to `head` (and `neck` for long hair). Keep cards in one material; MASK alpha only (no BLEND: sorting artefacts). Jamie's cap: either modelled into the head mesh as a capped variant (`chr.jamie.a12` with a `:hair_capped` and `:hair_uncapped` mesh, one visible at a time) or as a separate prop on `socket_cap` (`prop.jamie-cap.glb`), which the story already handles as an object it can take off, hold and give away. Recommended: the prop, so the cap scenes (Chapter Eight, Aftermath I/II) keep working.
- **Clothing:** separate meshes on the same armature (`:shirt`, `:shorts`, `:shoes`), with the body faces hidden under them **deleted** to prevent poke-through. Folds in the normal map; silhouette folds in the mesh. A per-outfit merge into one mesh is allowed once an outfit is approved (fewer draw calls).
- **Conditions** (wet, mud, dust, soot, blood: chapters 3–8) are material layers driven at runtime, not separate textures per state: leave a mask channel or a second UV-free approach for Phase 1; don't paint dirt into the base colour of the clean outfit.
- The procedural shirt cloth of Chapter Six (`chapter6-cloth.js`) stays procedural until a skinned replacement is approved.

## 9. Bringing a character into the game

1. Export: `blender assets/source/chr/sam/chr.sam.a12.blend --background --python tools/blender/ll_export.py -- --out dist/assets/chr/chr.sam.a12.glb`.
2. Validate: `GLTF_VALIDATOR_DIR=<folder with node_modules/gltf-validator> node tools/assets/validate-glb.mjs dist/assets/chr/chr.sam.a12.glb --profile chr.child --json docs/qa/assets/chr.sam.a12.json`. Zero errors. The expected warning is `NODE_SKINNED_MESH_NON_ROOT` (Blender parents meshes under the armature node, whose transform is identity; harmless).
3. Register one line in `dist/asset-library.js` `ASSETS`: `'chr.sam.a12':{file:'assets/chr/chr.sam.a12.glb',rig:'rig.human.child',kind:'character'}`.
4. Look at it in the **Pipeline Lab** (add it to `pipeline-lab.js` beside the probe, or load it in the browser console with `instantiate('chr.sam.a12')`), and in the running game with `?pipeline`.
5. Package for review: `PLAYTEST_MENU=1 PLAYTEST_MODELS=1 node tools/package-playtest.mjs <folder>` (embeds every model under `dist/assets/`; the default package does not, and says so if asked to load one).
6. Run `node tests/pipeline-browser.mjs` (software rendering) and record the approval (ART-APPROVAL-REGISTER) before any story scene uses the asset.

Not built yet (Phase 1): the **person facade** that lets scenes swap a procedural person for an authored one without changing scene code. It must provide `person.group`, `person.pose`, `person.joints` (head, headQ, wrists, elbows, knees, ankles: `asset-pose.js` already solves them), `person.parts.lhand/rhand/torso/head` frames for `physical.js` (from the sockets and bones), visibility and shadow switches, blinking and the `faces.js` API, and a per-character feature flag so the procedural model stays available until the authored one is approved.

## 10. Animation

### 10.1 Two ways a character moves, both proven on the probe

| Way | For | How |
|---|---|---|
| **Authored clips** (Blender Actions) | idles, walks and runs, gestures, acting moments, facial performance | `inst.play('walk_normal')` (three.js `AnimationMixer`, cross-fades) |
| **The pose contract** (`rig.js`, 35 IK numbers) | everything coupled to gameplay: riding (hands on the grips, feet on the pedals), pushing the bike, sitting, reaching for props, looking at things, every existing scene | `drivePose(inst, pose)` in `asset-pose.js`; same IK and lengths as the procedural people; measured 0–0.4 mm from `rig.js`'s own joint solution |

They layer: play a clip, then `drivePose` overrides the limbs that gameplay owns; bones it doesn't drive (jaw, eyes, fingers, shape keys) keep the clip.

### 10.2 Clip rules

- **30 fps**, authored **in place** (no root motion; the game moves the character). Loops: the last frame equals the first.
- Names `<family>_<variant>` in lower case (`walk_normal`, `ride_stand`, `cry_contained`); the families are in the bible §7.1.
- Shared bone names make clips **retargetable by name** between the four boys and between `a12` and adult variants of the same rig family.
- Facial clips: same name as the body clip they belong to (§7.3), or face-only clips named `face_<variant>`.

### 10.3 Control rigs

Rig with any controls you like (Rigify, custom IK), but export only the deform armature plus sockets. Before export, bake each Action onto the export armature (Pose ▸ Animation ▸ Bake Action, *Visual Keying*, *Clear Constraints*, on a copy), or keep the control rig in the `REF` scene constraining the `EXPORT` armature and bake there. `export_force_sampling` samples every frame.

## 11. Versioning

- The **file name never changes** (`chr.sam.a12.glb`); `ll_asset_version` goes up by one for every exported change. The game reads the version (it is shown in the lab and the `?pipeline` label).
- Commit the `.blend`, its `textures/`, the exported `.glb` and the validator JSON together, with in-game captures at the QA cameras ([VISUAL-QA-ACCEPTANCE.md](VISUAL-QA-ACCEPTANCE.md)).
- Approved identities are changed only through a new version and a new approval (Asset Plan §10). Chapters always use the approved version.
- Large sources: hero `.blend` files with sculpt data will be large; whether to use Git LFS is still open (CDA **A-39**). The probe's `.blend` is about 0.5 MB (plus 1.6 MB of source textures) and is committed directly.
- Determinism: the same `.blend` exports the same JSON, vertices, textures and animation every time; the order of triangle indices in some primitives can differ between runs (the exporter's triangulation), so compare validator reports, not file hashes.

## 12. What Phase 0A verified, and what it didn't

Verified (details in the report): the Blender 5.0.1 exporter → GLB with skin, 35 bones including 9 sockets, 6 shape keys, 9 PBR materials with 10 images, 4 clips including a merged bone and shape-key clip; Khronos validator 0 errors; r160 `GLTFLoader` in Chromium; clips, shape keys, the `faces.js` mapping, sockets, the pose contract on a procedural bike; 12 copies sharing one set of GPU data; the real game's Prologue scene; the offline package with the browser offline.

**Not verified:** the Blender application GUI; Blender 4.2/4.5 (the script has 4.2-compatible branches, untested); a real GPU (all rendering was ANGLE SwiftShader, software); a final-quality character's cost (45k triangles, 2048² textures, 50+ shape keys); KTX2/meshopt compression; LODs; the person facade; an environment map.

## 13. Corrections to the Asset Production Plan

| Plan | This pipeline | Why |
|---|---|---|
| §3.10 "export … −Z forward (game convention)" | Export **glTF-standard +Z front** (model facing Blender −Y); the game turns it | Blender's glTF exporter has no forward-axis option; pre-rotating models in Blender breaks every other glTF tool. One fixed half-turn in the loader is simpler and is checked by the validator. |
| §5.2 "continue with … the current custom reader (extended carefully)" | r160 `GLTFLoader` is vendored and used for all new assets; the creature keeps its custom reader | The custom reader cannot read multi-mesh, multi-material, morph-target or multi-clip files. The creature is not touched in this phase. |
| §4.3 shape-key names (descriptive) | ARKit-style identifiers (§7) | Exact identifiers are needed for code; ARKit names are the common convention in face tools. |

## 14. Bicycles (Phase 1 benchmark)

The four boys' bikes use this pipeline without a skeleton: `tools/blender/bikes/` builds them from `anchors.json` (dumped from `dist/rig.js` by `node tools/assets/bike-anchors.mjs`) with one shared kit and texture library; `ll_export.py` exports them; `validate-glb.mjs --profile bike` checks per-LOD budgets, the moving parts (`extras.ll_node` = frame, steer, wheel_front, wheel_rear, crank, pedal_l, pedal_r, kickstand, bell_lever, chain; `extras.ll_lod` 0–2), the anchor record (`extras.ll_anchors`), orientation and ground contact. Each part is modelled in place in the bike's rest pose (wheel 0, crank 0 = right arm up, steer 0, kickstand stowed), with identity transforms; the game hangs it under the matching rig.js group (`dist/bike-assets.js`). Files: `assets/source/bike/<id>/bike.<id>.blend`, `textures/`, `PROVENANCE.md`; runtime `dist/assets/bike/bike.<id>.glb`. Report: [../BIKES_PHASE1_REPORT.md](../BIKES_PHASE1_REPORT.md).

Lessons that apply to every asset: the game renders single-sided, so **face winding must point outward** (Cycles renders both sides and hides inverted faces; check in the browser, or with a signed-volume test as the kit now does); triangulate n-gons before export (MikkTSpace tangents fail on them); keep imported references out of the shipped scene and out of the saved file (packed images double the repository).

## 15. Houses (Prologue architecture benchmark)

The twelve Prologue houses use this pipeline without a skeleton: `tools/blender/houses/` builds them from the game's own lot plans (`plans.json`, dumped from `dist/houses.js planLots` by `node tools/assets/house-plans.mjs` for the lots listed in `dist/house-lots.js`) with one modular kit and one texture library, `ll_export.py` exports them (`export_vertex_color='ACTIVE'`, no tangents, no animation), and `validate-glb.mjs --profile house` checks per-house, per-LOD budgets, the lot records and the orientation. Conventions: [HOUSE-KIT.md](HOUSE-KIT.md); results: [../HOUSES_PHASE1_REPORT.md](../HOUSES_PHASE1_REPORT.md).

Differences from the character/bike conventions, on purpose:

| | Houses |
|---|---|
| Frame | The game's house-local lot frame (`houses.js`: x across the facade, +z toward the street). The house faces Blender −Y as every asset does; the glTF file is then in house-local coordinates, and the game places it with the plan (`P.toWorld`, `P.worldRot`), with **no** half turn. |
| Colour | Shared tiling textures are near-neutral; each house's palette colours ride on `COLOR_0` (divided by the texture's mean), so one material set serves every house. |
| Tangents | Not exported: tiling families use world-metre planar UVs, never mirrored; three.js derives the tangent frame per pixel. (The Khronos validator reports `MESH_PRIMITIVE_GENERATED_TANGENT_SPACE` warnings; zero errors.) |
| Draping | The game re-heights every vertex onto the terrain under the house at load (as world.js drapes a procedural house). Foundations reach 0.7 m below grade. |
| Lessons | Coplanar overlapping trim pieces render black in Cycles and z-fight in the game: butt them or step them. Re-fetch a mesh's attribute layers after adding another (Blender reallocates them; a stale UV layer handle crashed the build). Glass is alpha-blended (glTF BLEND), not transmission (no transmission pass in the game). |

Realism pass (`house.prologue` version 2): before export, `house_bake.py` tessellates each house and bakes occlusion,
upkeep weathering and macro colour variation into COLOR_0 (HOUSE-KIT.md §8), so the game shows the contact shading
Cycles computes and the game's renderer cannot. A frozen earlier version of an asset can ship beside the current one
for comparison: register it under its own id with `assetId` set to the id inside the file (`asset-library.js`).


## 16. Vegetation (Prologue vegetation benchmark)

The old oak, the street trees, the shrubs and the ground plants use this pipeline without a skeleton: `tools/blender/vegetation/`
builds them on one kit (`veg_mesh.py`: skeleton → bark tubes + leaf cards) with one texture library (`veg_textures.py`, one
late-August grade for every leaf) and exports with `veg_blender.export` (the `ll_export.py` path: COLOR_0 and the `_WIND`
custom attribute, WebP images, no tangents); `glb_pack.py` then packs NORMAL/COLOR_0/_WIND into bytes (KHR_mesh_quantization);
`validate-glb.mjs --profile veg` checks per-variant LOD budgets and the vertex standard. Results:
[../VEGETATION_BENCHMARK_REPORT.md](../VEGETATION_BENCHMARK_REPORT.md); sources: [../THIRD_PARTY_ASSETS.md](../THIRD_PARTY_ASSETS.md).

| | Vegetation |
|---|---|
| Frame | Tree-local, base of the trunk at the origin, Blender Z up; the game places each instance on a recorded procedural placement (vegetation.js / houses.js records, `world.vegRecord`). The old oak is built in the lookout's own frame (Blender X = +lat, Y = +d; `tools/assets/oak-site.mjs` dumps the ground, swing pivot, carving and story marks from the game) and placed with rotation −heading. |
| Files | One GLB per family: `lm.old-oak.glb` (one variant), `veg.street-trees.glb` (44), `veg.shrubs.glb` (18), `veg.ground.glb` (13); a node per variant (`extras.ll_variant`, species, height, crown) with `:lod0/:lod1/:lod2` meshes (`extras.ll_lod`). |
| Vertex data | COLOR_0 = baked occlusion (× species bark tint); `_WIND` = (flex 0..1, phase 0..1, leaf flutter 0..1, bark: −moss / +dead wood; leaves: hue jitter). The runtime shader (`dist/vegetation-assets.js`) reads only these, so wind and shading match in every LOD. |
| Materials | Bark (shared grey broadleaf bark tinted per species; birch; the oak's own plated white-oak bark), leaves (alpha-tested twig cards from one atlas per family, double-sided, crown-shaped normals), ground (one atlas). No alpha blending. |
| Rebuild | `node tools/assets/oak-site.mjs`; `python tools/blender/vegetation/oak_skeleton.py`; `python tools/blender/vegetation/veg_textures.py`; `oak_build.py`, `street_build.py`, `shrub_build.py`, `ground_build.py` (bpy 5.0.1); `python tools/blender/vegetation/glb_pack.py dist/assets/veg/*.glb`; renders `oak_render.py`, `street_render.py`, `shrub_render.py`, `scene_renders.py street grass`. |
| Lessons | **Cut-out textures need colour under their transparent pixels**: Pillow resizes RGBA premultiplied and Blender's WebP writer keeps what it is given, so colour under alpha 0 came back black — the AR carving showed as a black square in the game and shrub leaves had dark fringes once filtered and mip-mapped (the Cycles renders hid it: hard alpha clip, no mips). `runtime_texture` now pads after resizing and `glb_pack.py` re-encodes every cut-out image from its padded PNG (WebP q90, lossless alpha, `exact=True`); and a bark material must keep a MASK decal's cut-out. **Bark tubes must be wound outward** (the game draws bark single-sided; Cycles shades both sides and hides inward winding — the first build showed every trunk's inside wall in the game; caught by a ray test against the swing limb; now a signed-volume check). glTF UVs are v-down: flip them when building Blender meshes from glTF data. A Blender `copy()` of a hidden source object is hidden too. Normals packed to 4-byte-aligned int8 arrive in three.js as interleaved attributes: de-interleave before `mergeGeometries`. |
