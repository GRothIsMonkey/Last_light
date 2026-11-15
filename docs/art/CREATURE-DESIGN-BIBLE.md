# Last Light — Creature Design Bible

Part of the [Final Art Bible](../LAST-LIGHT-FINAL-ART-BIBLE.md). Story facts are from `docs/CHAPTER8_FULL_GAME_NARRATIVE_INTEGRATION.md`, `docs/AFTERMATH_STORY_HANDOFF.md`, `docs/CHAPTER7_CREATURE_ASSET_GUIDE.md` and the chapter handoffs. Source audit base: `c646a862b272c987b0a0b9aea690ddfc859ddda7`.

In-game text never names the Presence; characters say "it", "that", "the thing". "Presence", "hunter", "made things" and "smiling creature" are development names.

---

## 1. Design hierarchy

| Rank | ID | Creature | Why it ranks here |
|---|---|---|---|
| 1 | `cre.presence` | The Presence | The game's iconic image; climax; scale is the point |
| 2 | `cre.hunter` | Retrieval hunters | Close-range terror in Ch7–Ch8; kills Jamie |
| 3 | `cre.smiling` | The smiling creature (Danny Whitcomb, changed, 1991) | Recurs Ch3–Ch5 and Ch8; carries the lore of what the thing does to children |
| 4 | `cre.made` | The made things | Ch8 surface imitations of Danny's change |
| 5 | `cre.double` | The doubles / copies of the boys | Ch3, Ch5, Ch6; horror of the familiar |
| 6 | `fx.presence-lights` | Lights that move, go out, walk | Ch4 (streetlights), Ch5 (camp lamps, carried lights): the Presence's reach shown only as light |

## 2. Shared supernatural language

All creatures come from one underlying reality: something very old in the ground that takes children, keeps them, copies people and makes places. They share **principles**, not looks:

1. **Anatomical wrongness grounded in real anatomy.** Bones, tendons, skin folds and joints that are real enough to believe, in the wrong number, length, order or direction.
2. **Familiarity distorted.** The closer a creature is to the human, the more its horror comes from small errors (timing, symmetry, the mouth, the hands).
3. **Coherent organic construction.** Surfaces are continuous; parts grow out of each other; no visible primitives, no seams between unrelated meshes.
4. **Weight and contact.** Everything heavy displaces something: dust, water, gravel, a car's suspension, a fence.
5. **Restraint.** Show silhouette, hands, a mouth, a movement; let darkness, fog and framing keep the rest. Never a full lit turntable view in gameplay.
6. **No glow as a crutch.** Creatures are lit by the scene (flashlights, fire, the red deck). Exceptions are explicit: the skyline Presence's red under-glow is reflected fire and ground-light, not self-illumination.
7. **Shared palette family:** bone ivory, gray-beige dermis, wet dark-umber recesses, pale chalky-cream (made things, smiling creature). No saturated monster colors.

**Forbidden reads:** zombie, standard skeleton, spider, dragon, dinosaur, giant person, kaiju, generic spiky humanoid, cartoon grin, glowing eyes.

---

## 3. The hunters — `cre.hunter`

### 3.1 Identity (APPROVED direction from the brief; current implementation is the Astra build)

A gaunt, predatory **retrieval** creature: its job is to bring taken children back down. Emaciated but powerful.

| Feature | Specification |
|---|---|
| Overall | ~2.3 m if fully upright (CURRENT SOURCE `HUNTER_ASSET.height 2.3`; AI eye height = 0.88 × height); normally carried low and forward-loaded, 1.1–1.5 m at the shoulder when stalking, near-flat when running on its knuckles |
| Torso | Narrow, deep ribcage with raised ribs; pinched abdomen; visible vertebral ridge; scapulae that slide under the skin |
| Forelimbs | Elongated (forearm + hand ≥ 1.3× human ratio); long articulated fingers (≥ 3 joints each) ending in hooked talons; can grip an ankle and drag |
| Hindlimbs | Digitigrade tendency, strong; feet with spread toes that grip |
| Head | Recessed orbital cavities (no visible eyeballs at gameplay distance), nasal openings, hinged jaw with irregular tooth rows, dark throat. Tracks targets independently of the body |
| Surface | Gray-beige dermis (CURRENT `0x9c9274`, roughness .7) with folds, faint veining, tendon relief, darker wet recesses; bone `0xc7b99a` at exposed points; nails/talons `0x4c4231` |
| Movement | Low stalking with long pauses; sudden speed changes; knuckle-run pursuit; head tracking that leads the body; grabbing with real hand contact (ankle in `grab` socket); hammering doors; peeking around a newel post with the hand first |

**Must never read as:** a zombie, a skeleton, a dinosaur, a cylinder assembly, a random spiky humanoid. (Chapter Seven's first stand-in read as "a pale cartoon in daylight", `CHAPTER7_TEST_REPORT.md`; that is the failure mode to avoid.)

### 3.2 Consistency

- One identity across Chapter Seven and Chapter Eight (CURRENT SOURCE: both use `createHunterModel` in `dist/chapter7-creature.js` → `buildHunter` in `dist/astra-hunter.js`. Good).
- The **second hunter** (Ch8 trench, `chapter8-street.js` `h2`, scale 1.05) is the same species; size variation within ±8% is acceptable as an individual. PROPOSED: give it one distinguishing feature (scar, broken talon) so players know there are two (CDA A-26).
- Encounter conditions (wet from Line Two, mud, flashlight-scorched? no — nothing burns it) are condition variants on the same mesh.

### 3.3 Technical contract (keep)

The existing contract in [`CHAPTER7_CREATURE_ASSET_GUIDE.md`](../CHAPTER7_CREATURE_ASSET_GUIDE.md) remains binding for gameplay: `createHunterModel` interface; semantic states (`idle, walk, stalk, run, crawl, crouch, alert, peek, lunge, attack, grab, drag, hit, retreat`); drive values (`speed, low, look, reach, reachL, open, tilt, lunge, back, twitch`); sockets (`head, handL, handR, grab, chest, hips, footL, footR`); a separate **perception origin** that follows the original detection motion (Astra's fix; do not move the sight ray with the new head); fallbacks; GLB replacement via `HUNTER_ASSET`.

Replacement asset requirements (PROPOSED, extending the guide): binary glTF 2.0, one skinned mesh (current reader limit; Asset plan §5 proposes a fuller loader), metres, −Z forward, +Y up; ≤ 30k triangles LOD0, ≤ 8k LOD1, ≤ 60 bones (fingers included: 4 fingers × 3 + thumb × 3 per hand); ORM + normal + base color, 2048² LOD0; in-place clips for every semantic state; authored speeds; jaw and finger curl as bones; one material (dermis) + one (bone/teeth) + one (talon). The guide's "no custom shaders" line is superseded only to the extent that the shared creature material family (`mat.flesh.creature`) may use the shared material library's detail functions (see conflicts register C-09).

---

## 4. The smiling creature — `cre.smiling` (Danny Whitcomb, 1991)

### 4.1 Story identity (STORY CANON)

Danny Whitcomb, 12, Mill Street, disappeared August 21, 1991 on a green bicycle; missing two fingers of his left hand since 1988; chamber 14 (`D.W. 8/91`), `VACATED 9/91 — BREACH`: he got partly out, changed. He is the thing in the drain (Ch3), the thing on Main Street (Ch4, flinching as lights die), at the camp (Ch5, running from the lights), and in the Ch8 service corridor (his hand on the alcove beside the player's face; he flees what is coming). **His left ring and little fingers end in healed stumps in every appearance** (`dist/creature.js` injury bones). He is afraid of what is below. His fate is unresolved.

### 4.2 Current asset (CURRENT SOURCE; third-party)

"Smily horror monster" by Bento, **CC BY 4.0**, recorded in [`docs/THIRD_PARTY_ASSETS.md`](../THIRD_PARTY_ASSETS.md) (original `assets/source/creature/smily_horror_monster.glb`, runtime `dist/assets/creature/creature.glb`, 23,820 triangles, 46-joint skin, one idle clip; locomotion procedural). One instance is shared by Ch3, Ch4, Ch5 and Ch8 (`chapter8.js`: `const danny=ch3.creature`). Consistency of the instance is good.

### 4.3 Direction

- Almost human: the proportions of a child stretched and folded onto all fours; long arms; the smile is the face's resting state and never matches the eyes; eyes that track slightly wrong; stillness that lasts too long; human gestures performed imperfectly (cowering, shivering, the hand).
- Pale, chalky, slightly translucent skin in flashlight; dirt from the drains.
- He must read as **something that was a boy**: a faint echo of a 12-year-old's head shape and hands; the missing fingers visible whenever the left hand is near the camera.

### 4.4 Decision required

Keeping a third-party model as the identity of a central story character conflicts with the bible's originality goal, although its license permits use and modification with attribution. Options (CDA **A-27**):

1. **Keep** the Bento model as Danny's identity (credit retained), improve materials, rig (add locomotion clips) and the hand injury.
2. **Replace** with an original authored model that preserves the established silhouette, the smile, the gait and the missing fingers. The Bento credit stays in `THIRD_PARTY_ASSETS.md` as historical for builds that used it.

PROPOSED: option 2 in Phase 2, because Danny's identity also defines the made things (§5) and an original model allows a shared design family. Never overwrite or remove the existing license record.

---

## 5. The made things — `cre.made`

### 5.1 Story identity (STORY CANON)

"Pale, smiling, too long in the arm: copies of what it did to Danny Whitcomb, made out of what it has taken." One called for help in a woman's voice; two climbed out of the Hendersons' yard after Jamie died; one was on the police car's roof at the Kowalskis' corner. **Not Danny.** Chapter Eight's review question: "Do the made things read as 'made' and not as Danny?"

### 5.2 Current implementation (CURRENT SOURCE) — conflict

`dist/chapter8-street.js` `creature()` builds each made thing as **a hunter** (`createHunterModel`) with the skin material recolored pale (`0xcdc2b4`), scaled 0.80–0.90, and a **torus "grin" mesh pasted onto the head** (`GRIN`: a dark half-torus and a tooth half-torus). Consequences: they share the hunter's anatomy (wrong family — canon ties them to Danny's change, not to the retrieval hunter); the grin is a visible primitive (Commandment 7).

### 5.3 Direction (PROPOSED; CDA **A-28**)

- Family: derived from the **smiling creature's** design language (`cre.smiling`), not the hunter's.
- Distinguish from Danny by construction quality: they are *imitations*: symmetric where Danny is not, the smile slightly too regular, skin too smooth and uniform (as if pressed from a mold), fingers complete (no stumps — the missing fingers are Danny's alone), arms longer than his, movement copying human gestures with a lag.
- Variation between individuals: proportions ±10%, posture, one or two imitated human details (a voice, a held pose) — no clothing or human faces pasted on.
- Must still interact physically (roof of the police car, climbing out of the yard).

---

## 6. The doubles — `cre.double`

STORY CANON: the copies (Ch5 a second Jamie in Owl; Ch6 the other Sam — Reyes saw two Sams at once; Ch6 Jamie on the stairs; Ch6 the Line Two figure of Alex in the gold shirt; Ch3 the Alex-like figure and Alex's ordinary voice). "What's new can't be copied" (Ch8: the fan).

CURRENT SOURCE: Ch3 figure and Ch4 Alex use the canonical boy model; Ch5 double Jamie uses the canonical model; **Ch6 doubles use `chapter6Appearance(..., {cursed:true})`**, which replaces head, hair and body with the older Chapter Six model and adds cursed behavior (no blink, held smile, slight asymmetry, gaze offset).

Direction (PROPOSED; CDA **A-14**): a double uses the **identical canonical identity mesh** of the boy it copies (that is why it deceives), plus a *cursed behavior variant*: no blink, fixed half-smile, gaze a few degrees off the target, delayed head turns, no breath motion, footsteps that do not disturb dust/water, the copied state frozen at the moment of copying (e.g. clothes from the day it copied him — supports "what's new can't be copied"). Geometry swaps to an older model are not a valid way to show wrongness.

---

## 7. The Presence — `cre.presence` (highest priority)

### 7.1 Story identity (STORY CANON)

A living thing in the ground under Oak Hollow, older than the township's works; the 1958 construction gallery broke into the space it occupies (the original rupture, under Old Mill Court). Held in place by the living connections of the children kept in the isolation chambers. When the boys free their friends, it breaks free (Ch8 Act IV), enters Oak Hollow, is seen on the skyline before dawn by everyone in town, and is finally sealed under the dropped plug and flooded from Line Two — **not killed**. Nothing of it appears in Aftermath I.

### 7.2 Core artistic identity (APPROVED direction)

Not a conventional monster. An incomprehensibly old, alien, organic phenomenon whose anatomy follows no ordinary terrestrial rules, yet is deliberate and coherent.

| Required | Specification |
|---|---|
| Silhouette | Monumental arched central body (a vault/trunk), a **long forward-reaching neck** descending to a **deep tapered vertical opening** (no face, no eyes, no humanoid upper body), **massive angular load-bearing limbs** planted in the ground (CURRENT: eight, unequal arches), secondary articulated appendages (CURRENT: six continuous) for strikes and drags, a ridged dorsal shell with seams, hanging pleural membranes, a ribbed underside, a narrow abdomen. **Asymmetry**: unequal limb spacing and lengths; one side heavier |
| Recognizable in silhouette | At 2% of screen height against the red deck, a player can tell it from a hill, a cloud or a building: the arch, the planted limbs, the descending neck |
| Scale | Dominates the Chapter Eight skyline. CURRENT SOURCE: skyline mass radius **138** (`chapter8-street.js` `skyline()`, `r:138`, squash `[1.26,1.15,1.42]`), raised from 52; houses, poles, cars, trees and people are dwarfed; from street level the player must look up; at some angles it exceeds the frame. **Floor:** no future model may reduce its apparent angular size from the gameplay cameras listed in §7.6 |
| Originality | Unique to Last Light. The external references that informed the Astra silhouette are direction only (and are not in the repository; A-31). Not a spider, dragon, giant person, dinosaur or kaiju |
| Surface | Coherent organic mass with deep relief; layered roughness (dry ridges .8, wet folds .35); membrane translucency where feasible (back-lit by fire); controlled wetness; distinctive structural ridges; strong self-shadowing; integrates with smoke and red light. Underground: dark wet `0x2a2120`; skyline: near-black `0x140e0d` with reflected fire under-glow |
| Motion | Immense weight: slow (a limb repositioning takes 6–20 s), anatomically coordinated (load shifts before a limb lifts), occasionally impossible (a joint bending a way it should not, a limb longer than it was). Every movement has consequences: ground shudder, dust falls, fires gust, power lines sway, camera shake scaled by distance |

### 7.3 Two presentations, one organism

| Presentation | Where | Rule |
|---|---|---|
| Underground (partial) | Ch8 works: "never a whole body, never a face" (`chapter8-presence.js`): limbs through walls, a mass behind the original barrier, the breach | Same organism, seen in parts. Limbs are continuous tapered feelers (the recovery replaced visible spherical segments; keep) |
| Skyline (whole) | Ch8 surface (`c8-surface`, `c8-street`, ride) | The full silhouette inside the catastrophe deck |

CURRENT SOURCE: both are built by one function, `presenceOrganism({sky})` in `dist/astra-presence.js`, instanced by `dist/chapter8-presence.js` — keep this single-builder structure. Limb strikes are anchored to the transformed body (`VISUAL_RECOVERY_REPORT.md`).

### 7.4 Asset strategy (PROPOSED)

- Hero sculpt authored for the skyline read (silhouette first), with baked normal/cavity maps; LOD0 ≤ 150k triangles (it is one object, seen huge), LOD1 ≤ 40k; a **camera-facing impostor ring** is not acceptable for the hero view (parallax matters), but a far impostor may be used beyond 1.5 km.
- Underground limbs: authored limb segments with spline deformation (current approach) sharing the same material set.
- Animation: bone-driven at the limb level with procedural secondary motion (membranes, dorsal seams), deformation restrained so planted feet do not slide.
- Materials: `mat.flesh.creature` variant `presence` with a back-lit membrane term and the fire/ground-light response.

### 7.5 What would be a failure

- It reads as "plumbing behind glass" (the pre-reconstruction draft, per `CHAPTER8_RECONSTRUCTION_HANDOFF.md`).
- It reads as a lobed blob or a mass of overlapping parts.
- It shrinks after an upgrade.
- It has a face, glowing eyes or a mouth full of teeth.
- It floats (no ground contact at limb ends) or does not affect the town.

### 7.6 Required evaluation cameras (gameplay positions)

1. The oak lookout at the surface reveal (`c8-surface` entry).
2. Oak Hollow Drive looking north at the court from the Hendersons'.
3. The trench route on the near lawns.
4. The final ride looking back (the Presence is gone by then; the sky recovering — verify continuity).
5. The underground breach windows (`c8-breach`).

For each, record angular height and width of the silhouette and percentage of frame covered (QA §8).

---

## 8. Creature physical-presence checklist (all creatures)

- Receives scene light: flashlight, fire, red deck, emergency lights, porch lights.
- Casts shadows (at least contact/blob shadows on Low; real shadow on Medium+ for hunters within 15 m).
- Feet/hands planted: slide ≤ 3 cm per step at gameplay distance.
- Occludes and is occluded correctly by doors, cars, fences, hedges.
- Disturbs the world: dust puffs, water splash, debris, door impacts, car suspension.
- No penetration into walls, floors, cars or people at gameplay distances; grabbed victims stay attached at the socket.
- Reads at night: silhouette separates from background via rim/back light or fog contrast.

---

## 9. Creature consistency matrix (verified against source)

| Creature | Appears | Generator(s) | Shader/material | Proportions/scale | Rig | Status / issues | Consolidation |
|---|---|---|---|---|---|---|---|
| Hunter | Ch7 (garage, stairs, stealth, door, bikes, Jamie grab/drag), Ch8 (Line Four barrier, gallery stealth, flooded wing, retrieval wing/den, Hendersons' yard, Line Two) | `chapter7-creature.js` `createHunterModel` → `astra-hunter.js` `buildHunter` (one generator) | `hunter-skin` MeshStandard + `onBeforeCompile` dermis folds/veins | 2.3 m nominal | Procedural joints, two-bone IK, semantic sockets; optional GLB | Consistent. Still procedural; close-range read unverified on GPU | Authored GLB on the same adapter (Roadmap Phase 4) |
| Second hunter | Ch8 trench | Same, scale 1.05 | Same | +5% | Same | Indistinguishable individual | Distinguishing mark (A-26) |
| Smiling creature (Danny) | Ch3 drain, Ch4 Main Street/alley, Ch5 camp, Ch8 corridor | `creature.js` + `creature-asset.js` (Bento GLB, CC BY) — one shared instance | GLB PBR + catch-light shader | ×1.35 of cm source, ≈1 m crouched, 1.3 m long | GLB skin (46 joints) + procedural gait/IK | Consistent instance; third-party identity (A-27) | Decide keep/replace (A-27) |
| Made things | Ch8 surface (made-a/b/c, far-1, far-3) | **Hunter generator** recolored pale + torus grin (`chapter8-street.js`) | Hunter skin recolored `0xcdc2b4` | 0.80–0.90 of hunter | Hunter | Wrong family; primitive grin | New `cre.made` derived from smiling-creature family (A-28) |
| Far silhouettes | Ch8 surface (far-2 hunter, far-1/3 made) | As above | As above | | | Watchers only | Follow their species |
| Doubles | Ch3 Alex figure, Ch4 Alex, Ch5 Jamie (canonical); Ch6 Sam, Jamie, Alex (cursed C6 model) | `createPerson` + (Ch6) `chapter6Appearance` cursed | Boy materials / C6 materials | Same as boys | Boy rig | Ch6 geometry differs from canonical | Canonical mesh + cursed behavior (A-14) |
| Presence (underground) | Ch8 works, breach | `chapter8-presence.js` limbs + `astra-presence.js` mass | `c8-presence-skin` + `astra-presence-dermis` | Room-scale limbs | Spline-driven limbs | Consistent | Keep single builder; author hero sculpt |
| Presence (skyline) | Ch8 surface | Same `presenceOrganism({sky:true})` | Sky variant with reflected under-glow | r 138, squash [1.26,1.15,1.42] | Restrained body deformation, planted feet | Recovery-approved scale; GPU read unverified | Keep scale floor; author hero sculpt |
| Presence as light | Ch4 streetlights (`presence.js`), Ch5 camp (`chapter5-presence.js`) | Light/level systems | — | — | — | Consistent concept | Keep: the Presence is never a visible body before Ch8 |

---

## 10. Future creature asset requirements (summary)

| Creature | LOD0 tris | Bones | Textures | Clips (in place) | Sockets |
|---|---|---|---|---|---|
| Hunter | ≤ 30k (LOD1 ≤ 8k) | ≤ 60 | 2048² BC/N/ORM | 14 semantic states + idle variants | head, eye (perception separate), handL/R, grab, chest, hips, footL/R |
| Smiling creature | ≤ 25k | ≤ 55 | 2048² | idle, crawl, gallop, crouch, cower, rear, claw, flee, look | head, handL (injured), handR, chest, hips |
| Made thing (base + variants) | ≤ 18k | ≤ 50 | 1024² shared atlas | walk, crawl, climb, stand-wrong, call, turn | head, hands, roof-grip |
| Presence (skyline) | ≤ 150k (LOD1 ≤ 40k) | ≤ 40 (limbs) + procedural | 4096² body + 2048² membranes | limb shift, lean, strike, recoil, quiet | limb tips (×8 planted, ×6 striking), opening |
| Presence (underground limbs) | ≤ 20k per limb on screen | spline | shared | emerge, probe, strike, drag, retract | tip, root |

All creature assets: original or verified-licensed; recorded in `THIRD_PARTY_ASSETS.md` before commit when third-party; source files (sculpt, rig) kept under `assets/source/` with provenance.
