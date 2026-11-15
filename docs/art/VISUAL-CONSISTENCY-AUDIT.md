# Last Light — Visual Consistency Audit

Part of the [Final Art Bible](../LAST-LIGHT-FINAL-ART-BIBLE.md).

| | |
|---|---|
| Audited commit | `c646a862b272c987b0a0b9aea690ddfc859ddda7` (`codex/astra-chapter8-aftermath1-visual-recovery`, head on 2026-11-15) |
| Method | Static reading of `dist/*.js` (no build step; the shipped modules are the source), the docs listed in §11, and existing QA summaries. **No game was run and no new captures were made for this audit**; nothing here is a visual judgement of GPU output. |
| Evidence grades | **VERIFIED** — read directly in the code at the cited location. **SUSPECTED** — inferred from code structure or docs; must be confirmed in Phase 0 by running the game. |

---

## 1. Summary of findings

| # | Finding | Grade | Severity |
|---|---|---|---|
| F-01 | The four boys share one art system (`astra-anatomy.js` boyModel + `faces.js`) in every chapter; chapter modules skip them | VERIFIED | Positive |
| F-02 | Adults change face/hair/body geometry by chapter through stacked overlays (`refineAdult` → `chapter6Appearance` → `portrait` → `adultFace`) | VERIFIED | High |
| F-03 | Jamie's mother has two different identities (Prologue `CAST.mom` vs Ch7+ `JAMIE_MOM`) | VERIFIED | High |
| F-04 | Sam's mother and Jamie's mother (Ch7+) are derived from Alex's mother's spec; Sam's mother has her exact face | VERIFIED | High |
| F-05 | Adults are the child skeleton scaled ×1.10–1.22 (child head-to-body ratio) | VERIFIED | High |
| F-06 | Female adult head shape is selected by `name.includes('MOM')`; Mrs. Henderson, Mrs. Pruitt, volunteers, etc. get the male head rings | VERIFIED | Medium |
| F-07 | Lily Henderson is the hoop kid's (boy's) spec through `createActor`, so she has an adult sculpted head on a child body | VERIFIED | Medium |
| F-08 | The Hendersons, Lily and runners are created twice (`chapter8-fall.js` and `chapter8-street.js`) with a copy-pasted `ADULT()` helper | VERIFIED | Medium |
| F-09 | The Ch6 doubles (other Sam, Jamie on the stairs, Line Two Alex) use the older Chapter Six head/hair/body model, not the canonical boys | VERIFIED | High (CDA A-14) |
| F-10 | Jamie's cap is built by four separate 3D builders in three blues, plus a 2D drawing | VERIFIED | High |
| F-11 | Canon says Jamie turns his cap backwards when he rides; the model is always brim-forward | VERIFIED | High (CDA A-07) |
| F-12 | Jamie's uncapped hair is auto-generated `'cropped'`, never designed | VERIFIED | Medium |
| F-13 | Photographs of the boys: Ch7 renders 3D studio models; Aftermath I draws 2D canvas figures | VERIFIED | High |
| F-14 | The made things are hunters recolored pale with a pasted torus grin | VERIFIED | High (CDA A-28) |
| F-15 | The smiling creature (Danny) is a third-party CC BY model; identity of a central character is not original | VERIFIED | Decision (CDA A-27) |
| F-16 | At least seven material systems plus 29 ad-hoc `onBeforeCompile` shader patches in 23 modules | VERIFIED | High |
| F-17 | One renderer, one tone mapper, one sky shader, one shared world bake across chapters | VERIFIED | Positive |
| F-18 | No post-processing at all; per-chapter lighting authored as code in `game.js` | VERIFIED | Medium |
| F-19 | The oak is one landmark instance; its tire-swing limb is a separate cylinder | VERIFIED | Low |
| F-20 | The hunter has one generator for Ch7 and Ch8; the Presence has one organism builder for underground and skyline | VERIFIED | Positive |
| F-21 | Chapter Five swaps the player's flashlight mesh during its presentation | VERIFIED | Low |
| F-22 | Hardware GPU frame rate and in-browser WebGL gameplay have never been verified | VERIFIED (per reports) | High |
| F-23 | Whether Chapter Six/Seven adult overlays remain enabled after a natural Ch7 → Ch8 transition | SUSPECTED | Medium |
| F-24 | Sam's notebook has several separate meshes that may differ | SUSPECTED | Low |
| F-25 | Several close-up rough spots (seated arms, kitchen lighting, car, truck, underground darkness) documented by earlier reviews | VERIFIED (docs) | Medium |

---

## 2. Characters

### 2.1 Where characters are created (VERIFIED)

| Module | Creates | Builder |
|---|---|---|
| `dist/cast.js` | Data: `jamie`, `sam`, `alex`, `player`, `mom` (Jamie's mother in the Prologue), `kid` (hoop kid); `FORMATION` | — |
| `dist/rig.js` | `createPerson`: primitive head (`headGeometry`: sphere skull, sphere eyes, box brows/mouth, hair blobs), capsule limbs, rounded-box hands and shoes, capsule torso; replaced by boyModel when `isBoy` | Shared |
| `dist/astra-anatomy.js` | `boyModel` (head loft, fitted hair locks, cap, cloth loft, limb lofts, finger tubes), `isBoy = name ∈ {JAMIE, SAM, ALEX, YOU}` | Boys only |
| `dist/faces.js` | `createFace`: expressions, mouth, brows, lids, grief; "rich" face always on for boys (`modern`) | Boys + any `expressive` spec |
| `dist/game.js` | The player's body (`createPerson({...CAST.player, firstPerson:true})`), one instance | |
| `dist/friends.js` | Prologue friends (from `CAST`) and Jamie's mother (`createPerson(CAST.mom)`) | |
| `dist/companions.js` | Jamie, Sam (and Alex in Ch8) as companions from Ch1 on (separate instances from `friends.js`, same specs → same cached geometry) | |
| `dist/people.js` | `ADULTS` data; `createActor` → `refineAdult` | Adults |
| `dist/adult-art.js`, `dist/adult-sculpt.js` | Adult head loft (`adultHead`), hair, lips, clothing refinements | Adults |
| `dist/chapter3.js` | Alex-like figure (`createPerson({...CAST.alex})`) | Boy model |
| `dist/chapter4.js` | Alex across Main Street (`AX`); Sam's mother (inline, derived from `ADULTS.mom`) | |
| `dist/chapter5-presence.js` | The double Jamie | Boy model |
| `dist/chapter5-models.js` | `chapter5Appearance` — no-op for boys; would replace parts for non-boys (only boys are passed in Ch5) | |
| `dist/chapter6-cast.js` | `ADULTS6` (Sam's dad, Brandt, firefighters); figures `line-two-figure` (Alex), `the-other-sam`, `jamie-on-the-stairs` with `chapter6Appearance(…, {cursed:true})` | Ch6 model |
| `dist/chapter6-models.js` | `chapter6Appearance` — no-op for boys unless `cursed`; full head/hair/body replacement for adults | |
| `dist/chapter7-cast.js` | `MRS_LANGE` (`createPerson`, expressive), `JAMIE_MOM`, the dining-room family, the photo studio (four boys + bikes) | |
| `dist/chapter7-portraits.js` | `portrait` — skips boys; adds skin, garment, hand, eye, mouth and elder details for adults | |
| `dist/chapter8-fall.js`, `dist/chapter8-street.js` | Hendersons, Lily, runners (both), Mrs. Pruitt, Mr. Davis (street) | `createActor` |
| `dist/aftermath1.js` | `ADULTS9` (protagonist's mother, volunteer, paramedic); reuses earlier actor instances | |
| `dist/aftermath1-acting.js` | `adultFace` overlay (brows, mouth, lids, red rims, tears) | Adults in A1 |
| `dist/shelter-crowd.js` | 96 background evacuees in ten instanced batches | Lofts, no faces |
| `dist/town-life.js` | Main Street people (`createActor`) | Adults |
| `dist/ambient.js` | The hoop kid (`createPerson(CAST.kid)`) | Primitive rig |

### 2.2 The boys — consistent core (VERIFIED, F-01)

`createPerson` swaps every boy part to `boyModel(spec)` geometry (cached by spec JSON), and chapter overlays return no-ops for `person.artBoy` (`chapter5-models.js`, `chapter6-models.js` unless cursed, `chapter7.js` `dress()` returns early, `chapter7-portraits.js` unreachable for boys). So the protagonist, Jamie, Sam and Alex use the same geometry, materials and face system in the Prologue, every chapter and Aftermath I. **This is the model to extend to everyone.**

Remaining boy issues: F-09 (doubles), F-10–F-13 (cap, hair, photographs). Close-up limitations documented by Astra: hair tips, shoulder joins, hands and cloth intersections can look artificial; fingers have a fixed curl (`ASTRA-FULLGAME-ART-REWORK.md`, `ASTRA_CHAPTER5_ULTRA_VISUAL_RELEASE.md`).

The `isBoy` test is by display `name`. Any future spec that renames a boy (e.g. a caption name used as `name`) silently falls back to the primitive rig head — a migration risk (§10).

### 2.3 Adults change by chapter (VERIFIED, F-02)

Reyes (`ADULTS.officer2`), Alex's parents, the other officer, Sam's parents, Brandt, the firefighters and Jamie's mother pass through different presentations:

| Chapters | Head / hair / body | Face behavior |
|---|---|---|
| Ch1–Ch5 | `refineAdult` (`adultHead` loft, fitted hair) | Mouth opens when talking; two brows |
| Ch6 | `chapter6Appearance` replaces head, hair, torso, hands, shoes (its own `models(spec)`, `faceRig`), hides other head children, adds foot-contact blob shadows | Ch6 face rig |
| Ch7 | Ch6 replacement **plus** `portrait` (skin regrain, garment, weathered hands, eye/mouth offsets, elder details) | Portrait mouth envelope |
| Ch8 | Only `ch5.presentation` is enabled by Ch8; adults return to `refineAdult` (see F-23) | Base |
| Aftermath I | `refineAdult` + `adultFace` (expression overlay, tears, red rims) | Expressive |

Result: the same adult has up to four different faces across the game.

### 2.4 Adult identity defects (VERIFIED)

- **F-03 Jamie's mother.** Prologue: `CAST.mom` built with `createPerson` (not `createActor`, so no `refineAdult`): the primitive rig head, ponytail `0x6b4a2a`, red shirt `0x9c3b3b`, scale 1.13 (`friends.js:39`). Ch7 onward: `JAMIE_MOM = {...ADULTS.mom, name:'JAMIE’S MOM', hair 0x5a3a22, face {...ADULTS.mom.face, skin, iris, browTilt .2}, clothes …}` (`chapter7-cast.js:74`), through `createActor` (adult sculpt).
- **F-04 Shared mother face.** Sam's mother: `{...ADULTS.mom, name:'SAM’S MOM', hair …, clothes …}` (`chapter4.js:113`) — identical face parameters to Alex's mother including skin and green-hazel iris. Jamie's mother (Ch7+) — same jaw/cheek/eye/nose parameters as Alex's mother. `AFTERMATH1_VISUAL_REVIEW.md` notes "the two mothers are not the same face" (Jamie's vs Alex's: skin/brow differ), but the geometry parameters are shared.
- **F-05 Child skeleton on adults.** `createPerson` scales the whole group by `spec.scale` (`rig.js` `group.scale.setScalar(d.scale)`); `BODY` lengths are the child's. Adults therefore have child proportions at adult height.
- **F-06 Female head by name string.** `adult-sculpt.js` `mom=spec.name.includes('MOM')`; `adult-art.js` likewise (`officer=spec.name==='OFFICER'`, `older=spec.name==='NEIGHBOR'`). Women not named "…MOM" (Mrs. Henderson, Mrs. Pruitt, Mrs. Delaney, the volunteers, `vol2`, `vol4`) get the male jaw rings; any neighbor named `NEIGHBOR` gets the "older" treatment regardless of age.
- **F-07 Lily.** `{...CAST.kid, name:'LILY', scale .78 / .76, clothes …}` through `createActor` (`chapter8-fall.js:28`, `chapter8-street.js:89`): the hoop kid's cropped hair and face parameters (a boy), with `refineAdult`'s adult head geometry on a child.
- **F-08 Duplicate actors.** Mrs. Henderson (seeds 81 and 181), Mr. Henderson (82, 182), Lily (83, 183), runners (90–92, 190–191) exist twice. Aftermath I takes the `chapter8-street.js` set (`ch8.SC.STREET.PEOPLE`). Same specs, but two instances and two code paths to keep in sync.
- **Name collision.** `CAST.mom.name` and `ADULTS9.mom.name` are both `'MOM'`.
- **Mrs. Lange** is built by `createPerson` + `createFace` (not `createActor`) and dressed by Ch6/Ch7 overlays — a third adult path.

### 2.5 Doubles (VERIFIED, F-09)

`chapter6-cast.js` `figure(cast, name)`: `createPerson({...cast, expressive:true})` (boy model) then `chapter6Appearance(person, cast, {cursed:true})` → because `cursed` bypasses the boy no-op, the Chapter Six head, hair and body replace the canonical boy geometry; the cursed face rig stops blinking, holds a smile, offsets gaze and adds asymmetry (`chapter6-models.js:100–112`). Ch3's figure, Ch4's Alex and Ch5's double Jamie use the canonical model. So the copies look like the boys in some chapters and like a different model in Chapter Six.

### 2.6 Shelter crowd (VERIFIED)

`shelter-crowd.js`: 96 people, ten instanced mesh batches, child/adult proportions, varied clothes, seated/standing/floor poses, head turns, breathing; two walking volunteers. No faces. A different realism tier from the story actors, acceptable at distance; it must be raised to share the character shader family and gain LOD faces for near rows (Roadmap Phase 6).

---

## 3. Props (VERIFIED unless noted)

| Prop | Builders found | Finding |
|---|---|---|
| Jamie's cap (F-10) | `astra-anatomy.js` (worn, `0x2d4a7a`, seams, button, badge `0xb8c5bc`); `chapter7.js:1335` `c7-jamies-cap` (`0x1e2f6a`); `chapter8-street.js:291` `c8-jamie-cap` (`0x2e4a7a`, half-sphere + box brim); `aftermath1-scenes.js:93` `a1-jamie-cap` (`0x2d4a7a`); `aftermath1-props.js` canvas | Four 3D builders, three blues, different construction |
| T. Lange's cap | `chapter7-lange.js:113` `lange-cap` (`0x1a3a7a`) | Distinct object; must stay visibly different from Jamie's |
| Alex's camera | `alex-camera.js` `makeCameraModel`/`dressCamera` used by `chapter5-garage.js`, `chapter6-home.js`, `chapter6.js`, `aftermath1-town.js`, `aftermath1-record.js` | **Shared builder — good pattern** |
| Sam's notebook (F-24) | `chapter6-props.js:108`, `chapter7-house.js:104`, `aftermath1-record.js:65`; pages `chapter7-props.js` `notebookPage` | SUSPECTED differences in size/cover; verify |
| Flashlight (F-21) | `on-foot.js` (`player-flashlight`, `-spill`); Ch5 swaps in `chapter5-props.js` `flashlightMesh` during its presentation (`chapter5.js:255`) and restores after | Visual swap per chapter |
| Old green bike | `old-bike.js` "the one build of the old bike" | Good |
| Alex's bell, reflectors | `rig.js` bike extras | Good |
| Reyes's jacket | `astra-environment.js` `mourningCoat` | Single |
| Tire swing limb (F-19) | `ambient.js` separate cylinder from the oak's own branches | Mismatch risk |

---

## 4. Depictions: photographs and drawings (VERIFIED, F-13)

- Chapter Seven: `chapter7.js:1466–1482` renders the four studio models and their bikes (`chapter7-cast.js` studio) into a `WebGLRenderTarget` when possible — the photograph shows the canonical models.
- Aftermath I: `aftermath1-props.js` draws boys with a 2D canvas function `kid(g, x, y, size, CAST[...])` for the flyers, the portraits (Jamie's wallet picture, Alex's school portrait), Alex's printed boards and the photo-booth strip; the oak in the prints is a 2D `oak()` drawing.

The same people appear as rendered 3D portraits in one chapter and as flat illustrations in another.

---

## 5. Materials and shaders (VERIFIED, F-16)

Parallel material systems:

| System | File | Used by |
|---|---|---|
| `surfaceMaterial(material, kind)` | `materials.js` | World bake (houses, streets), Ch8 district |
| `artSurface(m, kind)` shared library (world-space detail, derivative fade) | `art-surfaces.js` | Astra full-game surfaces, environment dressing |
| `chapter4Surface(m, kind)` | `chapter4-surfaces.js` | Ch4 town |
| `stableTownTexture(m, kind)` | `chapter4-textures.js` | Ch4 town |
| `pineMaterial(color, kind)` | `pine-materials.js` | Ch5 Pine Ridge, Ch5 props |
| `mat(color, o, kind)` | `chapter7-build.js` | Ch7 |
| `material(color, extra)` | `rig.js` | People (primitive parts), bikes |
| Local `MeshStandardMaterial`s | many (`astra-anatomy.js`, `adult-art.js`, `chapter6-models.js`, `aftermath1-*.js`, …) | Characters, props |

`onBeforeCompile` shader patches appear in **23 modules, 29 call sites** (`world.js` ×3, `pine-build.js` ×2, `chapter8-ruin.js` ×2, `art-surfaces.js` ×2, `ambient.js` ×2, and one each in `town-repair2.js`, `town-build.js`, `pine-materials.js`, `pine-forest.js`, `materials.js`, `creek.js`, `creature.js`, `chapter8-presence.js`, `chapter6-works.js`, `chapter5-props.js`, `chapter4-textures.js`, `chapter4-surfaces.js`, `chapter3.js`, `chapter3-art.js`, `astra-presence.js`, `astra-hunter.js`, `astra-anatomy.js`, `aftermath1-places.js`). Each defines its own noise and detail. Similar surfaces (concrete in Ch3, Ch6, Ch8; asphalt in Oak Hollow vs downtown; wood at the camp vs on porches) therefore come from different shader code and can respond to light differently.

Textures: almost everything is procedural/vertex-colored; text and signs are canvas textures (`paper()` in `chapter6-kit.js`, `aftermath1-props.js` `tex9`, etc.). The only authored texture set in the game is the third-party creature's.

---

## 6. Creatures (VERIFIED)

- **Hunter (F-20):** `chapter7-creature.js` `createHunterModel` → `astra-hunter.js` `buildHunter` for Ch7 and Ch8 (incl. the second hunter at scale 1.05). Separate perception origin preserved. Consistent.
- **Made things (F-14):** `chapter8-street.js:53–59` — `createHunterModel`, material named `hunter-skin` recolored `0xcdc2b4`, scale 0.80–0.90, `GRIN` (half-torus mouth + half-torus teeth) added to the head.
- **Smiling creature (F-15):** `creature.js` + `creature-asset.js`, Bento's CC BY model, one instance shared from Ch3 to Ch8 (`chapter8.js:85` `const danny=ch3.creature`), injury bones keep the two missing fingers. Consistent instance; the identity is third-party.
- **Presence (F-20):** `astra-presence.js` `presenceOrganism({sky})` used by `chapter8-presence.js` for the underground mass and the skyline; skyline `r:138` (`chapter8-street.js:45`). Consistent builder. Older docs describe a "lobed fleshy mass" with "plated, barbed, fingered limbs" (`CHAPTER8_RECONSTRUCTION_HANDOFF.md`) — superseded by the Astra design (conflicts register C-07).
- **Doubles:** see §2.5.

---

## 7. Environments: quality differences (VERIFIED from code and earlier reviews; visual judgement SUSPECTED until captured)

- One world bake for Oak Hollow shared by every chapter that visits it (`world.js`); the damage map and real triangle cuts are shared by Ch8 and Aftermath I (`catastrophe-district.js`, `chapter8-ruin.js`, `aftermath1-street.js`; regression `tests/recovery-state.mjs`). **Positive.**
- Old Mill lots reuse `houses.js` architecture (`town-houses.js`). **Positive.**
- Downtown, Pine Ridge, the works and Ch7 interiors each have their own builders and material systems (§5), so finish quality varies by which session built them (Astra passes for Ch3–Ch7; Claude structural passes; the Ch8 reconstruction).
- Documented weak spots (`ASTRA_HANDOFF.md` §5, `AFTERMATH1_VISUAL_REVIEW.md`, `VISUAL_RECOVERY_REPORT.md`): spiky-cone tall grass at the lookout; tire swing as a black torus at night; chalk as 1-px lines; solid cars with glass blocks; flat lawns; far-field box houses relying on fog; mid-LOD houses with plain-box trim; the oak not reading from the Aftermath I barricade; seated people's straight arms; the kitchen lit like morning; simple unlit car interior; the moving truck a box (later improved with cargo interior); adult faces unreadable beyond a few metres; some underground angles extremely dark.

---

## 8. Rendering and lighting (VERIFIED, F-17, F-18)

- One `WebGLRenderer` (sRGB output, ACES, exposure 1.16 base), one sun with a following shadow frustum and shadow proxies, one hemisphere light, one `FogExp2`, one sky `ShaderMaterial` with day/dusk/night/storm/flash/apoc uniforms and the catastrophe layer (`game.js:40–66`, `catastrophe-sky.js`).
- Quality presets change only pixel ratio and shadow map size (`game.js:140–142`).
- Per-chapter lighting is authored as code in `game.js` `update()` lines ~621–647 (Ch4 `L4` light object: storm, apoc, flash, cave modifiers).
- No post-processing pass.
- Chapter Six's foot-contact blob shadows exist only while its adult overlay is on.

---

## 9. Shared-asset opportunities

1. Extend the boys' "one model everywhere" pattern to every human via a registry (bible §21).
2. One adult skeleton with its own proportions; one female and one male head family with per-identity sculpts (not name strings).
3. One cap builder with worn-forward / worn-backward / held / lying states.
4. One photograph pipeline (render-to-texture from canonical models).
5. One material library replacing the seven systems; one noise/detail GLSL chunk.
6. One flashlight builder.
7. One crowd system for the shelter, the vigil, the memorial and Main Street.
8. One made-thing base derived from the smiling creature.
9. Lighting profiles as data (the `L4` modifiers become profile blends).
10. Contact shadows as a global feature.

---

## 10. Migration risks

| Risk | Why | Mitigation |
|---|---|---|
| Breaking contact scenes | CPR, embraces, hand-holding, carrying Brandt, the ankle grab depend on current limb lengths and sockets (`tests/art-contacts.mjs`, 65 checks) | Keep the pose contract and socket names; re-run contact tests on every proportion change |
| Breaking IK/bike fit | Bikes and riders share `BODY` and `BIKE` anchor points | New bike meshes keep anchors; new boys keep (or explicitly re-tune and re-test) limb lengths |
| `isBoy` by name | Renaming a spec silently downgrades a boy | Registry IDs instead of names |
| Chapter overlays restoring state | Ch5/6/7 overlays save and restore geometry on enable/disable; removing them changes earlier-chapter visuals | Remove overlays only when the registry model replaces them in all chapters at once |
| Save/DEV starts | DEV starts and Continue rebuild state from sections; identity must be the same regardless of entry | Identity tests include DEV and Continue (QA §5) |
| Perception origin | The hunter's sight ray must not follow the new head | Keep the separate perception socket |
| Performance | Skinned hero meshes and textures add cost; current heavy views already reach 1,557 draw calls (software) | Measure hardware baseline first (Phase 0); budgets (bible §20) |
| Offline package | glTF/KTX2/Draco/meshopt loaders and textures must embed into the self-contained HTML; base64 inflates ~33% | Asset plan §6 |
| Concurrent work | Menu/settings, Aftermath II, credits are being built elsewhere | Do not change their modules; coordinate settings (bible §16) |
| Third-party license | Replacing or modifying the Bento creature | Never remove its record; record any replacement |
| Story regressions | Visual passes have previously nudged interaction radii (Ch7 drag marks) | Full chapter simulations after each phase |

---

## 11. Documents reviewed

`README.md`; `docs/ASTRA-FULLGAME-ART-REWORK.md`; `docs/VISUAL_RECOVERY_REPORT.md`; `docs/CHAPTER8_RECONSTRUCTION_HANDOFF.md`; `docs/CHAPTER8_FULL_GAME_NARRATIVE_INTEGRATION.md`; `docs/AFTERMATH_STORY_HANDOFF.md`; `docs/CHAPTER7_CREATURE_ASSET_GUIDE.md`; `docs/AFTERMATH1_VISUAL_REVIEW.md`; `docs/THIRD_PARTY_ASSETS.md`; `docs/ASTRA_HANDOFF.md`; `docs/ASTRA_CHAPTER3_HORROR_ESCALATION_HANDOFF.md`; `docs/ASTRA_CHAPTER5_ULTRA_VISUAL_RELEASE.md`; `docs/ASTRA_CHAPTER6_RECONSTRUCTION_HANDOFF.md`; `docs/CHAPTER7_EXPANSION_HANDOFF.md`; `docs/CHAPTER7_TEST_REPORT.md`; `docs/CHAPTER5_PINE_RIDGE_HANDOFF.md`; `docs/CHAPTER6_IMPLEMENTATION_HANDOFF.md`; `docs/qa/visual-recovery/render-summary.json`; `tests/verify.mjs` (render budget check). Other chapter handoffs were scanned for style statements (conflicts register).
