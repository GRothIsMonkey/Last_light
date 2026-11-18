# Last Light — Creative-Director Approval Register

Part of the [Final Art Bible](../LAST-LIGHT-FINAL-ART-BIBLE.md). Every visual decision that must be made by the creative director before the work that depends on it. **Nothing in this register has been approved yet.** Status values: OPEN · APPROVED (date, decision) · APPROVED WITH CONDITIONS · DEFERRED (until phase).

The bible's general direction (CINEMATIC NOSTALGIC HORROR REALISM, the ten commandments, the color script, the Presence's scale and originality, the hybrid asset strategy) is approved by the creative director's brief. The items below are the specifics that brief left open, or that the audit found in conflict.

How to record a decision: change Status to `APPROVED 2027-MM-DD — <decision>` and link the approved reference image or sheet. Do not delete rows.

---

## Characters

| ID | Decision | Evidence / why | Options | Recommendation | Blocks | Status |
|---|---|---|---|---|---|---|
| A-01 | Protagonist's final face | Current: `CAST.player` face params shared in part with Jamie (eye gap/height) | Approve sheet | Understated, observant; lopsided neutral mouth | Phase 1 | OPEN |
| A-02 | Eye colors of the four boys | Not in story text. Current: protagonist brown `0x3a3020`, Jamie dark brown `0x3a2a1c`, Sam very dark brown `0x2a1c12`, Alex green-hazel `0x4a5a3a` (shared with his parents) | Adopt current / change | Adopt current (Alex's green-hazel is the family trait) | Phase 1 | OPEN |
| A-03 | Protagonist's hair | Current: cropped, medium brown `0x5a4030` | Approve sheet | Short, natural, end-of-summer growth | Phase 1 | OPEN |
| A-04 | Protagonist's wardrobe set | Current summer shirt `0x7f93ab`; "Your Tour shirt" exists as an object; Ch7 pass added a wristband now lost (conflict C-11) | Approve outfits per day/scene; wristband yes/no | Keep current summer outfit; decide wristband game-wide | Phase 1–2 | OPEN |
| A-05 | Jamie's hair without the cap | Generated `'cropped'` fallback, never designed | Approve sheet | Short, thick, slightly flattened by the cap | Phase 2 (Ch8 death, A1 portrait) | OPEN |
| A-06 | Jamie's freckles | Present only in the Ch7 Astra pass (now unreachable); not in story text | Freckles game-wide / none | Light freckles game-wide (accepted in the Ch7 review) | Phase 1 | OPEN |
| A-07 | Jamie's cap orientation | STORY: "The one he turns backwards when he rides." Model: always brim-forward | Backwards riding + forwards on foot / always backwards / always forwards (and amend the line — story owner's call) | Backwards on the bike, forwards on foot | Phase 1 | OPEN |
| A-08 | Jamie's wardrobe details | STORY: orange shirt with a hole in the sleeve (not modeled). Ch7 pass added a "faded club shirt" graphic (now unreachable). Does he change clothes over Aug 21–26? | Approve shirt design (hole, graphic or not) and day-by-day outfits | Same orange shirt every day the story shows him (it is his identity), with the sleeve hole; graphic: CDA | Phase 1 | OPEN |
| A-09 | Jamie's final face | Current round/full-cheeked grin face | Approve sheet | Most expressive face of the four | Phase 1 | OPEN |
| A-10 | Sam's final face | Current narrow, closest-set eyes, straight nose | Approve sheet | Long, narrow, deep-set expressive eyes | Phase 1 | OPEN |
| A-11 | Sam's family resemblance | Sam skin `0xc4906a`; father `0xd9b394`; mother = Alex's mother's spec (`0xe2b898`, green-hazel iris) | Recolor Sam / new parents / accept | New identity for Sam's mother; align family skin/eye traits | Phase 2 | OPEN |
| A-12 | Sam's hair | Current shaggy near-black, longer at the back | Approve sheet | Shaggy, falls to the eyes | Phase 1 | OPEN |
| A-13 | Sam's wardrobe set | Current sage-teal shirt; hoodie and helmet exist in his room; after the flooded-wing rescue: wet, what else? | Approve outfits | Summer outfit; hoodie at night scenes where cold/wet is shown (only if story allows) | Phase 2 | OPEN |
| A-14 | How the doubles look | Ch6 doubles currently use the older Ch6 model (contradicts the Ch6 handoff's "same model as real Jamie"); Ch3/4/5 doubles use the canonical model | Canonical mesh + cursed behavior / distinct mesh | Canonical mesh + cursed behavior | Phase 2–3 | OPEN |
| A-15 | Alex's final face | Current wide-set eyes, soft jaw, closed smile | Approve sheet | Gentle, listening | Phase 1 | OPEN |
| A-16 | Alex's hair | Docs: "swept brown hair"; current `'swept'`, `0x7a5230` | Approve sheet | Side-swept fringe, lightest hair of the four | Phase 1 | OPEN |
| A-17 | Alex's clothes when rescued in Ch8 | His gold shirt was left wet in Owl (Ch5) and carried by Sam (Ch6) | Story owner decides what he wears; art follows | Ask the story owner; then design the variant | Phase 5 | OPEN |
| A-18 | Reyes: age and hat | Age not established; "his hat off" in Ch8 | Approve sheet, age, uniform set incl. hat | Late 30s–40s; patrol cap exists and is shown in that beat | Phase 2 | OPEN |
| A-19 | Brandt: age, glasses, vest | Gray cropped hair; yellow work shirt with bands (primitive torus bands today) | Approve sheet | Late 50s–60s; authored hi-vis vest; glasses only if approved | Phase 2 | OPEN |
| A-20 | Adult protagonist (2021, 2026) | Not built | Approve sheets derived from A-01 | Landmark-preserving age progression | Phase 7 | OPEN |
| A-21 | Adult Sam (2021) | Not built | Approve sheet derived from A-10/A-12; hairstyle in 2021 | Keep the hair long enough to push back | Phase 7 | OPEN |
| A-22 | The mothers' identities | Jamie's mother has two models (Prologue `CAST.mom` vs Ch7+ `JAMIE_MOM`, two hair colors); both Jamie's and Sam's mothers derive from Alex's mother | Approve three separate sheets; pick Jamie's mother's canonical hair (`0x6b4a2a` Prologue vs `0x5a3a22` Ch7+) | Three new identities; Jamie's mother resembles Jamie | Phase 1 (Prologue door), Phase 2 | OPEN |
| A-23 | Minor identities | Lily uses the hoop kid's boy spec with an adult head (age not stated); Mrs. Pruitt (Ch8) vs Mr. Pruitt (Ch3) relationship; is florist Mrs. Kowalski of the Kowalskis' house? | Story owner answers; art builds | Lily: own girl identity, age per story; others as answered | Phase 2/5 | OPEN |
| A-41 | Boy heights and proportions | Current rig: all four 1.53 m; proposed 1.50–1.55 m (Character canon §3.5) | Approve lineup | Proposed values | Phase 1 | OPEN |

## Creatures

| ID | Decision | Evidence / why | Options | Recommendation | Blocks | Status |
|---|---|---|---|---|---|---|
| A-26 | The second hunter's distinguishing mark | Same model ×1.05 | Mark / none | One mark (broken talon or scar) | Phase 5 | OPEN |
| A-27 | The smiling creature (Danny): keep the CC BY Bento model or replace with an original | Third-party identity for a central character; license allows use with attribution | Keep and improve / replace with original preserving silhouette, smile, gait and the missing fingers | Replace in Phase 2; keep the license record | Phase 3 (Ch3) | OPEN |
| A-28 | The made things' design | Implemented as pale hunters + torus grin | Derive from the smiling-creature family (distinct from Danny) / keep hunter-based | Derive from the smiling-creature family | Phase 5 | OPEN |
| A-31 | Creature and character reference images | Astra's "supplied references" are not in the repository; originality rule | Commit originals with provenance / replace with original sheets | Commission original sheets; keep any external images out of the repo unless licensed | Phase 0 | OPEN |
| A-33 | Final Presence model | Current Astra organism (r 138 skyline) | Approve hero sculpt at the evaluation cameras | Keep silhouette family; author hero sculpt; scale floor | Phase 5 | OPEN |
| A-34 | Final hunter appearance | Current Astra procedural hunter | Approve authored model at the Ch7 DEV scenes | Keep the Astra direction | Phase 4 | OPEN |

## Environment and objects

| ID | Decision | Evidence / why | Options | Recommendation | Blocks | Status |
|---|---|---|---|---|---|---|
| A-25 | Photograph method | Ch7 renders models; A1 draws canvas figures | Render-to-texture everywhere / illustrations | Render-to-texture with a period camera look | Phase 2 | OPEN |
| A-29a | The oak's species and exact silhouette | Procedural `kind:'oak'` landmark today | Approve sheet | White oak, asymmetric low limb toward the swing | Phase 1 | OPEN |
| A-29b | The oak in Chapter Eight | Not described as damaged | Undamaged / limb damage / scorched | Standing; ash on leaves; no structural damage | Phase 5 | OPEN |
| A-30 | The protagonist's bike type | "road-kid" geometry with riser bars | 24" hybrid / BMX-like / MTB-lite | 24" hybrid (matches current geometry) | Phase 1 | OPEN |
| A-32 | 2021 rebuilt lots and any memorial | Not designed; story only says the town is rebuilt | Approve per-lot plan; memorial yes/no (story owner) | Newer houses where the trench was; repaved seam; replaced pole; memorial only if story approves | Phase 7 | OPEN |
| A-35 | Material benchmark | Phase 1 material library | Approve captures | — | Gate 1 | OPEN |
| A-36 | The 2026 room and its object set | Not built; cap only if the save allows | Approve layout, objects, lighting | Desk, monitor with *Last Light*, the notebook, the Sunday print, the cap (save-dependent) | Phase 7 | OPEN |
| A-37 | Shelter crowd realism tier | 96 instanced faceless evacuees | Accept tier / raise near rows to secondary quality | Shared crowd bases with LOD faces | Phase 6 | OPEN |

## Rendering, lighting, technical

| ID | Decision | Evidence / why | Options | Recommendation | Blocks | Status |
|---|---|---|---|---|---|---|
| A-24 | Tone mapping | ACES today | Keep ACES / AgX (r160 supports both) | A/B in Phase 1 on hardware; keep ACES unless AgX clearly better for skin under red light | Gate 1 | OPEN |
| A-38 | Flashlight color | Jamie's spare (2011) — incandescent or early LED? | Incandescent warm / LED cool / mixed per flashlight | Jamie's spare incandescent; Sam's Ch5 flashlights early LED | Phase 3 | OPEN |
| A-39 | Storage of large source assets | Repo already holds a 12.9 MB original GLB | Git LFS / external archive with hashes / plain git | External archive or LFS; decide before Phase 2 | Phase 2 | OPEN |
| A-40 | High-texture package | Offline package size target ≤ 150 MB (Medium) | Single package / separate High package | Separate optional High package | Phase 9 | OPEN |
| A-42 | Default field of view | Not audited per chapter | Approve default + user range | 70–75° vertical-equivalent default, user-adjustable | Phase 1 | OPEN |
| A-43 | Post stack details | No post today | Bloom/grain/vignette on by default? | Bloom on (restrained); grain off by default, user toggle; vignette ≤ 10% | Gate 1 | OPEN |
| A-44 | Aftermath II time of day | Not specified | Approve | Late afternoon into golden hour, echoing the Prologue | Phase 7 | OPEN |
| A-45 | Performance profiles and reference hardware | Targets in bible §20.2 are aspirational; no hardware baseline exists | Approve hardware set and targets after Phase 0 | — | Gate 0 | OPEN |
| A-46 | AI-generated assets | Policy in Asset plan §8.4 | Allow per class / disallow | Allow for reference exploration only unless approved per asset | Phase 0 | OPEN |
| A-47 | Environment map (image-based reflections) for authored PBR materials | Phase 0A: the game has no `scene.environment`; Blender-authored metal and glossy materials show direct highlights only ([PHASE-0A-GRAPHICS-ARCHITECTURE.md](PHASE-0A-GRAPHICS-ARCHITECTURE.md) L-6) | None / one neutral PMREM per lighting profile / per-scene captured maps | Per-profile PMREM from the sky shader, faded by the lighting script; test on the probe first | Phase 1 (hero bikes, eyes, wet skin) | OPEN |
| A-49 | The four authored bicycles (`bike.jamie`, `bike.sam`, `bike.alex`, `bike.player`), Phase 1 benchmark | Built in Blender on the rig.js anchors, one shared kit and texture library; Jamie's incorporates CC BY 4.0 geometry from the supplied Sketchfab BMX ([../BIKES_PHASE1_REPORT.md](../BIKES_PHASE1_REPORT.md)). Shown only with `?bikes` and in the Bike Lab | Approve / revise / reject, per bike | Review in the game with `?bikes` on real GPU hardware | Production swap of the bikes in every chapter | OPEN |
| A-50 | Front-fork offset: the authored front axle sits ahead of the steering axis (Jamie 30 mm, Sam 40, Alex 45, protagonist 40), where rig.js puts it behind (12–39 mm). Wheelbases grow 5–8 cm; nothing else moves (pivot, rake, grips, saddle, BB, rear axle, crank, pedals unchanged) | A real fork's legs run parallel to, or ahead of, the steerer; rig.js's numbers would need forks raked backwards. `G.front` is used only to place the front wheel ([../BIKES_PHASE1_REPORT.md](../BIKES_PHASE1_REPORT.md) §4) | Keep the authored axle and update `rig.js STYLES[*].front` at the production swap / keep rig.js and bend the forks backwards | Keep the authored axle; change `front` in `rig.js` (one number per style) when the bikes are approved | Production swap | OPEN |
| A-30 note | The protagonist's bike is modelled as the recommended **24-inch hybrid** (riser bar, 1×7, V-brakes, bell, reflectors), the rig.js `road-kid` geometry | — | — | — | — | (see A-30) |
| A-48 | Hand grip and foot-on-pedal contact for authored characters | Phase 0A measured with the probe: `socket_grip` 3.8–3.9 cm from the bar, ball of the foot 7–8 cm from the pedal under the current `ridePose` targets ([BLENDER-PIPELINE.md](BLENDER-PIPELINE.md) §4, §9) | Re-tune `ridePose` targets for authored hands and feet / socket-driven IK / keep | Socket-driven IK for hands; re-tuned ankle offset for feet; contact tests updated | Phase 1 (first hero character) | OPEN |

## Gates

| Gate | Requires | Status |
|---|---|---|
| Gate 0 | A-01…A-23 decided or deferred; A-31, A-41, A-45, A-46; hardware baseline | OPEN |
| Gate 1 | Prologue benchmark accepted; A-24, A-35, A-42, A-43 | OPEN |
| Gate 2 | Master library accepted | OPEN |
| Phase gates 3–9 | Per roadmap | OPEN |
