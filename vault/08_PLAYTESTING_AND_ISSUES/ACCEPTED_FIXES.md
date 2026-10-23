# Accepted fixes

Fixes that shipped in an **accepted** chapter release. "Accepted" here means the release was accepted as a whole and
later work was built on it; individual sign-off per fix is not recorded in the repository. Chapter Five's fixes are not
listed here: they are ⏳ Awaiting playtest ([Chapter Five feedback](CHAPTER5_INITIAL_FEEDBACK.md)).

## From human playtests

| Release | Problem the human reported | Fix | Source |
|---|---|---|---|
| Chapter One Astra (`9c4b576`) | Finding Jamie's and Sam's houses at night was hard | Sequential **Find Jamie.** / **Find Sam.**; permanent landmarks (Jamie's red porch chair, planter, stepping stones; Sam's blue trim and old hoop); short reminders; no arrows or minimap | `docs/ASTRA_CHAPTER1_FINAL_RELEASE.md` |
| Chapter Two (`3384204` → `68cc543`) | Bedroom fan audio glitch at Sam's window | Accumulated syllable phase; a steady fan loop; near-field pan | `docs/ASTRA_CHAPTER2_HANDOFF.md` §1 |
| Chapter Two | Backwards / upside-down porch flag | Canton at the top by the hoist; flies away from the pole | Same |
| Chapter Two | Backwards basketball hoop | Faces the street; every hoop checked (1 curbside, 12 garage) | Same |
| Chapter Two | **Companions not following from the old oak on the first attempt** (critical) | Deadlock fixed (`yieldsTo`, stall watchdog, shuffle aside, turn bikes round with you); 120 randomized trials, 0 stuck | Same |
| Chapter Three escalation → creature chase → Astra (`5be6814`) | Rebuild playtest (muted): "better but not great"; jogging escape; figure never seen; not scary; tunnel not ominous | The drain closes in; the helmet; the boy waits until seen; a real chase with a creature; the gate; the obstacle; the road figure | `docs/ASTRA_CHAPTER3_HORROR_ESCALATION_HANDOFF.md` §0, creature chase |
| Chapter Four horror revision (`f0120ba`) | The creature slid; the greater evil had no weight; the escape played itself; Jamie and Sam disappeared; the marquee was generic | Weighted planted gait; the creature afraid; five responsive routes; companions keep up; the marquee repeats their own words | `docs/CHAPTER4_HORROR_REVISION_HANDOFF.md` §1 |
| Chapter Four Astra repair (`91d5dba`, `c964777`) | "The original random color flashing" (who reported it is not stated in the doc); surface and continuity problems | Separated coplanar floors; stable textures; Old Mill houses; terrain continuity; library doors; park; car wash; gas station | `docs/ASTRA_CHAPTER4_REPAIR.md`, `docs/CHAPTER4-REPAIR2.md` (the flashing was not reproduced in software; "visual stability on the user's GPU still needs human confirmation") |

## Engineering fixes carried into accepted releases (selected)

| Release | Fix |
|---|---|
| Prologue final | Sign texture batching keyed on texture identity; post occlusion; reduced wire clutter |
| Chapter Three structural | Companions wedged on a parked car; stale caption readback; rotated basin wall box; Alex's garage roof hiding the creek; Chapter Three state surviving Start over |
| Chapter Three rebuild | Being stuck after overlapping a person or bike (you can always step away); Briarwood's far end mis-located; Start over kept the figure's place |
| Chapter Three creature chase | First frame after a jump out of the drain lit as if still in the drain; the forest glimpse rendered as a few pixels |
| Chapter Four Astra polish | Reversed curb-face winding; glass covered by trim; Lyric poster UVs; light slots flashing as the camera moved |
| Chapter Five repair (shared code, protecting Ch0–4) | Chapter Four's simple heads reappearing over Chapter Three's detailed ones after a reset (`faces.js` `enable()` no-op when unchanged) |
