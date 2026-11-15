# LAST LIGHT — Official Final Art Bible

**Style name: CINEMATIC NOSTALGIC HORROR REALISM**

| | |
|---|---|
| Status | **Controlling specification for all future visual work.** Approved direction (creative director brief, November 2026); details marked *CREATIVE DIRECTOR APPROVAL REQUIRED* are not yet locked. |
| Branch / base | `claude/final-art-bible`, from `codex/astra-chapter8-aftermath1-visual-recovery` at `c646a862b272c987b0a0b9aea690ddfc859ddda7` (verified as that branch's head on 2026-11-15; no newer integrated visual branch existed). |
| Scope | Documentation only. No runtime code, model, shader, asset, scene, UI, audio or save data was changed when this bible was written. |
| Governs | Every future art, rendering, character, creature, environment, lighting, animation and visual-QA task in any Claude, Astra or other session. |
| Does not govern | Story canon (it obeys it), historical reports (they stay true records of older builds), gameplay design. |

## How to use this bible

1. Read this document in full before any visual task. It is written to stand alone.
2. Then read the supporting specification for your area:

| Area | Document |
|---|---|
| Every recurring person: identity, age, wardrobe, conditions | [`docs/art/CHARACTER-CANON.md`](art/CHARACTER-CANON.md) |
| Hunters, smiling creature, made things, the Presence | [`docs/art/CREATURE-DESIGN-BIBLE.md`](art/CREATURE-DESIGN-BIBLE.md) |
| Architecture, streets, interiors, trees, the oak, bikes, props, geography | [`docs/art/ENVIRONMENT-STYLE-GUIDE.md`](art/ENVIRONMENT-STYLE-GUIDE.md) |
| Light sources, exposure, chapter-by-chapter color | [`docs/art/LIGHTING-AND-COLOR-SCRIPT.md`](art/LIGHTING-AND-COLOR-SCRIPT.md) |
| What the code does today, and where it disagrees with itself | [`docs/art/VISUAL-CONSISTENCY-AUDIT.md`](art/VISUAL-CONSISTENCY-AUDIT.md) |
| Modeling workflow, glTF, textures, budgets, licenses, offline package | [`docs/art/ASSET-PRODUCTION-PLAN.md`](art/ASSET-PRODUCTION-PLAN.md) |
| The phased reconstruction, its gates and tests | [`docs/art/FULL-GAME-VISUAL-ROADMAP.md`](art/FULL-GAME-VISUAL-ROADMAP.md) |
| How visual work is verified and accepted | [`docs/art/VISUAL-QA-ACCEPTANCE.md`](art/VISUAL-QA-ACCEPTANCE.md) |
| Older guidance this bible supersedes | [`docs/art/ART-DIRECTION-CONFLICTS.md`](art/ART-DIRECTION-CONFLICTS.md) |
| Open decisions that block implementation | [`docs/art/ART-APPROVAL-REGISTER.md`](art/ART-APPROVAL-REGISTER.md) |

3. If something you need is undecided, **do not invent it**. Check the approval register; if it is not there, add it, mark it *CREATIVE DIRECTOR APPROVAL REQUIRED*, and build nothing that depends on it.

### Order of authority

When two sources disagree, the higher one wins:

1. Explicit creative-director decisions (recorded in the approval register as APPROVED).
2. This bible and its supporting documents.
3. Approved character/creature reference images (none are committed yet; see approval register).
4. Story canon: in-game text and the story handoffs (`docs/AFTERMATH_STORY_HANDOFF.md`, `docs/CHAPTER8_FULL_GAME_NARRATIVE_INTEGRATION.md`, chapter handoffs).
5. Accepted playable appearance (what the current build shows and the creative director has accepted).
6. Current source-code values (`dist/cast.js`, `dist/people.js`, …).
7. Drafts, placeholders, stand-ins.

Story canon (4) is never overridden by art direction: if the bible and the story disagree on a fact (who is dead, who owns the cap, what color Jamie's shirt is), the story wins and the bible is corrected. Art direction (2) governs *how* things look; story (4) governs *what is there*.

### Status labels used in every document

| Label | Meaning |
|---|---|
| **STORY CANON** | Established by in-game text or story handoffs. Must be preserved. |
| **APPROVED** | Explicitly approved by the creative director. Locked. |
| **CURRENT SOURCE** | What the code does now. Evidence, not a decision. May be adopted, changed or replaced. |
| **PROPOSED** | This bible's recommendation. Use it unless the creative director changes it, but it is not locked. |
| **CREATIVE DIRECTOR APPROVAL REQUIRED (CDA)** | Unknown or conflicting. Do not build anything that depends on it. |

---

## Part 1 — The identity

### 1.1 Official definition

> Last Light is a grounded, cinematic, semi-realistic first-person narrative horror game that portrays a beautiful, believable American suburban childhood in 2011. Its visual language combines emotionally warm nostalgia, detailed naturalistic environments, carefully stylized yet convincing human characters, realistic materials, cinematic lighting, and increasingly oppressive supernatural horror. The game progresses from a peaceful summer memory into industrial dread, catastrophic cosmic horror, and intimate grief, while maintaining one continuous artistic identity across every location, character, chapter, and time period.

**The game must never feel like several visual projects assembled into one story.** Light, weather, time of day, damage, age and emotional state change. The underlying artistic language does not.

### 1.2 The three words, made concrete

| Word | What it means on screen | What it does not mean |
|---|---|---|
| **Cinematic** | Motivated light with a direction; composed sightlines; atmospheric depth (fog/haze separating foreground, middle and background); controlled contrast; filmic tone curve; deliberate staging of story moments inside play. | Letterboxing, forced cutscenes, heavy depth of field, lens flares, constant shake, film-grain soup. |
| **Nostalgic** | Warm low sun, long soft shadows, lived-in yards, worn but cared-for objects, 2011 specifics, the feeling of a real neighborhood remembered at its best. | Sepia filters, vignettes, faded VHS, "retro" stylization, oversaturation. |
| **Horror realism** | Ordinary physical things rendered believably, so that the wrong thing in them is frightening; creatures with weight, contact and shadow; darkness with readable shape. | Gore for shock, jump-scare lighting, pitch-black screens, monsters that look pasted in, cartoon menace. |

### 1.3 The essential contrast

The player must want to go back to the Prologue even after they know what happens to it.

**Emotional progression (locked):** beauty → familiarity → subtle unease → dread → horror → catastrophe → grief → memory.

Visual consequence: **the Prologue is the quality benchmark for the entire game.** Every later chapter is the same world under different light, weather, damage and grief. If a later chapter is visually richer than the Prologue, the contrast fails; the Prologue is raised, not the later chapter lowered.

### 1.4 What stays fixed, what may change

| May change (with a story reason) | Never changes without a story reason |
|---|---|
| Time of day, sun position, weather, fog density | Material response rules (how wood, siding, skin, asphalt react to light) |
| Exposure target within the chapter's lighting profile | Tone mapping operator and color pipeline |
| Color temperature of light sources | Character identity: face, proportions, hair construction, skin |
| Damage state of buildings (by the shared damage map) | Geography: where houses, streets, the oak, the drains are |
| Wardrobe (per approved wardrobe variants) | Tree species language, architecture language |
| Condition: wet, dirty, bloody (non-graphic), injured, exhausted, older | Creature anatomy and scale (each creature has one master design) |
| Emotional acting | Level of realism between characters in the same frame |

---

## Part 2 — Reference policy and originality

### 2.1 NO SHELTER (Rough Devs, announced for 2027)

A **reference for ambition and atmosphere only**. What we take from it, as principles:

- grounded, believable environmental presentation;
- high atmospheric density (air you can see in);
- convincing architecture with physical construction;
- strong motivated lighting and deep darkness that still has shape;
- quiet, uncomfortable realism; horror that grows out of ordinary places;
- weather and darkness as primary storytelling tools;
- a strong sense of physical place.

What we never take: its characters, locations, creature designs, textures, models, compositions, UI, marketing imagery, or any distinctive scene. We do not assume the same engine or comparable rendering capability. No asset, texture, screenshot or frame from NO SHELTER (or any other commercial game) may be placed in the repository, traced, used as a texture source, used as a direct paint-over base, or fed to a generator as an image prompt.

### 2.2 Originality rules (binding)

1. Every creature design must be original to Last Light. External images may inform anatomy *direction* only and must not be reproduced literally. (The creature references used by the Astra rework are not committed to the repository; see `ART-APPROVAL-REGISTER.md` A-31.)
2. No traditional monster archetypes as the final read: not a zombie, skeleton, spider, dragon, dinosaur, giant humanoid or kaiju.
3. Third-party assets are allowed only with verified redistribution rights and full records in `docs/THIRD_PARTY_ASSETS.md` (process: `docs/art/ASSET-PRODUCTION-PLAN.md` §8).
4. A real-world brand, logo or trademark is never reproduced on props, clothing, vehicles or signs. Use original, period-plausible names and marks.

---

## Part 3 — The ten commandments (binding)

Each rule has a check. A visual change that fails a check is a defect, not a style choice.

| # | Rule | Acceptance check |
|---|---|---|
| 1 | **One game, one visual language.** Every chapter uses the same standards for geometry, materials, texture, lighting response, anatomy, faces, hair, clothing, environment detail, creature anatomy, animation and image finishing. Mood comes from the situation. | Side-by-side captures of the same material family (e.g. painted siding) from three chapters read as the same material under different light. No chapter has a module that replaces a shared model for that chapter only. |
| 2 | **Character identity never changes without an in-story reason.** | The identity test (QA §5) passes for every recurring character in every chapter, including chapter transitions and DEV starts. |
| 3 | **Grounded realism before spectacle.** Cars, roofs, trees, bodies look and behave physically, especially during supernatural scenes. | The architecture and vehicle checklists (Environment guide §2, §9) pass in the catastrophe scenes, not just the Prologue. |
| 4 | **Horror is physically present.** Creatures receive and cast shadows, touch the ground with weight, disturb objects, occlude correctly, are lit by the scene's lights. | Creature contact test (Creature bible §8): planted feet, contact shadows, no floating, no penetration of solid geometry at gameplay distances. |
| 5 | **Emotion before decorative complexity.** Faces, eye contact, gesture, posture and touch outrank surface detail. | Every emotional key scene (Lighting guide §6) shows the faces readable at the scene's natural play distance. |
| 6 | **Beautiful scenes stay readable.** | Night-readability rule (Lighting §3): characters, navigation and story clues are distinguishable at default brightness on a calibrated sRGB monitor. |
| 7 | **No primitive-geometry appearance.** No visible stacked cylinders, spheres as facial features, helmet hair, slab clothing, cloned trees, flat black windows, empty buildings, floating details, or broken joints. | The primitive-appearance checklist (QA §6) passes at gameplay distance; at close-up distance for hero assets. |
| 8 | **Physical continuity is mandatory.** Damage, weathering, placement, geography and character appearance persist logically between scenes and chapters. | The geography and damage-state continuity tests (QA §7) pass; one damage map and one layout drive every chapter. |
| 9 | **Art direction is shared, not reinvented.** No session creates its own version of a friend, adult, creature, bike, the oak or a signature prop. | Code review: every recurring entity is built from its canonical asset ID (Part 21). A second builder for the same ID is rejected. |
| 10 | **Real gameplay is the final visual authority.** | Acceptance requires in-game WebGL captures from the playable build plus human review on real GPU hardware. Turntables, geometry exports and concept art are supporting evidence only. |

---

## Part 4 — Global rendering

### 4.1 Target

High-quality cinematic semi-realism for a desktop browser Three.js game, including self-contained offline playtest packages. Environmental credibility of a modern narrative indie game, without attempting photographic human realism.

### 4.2 Current baseline (CURRENT SOURCE, `dist/game.js`)

- Three.js **r160**, vendored (`dist/three.module.js`, MIT). WebGL 1/2. No build step.
- One `WebGLRenderer`: `outputColorSpace = SRGBColorSpace`, `toneMapping = ACESFilmicToneMapping`, base `toneMappingExposure = 1.16`, adjusted per chapter.
- Shadows: `PCFSoftShadowMap`, one directional sun that casts (map 1024 / 2048 / 3072 by quality), position-only shadow proxies on layer 1, a ~120 m frustum following the player.
- Fill: one `HemisphereLight`. Fog: one `FogExp2`, color and density driven per chapter.
- Sky: one shared `ShaderMaterial` (`skyMat`) with uniforms `day`, `dusk`, `night`, `storm`, `flash`, `apoc`, `apocT`, `apocDir`; catastrophe layer `dist/catastrophe-sky.js`.
- Quality setting (low / medium / high): pixel ratio cap 1 / 1.35 / 2; shadow map 1024 / 2048 / 3072.
- **No post-processing pass** (no composer, bloom, grain, AO, color grade LUT). The only image finishing is ACES and fog.
- Chapter lighting is computed in code inside `game.js` `update()` from chapter `light()` objects (`chapter4.light()` and chains through later chapters).

This is a good foundation: there is already one renderer, one tone mapper and one sky. The reconstruction keeps that and moves the per-chapter numbers into data.

### 4.3 Required rendering architecture (PROPOSED; implement in Phase 2)

1. **One render profile module** (proposed `dist/render-profile.js`): owns renderer settings, tone mapping, exposure clamp, shadow tiers, fog model, post stack, and the quality presets. No chapter sets renderer state directly.
2. **Lighting profiles as data** (proposed `dist/art/lighting-profiles.js`): named profiles (`lgt.prologue.golden`, `lgt.ch8.catastrophe`, …) with sun direction/color/intensity, sky uniforms, hemisphere colors, fog color/density, exposure target, practical-light defaults, post settings. Chapters choose and blend profiles; they do not author raw numbers in scene code. Full list: `LIGHTING-AND-COLOR-SCRIPT.md` §8.
3. **One material library** (Part 5) replacing the current parallel systems (`materials.js`, `art-surfaces.js`, `chapter4-surfaces.js`, `chapter4-textures.js`, `pine-materials.js`, `chapter7-build.js` `mat`, `rig.js` `material`, and 29 ad-hoc `onBeforeCompile` patches in 23 modules; see audit §5).
4. **One character shader family** (skin, eyes, hair, cloth) used by every human in every chapter.
5. **One sky system** with states (Part 14), not a renderer per chapter.
6. **A restrained post stack** (Part 16): tone mapping, optional bloom, optional grain, optional vignette at ≤ 0.1, no others by default.

### 4.4 Color pipeline rules

- All authored colors are sRGB; textures with color data are tagged `SRGBColorSpace`; data textures (normal, roughness, AO, masks) are `NoColorSpace`.
- Lighting is linear; tone mapping happens once, at output. No chapter applies its own tone curve in a material.
- No emissive cheating on surfaces that are not light sources. (Current exception to retire: interiors whose materials "carry a little of their own light", noted in `AFTERMATH1_VISUAL_REVIEW.md`.)
- White point: the brightest non-emissive surface in a daylit scene (white trim in sun) lands near, not at, display white after tone mapping. Snow-white clipping on sunlit siding is a defect.

---

## Part 5 — Materials and textures

### 5.1 Material taxonomy (PROPOSED; full response tables in `ENVIRONMENT-STYLE-GUIDE.md` §4)

Every surface in the game belongs to one family. Each family has one definition (base color range, roughness range, metalness, normal/detail behavior, weathering inputs, wet response) used everywhere.

| ID | Family | Roughness (dry) | Metal | Key detail |
|---|---|---|---|---|
| `mat.wood.raw` | Untreated / weathered wood | 0.75–0.95 | 0 | Directional grain, gray weathering, end-grain darkening, splits |
| `mat.wood.painted` | Painted wood (trim, fences, porches) | 0.55–0.8 | 0 | Brush direction, chips at edges showing wood, dirt in recesses |
| `mat.siding.vinyl` | Vinyl / aluminium lap siding | 0.45–0.65 | 0 | Visible laps, J-channel trim, slight panel waviness, chalky fade on sun side |
| `mat.brick` | Brick veneer | 0.8–0.95 | 0 | Per-brick tone variation, recessed mortar (real depth via normal/parallax), efflorescence low |
| `mat.concrete` | Cast concrete | 0.7–0.95 | 0 | Formwork lines, pits, mineral runoff, darker wet bands, structural cracking |
| `mat.asphalt` | Road asphalt | 0.85–0.97 (0.15–0.35 wet) | 0 | Aggregate, tire polish lanes, patches, oil, crack sealant, painted lines with wear |
| `mat.roof.shingle` | Asphalt shingle | 0.85–0.95 | 0 | Tab rows, granule loss streaks, ridge caps, moss on north faces in older houses |
| `mat.metal.painted` | Painted steel (poles, rails, car bodies) | 0.3–0.6 | 0 base / 1 at chips | Chips to bare/rust metal at contact edges |
| `mat.metal.bare` | Bare / galvanized / stainless | 0.25–0.55 | 1 | Directional brushing, spangle on galvanized, handling smudges |
| `mat.metal.rust` | Oxidized iron/steel | 0.75–0.95 | 0.2–0.5 | Rust blooms from joints and bolts, streaks downward |
| `mat.glass` | Window / car glass | 0.02–0.1 | 0 | Reflection, slight tint, dirt at edges, **interior depth behind it** |
| `mat.skin` | Human skin | 0.45–0.6 | 0 | Soft wrap/subsurface approximation, subtle tonal zones (cheeks, nose, ears warmer), no plastic highlight |
| `mat.eye` | Cornea / sclera / iris | cornea 0.02, sclera 0.3 | 0 | Wet highlight, sclera not pure white, iris depth |
| `mat.hair` | Hair cards / shells | 0.35–0.55 | 0 | Anisotropic highlight, root-to-tip tone, alpha-tested strands at silhouette |
| `mat.fabric.cotton` | T-shirts, polos | 0.85–0.98 | 0 | Weave microdetail, seam stitching, fold normals, sheen low |
| `mat.fabric.denim` | Jeans, jean shorts | 0.85–0.95 | 0 | Twill, fading at wear points, seams |
| `mat.fabric.synthetic` | Hoodies, nylon, hi-vis | 0.6–0.85 | 0 | Nylon sheen, retroreflective tape is a separate family |
| `mat.leather` | Shoes, saddles, belts | 0.4–0.7 | 0 | Creasing, scuffs |
| `mat.rubber` | Tires, grips, soles | 0.75–0.9 | 0 | Tread, molded text (original), dust |
| `mat.plastic` | Toys, bins, electronics | 0.3–0.6 | 0 | Molded texture, sun fade |
| `mat.foliage` | Leaves, grass, shrubs | 0.6–0.8 | 0 | Alpha-tested cards, back-lit transmission, per-instance hue variation |
| `mat.bark` | Tree bark | 0.85–0.97 | 0 | Species-appropriate fissuring, moss/lichen, darker wet |
| `mat.soil` | Dirt, mud, gravel | 0.8–1.0 (0.3 wet mud) | 0 | Pebbles, footprints/tire marks as decals |
| `mat.water` | Standing / flowing water | 0.02–0.1 | 0 | Reflection, depth tint, flow normals |
| `mat.flesh.creature` | Creature dermis | 0.45–0.75 | 0 | See Creature bible §6 |
| `mat.paper` | Paper, photos, flyers, notebooks | 0.8–0.95 (photo gloss 0.2–0.4) | 0 | Fiber, curl, ink bleed, wet warping |
| `mat.char` | Fire-damaged surfaces | 0.9–1.0 | 0 | Alligatored char on wood, soot gradient above openings |

### 5.2 Texture standards (PROPOSED)

| Map | Rule |
|---|---|
| Base color | sRGB. No baked lighting except very soft cavity darkening. Values: no pure black (< sRGB 30) except voids; no pure white (> sRGB 240) except emissives/snow-white paint in shade. |
| Normal | Tangent-space, OpenGL (+Y) convention (Three.js default). Generated from height or sculpt. |
| Roughness / metalness / AO | Packed as glTF ORM (R = AO, G = roughness, B = metalness). |
| Opacity | Alpha-tested (cutout) for foliage, hair cards, fences; **alpha-blended only for glass, smoke, tears and soft particles**. |
| Detail maps | One tiling detail normal + roughness per material family for close-up breakup (world-space or UV2), faded by distance (the current `art-surfaces.js` derivative fade is the right idea). |
| Decals | Projected or mesh decals for cracks, stains, graffiti, search markings, chalk, oil, tire marks, burn scars. Decals carry their own roughness. |
| Weathering | A shared weathering layer driven by per-asset masks (edge wear, cavity dirt, top-down rain streak, ground splash) with chapter/damage-state intensity parameters. |
| Filtering | Trilinear mipmaps on everything; anisotropic 4× (low) / 8× (medium) / 16× (high) on ground and road surfaces. |
| Compression | KTX2 (Basis UASTC for normals and hero color, ETC1S for background color) once the loader is vendored and verified offline (Asset plan §5). Until then JPEG for color, PNG only where alpha is needed. |

**Texel density (PROPOSED target, measured in texels per metre at the asset's main read distance):**

| Asset class | Density | Typical map size |
|---|---|---|
| First-person hands, held props, bike handlebars | 1024–2048 px/m | 1024–2048 |
| Hero faces (boys, key adults) | ~4096 px/m on the face region | 2048 head + body atlas |
| Hero props (cap, bell, camera, notebook, photos) | 1024–2048 px/m | 512–1024 |
| Bikes | 512–1024 px/m | 1024–2048 |
| Near houses (story homes), porches | 256–512 px/m tiling + trim sheet | 1024–2048 tiling sets |
| Road, sidewalk, ground | 256–512 px/m tiling + detail | 1024–2048 |
| Mid houses, cars | 128–256 px/m | 512–1024 |
| Far buildings, far trees | 32–64 px/m or vertex color | atlas / impostor |

These are performance targets, not universal laws. Measure memory (Part 20) before raising them.

---

## Part 6 — Character art

### 6.1 Style: GROUNDED STYLIZED REALISM

Human, anatomically credible, expressive, consistent. Not cartoon, not Roblox, not doll, mannequin or clay. Not scanned photorealism with poor animation.

| Element | Standard |
|---|---|
| Body proportions | Realistic for age and build. 12-year-olds ≈ 6.6–7 heads tall; adults ≈ 7.3–7.7 heads. **Adults are not uniformly scaled children.** |
| Face | Slightly stylized: features very gently simplified and enlarged eyes (≤ 5% over anatomical) for readability; real skull, cheekbone, jaw and orbital structure; distinct per character. |
| Eyes | Real eyeballs in sockets with lids that wrap them, wet highlight, iris depth, correct convergence on gaze targets. No sphere eyes on the surface of the face. |
| Hair | Sculpted mass with card or shell strands at the silhouette, coherent parting and growth direction, flyaways at the edge, no scalp showing through unless intended. No helmet hair. |
| Skin | `mat.skin`: soft, warm, subtly varied; translucent at ears/nostrils in back-light where feasible. |
| Clothing | Real garment construction: seams, hems, collars, cuffs, thickness at openings, folds driven by pose. No slabs or tubes. |
| Hands | Correct finger count and length ratios, knuckles, nails, articulated fingers (at least 3 joints per finger in the rig for hero characters; first-person hands at hero quality). |
| Realism parity | Every human in one frame shares one realism level. A detailed boy next to a primitive adult is a defect. |

### 6.2 The four boys (summary; full specs in `CHARACTER-CANON.md`)

All four are **twelve** in 2011 (STORY CANON: flyers, Reyes's notes, Aftermath I). They must read as children: shorter limbs relative to adults, larger head-to-body ratio, softer jaws, no adult musculature, no stubble, slight differences in height and build.

| ID | Who | Story-fixed identity markers |
|---|---|---|
| `chr.protagonist` | The player, unnamed ("YOU") | First-person body and hands; his own bike with bell; moves away October 2011; adult in 2021 and 2026 |
| `chr.jamie` | The lively, warm friend; dies in Chapter Eight | **Blue cap he turns backwards when he rides**; **orange shirt with a hole in the sleeve**; BMX; the red chair on his porch; "Biscuit" |
| `chr.sam` | The loyal, sensitive survivor | His notebook; fixes chains; hoodie and helmet in his room; keeps the Tour de Oak Hollow poster; adult in 2021 |
| `chr.alex` | The thoughtful friend; taken first; dies at the oak | **Gold collared shirt**, olive shorts; **green cruiser with rack, bell and rear reflector**; his camera; red bike helmet |

No two boys may share a face, hairstyle, silhouette or posture. Each has a distinct resting expression and body language (Character canon §3).

### 6.3 Canonical character asset model

Every recurring person has exactly one **identity**. Everything else is a variant of it:

1. **Identity** — skull, face, proportions, skin, eye color, hair identity, distinguishing marks. Permanent.
2. **Age variant** — 2011 / 2021 / 2026 where the story needs it. Derived from identity by an approved age-progression (Part 18), never a different model.
3. **Wardrobe variant** — an approved outfit for a scene/time.
4. **Condition variant** — wet, muddy, dusty, blood (non-graphic), bruised, bandaged, cast, exhausted, dead-still.
5. **Expression state** — runtime facial pose (shared expression set, per-character intensity).
6. **Animation state** — runtime body motion (shared libraries + per-character style parameters).
7. **Lighting state** — scene lighting; never alters identity data.

ID grammar (PROPOSED): `chr.<name>.<age>/<wardrobe>+<condition>+<condition>`, e.g. `chr.sam.a12/summer-teal+wet+mud`, `chr.sam.a22/fall-2021`. One registry maps each ID to its geometry, materials, rig and attachments (Part 21).

### 6.4 Adults

Same art language, same shader family, same realism as the boys. Every recurring adult gets an identity (face, age, build) — never the same face with different hair (the current build shares one face among three mothers; audit §2). Required: believable skull, age-appropriate skin and hair, real hands, posture, eye contact, and **individual grief behavior** (Character canon §5).

### 6.5 Hands in first person

The protagonist's hands are seen more than any other character's body part. One canonical pair (`chr.protagonist.a12` hands) is used for handlebars, bell, flashlight, doors, objects, another person's hand, and looking down at himself, in every chapter. Hands receive scene light and shadow, grip props at authored sockets, and never pass through grips, doors or held objects.

---

## Part 7 — Animation and acting

### 7.1 One animation standard

No chapter uses a better walk than another for the same character. Required shared families: idle, weight shift, look-around, walk, run, cycle, steer, brake, stop, dismount, push bike, sit (chair/floor/curb/cot), kneel, crouch, reach, hold, open door, hug/embrace, hold hands, cry, shake, limp, fall, lie, injured movement, exhausted movement, conversation gestures. Scene-specific animations are listed in `CHARACTER-CANON.md` §6.

**Movement principles:** feet contact the ground and do not slide beyond 2 cm at walking pace; hands contact props at sockets; balance is kept (center of mass over support); gait scales with speed; no snapping between incompatible poses (blend ≥ 0.15 s unless a hit); heads and eyes track targets with eyes leading the head by ~80–150 ms; hair and clothing stay attached; no self-penetration visible at play distance.

### 7.2 Faces

Support: blinking (random 2–6 s, faster when anxious, absent in death), gaze, brow tension, mouth shapes for speech, asymmetric smiles, fear, surprise, sadness, crying, anger, numbness, fatigue, pain, weakness, and **death stillness** (no blink, no breath, no micro-motion; lids per scene; jaw relaxed; no frozen mid-expression).

**Crying is a system, not a texture:** eye moisture and lower-lid redness, brow inner raise, mouth tension and corner pull, irregular blinking, head dips, shoulder rises, breath catches, hesitation between words. Every crying character has its own pattern (rate, intensity, restraint); identical loops on two characters in one scene are a defect.

Current state: the boys share `dist/faces.js` (expressions, text-timed mouth, grief pulses); adults use `aftermath1-acting.js` `adultFace` only in Aftermath I and Chapter Six/Seven overlays otherwise (audit §2.3). The target is one facial system for all humans.

---

## Part 8 — Environments (summary; full guide in `ENVIRONMENT-STYLE-GUIDE.md`)

- A real, lived-in American suburb in 2011: believable proportions, correct roofs, doors, windows, garages, porches, gutters, downspouts, trim, siding, brick, fences, mailboxes, driveways, sidewalks, signs, storm drains, continuous power lines, streetlights, real road widths, landscaping, yard objects, clutter.
- Houses vary within one community vocabulary (ranch, colonial, cape, front-gable; the four current styles are the right set).
- **Forbidden:** missing or floating roofs, illogical windows, doors into walls, fences ending in air, cables ending in air, truncated trees, houses without interior depth, flat untextured lawns, sharp corners where curves belong, endless empty terrain, featureless cul-de-sacs, floating signs, poles through signs, props intersecting ground.
- Environmental storytelling is intentional and period-correct (2011): no smartphones newer than 2011 designs, no LED streetlights, no 2020s cars, no smart doorbells.

---

## Part 9 — Vegetation and the old oak

- Trees: believable taper, branch hierarchy, irregular crowns, root flare and ground contact, species language, consistent season, real shadows, subtle wind. Beautiful in the Prologue; frightening in night silhouette.
- **The old oak (`lm.old-oak`) is one landmark** at Oak Hollow Drive d 1162, lat 7.6 (`dist/layout.js` `LOOKOUT.oak`), with the healed `AR` carving at a child's height, the tire swing limb, the lookout bench and the `JSA` chalk nearby, and Alex's death against its trunk. It must be recognizable instantly from every story vantage. It is never replaced by a generic tree. Master spec: Environment guide §6.
- Grass and plants: varied, edged, weedy where neglected, seasonal (green August → browning September → orange/brown October 2011 → mature 2021).

---

## Part 10 — Bicycles, vehicles and signature objects

- Bicycles are hero assets. Each boy's bike has one identity (Environment guide §8): protagonist's road-kid bike with bell and reflector; Jamie's rust-red BMX with pegs and pad; Sam's steel-teal mountain bike with bottle and knobby tires; Alex's olive-green cruiser with swept bars, rack, bell and rear reflector. Plus the 1958 Meadowlark ("the old green bike", `dist/old-bike.js`), which is not Alex's.
- Vehicles are period-generic 1995–2011 designs without real badges, with real glass and interiors (no solid bodies with a glass block), lights, mirrors, plates and damage states; police, fire, ambulance, utility, excavator, moving truck and school bus for the story scenes (Environment guide §9).
- Story states persist: Alex's broken rear reflector, flat tires, evidence tag, the bikes' positions after Chapter Eight, Alex's bike on two garage hooks, Jamie's BMX at his mother's porch.
- Signature objects have **one builder each** (Environment guide §10): Jamie's cap, Alex's bell, Alex's camera, the photographs, Sam's notebook, Tour de Oak Hollow materials, the flashlight, maps/documents, memorial objects, items carried into 2026. A photograph of a boy shows that boy's canonical model, rendered, not a separate drawing.

---

## Part 11 — Creatures (summary; full bible in `CREATURE-DESIGN-BIBLE.md`)

Shared supernatural language: anatomical wrongness, unsettling movement, distorted familiarity, coherent organic construction, disturbing silhouettes, inhuman behavior, physical threat, restraint.

| ID | Creature | One-line identity |
|---|---|---|
| `cre.hunter` | Retrieval hunter (Ch7, Ch8; second hunter in Ch8) | Gaunt, low, forward-loaded predator with elongated forelimbs and hooked talons; retrieves taken children |
| `cre.smiling` | The smiling creature — Danny Whitcomb as changed in 1991 (Ch3–5, Ch8) | Almost-human, wrong-smiling, two fingers missing from the left hand; afraid of what is below |
| `cre.made` | The made things (Ch8 surface) | Pale, smiling, too long in the arm: imitations of Danny's change, **not Danny** |
| `cre.double` | The doubles (Ch3 Alex figure, Ch5 Jamie, Ch6 Sam/Jamie/Alex) | Exact copies of a boy whose wrongness is behavior, not geometry (PROPOSED; CDA A-14) |
| `cre.presence` | The Presence (development name; never named in game) | Monumental, original, arched organism with load-bearing limbs, a long reaching neck and a tapered vertical opening; dwarfs houses |

**The Presence is the highest-priority creature.** It must dominate the Chapter Eight skyline from gameplay cameras; the player must look up to understand it. No model upgrade may shrink its apparent scale (current skyline mass radius 138, `dist/chapter8-street.js`).

---

## Part 12 — Lighting (summary; full script in `LIGHTING-AND-COLOR-SCRIPT.md`)

**NATURALISTIC CINEMATIC LIGHTING:** believable sources, soft but meaningful shadows, directional composition, consistent exposure, atmospheric depth, bounce approximations, controlled contrast, correct time-of-day behavior, emotionally motivated color.

Avoid: flat ambient light, grading that overwhelms materials, black-crush night scenes, one universal white light. Every source type has a defined color temperature, falloff, shadow behavior and flicker (Lighting §2).

---

## Part 13 — Master color script (locked progression)

| Part of the game | Dominant colors | Emotional target |
|---|---|---|
| Prologue | Warm golden sun, soft blue sky, healthy greens, muted cream, warm siding, amber streetlights | The happiest summer evening the player will never get back |
| Chapters One–Two | Muted greens, warm twilight, dusk blue, soft gray, deepening shadow, restrained warm interiors | Something is wrong with a place that still looks familiar |
| Chapter Three | Damp charcoal, dirty concrete gray, dark moss, rust, muted industrial amber, black-blue shadow | Descending beneath childhood into a place nobody should enter |
| Chapters Four–Six | Cool blue-gray, aged concrete, desaturated greens, rust orange, old fluorescent, stained interior yellow, isolated shadow | The ordinary town is sitting on something much older |
| Chapter Seven | Cold suburban night blue, deep neutral black, sickly interior green, muted tungsten, flashlight highlights, selective red | Safety has completely disappeared |
| Chapter Eight | Blood red, crimson, charcoal, burnt orange, ash gray, firelight, smoke neutrals, limited emergency red/blue | The world itself is breaking |
| Aftermath I | Dusty gray, faded green, pale late-summer daylight, smoke-stained neutrals, autumn browns, soft evening gold, candlelight | The nightmare has ended, but nothing is normal |
| Aftermath II (2021) | Mature green, peaceful blue, warm daylight, gentle amber, subdued reflective tones | The place has recovered, but time cannot be reversed |
| 2026 coda | Desk-lamp amber, dark neutral blue, soft interior shadow, subtle screen light, wood and fabric | Someone has spent years trying to preserve what mattered |

These are lighting treatments on the same world, never changes in art quality or character style.

### 13.1 Chapter-by-chapter art direction

Each chapter's requirements and its acceptance check. Lighting detail per chapter: `LIGHTING-AND-COLOR-SCRIPT.md` §5. Places: `ENVIRONMENT-STYLE-GUIDE.md`.

| Chapter | What it must achieve visually | Requirements | Acceptance check |
|---|---|---|---|
| **Prologue** (Sun Aug 21, sunset ride) | Define what the player is going to lose; the benchmark for the whole game | Gorgeous 2011 summer street; detailed roads and sidewalks; realistic houses with interiors behind glass; golden-hour light; natural trees and lawns; authentic bikes; the four boys at final quality; subtle wind; lived-in yards; convincing riding; strong distance composition; warm depth haze | Phase One benchmark criteria (Roadmap Phase 1) and creative-director approval; first-time viewers want to keep riding |
| **Chapters One–Two** (that night; the next morning) | The same street, wrong | Do not redesign streets; darker light, deliberate framing, fewer people at night, stillness, fog in the creek strip, placed shadows; police lights on Briarwood; the morning search with flyers | Same-camera captures vs the Prologue show the same houses, trees and objects; only light, people and story props differ |
| **Chapter Three** (Alex's house; the pond road; the drains) | Descending beneath childhood | Coherent tunnel construction; wet concrete; water and drainage; aging brick where era-appropriate; mineral stains; grates; pipes; maintenance structures; flashlight interaction; echoing scale; creepy silhouettes; the drain sits under the real street plan | Night-readability test passes with the flashlight; construction checklist passes; the smiling creature receives the flashlight and casts shadows |
| **Chapters Four–Six** (Main Street; Pine Ridge and the camp; Sam's house and the works) | The ordinary town sits on something older | Consistent architecture (Old Mill lots already reuse the Prologue kit — extend to downtown); detailed interiors with correct furniture proportions; consistent doors and windows; rich materials; industrial structures with logical construction; continuity with Ch3 below and the Ch8 complex | Material families identical to the Prologue's under different light; works construction checklist passes |
| **Chapter Seven** (Sam's house; Old Mill Court; the Langes'; the chase) | Safety has disappeared; horror becomes personal | Strongest night lighting; believable interiors; powerful close-range hunter encounters; a convincing Mrs. Lange; the canonical Jamie; better acting; flashlight readability; deep shadow composition | Hunter DEV scenes (asset guide §7) read as one creature near and far; hand on the newel post and the ankle grab show real contact |
| **Chapter Eight** (the works; the breach; the surface; the deaths; the ride) | The visual climax: the world is breaking | Colossal Presence; terrifying moving sky; physically convincing destruction (torn walls, broken roof structures with exposed framing, shattered windows, fallen porches, crushed garages, fire; displaced asphalt, trench, exposed pipes, fallen poles, crushed cars, collapsed Summerfield); old, vast, mechanically coherent works; hunter consistency; emotional acting readable amid destruction; Jamie's death against a visibly devastated street; Alex's death intimate but connected to the catastrophe; the ride with the ruined town behind and light beginning to recover | Presence scale test; destruction continuity into Aftermath I; contact tests for CPR, coat and embrace; human review of both deaths with sound |
| **Aftermath I** (Aug 27 – Oct 15, 2011) | A real disaster aftermath, not a reset | Shelter as a genuine mass evacuation center (crowd density, clothing variation, children and adults, medical workers, volunteers, families, cots, blankets, supplies, missing-person boards, school architecture, natural crowd movement, clear staging for grief); persistent damage by date (`dmg.C/D/E`); the same human quality for every mourner; believable interiors (school, nurse's room, homes, garage, bedrooms, kitchen, the car); the final goodbye shows the same children from the Prologue | Damage-state tests; identity tests for the protagonist and Sam vs the Prologue; per-family grief behavior distinct (Character canon §5) |
| **Aftermath II** (~2021; separate story work, not implemented) | Rebuilt, but the past cannot be restored | Adult protagonist and adult Sam derived from 2011 identities; recognizable geography; realistically rebuilt buildings (`dmg.F`); 2021 vehicles and details; peaceful reflective light; understated melancholy; subtle traces of the past only where the story allows; **no new supernatural content** | Players recognize where the destruction was; adult Sam lineup test |
| **2026 coda** (separate story work, not implemented) | The last moment of a long memory | An intimate adult room; warm desk light; the computer showing *Last Light*; meaningful objects with their 2011 identities (photographs from the canonical models, Sam's notebook, Jamie's cap only if the save says he kept it); natural, quiet camera; nothing suggests the events were imagined | Object identity tests vs 2011 builders; the monitor shows the real Prologue rendering |

- One sky system with states: time of day, sun position, cloud layers (high wisps, mid cumulus, storm deck, catastrophe deck), atmospheric scattering approximation, fog, exposure, weather, catastrophe intensity, post-catastrophe recovery. The current `skyMat` uniform set (`day/dusk/night/storm/flash/apoc`) is the seed of this; extend it, do not fork it.
- Effects (dust, wind-blown leaves, fog, mist, smoke, rain where established, steam, embers, ash, light shafts, cloud motion, haze, emergency atmosphere) are lit by scene lights, have believable scale and motion, are bounded in count, and never read as repeating decorative particles.
- Chapter Eight's sky is not a flat red background: moving charcoal cloud structure, crimson underlighting from fires and the opening ground, burnt-orange horizon, smoke columns, depth, light that falls on the town, and the Presence's silhouette inside it.

---

## Part 15 — Cinematography (first person)

- Eye height: 12-year-old standing ≈ 1.40–1.45 m; on bike per current rig; adult (2021/2026) ≈ 1.60–1.70 m.
- Field of view: default 70–75° vertical-equivalent (PROPOSED; current values per chapter to be audited; CDA A-42), user-adjustable where supported.
- Head motion subtle; breathing motion only when exhausted, crying or hiding; turns eased; bicycle camera stable (no wheel-frequency shake).
- Camera shake: reserved for impacts, collapses and the Presence; amplitude scaled by distance; always reducible by setting.
- Story moments are **staged inside play**: characters walk into the player's natural sightline, stop at conversational distance (1.2–2.0 m), face the player, are lit by a motivated key, and hold long enough to be seen. Forced camera control is used only where the story already uses it (e.g. sitting with Alex, the car in Aftermath I) and must be brief and gentle.

---

## Part 16 — Image finishing, post-processing and accessibility

**Target stack (PROPOSED):** ACES (keep) or AgX after A/B approval (CDA A-24) → controlled bloom on true emissives only (threshold above display white, intensity low) → optional fine grain (≤ 2% luminance, user toggle) → optional very light vignette (≤ 10%). Chromatic aberration off by default (defaults: CDA A-43). No gameplay depth of field (only in inspect/photo views). No VHS distortion except where a story medium literally is video (Alex's camera playback, the 1958 film, the TVs in Chapter Four). No sharpening filter.

**Do not hide weak art behind filters.** If a scene needs fog to hide a bad model, fix the model.

**Accessibility (coordinate with the separate main-menu/settings work; do not modify it from art sessions):** brightness/gamma, graphics preset, reduced camera shake, reduced flashing (caps strobe frequency ≤ 3 Hz and contrast of the Chapter Four/Eight flashes), grain toggle, motion blur toggle if ever introduced, field of view where supported, readable captions (already adaptive from Chapter Three on). Story-critical visuals must remain recognizable on Low.

---

## Part 17 — Geography and destruction continuity

There is one Oak Hollow. Its layout lives in `dist/layout.js` and `dist/town-plan.js` (CURRENT SOURCE) and must not be moved by art work: Oak Hollow Drive and its cul-de-sac and lookout; Briarwood Lane (d 595, right) with Alex's house past the creek; Summerfield Road (d 870, left); Jamie's house (d 791, right, colonial); Sam's house (d 994, left, ranch); the Hendersons' (≈ d 1026, right) and the Kesslers' across; the Kowalskis' corner; the old oak (d 1162); Old Mill Court and the vacated lane behind the oak; the creek, culvert and easement; the storm drains and works below.

**Damage states** derive from one map (`dist/catastrophe-district.js` `DAMAGE_MAP`, `chapter8-town.js`, `chapter8-ruin.js`, `aftermath1-street.js`):

| State | When | Summary |
|---|---|---|
| `dmg.A` | Prologue–Chapter Seven (Aug 21–26, 2011) | Intact 2011 neighborhood |
| `dmg.B` | Chapter Eight surface (Aug 27, before dawn) | Active destruction, fires, smoke, ground failure |
| `dmg.C` | Chapter Eight end / Aftermath I Aug 27 | Extensive damage, emergency response, debris |
| `dmg.D` | Aftermath I, September 2011 | Fenced zones, search markings, crews, unrepaired damage |
| `dmg.E` | Aftermath I, October 2011 | Limited clearing (two shells to foundations; Kowalskis' lot cleared), temporary repairs, much damage remaining |
| `dmg.F` | Aftermath II, ~2021 | Rebuilt; same streets and lots; matured landscaping; traces of the past where the story allows |

Houses never regenerate between states without a recorded reason. Full rules: Environment guide §12.

---

## Part 18 — Time periods and age progression

| Period | Ages (STORY CANON / anchors) | Visual treatment |
|---|---|---|
| August–October 2011 | Boys 12 | Everything above |
| ~2021 (Aftermath II, not implemented) | Protagonist and Sam ≈ 22 (anchor; story text wins) | Adult proportions (≈ 7.5 heads), matured jaw and brow, adult posture, period clothing, recognizable eyes, smile and mannerisms |
| 2026 coda (not implemented) | Protagonist ≈ 27 | Mostly seen in first person: hands, sleeves, room, objects |

**Age rules:** derive the adult face from the child identity (same eye spacing ratio, iris color, brow shape family, nose type, ear shape, hairline family, characteristic smile); add adult bone growth (longer midface and jaw, stronger brow and nose bridge, narrower relative eye size); never stretch a child model; never use an unrelated adult face. **Jamie and Alex never receive living adult versions.** After 2011 they exist only as photographs, memories, objects and references, all derived from their 2011 canonical models.

---

## Part 19 — Asset philosophy

The procedural approach made fast development possible and is also the main source of the primitive look. The reconstruction uses a **hybrid** (full detail in `ASSET-PRODUCTION-PLAN.md`):

| Category | Strategy |
|---|---|
| Hero humans (4 boys, key adults) | Authored, skinned glTF meshes on one shared skeleton family, PBR textures, blend shapes or bone-driven faces; procedural code only for pose/IK and variant assembly |
| Background humans (shelter, street) | Shared skinned base meshes with texture/attachment variation, instanced or batched; economical animation |
| Creatures | Authored, skinned glTF per creature with semantic sockets (hunter contract exists); the Presence authored as hero sculpt with LOD and impostor |
| Story houses | Authored modular kit (walls, trims, windows, doors, porches, roofs) assembled procedurally from the layout, with authored interiors where entered |
| Background houses | Same kit, lower LOD, instanced; far ring as impostors |
| Vegetation | Authored species sets (trunk/branch mesh + leaf cards) with procedural placement and instancing; the oak authored as a unique hero |
| Props, bikes, vehicles | Authored glTF hero props; procedural only for placement and state |
| Roads, terrain, curbs | Keep procedural sweeps (they are good), with the shared material library and decals |
| Industrial / underground | Modular authored kit (concrete sections, pipes, grates, valves, catwalks) assembled by the existing plans |
| Destruction | Pre-fractured authored pieces and damage-state meshes from the shared damage map, not ad-hoc boxes |

All new assets must be original or verifiably licensed (`ASSET-PRODUCTION-PLAN.md` §8).

---

## Part 20 — Performance and technical feasibility

### 20.1 Measured baselines (CURRENT SOURCE; software rendering, not hardware)

- `docs/qa/visual-recovery/render-summary.json` (30 Chapter Eight/Aftermath I scenes, Mesa/ANGLE software WebGL, 1280×800): **115–1,557 draw calls**, **109,444–1,717,215 triangles**; heaviest views are Jamie's death (1,461–1,557 calls) and the surface street (1,387 calls). Software frame times 143–494 ms are **not** hardware FPS.
- `docs/ASTRA_HANDOFF.md` (Prologue era): 58–353 draw calls and 69k–588k triangles per view; ~1.43 M world triangles in 845 merged meshes plus 203 shadow proxies.
- `tests/verify.mjs` world budget: normal targets 4 M triangles / 1,500 meshes; ceilings 6 M / 2,259 world batches.
- `dist/` is 7.7 MB; the creature GLB is 2.58 MB.
- **Hardware GPU frame rate has never been measured.** Phase 0 must measure it (Roadmap).

### 20.2 Profiles (PROPOSED targets; aspirational until measured; reference hardware and targets: CDA A-45)

| | Low | Medium (default) | High |
|---|---|---|---|
| Target | 30 fps on integrated GPU at 1080p | 60 fps on mid-range discrete GPU at 1080p | 60 fps on upper-mid GPU at 1440p |
| Pixel ratio cap | 1.0 | 1.35 | 2.0 |
| Visible draw calls (typical / peak) | ≤ 400 / 600 | ≤ 800 / 1,200 | ≤ 1,200 / 1,800 |
| Visible triangles (typical / peak) | ≤ 0.8 M / 1.2 M | ≤ 2 M / 3 M | ≤ 3.5 M / 5 M |
| Sun shadow map | 1024, 60 m | 2048, 100 m | 3072–4096, 120 m + contact shadows |
| Shadowing practical lights | 0 | 1 | 2–3 |
| GPU texture memory | ≤ 300 MB | ≤ 600 MB | ≤ 1.1 GB |
| Skinned characters on screen at full rig | 4 | 8 | 12 |
| Crowd (instanced) | 40 | 96 | 150 |
| Particles alive | 1,500 | 4,000 | 8,000 |
| Post | tone map only | + bloom | + bloom, grain option, contact shadows |

Story-critical visuals (faces in key scenes, the Presence's scale, clue objects, navigation) must remain recognizable on Low.

### 20.3 Performance rules

Avoid thousands of tiny meshes, stacked transparency, unbounded particles, many shadowing lights, uncompressed huge textures, high-poly background props, duplicate rigs for one character, per-frame scene rebuilds, and expensive shaders on everything. Prefer merging by material, instancing, LOD, impostors, texture atlases, shared materials, culling by zone. Never shrink the Presence or thin the shelter crowd to save performance when a cheaper representation (impostor, LOD, instancing) preserves the image.

---

## Part 21 — The master consistency system

### 21.1 Single source of truth (PROPOSED structure; build in Phase 2)

A canonical **art registry** (proposed `dist/art/registry.js`, data only) that every chapter imports:

```
registry = {
  characters: { 'chr.jamie': { identity, ages:{a12:{…}}, wardrobe:{…}, conditions:{…}, rig:'rig.human.child', status } , … },
  creatures:  { 'cre.hunter': { model, rig, sockets, materials, scaleM, status }, … },
  landmarks:  { 'lm.old-oak': { … } },
  props:      { 'prop.jamie-cap': { builder, colors, states }, … },
  bikes:      { 'bike.alex': { … } },
  materials:  { 'mat.siding.vinyl': { … } },
  lighting:   { 'lgt.prologue.golden': { … } },
  damage:     { 'dmg.D': { … } },
}
```

Each entry carries: canonical ID; files that build it; approval status (labels above); reference-image provenance (path + approval date); owner (which session may change it); version. Chapters request entities by ID and variant; they never construct a recurring entity themselves.

### 21.2 Ownership rule

Changing a registry entry's identity data requires creative-director approval recorded in `ART-APPROVAL-REGISTER.md`. Adding a wardrobe or condition variant requires a story reason recorded in the entry.

### 21.3 Automated consistency checks (PROPOSED; see QA §5)

- Every person in every chapter resolves to a registry ID; unregistered humans fail the build test.
- For each character ID, identity geometry hash and material parameters are identical across chapters (only declared variants may differ).
- No chapter module mutates a registered character's geometry or materials (the current `chapter5Appearance` / `chapter6Appearance` / `portrait` swap pattern is retired).
- Signature props have exactly one builder.
- Damage state for each lot matches the declared state for the chapter/date.

---

## Part 22 — Verification and human approval

Real gameplay rendering on real hardware is the authority (Commandment 10). Each delivery includes the in-game captures listed in `VISUAL-QA-ACCEPTANCE.md` §2, equivalent-camera before/after pairs, identity tests, performance measurements on named hardware, and a human review. **No full-game rollout before the creative director approves the Phase One Prologue benchmark.**

---

## Part 23 — Reconstruction order (summary; detail in `FULL-GAME-VISUAL-ROADMAP.md`)

0. Source inspection, canonicalization, reference images, approvals, hardware baseline.
1. **Prologue benchmark** (four boys, bikes, houses, street, trees, golden hour, animation, camera) → creative-director gate.
2. Master asset library (boys, adults, bikes, architecture kit, materials, vegetation, lighting profiles, shared animation, registry).
3. Chapters One–Six.
4. Chapter Seven.
5. Chapter Eight.
6. Aftermath I.
7. Aftermath II and 2026 (after they exist in the main workflow).
8. Menu and interface cohesion (with the accepted menu work).
9. Full-game visual QA and final approval.

---

## Part 24 — Hard rules checklist (print this)

**Always**
- Build recurring entities from their canonical ID.
- Keep one renderer, one tone mapper, one sky, one material library, one character shader family.
- Light with motivated sources; keep night readable.
- Ground everything: contact shadows, planted feet, no floating props.
- Keep geography and damage states exactly as the shared maps say.
- Capture real gameplay for evidence; disclose review cameras.
- Record every third-party asset before committing it.

**Never**
- Create a chapter-only version of a friend, adult, creature, bike, the oak or a signature prop.
- Swap a character's geometry or materials inside a chapter module.
- Invent a fact (eye color, outfit, scar) and call it canon.
- Give Jamie or Alex a living adult version.
- Shrink the Presence or make it generic.
- Add supernatural content to Aftermath II for visual excitement.
- Use filters to hide weak models.
- Copy from NO SHELTER or any other game.
- Change gameplay, story beats, saves or the menu from an art task without the owning session's agreement.

---

## Glossary

| Term | Meaning |
|---|---|
| Identity | The permanent design of a character or creature (face, proportions, anatomy) |
| Variant | Age, wardrobe or condition derived from an identity |
| Registry | The proposed single data source for canonical IDs |
| Lighting profile | A named, data-defined set of light, sky, fog, exposure and post values |
| Damage state | One of `dmg.A`–`dmg.F` for each lot and street segment |
| Gameplay camera | The player's camera in normal play (not a review camera) |
| Review camera | A QA-only camera; captures from it must be labeled |
| CDA | Creative Director Approval required |
