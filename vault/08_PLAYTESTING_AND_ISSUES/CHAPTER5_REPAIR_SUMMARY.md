# Chapter Five repair summary

> Branch `claude/chapter5-gameplay-story-repair`, from `claude/chapter5-pine-ridge` @ `cafc27f`; final commit **`d4de9ab`**
> (2026-10-20). Full record: [docs/CHAPTER5_GAMEPLAY_STORY_REPAIR.md](../../docs/CHAPTER5_GAMEPLAY_STORY_REPAIR.md);
> verification: top section of [docs/TEST_REPORT.md](../../docs/TEST_REPORT.md). **"It is not an approval: the chapter
> waits on human review."**

## Stages

| Stage | What | Main code |
|---|---|---|
| A | Root causes of the 36 complaints found in code (e.g. friends' target slots placed by **view heading**; `vT = pv + gap*.5`; garage footing 0.18 m above the floor; `pack()` was one F press; gates drawn but not solid; water cells unwalkable; random skip counts; camera inside the neck; the flashlight dying on first use; `C.lapse` jumping ~3 hours; sphere "orbs"; RUN on sight) | — |
| B | Jamie and Sam as people: goal-based minds, moods, personalities, reaction delays, own bikes | `companion-brain.js`, `chapter5-places.js` |
| C | Things handled for real: props and hands, the garage, Sam's feet, Jamie's sock, the map, looking down, faces | `physical.js`, `chapter5-garage.js`, `faces.js`, `on-foot.js` |
| D | The beach and the dock: stones with physics, wading, sitting | `chapter5-park.js`, `pine-plan.js` |
| E | Gates, gear, inventory, the shirt: solid gates opened by hand; flashlight state; batteries; photographs with hands; inventory | `chapter5-gates.js`, `chapter5-gear.js`, `inventory.js` |
| F | A coherent afternoon: clock (3:37 PM → night, never skipping hours); a short campfire rest; the investigation chain | `chapter5.js` |
| G | The night, earned: flashlights not orbs; the first light; three lights that copy you; the double that comes out; the gate that slams | `chapter5-presence.js`, `chapter5.js` |
| Review | Code review + frame-by-frame inspection of 22 scenes; Chapters 0–4 protected (shared changes switched on only in Chapter Five) | — |
| Final audit | Five confirmed defects fixed in `c08d35e` (Chapter Four's heads regression; the yellow gate pinning Jamie; the camera hand-over through the table; the garage footing never showing; the camera screen counter) + follow-ups (path searches inside walls; Sam wedged in the table; Sam's stand point in Owl; a Pine Ridge path-search freeze) | — |

## The investigation chain (Stage F)

The photograph and the county map (why Pine Ridge) → the old sign matches the picture (where) → the trail map and the road
to the camp (why the camp) → the 1991 register and search map (what happened here; two bike tracks; grid seven; the pump
house) → the pantry (somebody recently) → the shirt and the fresh carving with its arrow toward the pump house (Alex, and
where) → the light in the trees going that way.

## Verification

| Gate | Result |
|---|---|
| Full simulation (`QUICK=1 node tests/verify.mjs`) | **736/736** (Chapters 0–4 all pass) |
| Chapter Five alone + companions | **81/81** |
| Chromium walkthrough (segmented, sound off, Low quality) | 24 passed (end card → campfire) + 16 passed (dusk → end card); 0 JS errors; 0 WebGL warnings |
| DEV selector | All 37 Chapter Five scenes start with real clicks |
| Memory | JS heap flat 1,089–1,099 MB; renderer steady 1.67–1.82 GB |
| Review frames | 156 frames in 10 folders (`docs/qa/chapter5-repair/`) for a person to judge (captured before the final audit's fixes) |

## Not done / limits (from the report)

Not approved; art is placeholder; real-GPU frame rate unmeasured; audio placeholder; touch partial; frames are samples;
Chromium coverage segmented. Known, not fixed: Sam can linger in Owl after the shirt; the garage slab 1–2 cm above the
walk floor; the car garage's footing culled from Alex's room; the world mesh count (2,259) over the 2,000 check.

## Found by the vault (not in the repair report)

The garage line "Last night. Under the theater. It said 'come find him.'" contradicts the accepted Chapter Four (OI-01 in
[Open issues](OPEN_ISSUES.md)).
