# Chapter One — the night Alex did not come home

> ✅ **CONFIRMED CANON.** End card: **LAST LIGHT · Chapter One · Briarwood · August 21, 2011.** ("The night Alex did not
> come home" is the vault's description, not an official title.)

| | |
|---|---|
| In-world date | Sunday, **August 21, 2011**, night |
| Time | Ride home resumes at **8:44 PM**; darkness deepens through the chapter (peak at the creek) |
| Length | About 12–15 minutes |
| Release | `codex/astra-chapter1-final-polish` @ `9c4b576` (Astra polish of Claude's `claude/relaxed-heisenberg-gv002b` @ `ed471c0`) |
| Main sources | [docs/ASTRA_CHAPTER1_HANDOFF.md](../../docs/ASTRA_CHAPTER1_HANDOFF.md), [docs/ASTRA_CHAPTER1_FINAL_RELEASE.md](../../docs/ASTRA_CHAPTER1_FINAL_RELEASE.md); code [dist/chapter1.js](../../dist/chapter1.js) (director), [dist/police.js](../../dist/police.js), [dist/people.js](../../dist/people.js), [dist/companions.js](../../dist/companions.js), [dist/creek.js](../../dist/creek.js), [dist/nav.js](../../dist/nav.js) |

## Setting

The same neighborhood at night: Oak Hollow Drive, **Briarwood Lane** and its curve past the **creek strip** (a concrete
storm channel crossing under Briarwood), **Alex's house** just round that curve (Briarwood u 127), Jamie's and Sam's
houses on Oak Hollow, the old oak at the lookout. See [The neighborhood](../04_WORLD_AND_LOCATIONS/THE_NEIGHBORHOOD.md),
[Friends' homes](../04_WORLD_AND_LOCATIONS/FRIENDS_HOMES.md), [Creek and drainage](../04_WORLD_AND_LOCATIONS/CREEK_AND_DRAINAGE.md).

## Starting conditions

You are riding home alone from the lookout. Jamie and Sam are home. Alex turned down Briarwood about an hour earlier.

## Characters

You, Jamie, Sam; two police officers; Alex's mom (on the porch with a cordless phone); Alex's dad; a neighbor across the
street (arms folded). See [Adult characters](../02_CHARACTERS/ADULT_CHARACTERS.md).

## Objectives (as shown)

*See what's happening on Briarwood.* → (after the officer) **Find Jamie.** → **Find Sam.** → meet at the oak → go the way
Alex went → the creek → *Look closer* at the reflector. Reminders: "Back on Oak Hollow. The red chair on his porch." /
"Farther toward the oak. His garage with the old hoop." Tapping Sam's window first gives "I should get Jamie first."

## Story progression

1. **The ride home** (about 25 s of quiet). A siren starts far off.
2. **The police car** comes up Oak Hollow, passes about 4.4 m from you (Doppler), and **turns onto Briarwood behind
   you**; red and blue on the houses. Your head turns to follow it.
3. **LAST LIGHT** title card.
4. **Alex's house.** Two patrol cars; porch light on, front door open, his bedroom light on; garage open with empty
   J-hooks where a bike would hang; **no bike anywhere**. The officer walks over:
   - "You were with Alex tonight?" / "Yeah."
   - "When did he leave you?" / "At Oak Hollow. He turned here."
   - Alex's dad: "He never came home."
   - "Was anyone with him?" / "No."
   - "Okay. Thank you. Head on home now, alright? We'll call your folks if we need anything."
   - Overheard: the radio, "…twelve-year-old male, last seen on Oak Hollow around eight, riding a green bicycle…"; now
     and then his dad calling "Alex!" down the street.
5. **Jamie.** Tap on his side bedroom window (two-story house, red porch chair). "Dude. What are you doing?" → "Ha. Nice
   try." → "…Wait. For real?" → "Okay. Hang on." He climbs out: "Is his mom okay? Did they say anything?" … "We have to
   help look."
6. **Sam.** His window doesn't answer (he sleeps with a fan on), so Jamie throws two pebbles. Sam: "What? My dad's still
   up." / "That's not funny." / "This is so dumb. Okay. Side door. Two minutes." He comes out of the **garage side door**
   pushing his bike: "If my dad finds out, I'm dead."
7. **The old oak.** Comparing memories: Jamie: "Okay. He turned onto Briarwood. We all saw him." You: "He waved. He rang
   his bell." Sam: "He stopped first." You: "No he didn't." Sam: "Yeah, he did. For a second." Jamie: "Back on the hill he
   asked if we heard something. Remember?" Sam: "That was nothing." Jamie: "Then let's go the way he went."
8. **Retrace.** On Briarwood, short of the bend, Jamie stops them: "Wait—stop. Cops. If they see us, we're done." (An
   officer with a flashlight on the far sidewalk is the natural limit; no invisible walls.)
9. **The creek.** Bikes left by the culvert railing. Jamie switches on a flashlight and gives you a **spare** (T toggles
   it). Optional: a faint tire line in the soft ground ("Somebody rode down here."). **The broken red rear reflector**
   with a black tape band, in the weeds by the channel, catching the light. **F: Look closer.** You: "That's his." Sam:
   "Why would he come back here?" Silence: water, katydids. Then, far off past the fence gap toward the woods, **a
   bicycle bell, twice**. Everyone turns toward it. The view rises gently toward the trees. Fade.

## Discoveries and clues

| Clue | Where | Label |
|---|---|---|
| Alex never came home; his bike is gone | Alex's house | ✅ |
| Last seen on Oak Hollow around eight, riding a green bicycle; he is 12 | Police radio | ✅ |
| Sam remembers Alex **stopped** at the turn; you don't | The oak | ✅ (resolved in Ch2's memory: Sam was right) |
| A tire line by the creek | Creek bank (optional) | ✅ |
| **Alex's broken rear reflector** (red, black tape) | Creek, by the channel | ✅ |
| **The bell, twice**, beyond the fence gap | Creek | ✅ |
| The old bike under the oak is quietly gone that night; nobody mentions it | Lookout | ✅ |

## Supernatural events

The distant two-strike bell. Nothing else is shown. "No supernatural answer is decided" (Chapter One handoff).

## Connections

- From the Prologue: Alex's route down Briarwood, his bell rung twice, "Did you guys hear that?", the old bike at the oak.
- To Chapter Two: the reflector matches the clip on Alex's bike; the bell comes again from the culvert.

## Ending

The end card (*LAST LIGHT · Chapter One · Briarwood · August 21, 2011*). In current builds Chapter Two follows
seconds later without a menu.

## Gameplay systems introduced

Free world-space night riding and walking; on-foot body, sprint with stamina, jump, crouch; the spare flashlight (T);
objectives; dialogue queue; title card; invisible checkpoints with **Continue**; QA jumps (`?qa`, `?jump=`); police
cars and emergency lights; adult NPCs; world-space companions that follow the path you actually rode. See
[06 Gameplay systems](../06_GAMEPLAY_SYSTEMS/SYSTEMS_INDEX.md).

Checkpoints: Alex's house, Jamie, Sam, the oak, the retrace, the creek. QA sections: `alex-departure`, `ride-home`,
`police`, `title`, `alex-house`, `jamie`, `sam`, `oak`, `retrace`, `investigation`, `clue`.

## Known problems (accepted limits)

- Audio never listened to by a person (siren, radio, TV through a wall, the dad's call, the bell).
- Companion avoidance is local, not global pathfinding; tight turns can make a friend pause.
- Some heavy neighborhood views exceed the 300 draw-call guidance (e.g. 549 at Sam's side door, SwiftShader).
- Touch controls lack sprint/jump/crouch/flashlight buttons.

## Release status

✅ Accepted. Final validation: 156 simulation, 184 browser checks, 219 captures, 0 errors (validated runtime `ec67022`).
