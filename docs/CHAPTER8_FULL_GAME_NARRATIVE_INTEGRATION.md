# Chapter Eight: full-game narrative integration

Branch `claude/chapter8-fullgame-story-integration`, started from the recovered Astra Chapter Seven commit
`27ad0b6fcd361c023a735cf9ec8ff61e144e69e3` (base `e24f6638721da8e5f2b74b9565cb0f9598f06cbb`, full history kept).
`main` was not touched.

This document lists every change made to the Prologue through Chapter Seven for Chapter Eight, the Chapter Eight
scene that pays each one off, and the continuity rules the new chapter keeps. The earlier chapters were changed
only by small, optional additions: no approved scene, encounter, line of marquee dialogue or ending was removed
or replaced.

## 1. What the earlier chapters now plant

Each addition is something a player can find (or that happens in an existing encounter) and that nobody explains
at the time. Chapter Eight is where it is explained.

| Chapter | File(s) | What was added | Paid off in Chapter Eight |
|---|---|---|---|
| Prologue (the oak) | `dist/ending.js` | The `AR` carving in the oak has healed bark lips: an old cut, older than the boys' chalk. No name is given. | The office in the construction gallery: Mason's 1958 slip and the township licence card name the first owner of Meadowlark No. 0417, **ROWAN, A. (ANNIE), age 12**; her school picture is signed `A.R.`. The anchor board lists `CH. 1 — A.R. — 9/58`. Alex dies against the same oak; nothing says or implies that AR is Alex. |
| Chapter One (the creek) | `dist/creek.js`, `dist/chapter1.js` | An optional closer look at the grate's iron plate: `OAK HOLLOW TWP. — LINE 4 — 1958`, with older brick going on under the yards. | Sam's torn notebook page (Line Four drawn round a box nobody drew), the `LINE 4` cover in the road pushed up from underneath, the Line Four connector under the neighbourhood and its outer barrier (Act I). |
| Chapter Two (the easement) | `dist/easement.js`, `dist/chapter2.js` | Beside the culvert, a second opening plated and bolted shut: `TWP. P.W. — 1974 — NO ENTRY`. Optional, unexplained. | The 1974 isolation work under the court: the 1974 hall and the crew room (1974 paint, a 1974 radio, a calendar from 1991 nobody turned) and the 1974 row on the anchor board (`E.L. · T.L. — 4/74`: Evelyn and Thomas Lange). |
| Chapter Three (the drain) | `dist/creature.js`, `dist/chapter3.js` | The smiling creature's left ring and little fingers end in healed stumps, in every appearance. After the chase Sam and the player notice the hand. During the reveal a deep sound from far down the drain stops the creature cold: it freezes and cowers. | Act II, the service corridor: the 1991 flyer (two fingers, left hand), the same hand on the alcove beside the player's face, his name said aloud (**Danny Whitcomb, twelve, Mill Street, 1991**), and the thing fleeing what is coming. The anchor board: `CH. 14 — D.W. — 8/91 — VACATED 9/91 — BREACH`. |
| Chapter Four (Main Street, the archive) | `dist/chapter4.js` | The 1988 Courier names the Meadowlark's first owner, **A. Rowan** (No. 0417), keeping Roy Mason's purchase/repurchase history intact. The 1991 Courier gives Danny Whitcomb's missing fingers ("Two fingers. Left hand." — "…So?" — "Nothing."). The creature visibly flinches and shakes as each light dies. The accepted marquee dialogue is unchanged; no rejected "Come find him" lines were restored. | As above (Annie Rowan, Danny Whitcomb); the creature's fear of the Presence is the thing the boys see it run from in Acts II and IV. |
| Chapter Five (Pine Ridge camp) | `dist/pine-camp.js`, `dist/chapter5.js` | Beside the pump house, the township's **Valve Vault 3** on the reservoir line, its lid bent up from underneath: mud, a soup-can label, a small checkerboard sneaker print. Flooded; not a way in. | The crew room, Alex: "I got out once. There's a pipe off the end room. It goes forever. I came up in a box in the woods. The camp. I took soup. I left my shirt. I cut our letters in the wall so somebody would know. Then the lights found me. And it brought me back." |
| Chapter Six (the works) | `dist/chapter6.js` | The gallery's 1959 **Line 4 drawdown gate** at its north end beside the old speaker. While it is open the horn mutters in Reyes's voice; shutting it stops the voice mid-word ("It stopped when the gate shut." — "It's a pipe, Sam. You shut a pipe." — "Then it should've just got quieter. It stopped."). Brandt's switchgear room gets its fifth door and one line. | The final operation, objective A: shutting that same gate closes the outer routes. "That's what stopped the voice. On Thursday. When I shut it." |
| Chapter Seven (the Langes', Old Mill Court) | `dist/chapter7-lange.js`, `dist/chapter7.js` | The 1974 Courier gains one line about isolation work at the Line Four junction; Mrs. Lange's note on Tommy's wall ("NOT EVEN IF IT SOUNDS LIKE ME") and the latch on his door. The end card now offers Chapter Eight. | The room it made for Alex in the works: "That's what the court was. That's what that whole street was." — "Mrs. Lange." The anchor board's 1974 row. |

Supporting changes outside the story text (needed for the new chapter, not visible as content in earlier chapters):
`dist/game.js` (Chapter Eight wired after Chapter Seven, its own seeded random numbers, QA exposure),
`dist/dev-chapters.js` and `dist/index.html` (DEV "Chapter Eight" scenes), `dist/audio.js` (the chapter's sounds and
fire/gas loops), `dist/companions.js` (a third friend can be enlisted while Chapter Eight has him) and
`dist/companion-brain.js` (Alex's personality).

## 2. The master lore, as Chapter Eight tells it

- **The Presence** is a living thing in the ground under Oak Hollow, older than the township's works. The 1958
  construction gallery broke into the space it occupies (the original rupture, under Old Mill Court).
- **Capture.** It takes children who come near its openings, and keeps them. It can make copies of people (the
  "doubles" of Chapters Five to Seven), and it makes places: the room it made for Alex, and the court the boys
  rode into in Chapter Seven.
- **Containment.** The township's isolation structure (1958–1959, with 1974 work) held the Presence in place through
  the *living connections* of the children it held, logged on the anchor board as chambers, initials, dates and
  lost connections (`A.R. 9/58`, `R.A.C. 8/66`, `E.L. · T.L. 4/74`, `D.W. 8/91`, and three blank rows: the three
  boys). The people who ran it knew; Procedure 7 was never used because it would have killed whoever was inside.
- **The Truth (Act IV).** When the boys get their friends out, the walls start moving: "Those chambers weren't just
  holding the children." — "They were holding something else." — "When we got out, the walls started moving." —
  "The connections were keeping it in place." — "We let it out?" — "You got your friends back." — "Whatever these
  people built, it wasn't going to hold forever."
- **The final solution.** With every chamber empty, the emergency drawdown can be run without killing anyone:
  close the outer routes, turn the creek down Line Two (1908) into the central junction, and drop the original
  plug into the throat of the rupture. That seals the breach physically, not by sacrifice. It costs Jamie and Alex
  anyway, in the open, by the hunter and by the roof.

## 3. Chapter Eight, scene by scene (17 scenes, Acts I–V)

Friday 26 August 2011, 10:42 PM, to Saturday 27 August, dawn.

| Act | Scene | Phase / sections | What the player does |
|---|---|---|---|
| I | 1. Four bikes | `d8-bikes` · `chapter8-start`, `c8-bikes`, `c8-cover`, `c8-reyes` | Out of Sam's house; the four bikes under the streetlight (Alex's is back); Sam's torn page; the `LINE 4` cover pushed up in the road; Reyes: "Get away from that cover." / "They're underneath us." — "Who?" — "All of them." |
| I | 2. The missing junction | `d8-field` · `c8-field`, `c8-probe` | Brandt's 1959 sheet over the 2009 map: find MH-12 (a map puzzle); probe the field for it. |
| I | 3. MH-12 and the outer barrier | `d8-shaft` · `c8-lift`, `c8-shaft`, `c8-barrier` | Dig, vent and lift the cover on three; down the shaft. Crank the outer barrier down before the hunter, coming along Line Four, reaches it; it hits the leaf and stops. A caught player goes back to the barrier. |
| II | 4. The construction gallery; Annie Rowan | `e8-gallery` · `c8-gallery`, `c8-stealth`, `c8-office`, `c8-film` | Stealth through the 1958 gallery while the hunter searches (crouch, light off, hide). The office: Mason's slip, licence 0417, `A.R.`. The review room: wind the projector (loud); the 1958 observation film shows the wall moving while she is away. |
| II | 5. Danny Whitcomb | `e8-danny` · `c8-corridor`, `c8-danny`, `c8-bulkhead` | The service corridor and its alcoves: the 1991 flyer; his hand on the alcove; you say his name; it flees what is coming. |
| III | 6. Sam | `e8-sam` · `c8-wing`, `c8-ruth`, `c8-sam`, `c8-sam-door` | The flooded isolation wing (Ruth Ann Carver's 1979 book on the cot). Prove it's you ("What's new can't be copied": the fan); drain the wing, free the seized crank and its catch with the hunter in the wing; Sam out. |
| III | 7. Jamie | `e8-jamie` · `c8-retrieval`, `c8-jamie`, `c8-jamie-door` | The retrieval wing: it brings him back to his cell; you and Sam coordinate (Sam holds the grille); Jamie's door; it hits the grille. "You look awful." — "You look worse." |
| III | 8. Alex | `e8-alex` · `c8-shift`, `c8-made`, `c8-alex`, `c8-alex-free` | The corridor that moves behind you; the room it made (his bedroom, too clean) comes apart; at his door he doesn't believe you ("It keeps bringing you here."); prove it together, at the same time (your light, off and on, twice); two handles, two people. |
| III | 9. All four of them | `e8-reunion` · `c8-reunion`, `c8-alarm` | The crew room: talk to each of them (Sam, Alex's account of the camp, the gum, the notebook, the camera). "I thought I wasn't going to see you guys again." … "Can we just go home?" The alarm; Reyes on the radio. |
| IV | 10. The Truth | `f8-truth` · `c8-truth` | The anchor board: the tags, three blank rows, three needles down. The exact Truth dialogue above. |
| IV | 11. The Presence breaks free | `f8-breach` · `c8-breach`, `c8-escape`, `c8-ladder` | Through the long windows the ribs break outward and it comes through; the hunter runs past, *from* it. The real escape: the 1974 hall comes down ahead (round through the crew room), a beam behind you in the junction hall, crouch under the jammed bulkhead, round the limb in the gallery under the falling crane, up the ladder. Hazards are fatal with a visible warning (grit falling); failure returns to `c8-escape`. |
| V | 12. The surface catastrophe | `g8-surface` · `c8-surface` | Oak Hollow from the oak at five in the morning: the road gone into the ground, the burning house and the gas fire at the curb, the pole down, people running, emergency vehicles; at Summerfield the intersection lifts, splits and takes a car; something comes up after it. |
| V | 13. The ruined neighbourhood; Jamie | `g8-street` · `c8-street`, `c8-hendersons`, `c8-garage`, `c8-jamie-death` | The hunter seen roaming the yards. The Hendersons': the jack from her car, under the fallen header, pumped; Lily out. Mr. Henderson is trapped in the garage end; Jamie goes in and holds the doorway up; you get Lily and her mother round the hole to Reyes's car. It comes out of the hole; Jamie runs; it catches him at the curb. Reyes fires. Jamie is dead, in plain view, without gore; there is no prompt to save him. |
| V | 14. A different solution | `g8-staging` · `c8-staging` | The Mill Creek works at first light: Procedure 7, the drawdown nobody would use while anyone was inside. "There aren't now." |
| V | 15. The final operation | `n8-op` · `c8-gates`, `c8-ports`, `c8-line-two`, `c8-plug`, `c8-hatch` | A: main gate 1 on the operating bridge (Brandt has 2) (back off when the water heaves) and the gallery's Line 4 drawdown gate (Chapter Six's). B: down to junction J, open the port (Sam the far one); the hunter comes up Line Two against the flow and the drawdown takes it. Line Two (1908). C: the catwalk over the main chamber; drive out pins A, B and C with Brandt's sledge, against the wall when it strikes; the plug drops; it goes quiet. The hatch: Alex holds it; the roof comes down on him. |
| V | 16. The oak | `n8-oak` · `c8-oak`, `c8-alex-death` | Sit with Alex against the oak; Sam beside him holding his hand. "Did we stop it?" "Yeah." "Good." … "Where's Jamie?" … "We were supposed to go riding tomorrow." He dies. |
| V | 17. The last ride | `n8-ride` · `c8-ride`, `c8-look-back`, `chapter8-end` | Two bikes, you and Sam, down Oak Hollow Drive toward the school; past Sam's, the Kowalskis', Jamie's red chair. "I keep thinking they're right behind us." Look back: the road behind you is empty. The end card: Chapter Eight — THE NIGHT OAK HOLLOW FELL — August 27, 2011. The aftermath is not implemented. |

## 4. Continuity rules kept

- AR is Annie Rowan (1958), not Alex. The fifth chalk rider is not a fifth 2011 friend: there are four boys.
- Line Two is 1908 brick; Line Four is 1958; the isolation structure is 1958–1959 with 1974 work.
- The Whitcomb house of Chapter Seven was a reconstruction (the room it made for Alex says so).
- No time travel: everything happens on the night of 26–27 August 2011; the earlier victims are history, records and
  what the Presence made of them.
- Reyes directly saw two Sams at once (Chapter Six); nothing in Chapter Eight explains that away.
- Sam's Chapter Six disappearance and Jamie's Chapter Seven abduction keep their causes; Chapter Eight finds them
  where those chapters left them.
- Nobody is magically immune to the forgetting: the player remembers the three names because they wrote them in
  Sam's notebook ("Everybody was forgetting. Me too. So I wrote it down."). Sealing the rupture does not restore
  what was erased; the aftermath inherits that (see the aftermath handoff).
- In-game text never calls the thing "the Presence" (a development name): characters say "it", "that", "the thing".
- Gate 2B keeps its Chapter Six mechanics (rack, pawl, broken brake) and is not given a new job; the operation uses
  the works' main gates 1 and 2 (the panel's GATE 1 and GATE 2) and the gallery's Line 4 drawdown gate.
- Jamie's death is real: he is not later revealed to be alive or a copy. Alex's death is real.
- Chapter Eight writes `lastlight.chapter8` to local storage: `{home:['YOU','SAM'], lost:['JAMIE','ALEX'],
  presence:'sealed'}` for whatever comes after (see `docs/AFTERMATH_STORY_HANDOFF.md`).
