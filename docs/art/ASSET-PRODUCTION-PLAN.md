# Last Light — Asset Production and Licensing Plan

Part of the [Final Art Bible](../LAST-LIGHT-FINAL-ART-BIBLE.md). Source audit base: `c646a862b272c987b0a0b9aea690ddfc859ddda7`.

This plan says how future assets are made, named, budgeted, licensed, loaded and packaged. It does not authorize any asset import by itself: each import still needs the checks in §8 and, for identities, creative-director approval.

---

## 1. Current state (CURRENT SOURCE)

- Runtime: Three.js r160 vendored as one file (`dist/three.module.js`); **no examples/addons are vendored** (no `GLTFLoader`, `KTX2Loader`, `DRACOLoader`, `MeshoptDecoder`, `EffectComposer`).
- Geometry: procedural, built at runtime in 144 modules (every `dist/*.js` except `three.module.js`); merged and baked by material and cell (`world.js`).
- Textures: vertex colors + procedural shader detail + canvas-drawn text/sign textures. No authored texture sets except the creature's.
- One external model: `dist/assets/creature/creature.glb` (Bento, CC BY 4.0), read by a small custom reader `dist/creature-asset.js` that supports **one skinned mesh with one skin** and its clips; the original is kept byte-for-byte at `assets/source/creature/`; a repack script (`tools/creature/repack_glb.py`) made the runtime copy.
- Offline package: `tools/package-playtest.mjs` embeds every `dist/*.js` module as base64 into one HTML file (Blob URLs for imports), embeds the creature GLB, writes `manifest.json` with SHA-256 for every packaged file, and copies `THREE-LICENSE.txt` and `THIRD_PARTY_ASSETS.md`.
- `dist/` is 7.7 MB; the repository also carries the 12.9 MB original creature GLB.

---

## 2. Strategy by asset category

| Category | Strategy | Authoring | Runtime form | Procedural role kept |
|---|---|---|---|---|
| Hero humans (protagonist, Jamie, Sam, Alex; Reyes; the parents; Brandt; Mrs. Lange) | Authored skinned meshes on a shared skeleton family | Sculpt → retopo → UV → bake → texture → skin → face shapes | glTF 2.0 binary, one file per identity (+ variant attachments) | Pose/IK from the existing pose contract; variant assembly |
| Secondary humans (Hendersons, Lily, Pruitt, Davis, officers, crews, neighbors, Main Street) | Shared base bodies (child, adult F, adult M, elder F/M) + head variants + wardrobe sets | As above at lower budget | glTF; shared textures/atlases | Assembly, color variation |
| Crowd (shelter, vigil, memorial, street) | Shared skinned crowd bases with GPU-instanced or batched animation; LOD heads with simple faces | Derived from secondary bases | glTF + instancing | Placement, pose selection |
| Creatures | Authored per species (hunter, smiling creature, made-thing base); hero sculpt for the Presence | Sculpt → retopo → rig | glTF with semantic sockets | Locomotion IK, procedural secondary motion, Presence limb splines |
| Story houses (Jamie's, Sam's, Alex's, the Hendersons', the Langes', the Kesslers', 1052, 1081, the protagonist's) | Authored modular kit assembled by `layout.js` / `houses.js` plans, plus authored interiors where entered | Kit pieces (walls, corners, windows, doors, trims, porches, roofs, garages) | glTF kit + instancing; baked into world cells | Placement, lot planning, damage-state swaps |
| Background houses | Same kit at LOD1/LOD2; far ring as impostors (billboard atlas with depth) | Kit LODs, impostor bake | Instanced / impostors | Placement |
| Vegetation | Authored species kits (trunk + branch meshes + leaf-card clusters) with seeded variants; the oak authored as a unique hero | Modeling + card textures | glTF, instanced | Placement, seasonal tint, wind |
| Roads, curbs, sidewalks, terrain, channels | Keep procedural sweeps (`streets.js`, `terrain.js`, `route.js`) | — | Procedural + shared materials + decals | All |
| Bikes | Authored hero models matching `rig.js` anchor points | Hard-surface modeling | glTF; frame, fork/bars, wheels, crank as separate nodes | Steering, wheel/crank rotation, chain |
| Vehicles | Authored period-generic models with interior LOD | Hard-surface | glTF | Placement, damage swaps |
| Props (hero: cap, bell, camera, notebook, photographs, flashlight, documents) | Authored, one builder each | Modeling + texture | glTF | States (held, lying, worn) |
| Props (background clutter) | Authored kit pieces, shared atlases | Modeling | Instanced | Placement |
| Industrial / underground | Modular kits per era (1908 brick, 1958 concrete, 1974 fittings) | Modeling | glTF kit | Assembly by `chapter8-complex.js`, `drain.js`, `chapter6-works.js` plans |
| Destruction | Pre-fractured authored pieces per damage type; damage-state meshes from `DAMAGE_MAP` | Modeling + fracture | glTF | State machine, authored collapse animation |
| Text, signs, documents, flyers | Canvas textures (keep) with era typefaces (licensed fonts only; §8) | Code | Canvas | All |
| Sky, clouds, fog | Shader (keep, extend) | Code | Shader | All |

Rule: **adding more procedural primitives does not make a high-quality asset.** Procedural code remains for placement, assembly, state and motion; authored meshes provide form.

---

## 3. Modeling workflow (PROPOSED)

1. **Brief** — the asset's canonical ID, registry entry, references (approved), budget (§4), sockets/anchors it must keep, states/variants.
2. **Blockout** in the game: a grey box at true scale placed in the real scene at the real gameplay camera; screenshot; approve scale and silhouette.
3. **High-detail sculpt / model** (Blender recommended: free, scriptable, glTF exporter maintained; any tool that exports clean glTF 2.0 is acceptable).
4. **Retopology** to the budget; clean edge flow at joints and the face for deformation.
5. **UVs**: non-overlapping for baked maps; consistent texel density (bible §5.2); UV2 for lightmaps/detail if needed.
6. **Bake** normal, AO, cavity, curvature from the high mesh.
7. **Texture** using the shared material families (§5 of the bible); export base color (sRGB), normal (OpenGL +Y), ORM (R AO, G roughness, B metal).
8. **Rig / skin** to the shared skeleton (§4.2); weight paint; face shapes.
9. **Animate** in-place clips per the clip list; authored speeds recorded.
10. **Export** glTF 2.0 binary (`.glb`), metres, +Y up, −Z forward (game convention), applied transforms, no unused nodes; names per §7.
11. **Validate** with the Khronos glTF Validator (zero errors), triangle/bone/texture budgets (script), naming, socket presence.
12. **In-game review** at gameplay cameras (QA doc), both before/after, labeled.
13. **Approval** recorded in the registry and `ART-APPROVAL-REGISTER.md`.

Source files (`.blend`, sculpt files, PSD/KRA/texture projects) are kept under `assets/source/<category>/<id>/` with a `PROVENANCE.md` per asset. Large binary sources: decide whether to use Git LFS or an external archive (CDA **A-39**; LFS changes the repository workflow for every session).

---

## 4. Shared character system

### 4.1 Pose contract (keep)

All scenes drive people through `rig.js`: a 35-float pose (`P` layout: root, yaw, lean, roll, twist, head yaw/pitch, hand targets, foot targets, foot pitch, knee and elbow poles), `applyPose`, IK. Socket names used by scenes and `physical.js` (hands, head, feet, torso frame) must survive. The new skinned characters are **driven by** the pose contract (IK targets → skeleton), so no scene has to be rewritten to adopt them.

### 4.2 Skeletons (PROPOSED)

| Rig ID | For | Bones (target) | Notes |
|---|---|---|---|
| `rig.human.child` | The four boys, Lily, crowd children | ≈ 65 body + face | Limb lengths = current `BODY` unless a re-tune is approved and contact tests are updated |
| `rig.human.adult` | All adults | ≈ 65 body + face | Adult proportions (≈ 7.5 heads); its own `BODY` table; same bone names |
| `rig.human.crowd` | Instanced crowd | ≈ 24 | Subset of the above names |

Bone set (names fixed; the exporter maps tool names to these): `root, hips, spine_01, spine_02, chest, neck, head, jaw, eye_l, eye_r, clavicle_l/r, upperarm_l/r, lowerarm_l/r, hand_l/r, thumb_01–03_l/r, index_01–03_l/r, middle_01–03_l/r, ring_01–03_l/r, pinky_01–03_l/r, thigh_l/r, calf_l/r, foot_l/r, ball_l/r`, plus sockets (non-deforming): `socket_grip_l/r, socket_head_top, socket_cap, socket_chest, socket_back, socket_hip_l/r, socket_eye_cam`.

### 4.3 Faces

Hero faces: morph targets (blend shapes), ≈ 32–40 shapes (brow inner up L/R, brow down L/R, brow outer up L/R, lids close L/R, lids squint L/R, cheek raise L/R, nose wrinkle L/R, mouth corner up/down/stretch L/R, mouth open, jaw open, lips funnel/pucker/press, upper lip raise L/R, lower lip depress L/R, mouth left/right, tear-line wet weight (material), plus visemes A/E/O/M-B-P/F-V/L/W-Q) mapped from the existing `faces.js` expression channels (`browY, tilt, knit, smile, open, wide, teeth, lids`) so every existing `face:'…'` line in the story keeps working. Eyes are bones (`eye_l/r`) for gaze. Tears: thin mesh strips + wet/red material weights, not overlays.

Secondary faces: ≈ 12 shapes. Crowd: none (texture swaps for eyes open/closed).

### 4.4 Wardrobe and conditions

Clothing modeled as separate skinned meshes on the same skeleton (with hidden-body-under-clothing masks to prevent poke-through), or merged per approved outfit to save draw calls. Conditions are material layers (wet, mud, dust, soot, blood) driven by masks, plus attachments (bandage, cast).

### 4.5 Animation library

Clips in place, 30 fps authored, retargetable between `rig.human.child` and `rig.human.adult` by bone names. Families: bible §7.1. Per-character style is a parameter set (cadence, sway, stand, weave, look, reaction — the existing `CAST.ride` fields are the start), not separate clips.

---

## 5. Texture pipeline and runtime loading

### 5.1 Authoring

Author at 2× the runtime size; downsample with sharpening off; keep sources. Color in sRGB, data maps linear. Channel packing per glTF ORM. Shared trim sheets for houses (one 2048² sheet for fascia, trims, sills, casings, door panels; one for brick/siding/shingle tiling sets).

### 5.2 Compression and loaders (requires Phase 0 verification and license records)

| Need | Proposed | License to record | Offline-package impact |
|---|---|---|---|
| Full glTF (multiple meshes, materials, morph targets, skins) | Vendor `GLTFLoader.js` from three.js **r160** `examples/jsm` (same version as the runtime) | MIT (three.js) | +~100 KB JS |
| Mesh compression | Vendor `meshopt_decoder` (`MeshoptDecoder`) | MIT | +~20 KB JS (wasm embedded in JS) |
| Texture compression | Vendor `KTX2Loader` + Basis Universal transcoder (`basis_transcoder.js` + `.wasm`) | three.js MIT; Basis Universal Apache-2.0 | +~600 KB; wasm must be embedded as base64 and instantiated from bytes |
| Draco (alternative to meshopt) | Not recommended (larger decoder) | Apache-2.0 | — |
| Post-processing | `EffectComposer`, `RenderPass`, `UnrealBloomPass`, `OutputPass` from r160 examples, or a single custom post pass | MIT | Small |

Until these are vendored and proven in the offline package, continue with uncompressed glTF + JPEG/PNG and the current custom reader (extended carefully).

### 5.3 Runtime

- Texture memory is computed per profile (bible §20.2) from the actual loaded set; a debug overlay reports it (PROPOSED).
- Mipmaps for everything; anisotropy per profile.
- Lazy loading by chapter zone with a persistent core set (the four boys, bikes, the oak, the street kit) always resident.

---

## 6. Offline package constraints

The self-contained HTML playtest must keep working without a server:

- Every asset is embedded (base64 inflates size by ~33%). PROPOSED total package target: **≤ 150 MB** for the full game on Medium textures; stretch goal ≤ 100 MB. A "High textures" package may be offered separately (CDA **A-40**).
- Decoders (wasm) embedded and instantiated from bytes (no fetch of separate files).
- The manifest continues to hash every embedded file, including assets.
- Assets are embedded in compressed form (KTX2/meshopt) to limit size; the browser's memory peak during decode must be measured on Low-tier hardware.
- The hosted (served) build and the offline build must load identical bytes.
- `THIRD_PARTY_ASSETS.md` and every license text required by an embedded third-party asset or decoder ship inside the package (the packager already copies `THREE-LICENSE.txt` and `THIRD_PARTY_ASSETS.md`; extend it to copy each new license file).

---

## 7. Naming conventions

| Thing | Pattern | Example |
|---|---|---|
| Asset file | `<domain>.<id>[.<age>][.<variant>].glb` | `chr.sam.a12.glb`, `bike.alex.glb`, `cre.hunter.glb`, `lm.old-oak.glb`, `kit.house.colonial.glb` |
| Texture | `<asset>__<map>.<ext>` | `chr.sam.a12__basecolor.ktx2`, `__normal`, `__orm` |
| Mesh node | `<asset>:<part>` | `chr.jamie.a12:cap`, `bike.jamie:fork` |
| Material | `<mat family>/<asset>` | `mat.fabric.cotton/chr.jamie.a12.shirt` |
| Clip | `<family>_<variant>` | `walk_normal`, `ride_stand`, `cry_contained`, `hunter_stalk` |
| Runtime folder | `dist/assets/<domain>/` | `dist/assets/chr/`, `dist/assets/cre/` |
| Source folder | `assets/source/<domain>/<id>/` | `assets/source/chr/sam/` |

---

## 8. Licensing, provenance and third-party approval

### 8.1 Allowed sources (in order of preference)

1. Original assets created for Last Light (by the team or commissioned with a written assignment/license that permits use, modification and redistribution in the game and its packages).
2. CC0 / public-domain assets from reputable sources with a clear license page.
3. CC BY 4.0 assets with full attribution recorded (author, title, source URL, license URL, modifications, non-endorsement note).
4. Other licenses only with creative-director approval after license review (no NC "non-commercial", no ND "no derivatives", no ShareAlike unless the team accepts its terms for the asset; no "editorial use only"; no licenses that forbid redistribution in source form, since the offline package and repository redistribute the files).

Never: ripped game assets (NO SHELTER or any other game), store assets whose license forbids redistribution of the raw file in an open repository, textures photographed from copyrighted artwork, brand logos/trademarks, scans of real identifiable people without a release, fonts without a license that allows embedding.

### 8.2 Import checklist (every third-party file, before the commit that adds it)

- [ ] Source URL, title, author, author URL recorded.
- [ ] License name and URL recorded; license permits modification and redistribution in an open repository and a downloadable package.
- [ ] License text included in the package if the license requires it.
- [ ] Original file stored byte-for-byte under `assets/source/…` with its SHA-256; original metadata (e.g. glTF `asset.extras`) intact.
- [ ] Runtime copy SHA-256 recorded; every modification listed (as `THIRD_PARTY_ASSETS.md` does for the creature).
- [ ] Non-endorsement note for CC BY.
- [ ] Inspected: polygon count, materials, textures, embedded scripts/extensions, no hidden content.
- [ ] No real brands, people or trademarked designs in the asset.
- [ ] Entry added to `docs/THIRD_PARTY_ASSETS.md` in the same commit.
- [ ] Creative-director approval if the asset defines a canonical identity (a character, creature or landmark).

### 8.3 Existing record

`docs/THIRD_PARTY_ASSETS.md` (the Bento creature, CC BY 4.0) is preserved verbatim. If the creature is replaced (CDA A-27), its record stays, with a dated note that later builds no longer embed it.

### 8.4 AI-generated assets

Allowed only with creative-director approval per asset class (policy: CDA A-46); must not imitate any real person, existing character, game, or artist's distinctive style; the generator's terms must allow commercial use and redistribution; provenance (tool, date, prompt summary, human edits) recorded in `PROVENANCE.md`. Generated images are never accepted as evidence of implemented quality (QA §1).

---

## 9. Asset budgets (PROPOSED; verify in Phase 0/1 on hardware)

| Asset | LOD0 tris | LOD1 | LOD2 / impostor | Bones | Materials | Textures (Medium) |
|---|---|---|---|---|---|---|
| Hero boy (body + head + hair + clothes) | 35–45k | 15k | 5k | ≈ 65 + face shapes | ≤ 5 (skin, eyes, hair, cloth, shoes) | 2048² head, 2048² body atlas, 1024² hair |
| First-person hands/arms | 12k | — | — | shared | 2 | 2048² |
| Hero adult | 30–40k | 12k | 4k | ≈ 65 | ≤ 5 | as boys |
| Secondary human | 15k | 6k | 2k | ≈ 65 | ≤ 4 | 1024² shared atlases |
| Crowd human | 4–6k | 1.5k | impostor | ≈ 24 | 1 (atlas) | 1024² atlas for all |
| Bike (hero) | 15–20k | 5k | 1k | — | ≤ 4 | 1024² + shared metal/rubber |
| Car | 12–20k | 4k | 800 | — | ≤ 4 | 1024² |
| Story house exterior (kit assembled) | 20–35k | 8k | 2k / impostor | — | trim sheet + tiling sets | shared 2048² |
| Background house | 6–10k | 2k | impostor | — | shared | shared |
| Street tree (species variant) | 8–15k (cards) | 3k | impostor | — | 2 (bark, leaves) | 1024² bark, 1024² leaf atlas |
| The old oak | 40–60k | 15k | 4k | — | 3 | 2048² bark, 2048² leaves |
| Hero prop | 1–4k | 500 | — | — | 1–2 | 512–1024² |
| Hunter | ≤ 30k | 8k | 2k | ≤ 60 | 3 | 2048² |
| Smiling creature | ≤ 25k | 8k | 2k | ≤ 55 | 2 | 2048² |
| Presence (skyline) | ≤ 150k | 40k | far impostor > 1.5 km | ≤ 40 + procedural | 2–3 | 4096² + 2048² |

Per-scene totals must fit the profile budgets in bible §20.2.

---

## 10. Asset review and versioning

- Every asset has a registry entry with `version`, `status`, `approvedBy`, `approvedDate`, `references[]`, `sources[]`, `budgetMeasured {tris, bones, texMB}`.
- Changing an approved identity creates a new version and requires approval; chapters always resolve the approved version.
- Every asset PR/commit includes: in-game captures at the defined cameras, budget report, validator output, license checklist (if third-party).
