# Continuity discrepancies

Places where the game contradicts itself, or where repository documents disagree with the code. Found while building
the vault (2026-10-23). The vault does **not** edit game code or existing docs; each item needs a human decision or a
future pass. Story issues also appear in [Open issues](../08_PLAYTESTING_AND_ISSUES/OPEN_ISSUES.md).

## In the game itself

### C1 — "It said 'come find him'" (Chapter Five vs Chapter Four) — 🔴 Open

- **Chapter Five** (`dist/chapter5.js`, garage dialogue): Sam: *"Last night. Under the theater. It said 'come find
  him.'"*
- **Chapter Four** (accepted horror revision, `dist/chapter4.js` `MQ`): the figure under the marquee says only "Did you
  guys hear that?" / "Never mind." / "Don't run. Don't run." / "Alright, I'm this way." / "See you tomorrow." The
  structural pass's "I know where he is." / "Come find him." were ⛔ REJECTED and removed.
- The Chapter Five **first draft** had matched Chapter Four ("He said 'see you tomorrow.' It's tomorrow." / "It said what
  WE said. Like it was copying us."). The repair's rewrite of the garage introduced the contradiction.
- Options (💡, for the human developer): restore a line consistent with Chapter Four, or decide Sam is misremembering
  (not supported by anything in the game).

### C2 — The prologue's v0.1 on `main` differs from the canon prologue — informational

`main` (`21bb7a7`) has the v0.1 prologue: before "Alex leaves first" and with an end card instead of Chapter One. The
canonical prologue is the one carried in every later release. Nobody playing `main` sees the current story.

## Documents vs code

| # | Document says | Code / accepted doc says | Which to trust |
|---|---|---|---|
| D1 | Root `README.md`, Chapter Three: the pond road, detention basin, culvert voice, no chaser | Accepted Chapter Three is the access road, storm drain, false Alex, creature chase (`docs/ASTRA_CHAPTER3_CREATURE_CHASE_HANDOFF.md`, `dist/chapter3.js`) | Code / creature-chase doc |
| D2 | Root `README.md`, Chapter Four: "a 1983 boy who went missing after riding to the Pine Ridge Recreation Area" | Microfilm has Danny Whitcomb, **1991** (Mill Street; searched for at Pine Ridge) and Ruth Ann Carver, 1966; no 1983 record (`dist/chapter4.js` `ARCHIVE`) | Code |
| D3 | Root `README.md`, Chapter Four: marquee "Jamie." "Where is he?" "I know where he is." "Don't listen to him." "Come find him." | Horror revision lines (see C1) | Code |
| D4 | `dist/chapter4.js` top comment: same old marquee lines | Same as D3 | Code below the comment |
| D5 | `dist/chapter5.js` top comment: three-hour campfire; the camp gate "opens again by itself"; picture "at 6:53" | Repair: short rest; gate slams in front and Sam shoves it open; picture stamped with the rest's real time | Code below the comment / repair doc |
| D6 | `docs/CHAPTER5_PINE_RIDGE_HANDOFF.md`: garage at 1:52 PM, flashlight dies on first use, campfire lapse, double seen through door, gate reopens | `docs/CHAPTER5_GAMEPLAY_STORY_REPAIR.md` and code | Repair doc |
| D7 | Root `RELEASE_NOTES.md`: "newest work is Chapter Four: Main Street" | Chapter Five repair exists | `docs/RELEASE_NOTES.md` (top: Chapter Five first draft) and the repair doc |
| D8 | `README.md`: Chapter Three "about 13–14 minutes (scripted runs 13.1–13.7)" | Creature-chase test report: "Chapter Three, all of it (game time) 19.1 min" | Not yet verified |
| D9 | `docs/ASTRA_HANDOFF.md`: final fade line "Nobody ever said which summer would be the last." | Current `dist/story.js`: "I thought I remembered everyone." (and two revised reflections) | Code |
| D10 | `docs/ASTRA_CHAPTER1_HANDOFF.md`: "Nothing is lifted from Stranger Things: no lab, no monster, no powers, no chase." | Chapter Three (accepted) added a creature and a chase | Later accepted chapters; "no lab, no powers" still holds |

## How to resolve one

1. The human developer decides which version is canon.
2. Record it in the [Decision log](../00_START_HERE/DECISION_LOG.md).
3. Fix the code in a normal development pass (not in the vault branch), or fix the doc in a docs pass.
4. Mark the item here as resolved with the commit.
