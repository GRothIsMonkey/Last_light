# Jamie's mother — proposed canonical identity (`chr.jamie-mother`)

**Status: PROPOSAL. Approval item A-22 stays OPEN.** Nothing below is canon until the creative director approves it. It is
the identity the `?supportcast` benchmark builds, recorded so that the later chapters can eventually show the same person.

## 1. What the game has today (verified)

| | Prologue (`dist/friends.js`) | Chapter Seven → Aftermath I (`dist/chapter7-cast.js` `JAMIE_MOM`) |
|---|---|---|
| Builder | `createPerson(CAST.mom)`: the primitive child rig × 1.13 (≈ 1.73 m), rig head | `createActor({...ADULTS.mom, …})`: **derived from Alex's mother**, adult sculpt head |
| Hair | ponytail `0x6b4a2a` | `0x5a3a22` |
| Skin, eyes | `0xd6a57f`, `0x3a2a1c` | `0xd6a57f`, Alex's mother's iris `0x4a5a3a` |
| Clothes | muted red short-sleeve shirt `0x9c3b3b`, jeans `0x3d4a66`, dark shoes | mauve long-sleeve `0x8a5a7a`, dark trousers `0x2e3442` |

Two different people. The benchmark replaces only the Prologue's; the later chapters are untouched (checked by the suite).

## 2. Proposed identity (built)

| Field | Proposal | Basis |
|---|---|---|
| Age | late thirties (about 38) | the mother of a twelve-year-old in 2011; Character Canon leaves it open |
| Stature | **1.64 m** to the crown (1.65 m to the top of the hair), within the canon's adult-women range 1.58–1.72 m; 0.09 m taller than Jamie (1.55 m) | the doorway (2.04 m leaf) and the Prologue porch; her son nearly her height but clearly a child |
| Proportions | head 0.213 m, **7.7 heads** (canon proposes 7.3–7.6: a slightly smaller head would bring her into range — a small open question); eyes at 1.536 m; shoulder joints 0.332 m apart; upper arm 0.275, forearm 0.235, thigh 0.394, shin 0.390 m; hip joints at 0.862 m | an adult skeleton of her own (`rig.human.adult`), not the child rig scaled |
| Build | average, slim-to-average; a supported, everyday bust; a natural waist; hips wider than shoulders | ordinary, not glamorous |
| Skin | warm medium-light `0xd6a57f` (Jamie's own value), warmth on the cheeks, nose and ears, a faint darkening under the eyes, a few faint freckles across the nose | family resemblance (canon: "skin, eye colour, round cheeks, warmth") |
| Eyes | warm brown, iris `0x3a2a1c` (Jamie's value); natural upper-lid crease; lids covering the top of the iris | family resemblance |
| Face | a soft oval; moderately full cheek pads (Jamie's round cheeks, in an adult); a straight nose (the Prologue spec's `nose:'straight'`); a softer jaw; a fuller lower lip; faint nasolabial folds, tear troughs and crow's-feet relief (late thirties); a few tenths of a millimetre of natural asymmetry (her left side slightly fuller and higher) | her own face: **not** Alex's mother's and not a modified Jamie |
| Hair | natural brown `0x6b4a2a` with darker roots and sun-lightened ends; combed back from a natural hairline into a practical mid-height ponytail on a dark elastic, falling to between the shoulder blades | the Prologue spec; the later chapters' `0x5a3a22` is a darker brown: **unresolved** (A-22) |
| Clothes | muted red cotton crew-neck T-shirt (rib neckband, set-in short sleeves, turned hem, untucked), mid-rise bootcut blue jeans (waistband, the break on the shoe), dark low slip-on canvas shoes with grey soles | the Prologue's outfit kept; period-plausible for an evening at home in 2011 |
| Expressions built | neutral, warm smile, calling, attentive, mild expectation; blink; plus the ARKit-style keys a later scene can combine (brows, squints, jaw, lips) | brief §14; grief is **not** built or animated |

## 3. Unresolved between the Prologue and the later chapters

1. **Hair colour:** `0x6b4a2a` (Prologue) or `0x5a3a22` (Ch7+). The benchmark keeps the Prologue's.
2. **Eye colour:** Ch7+ uses Alex's mother's green-brown `0x4a5a3a`; the proposal is Jamie's warm brown.
3. **Face:** Ch7+ shows Alex's mother's sculpt; the proposal is this new face. Rebuilding Chapter Seven and Aftermath I with
   it is later work (not started).
4. **Wardrobe:** the later chapters' mauve long-sleeve and dark trousers are a different day's clothes and may stay.
5. **Head size:** 7.7 heads against the canon's 7.3–7.6.

## 4. Where it lives

Source `assets/source/chr/jamie-mother/chr.jamie-mother.blend`; build `tools/blender/supportcast/build_jamie_mother.py`; game
asset `dist/assets/chr/chr.jamie-mother.glb`; runtime `dist/supportcast.js`. Measurements: `assets/source/chr/jamie-mother/build-stats.json`.
