# Chapter Two — the culvert, and the morning

> ✅ **CONFIRMED CANON.** End card: **LAST LIGHT / Chapter Two**, August 22, 2011. ("The culvert, and the morning" is the
> vault's description, not an official title.)

| | |
|---|---|
| In-world date | Night of **August 21** (seconds after Chapter One) → morning of Monday, **August 22, 2011** |
| Length | About 10 minutes played straight (scripted 9.7 game minutes) |
| Release | `codex/astra-chapter2-final-polish` @ `68cc543` (tested implementation `f9ef319`; Claude source `claude/optimistic-tesla-obxiv5` @ `3384204`) |
| Main sources | [docs/ASTRA_CHAPTER2_HANDOFF.md](../../docs/ASTRA_CHAPTER2_HANDOFF.md), [docs/ASTRA_CHAPTER2_FINAL_RELEASE.md](../../docs/ASTRA_CHAPTER2_FINAL_RELEASE.md); code [dist/chapter2.js](../../dist/chapter2.js), [dist/easement.js](../../dist/easement.js), [dist/memory.js](../../dist/memory.js) |

## Setting

The creek, then through the widened gap in its back fence into the **drainage easement** behind the yards: a concrete
V channel, an outfall headwall, a power line overhead, weeds and brush, and a **big box culvert** in a wooded rise.
Next morning: the same neighborhood in daylight, with a search under way. See
[Creek and drainage](../04_WORLD_AND_LOCATIONS/CREEK_AND_DRAINAGE.md).

## Starting conditions

Black, a quiet **CHAPTER TWO** card. Over black: "You guys heard that too, right?" "Yeah." The same creek moments later.
You have the reflector and a flashlight; Jamie and Sam are with you.

## Characters

You, Jamie, Sam; an officer; a second officer; volunteers with lights; Alex's dad. In the morning: officers, volunteers,
neighbors.

## Objectives (as shown)

**Follow the sound.** → **Search beyond the fence.** → **Check the drainage path.** → **Look at the bicycle.** →
**Step back for the police.** → **Go home.** → (morning) **Meet Jamie and Sam at the oak.** → **Go back to where Alex
turned.** (note: *Briarwood. Where he left us last night.*) → **Remember Alex leaving.** (**F — Remember**).

## Story progression

1. **The disagreement.** Sam wants the cops: "And tell them what? We heard a bike bell?" "His reflector's here." "Just a
   little farther." If you dawdle, Jamie: "Through the fence. Come on."
2. **The easement.** Evidence along the path: a **tire track** in the mud (Jamie bends to it), a lane of **flattened weeds**
   toward the channel (Sam), a **scrape** over the channel lip (Jamie). Nothing implies injury: no blood, no body.
3. **Alex's bike.** "Guys." **Alex's own green bicycle** lies on its side at the top of the bank beside the culvert, its
   **rear reflector broken out of the clip**: a jagged red sliver still in it, black tape round the bracket. It matches
   the creek piece. "That's his bike." / "The back reflector's broken off." / "Where is he?" / "Alex?"
4. **The second bell.** Silence, then **the bell, twice, from deep inside the culvert** (about 19 m in, muffled with
   echoes). Jamie and Sam turn to the mouth; Sam steps in. "Nope." / "That wasn't his bike." (The found bike's own bell
   is not what rings.)
5. **The police.** An officer comes through the gap: "Hey!" / "Kids! Stop right there." "It's Alex's." / "What?" / "His
   bike." He radios it in. Tape goes up, a second officer and volunteers arrive with lights, then **Alex's dad**.
   "We heard a bell. In there." gets "Okay." (on purpose: the grown-ups don't take it seriously). "You three need to go
   home." Coming near the bike: "Back. Now."
6. **Sent home.** "Oak. Tomorrow morning." / "Seriously?" / "Nine."
7. **August 22 card.** Bright morning by your house, bike beside you. Cruisers, volunteers, **missing-person flyers** on
   poles and the lookout fence, neighbors talking. No school (never mentioned).
8. **The oak, morning.** **The old bike is not there**, and maybe never was: the friends disagree about it. "What if he
   heard the bell?" "Come on. Briarwood."
9. **Where Alex turned.** "This is where he turned." F: **Remember**. The evening replays from your own eyes, warm and
   muffled: on his turn into Briarwood, **Alex all but stops for about 3.4 s and looks off toward the creek woods**
   behind the yards (the easement), then waves, rings and rides on, as before. You return to the morning exactly as you
   left it.
10. **The realization.** "Sam was right." / "He stopped." / "He was looking toward the creek." / "And earlier he asked if
    we heard something." / **"He heard it before he left."** They look down Briarwood; fade; end card.

## Discoveries and clues

| Clue | Label |
|---|---|
| Tire track, flattened weeds, scrape over the channel lip | ✅ |
| Alex's bike by the culvert, reflector broken out (matches the Chapter One piece) | ✅ |
| The bell twice from deep in the culvert (not from the found bike) | ✅ |
| Police and adults dismiss the bell | ✅ |
| The old bike is gone from the oak in the morning | ✅ |
| The memory: Alex stopped and looked toward the creek before he left | ✅ |
| "He heard it before he left." | ✅ |

## Supernatural events

The bell from inside the culvert. The old bike's absence (never explained; the morning world is checked to be
identical to the night: "no supernatural changes").

## Connections

- From Chapter One: the reflector, the distant bell, Sam's "He stopped first."
- To Chapter Three: "If Alex heard it before he left… maybe yesterday wasn't the first time." The culvert's water comes
  from the creek behind Alex's house and leads on to the storm drain.

## Ending

**LAST LIGHT / Chapter Two**, August 22, 2011. In current builds Chapter Three follows after a black card, a few minutes
later at the same corner.

## Gameplay systems introduced

The data-driven **memory system** (`dist/memory.js`; remembered ride hosted by `game.js`); companions route round fences
and through gaps; a morning sky; seven silent checkpoints (Behind the creek · Alex's bike · The police · The next
morning · The oak, morning · Where Alex turned · Briarwood, morning); ten QA jumps.

## Human-playtest fixes carried in this release

The Chapter One playtest found four bugs, all fixed with regression tests (`tests/playtest-fixes.mjs`): the bedroom fan
audio stutter, the upside-down porch flag, a backwards basketball hoop, and **Jamie and Sam not following from the old
oak on the first attempt** (a deadlock; fixed and swept with 120 randomized trials). See
[Earlier playtest feedback](../08_PLAYTESTING_AND_ISSUES/EARLIER_PLAYTEST_FEEDBACK.md).

## Known problems (accepted limits)

- Audio checked as signals only; never listened to.
- Adults' idle poses are stiff; "bend to look" is a simple crouch.
- Alex's "stop" in the memory is a slow roll, not a foot down.
- The supplemental morning-route test is scripted, not a human usability study.

## Release status

✅ Accepted and frozen. 230 simulation + 311 browser + 10 route checks, two continuous full-story browser runs.
