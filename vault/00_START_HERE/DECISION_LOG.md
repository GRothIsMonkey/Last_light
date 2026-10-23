# Decision log

Newest first. Each entry says who decided (when known), what, and where it is recorded. Dates are commit dates of the
branch that carried the decision unless stated. Add new entries at the top with the
[decision template](../11_TEMPLATES/DECISION_RECORD_TEMPLATE.md).

Labels: ✅ adopted (in an accepted chapter, or a standing rule) · 🟡 adopted in an unapproved build · ⛔ REJECTED ·
💡 proposed / not decided.

## 2026

| Date | Decision | Label | Decided by / source |
|---|---|---|---|
| 2026-10-23 | *Last Light* must be a genuine horror game: meaningful jumpscares, terrifying encounters, physical danger, psychological horror, atmospheric dread, effective chases, emotional storytelling. Avoid long running without visible danger and threats that exist only as text. | ✅ standing rule | Human developer, vault brief |
| 2026-10-23 | Remaining chapters (Six, Seven, Eight, maybe an epilogue) are not final; no survivor, death, sacrifice or ending is locked. | 💡 | Human developer, vault brief |
| 2026-10-23 | Build a browser-usable knowledge vault on `docs/last-light-vault` from `d4de9ab`; do not touch Astra's branch. | ✅ | Human developer, vault brief |
| 2026-10-23 | Astra starts Chapter Five's visual reconstruction, including an interactive escape from Owl (`4f96fdf`, `4bf3902`). | 🟡 in progress | Astra branch commits (observed read-only) |
| after 2026-10-20 | The repaired escape after Jamie's double is "excessively long, boring, and frighteningly ineffective". Redesign it. | 🔴 open | Human developer playtest, reported in the vault brief (exact date not verified) |
| 2026-10-20 | Chapter Five repair finished at `d4de9ab`; it is the gameplay/story baseline for Astra. | 🟡 | `docs/CHAPTER5_GAMEPLAY_STORY_REPAIR.md` |
| 2026-10-20 | Campfire: no three-hour time-skip; a short rest at the real clock rate. | ⛔ REJECTED the lapse | Repair, complaint #28 |
| 2026-10-20 | Carried lights are flashlights with beams, never glowing spheres ("orbs"). | ⛔ REJECTED orbs | Repair, complaint #30 |
| 2026-10-20 | Dialogue talks about lights, not "people", when only lights are visible. | ⛔ REJECTED naming unseen people | Repair, complaint #31 |
| 2026-10-20 | RUN only when something visibly comes at the boys (the double walks out of Owl toward them). | 🟡 | Repair, complaint #33 |
| 2026-10-20 | Evidence is never found for the player; only progressive hints. | 🟡 (Chapter Five rule) | Repair, *Fallbacks* |
| 2026-10-20 | Chapter Five's shared-code changes are switched on only in Chapter Five, so Chapters 0–4 stay as accepted. | ✅ standing rule | Repair, *Review round* |
| 2026-10-17 | Chapter Five first draft: Pine Ridge, Camp Whippoorwill, the double; no fight; all three boys get out. | 🟡 (superseded in parts by the repair) | `docs/CHAPTER5_PINE_RIDGE_HANDOFF.md` |
| 2026-10-14 | Chapter Four repair pass 2 (`c964777`) becomes the base of Chapter Five. | ✅ | `docs/CHAPTER4-REPAIR2.md`, Chapter Five handoff |
| 2026-10-13 | Chapter Four Astra art polish (`4542392`) accepted as Chapter Four's art release. | ✅ | `docs/CHAPTER4-REPAIR2.md` ("descended from accepted Astra release `4542392…`") |
| 2026-10-11 | Chapter Four horror revision: the creature moves with weight and is **afraid of something**; five complete escape routes; Jamie and Sam keep up; the marquee figure repeats the boys' own past words. | ✅ | `docs/CHAPTER4_HORROR_REVISION_HANDOFF.md` |
| 2026-10-11 | The marquee's "I know where he is… Come find him." lines. | ⛔ REJECTED (replaced) | Same |
| 2026-10-10 | Chapter Four: the darkness that takes the lights is never shown or named (dev name: the Presence). | ✅ | `docs/CHAPTER4_MAIN_STREET_HANDOFF.md` |
| 2026-10-08 | Chapter Three Astra visual polish accepted (`5be6814`). | ✅ | `docs/ASTRA_CHAPTER3_FINAL_VISUAL_POLISH.md` |
| 2026-10-07 | Chapter Three climax: a real creature (licensed model), a real chase; the Alex-like boy becomes the lure; boy and creature are **never on screen together**; the creature is never named. | ✅ | `docs/ASTRA_CHAPTER3_CREATURE_CHASE_HANDOFF.md` |
| 2026-10-07 | Chapter Three's day shortened by 45% (one useful neighbour, Mr. Okafor). | ✅ | Same |
| 2026-10-06 | Chapter Three escalation: Alex's helmet in the drain; the boy waits until the player has actually seen him. | ✅ | `docs/ASTRA_CHAPTER3_HORROR_ESCALATION_HANDOFF.md` |
| 2026-10-06 | Chapter Three's pond road and detention basin. | ⛔ REJECTED (replaced by access road and storm drain) | `docs/ASTRA_CHAPTER3_REBUILD_HANDOFF.md` |
| 2026-10-05 | Temporary DEV chapter selector for private playtests; must never ship. | ✅ (tool rule) | `docs/DEV_CHAPTER_SELECTOR.md` |
| 2026-10-05 | Reusable player tension / heartbeat system; adaptive captions without a box from Chapter Three on. | ✅ | `docs/ASTRA_CHAPTER3_HANDOFF.md` |
| 2026-10-03 | Chapter Two's morning objective becomes "Go back to where Alex turned." with a persistent **F — Remember**. | ✅ | `docs/ASTRA_CHAPTER2_FINAL_RELEASE.md` |
| 2026-10-02 | No end menu between chapters: black, a quiet chapter card, then the next scene. | ✅ | `docs/ASTRA_CHAPTER2_HANDOFF.md` |
| 2026-10-01 | Chapter One: "Find Jamie." then "Find Sam." (Jamie first); Jamie gives the player a spare flashlight. | ✅ | `docs/ASTRA_CHAPTER1_FINAL_RELEASE.md` |
| 2026-10-01 | Alex leaves first, down Briarwood; "Go home" leads into Chapter One instead of ending the game. | ✅ | `docs/ASTRA_CHAPTER1_HANDOFF.md` |
| 2026-10-01 | "AR" stays separate and unexplained; Alex has no surname. No supernatural answer decided. | ✅ | Same |
| 2026-10-01 | "Nothing lifted from Stranger Things: no lab, no monster, no powers, no chase." | Partly superseded: the monster and the chase were later adopted in Chapter Three (accepted). No lab and no powers still hold. | Same |
| 2026-09-30 | Prologue ends on "I thought I remembered everyone."; a fifth chalk child appears only out of view; AR marks on the old bike. | ✅ | `docs/ASTRA_FINAL_RELEASE.md` |
| 2026-09-29 | Publish v0.1 to `main` without waiting for the perceptual audio review. | ✅ | Repository owner (`docs/RELEASE_NOTES.md`, v0.1 notes) |
