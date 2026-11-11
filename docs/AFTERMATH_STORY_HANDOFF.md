# Aftermath: story handoff

**Aftermath I (What Was Left) is now implemented** on `claude/aftermath1-what-was-left` (see
`AFTERMATH1_IMPLEMENTATION_HANDOFF.md`): Chapter Eight's end card has an **Aftermath I →** button, and Aftermath I ends
on its own card with nothing after it. **Aftermath II and the 2026 coda are not implemented, staged or teased.**

Sections 1–4 below are the state Chapter Eight leaves (unchanged; Aftermath I was built on them). Section 5 is the state
Aftermath I leaves for Aftermath II.

## 1. What is true when Chapter Eight ends (Saturday 27 August 2011, about 6:30 AM)

| Who / what | State at the end card | Where the player saw it |
|---|---|---|
| The protagonist | Alive, on his bike on Oak Hollow Drive, riding toward the evacuation point at the school. | The last ride. |
| Sam | Alive, riding beside him, crying on and off. Rescued from the flooded isolation wing (Act III). Knelt over Jamie; held Alex's hand at the oak and held him after he died. Carries both deaths visibly (face, walk, silences). | Scenes 6, 13, 16, 17. |
| Jamie | **Dead.** He talked Lily Henderson out of the front room, freed Mr. Henderson in the garage, and held the garage's side-door header up while the old man crawled out. The hunter came up out of the hole at the end of the yard and took him (to drag him back down: what it is for); with Reyes firing and the protagonist running at it, it slammed him down at the edge of the hole and went back into the ground. Reyes tried CPR and stopped; Sam knelt over him; the protagonist held his hand and kept his cap; Reyes covered him with his jacket and swore to come back for him (and did: he is gone from the side yard at dawn). He is not a copy and is not coming back. | Scene 13. |
| Alex | **Dead.** At the end of the operation the service hatch's counterweight arm was gone; Alex chose to hold its chain from below so the others could climb, and when the chain fouled and he let go to climb the last rungs, the steel lid came down across his back. Sam and the protagonist lifted it and pulled him out. He died sitting against the old oak, Sam holding his hand and then holding him, after "We were supposed to go riding tomorrow." Reyes left his coat over him and stayed. | Scenes 15–16. |
| Officer Reyes | Alive. Left the protagonist's and Sam's bikes on the road below the trench and follows them to the school. Witnessed the anchor board, the breach, the hunter, Jamie's death (he fired at it and tried to save him), the operation, Alex's death. He saw two Sams at once in Chapter Six; nothing has explained that away. | Throughout. |
| Mr. Brandt | Alive, **his leg broken** (the catwalk folded under him at the plug's last pin); carried up the service well by Reyes. Read Procedure 7 with them, closed main gate 2, brought the sledge. Knew the works as plumbing; now knows what they were for. | Scenes 14–16. |
| The Hendersons | Mrs. Henderson, Lily and Mr. Henderson alive (Jamie got Lily and Mr. Henderson out). Their front yard went into the ground; their garage is down. Lily heard Jamie's made-up dog, "Biscuit". | Scene 13. |
| Mrs. Pruitt | Alive; Jamie and the protagonist lifted her porch awning off her. | Scene 12. |
| The hunter (the long thing) | Killed Jamie in the Hendersons' side yard and went back into the ground; later swept down Line Two by the drawdown during the operation. Not shown dead. | Scenes 13, 15. |
| A second hunter | Came up out of the storm line in the trench on Oak Hollow Drive, searched the street, went back down it. Fate open. | Scene 12. |
| The made things | Pale, smiling, too long in the arm: copies of what it did to Danny Whitcomb, made out of what it has taken (one called for help in a woman's voice; two climbed out of the Hendersons' yard after Jamie died; one was on the police car's roof at the Kowalskis' corner). **Not Danny.** Where they went when the access was sealed is open. | Scenes 12–13. |
| The smiling creature (Danny Whitcomb, 1991) | Last seen fleeing what was coming, in the service corridor (Act II). His fate is not resolved on screen. | Scene 5. |
| The Presence (never named in game) | Not killed. The original rupture under Old Mill Court is sealed under the dropped plug and flooded from Line Two; it went quiet. Its accessible connection to the neighbourhood is cut. | Scenes 11, 15. |
| Oak Hollow | A disaster area at dawn, and it stays that way: Oak Hollow Drive gone into the storm line from about 1050 to 1095 (a car in it, the pole at 1067 down across it, the water main open); the house at 1052 leaning into the trench with its front off; the porch and roof gone at 1081; the Kesslers' (across from the Hendersons') smashed by a limb and burned to a shell; the Hendersons' front yard gone into the ground; windows blown out along the street; the Kowalskis' house burned to a frame; the Summerfield intersection collapsed with a car in it; smoke over the town; responders at Summerfield; an evacuation to the school. | Scenes 12–13, 17. |

The chapter writes this to local storage as `lastlight.chapter8`:

```json
{"home":["YOU","SAM"],"lost":["JAMIE","ALEX"],"presence":"sealed","at":<timestamp>}
```

## 2. Threads left open on purpose

- **The forgetting is not undone.** Sealing the rupture stops new loss; it does not give back what was erased.
  People and records that lost Jamie, Alex and Sam during the week stay partly wrong. The protagonist kept the three
  names because he wrote them in Sam's notebook ("Everybody was forgetting. Me too. So I wrote it down."), not
  because he was immune. Alex's camera holds a last picture nobody took (the three of them at the fire, from the
  trees). Whether the notebook and the camera survive is the aftermath's to decide.
- **Physical evidence.** Reyes has seen the anchor board and the works; the township's Procedure 7, the 1958 slip
  and licence card (No. 0417, A. Rowan), Ruth Ann Carver's 1979 Public Works book, the 1991 Whitcomb flyer and the
  1958 observation film are all physical things in the flooded works. The brief says Reyes preserves physical
  evidence; Chapter Eight leaves him in a position to.
- **The transformed victims.** No cure was found or invented. Danny Whitcomb's state is unresolved; the earlier
  victims (Annie Rowan 1958, Ruth Ann Carver 1966, Evelyn and Thomas Lange 1974) are history and records, and what
  the thing made of them.
- **Witnesses.** Residents ran past things on the street at dawn: Mr. Davis on his porch, Mrs. Pruitt, the Hendersons
  (Lily saw the thing that took Jamie), a neighbour chased across the lawns. Some will remember creatures and impossible
  events, some will not, some will remember wrongly.
- **Jamie's cap.** The protagonist picked it up off the grass by the Hendersons' garage and still has it at the end.
- **The sky.** Everyone in town saw the red deck over Oak Hollow and the thing itself on the skyline over the court
  before dawn. How that is explained afterwards (weather, fire, gas, nothing) is the aftermath's to decide.

## 3. The aftermath as briefed (for whoever builds it)

- **Aftermath I** (late August–October 2011): Oak Hollow a major disaster area; police, rescue, structural engineers,
  investigators and emergency-response organisations; National Guard only later, through normal procedure; federal
  investigators; cleanup and repair; inconsistent memories; the families grieve; Reyes keeps the evidence; the
  protagonist's family leaves Oak Hollow in October 2011.
- **Aftermath II** (about 2021): the town rebuilt and normal-looking; the protagonist returns as a young adult and
  meets the adult Sam; they revisit the old neighbourhood. Jamie and Alex remain dead. Places can be repaired; lost
  people cannot be brought back.
- **The 2026 coda:** the adult protagonist made *Last Light* to keep the true events of 2011 and remember his friends.
  The supernatural events were real.

## 4. Continuity the aftermath must not break

- Four boys in 2011: the protagonist, Sam, Jamie, Alex. AR is Annie Rowan (1958); the fifth chalk rider is her
  imprint at the oak, not a fifth friend. Alex died against the oak with the AR carving; that is place, not identity.
- Line Two is 1908 brick; Line Four and the isolation structure are 1958–1959 with 1974 work; Gate 2B keeps its
  Chapter Six mechanics (rack, pawl, broken brake).
- The 1991 Whitcomb house and Old Mill Court interiors in Chapter Seven were reconstructions; no time travel.
- Reyes saw two Sams at once (Chapter Six).
- Jamie's and Alex's deaths are real and final. Sam lives.
- The thing was sealed off from the neighbourhood, not destroyed; nobody was put back in a chamber to do it.

## 5. What Aftermath I leaves (October 15, 2011, the last of the light)

| Who / what | State at the Aftermath I end card |
|---|---|
| The protagonist | Twelve. Driving out of Oak Hollow with his mother, to his aunt's (a job for her there; the township could not certify the ground under the Drive for 12–18 months). Carries Sam's notebook (ALEX · JAMIE · SAM in his own writing; Sam's aunt's number, his dad's e-mail and "RULE 6. WRITE BACK" inside the back cover); the Sunday print from Alex's father; Jamie's cap unless it is with Jamie's mother (see the save). He wrote JAMIE on the county's list himself. He cannot remember exactly what living there was like before that week; he knows their names and that it was real. |
| Sam | Alive, staying in Oak Hollow (his family is not moving; their house is RESTRICTED, inside the fenced zone). Keeps the Tour de Oak Hollow poster ("Somebody has to"). Angry at the official story, at Jamie for going back into the yard, at all of it; refused to let the protagonist call it his fault. Practical again by October (fixed the chain twice). They plan to call; nothing beyond that is promised. |
| Jamie's mother | Has his BMX at her porch (by the rail or in the middle of the walk, where he always left it), Lily's drawing of Biscuit, and — if it was given — his cap. Leaves the porch light on. |
| Alex's parents | Have his camera back (Reyes copied the card first), his bike on its two garage hooks, every picture printed (two sets, shown at his memorial at the school on September 6). His room is untouched. His father knows about the one picture with Alex's shadow in it if the protagonist told him. |
| Reyes | Wrote down everything he saw, signed it, and has not been asked to change a word. Copied the notebook pages, the camera card and the 1959 sheet (and copied the copies). Told the boys in October that the state engineers' report (aged storm lines, a gas main, fifty years of washout) is true but not all of it. |
| Brandt | Leg in a cast (seen at both remembrances in a lawn chair / with his leg out in the aisle). |
| The Hendersons, Mrs. Pruitt, Mr. Davis | Alive; at Jamie's vigil telling what he did. The Hendersons remember the night differently on different days. |
| Oak Hollow | Still damaged. In October the fence is at Summerfield itself and shut; the Summerfield hole is filled with gravel and plated; the Kowalskis' frame is gone (a cleared lot); the trench, 1052, 1081, the Kesslers' shell and the Hendersons' yard are behind the line, the searchers' paint fading; plywood on the windows; the pole opposite the protagonist's house replaced. Below Summerfield people live, work and rake leaves. Kids from the Drive are bused to Lincoln. |
| The Presence, the hunters, the made things | Nothing of them appears in Aftermath I. Still sealed off, fates as Chapter Eight left them. |

Aftermath I's save, `lastlight.aftermath1` (written at every checkpoint and at the end card):

```json
{"cap":"you|mom","capWhen":"shelter|porch|null","notebook":"you","camera":"parents","print":true,"wrote":true,"bell":true,
 "note":"chain|bell|look","boxed":[...],"told":{...},"left":true,"section":"aftermath1-end","home":["YOU","SAM"],
 "lost":["JAMIE","ALEX"],"presence":"sealed","you":"moved away, October 2011","sam":"Oak Hollow","at":<timestamp>}
```

For Aftermath II (about 2021, still only a preferred direction): the protagonist left with the notebook; Sam stayed with
the Tour poster; the families stayed or did not as their own stories need. Nothing in Aftermath I fixes what happens
after the drive out.
