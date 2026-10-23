# Unanswered questions

Two kinds of open question live here:

- **Deliberately open** — a mystery the game keeps unresolved on purpose. ❓ UNKNOWN. Only the human developer can
  answer it.
- **Not yet verified** — a fact this vault could not confirm from the repository. Someone can check it.

Never write an answer in this file. Candidate answers belong in a 💡 PROPOSED section of a future-chapter note.

## Story mysteries (deliberately open)

| # | Question | What is known | Chapters |
|---|---|---|---|
| Q1 | Where is Alex? Is he alive? | Last seen Aug 21 ~8 PM; reflector, bike, helmet, wet shirt found in a trail from the creek to the drain to Pine Ridge; fresh JSA with four day-marks (🟡) | 1–5 |
| Q2 | What rings the bell? | Heard many times; never seen; the old bike's bell does not ring | 0–4 |
| Q3 | What is the old bike and why does it follow Alex? | Roy Mason's 1958 Meadowlark, licence 0417, AR scratched on it | 0, 3, 4 |
| Q4 | What is "AR"? | Chalk, oak bark, the old bike. Not Alex (no surname). | 0 |
| Q5 | Who is the fifth chalk rider? "I thought I remembered everyone." | Appears only unobserved | 0 |
| Q6 | What wears Alex's face and voice? Is it the same thing that became Jamie? | Ch3–4 false Alex; Ch5 double (🟡) | 3–5 |
| Q7 | What is the creature? Why does it fear the Presence? Why did the false Alex lead them to it? | Never named; never harmed anyone | 3–5 |
| Q8 | What is the Presence? What does it want? | Takes lights, watches, copies; "It didn't start till we found it." "Like it knew we'd come." (🟡) | 4–5 |
| Q9 | Are Ruth Ann Carver (1966) and Danny Whitcomb (1991) connected to Alex? | Same late-August window; bicycles; 1991 culvert figure and bell | 4 |
| Q10 | Whose was the second bike track on 8/24/1991? | Register only (🟡) | 5 |
| Q11 | What is in the pump house? | Circled in 1991; the first light went there; Owl's arrow points there (🟡) | 5 |
| Q12 | Who took the photograph at the campfire? | Jamie hopes Alex; "Maybe he couldn't." (🟡) | 5 |
| Q13 | Who has been eating from the pantry? | Cans gone recently; "Kids don't take soup." (🟡) | 5 |
| Q14 | Why is one light on in Owl at the end? | Final image (🟡) | 5 |
| Q15 | What does the adult narrator's frame mean (moved away in October; "meant to keep in touch")? | Prologue narration | 0 |
| Q16 | Was the Sep 1991 "Danny" on the bridge really Danny? | "He looked at me, and then he walked off toward the creek." | 4 |

## Design questions for the human developer

| # | Question | Notes |
|---|---|---|
| D1 | Can the player be caught, hurt or fail? | So far: no failure state, nothing touches anyone. The 2026-10-23 direction asks for real physical danger. |
| D2 | How many chapters remain? | Six, Seven, Eight and a possible epilogue are mentioned; none is locked. |
| D3 | Are any of the friends lost? | Nothing locked. |
| D4 | Will the Presence or creature ever be named or explained? | Never so far. |
| D5 | Do adults ever believe the boys? | Never so far. |
| D6 | How does Chapter Five's garage line "It said 'come find him'" get resolved? | Contradicts Chapter Four (OI-01). |
| D7 | Should the DEV selector be removed before release, and when? | It is marked TEMPORARY. |

## Not yet verified (facts someone can check)

| # | Question | Where to look |
|---|---|---|
| V1 | Jamie's and Sam's ages | Not stated in any doc read; search `dist/` dialogue |
| V2 | The player's street / house | `dist/chapter2.js` `morningWorld`, `dist/layout.js` |
| V3 | Chapter Three's real length (13–14 min per README vs 19.1 game min per the creature-chase test report) | Play it, or re-run `tests/chapter3-sim.mjs` |
| V4 | Whether the human explicitly approved Chapter Four repair pass 2 (`c964777`) | Ask the human developer |
| V5 | The exact date of the human's Chapter Five escape complaint | Ask the human developer |
| V6 | The exact departure order in v0.1 on `main` | `git show 21bb7a7:dist/cast.js` |
| V7 | Whether the private hosted playtest builds are current | Links are in chat reports, not in the repository |
