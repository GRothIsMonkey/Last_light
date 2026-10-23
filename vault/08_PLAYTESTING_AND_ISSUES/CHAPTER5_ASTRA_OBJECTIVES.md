# Chapter Five — Astra objectives

> Astra's pass is the **visual reconstruction** of Chapter Five on `codex/astra-chapter5-ultra-visual-reconstruction`,
> built on the gameplay repair `d4de9ab`, plus the **escape redesign** answering the human's complaint. Source of the
> objectives: [docs/CHAPTER5_ASTRA_PREP_HANDOFF.md](../../docs/CHAPTER5_ASTRA_PREP_HANDOFF.md) and the vault brief.
> **This vault does not modify Astra's branch.** Progress notes below were read from its commit history only.

## Objective 1 — fix the escape after the double (highest priority)

The human: *"The escape after seeing Jamie's duplicate in Owl cabin was excessively long, boring, and frighteningly
ineffective."* Targets (from the [Chase design](../05_HORROR_DESIGN/CHASE_DESIGN.md) rules): a visible pursuer, events every
few seconds, 45–90 s of running, a decisive end, no empty recovery walk.

Observed on Astra's branch (`4f96fdf`, 2026-10-23; 🟡 unapproved, may change): a pursuer that follows the player's walked
path; the player pulls the slammed camp gate open while Sam holds the latch; a pump-house beat on route C; an announced
passage of time instead of 190–300 m of recovery walking; recovery prompts and a forgiving 55 s fallback at the gate.

## Objective 2 — the visual pass (everything the human judged below quality, except the sky)

Grouped as in the prep handoff:

| Area | Key deficiencies to fix |
|---|---|
| Characters (Jamie, Sam, the double) | Rig proportions, clothing (hem "hula-hoop", seams), shoes (ski soles, no contact shadow), hands (no finger grips), faces (eyelids, eyes, small low-contrast mouths, subtle expressions), hair helmets; the double's wrong-feeling idle and walk and a readable "smiling with Jamie's face"; clamp Sam's look-at pitch |
| Props | Soft backpacks with straps and real open/closed states; flashlights with lens/head/switch; one consistent skipping-stone mesh; the shirt with cloth states; the sock; the register's legibility; Alex's camera (mirrored model) |
| First-person body | Sleeves, hands, fingers; the look-down body (shorts, knees, sneakers); a seated body at the dock |
| Animation and staging | Bike mount and kickstand; reach animations; a low sidearm throw; seated legs; idle variety |
| Environment | Water (shading, reflection, shoreline, see-through shallows, real ripples/splash); ground textures; camp buildings (materials, porch ceilings, visible light sources); **a fence line at the camp gate** so the slam is a threat; gate hardware; a real porch light; a lamp post in the lot |
| Light and time of day | A smooth, **darker** night grade from the call on; no bright lavender sky at the escape; carried beams with volumetrics/bloom; holders hidden; a visible torch in hand with a hotspot; a forward camera-flash burst; faces readable at night; firelight on faces |
| Audio | Placeholder `click`, `fence`, `creak`, `cloth`, `pebble`, `splash`; no voice. Horror sound design (voices, the bell, the camp at night) |

Observed new modules on Astra's branch: `chapter5-models.js`, `chapter5-props.js`, `pine-detail.js`, `pine-forest.js`,
`pine-materials.js`; tests `tests/astra-smoke.mjs`, `tests/chapter5-ultra-capture.mjs`.

## Contracts Astra must keep (from the prep handoff)

| System | Keep |
|---|---|
| Companion minds | Goals, moods, personal space, reaction delays, `PERSON`; the rig's IK targets (`rig.js` `P`) and `applyPose` |
| Props and hands | `prop(name, obj, {grip})`, `container(name, obj, {opening})`; re-measure grips for new models |
| Garage supplies | Prop names (`supply-flashlight-*`, `supply-batteries-*`, `supply-water-*`), the table frame `TL()`, the two backpacks and `bagSteps` |
| Faces | `createFace`, `set`, `update`, `speakAudio`; two draw calls per face |
| Stones and water | `bounce`; `WADE`, `PS.shallow` |
| Gates | `GATES[id].ang` written each frame; hinge position, bar length and axis (or update `GATES`) |
| Gear and inventory | The flashlight state model; the shot timeline (press at 0.46 s); the flash borrows the spill light |
| Night | Three carried spot lights always in the scene; `BEAM_L`; `switchLight`, `aim`, `sitDown`, `hold`; `doubleWalk`; the run starts once the double is out and close (or 8.5 s) |
| Chapter Five only | `foot.fpBody`, `face.enable(on)` (no-op when unchanged), `nav.setPine(on)` (walk-in garages), the live garage footing and `slabs(true)` — all switchable so Chapters 0–4 are unchanged |
| Performance | Constant light count; no light added mid-scene |
| Interaction ranges | Spot ids `g5-*`, `p5-*`, `c5-*`; arm's-length takes (~1–1.25 m) |

## Definition of done

1. The human developer plays Chapter Five and approves it (✅ Human-approved), or lists what remains.
2. Chapters 0–4 still look and play as accepted (full regression).
3. Astra writes a handoff/release doc for the pass (none exists yet on the branch).
4. The vault is updated: [Chapter Five](../03_CHAPTERS/CHAPTER_5_THE_PLACE_IN_THE_PICTURE.md), [Open issues](OPEN_ISSUES.md),
   [Release history](../09_DEVELOPMENT_HISTORY/RELEASE_HISTORY.md).
