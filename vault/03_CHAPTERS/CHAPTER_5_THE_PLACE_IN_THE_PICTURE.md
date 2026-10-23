# Chapter Five — The Place in the Picture

> 🟡 **IMPLEMENTED BUT UNAPPROVED.** This note describes the **gameplay and story repair**
> (`claude/chapter5-gameplay-story-repair` @ `d4de9ab`), the baseline the human developer named for current work. It is
> not approved: the human reported that the escape after Jamie's double is too long and not frightening, and Astra's
> visual reconstruction (with a redesigned escape) is in progress. Chapter card: **THE PLACE IN THE PICTURE / Chapter
> Five**. End card: **LAST LIGHT / Chapter Five / August 24, 2011.** No Chapter Six button.

| | |
|---|---|
| In-world date | Wednesday, **August 24, 2011** |
| Clock (repair) | Out of Sam's garage ~**3:37 PM**; Pine Ridge ~4:20; the camp before 6; the campfire ~6:37–6:45; Owl ~7:30; the call ~7:43; three lights ~7:52; the split ~8:02; the double ~8:08; RUN ~8:11; out ~8:17; the last image ~8:25 (`HOUR` in `dist/chapter5.js`). Time runs at about four times real time by day and never skips hours. |
| Length | 35–45 minutes with exploring; the scripted direct simulation run took 30.5 game minutes (first draft 24.6) |
| Code | Director [dist/chapter5.js](../../dist/chapter5.js); [chapter5-garage.js](../../dist/chapter5-garage.js), [chapter5-park.js](../../dist/chapter5-park.js), [chapter5-gates.js](../../dist/chapter5-gates.js), [chapter5-gear.js](../../dist/chapter5-gear.js), [chapter5-presence.js](../../dist/chapter5-presence.js), [chapter5-places.js](../../dist/chapter5-places.js), [companion-brain.js](../../dist/companion-brain.js), [physical.js](../../dist/physical.js), [faces.js](../../dist/faces.js), [inventory.js](../../dist/inventory.js); world [pine-plan.js](../../dist/pine-plan.js), [pine-build.js](../../dist/pine-build.js), [pine-camp.js](../../dist/pine-camp.js), [pine-art.js](../../dist/pine-art.js) |
| Docs | [Repair record](../../docs/CHAPTER5_GAMEPLAY_STORY_REPAIR.md) · [Astra prep handoff](../../docs/CHAPTER5_ASTRA_PREP_HANDOFF.md) · [First-draft handoff](../../docs/CHAPTER5_PINE_RIDGE_HANDOFF.md) (story and world; superseded where the repair differs) · [Test report](../../docs/TEST_REPORT.md) (top two sections) · [DEV selector](../../docs/DEV_CHAPTER_SELECTOR.md) |

## Setting

North out of town on Mill Street (past its LOCAL TRAFFIC ONLY sawhorse) onto the **Old Reservoir Road**: fields, a farm,
a climb over a wooded ridge, the reservoir below. **Pine Ridge Park** (fee booth, lot with bike rack and lamp, picnic
shelter, lawn to the water, public dock, playground, restroom, trail kiosk, a pebble beach), the **old gravel lot** with
the original brown sign, a **yellow swing gate** and the Reservoir Authority's gray shed; a **gravel road** along the
north shore to **Camp Whippoorwill** (closed): office, clearing with flagpole and dinner bell, lodge with pantry, six
cabins (Robin, Bluejay, Cardinal, Wren, Heron, **Owl**), washhouse, maintenance shed, **pump house**, campfire circle,
camp dock; a **service road** past the pump house and over the **dam** back to the park's south shore. See
[Pine Ridge](../04_WORLD_AND_LOCATIONS/PINE_RIDGE_RECREATION_AREA.md) and [Camp Whippoorwill](../04_WORLD_AND_LOCATIONS/CAMP_WHIPPOORWILL.md).

## Starting conditions

Chapter Four's end card has a **Chapter Five →** button. The boys have Alex's camera with the picture of the TV screen
(Pine Ridge Recreation Area). Sam's mom is at work until six and thinks they are at Jamie's.

## Characters

You, Jamie, Sam. No adults appear. At night: the Presence's lights and voices, **Jamie's double**, and the creature.

## Story progression

### Sam's garage (afternoon)

- Sam: "Mom's at work till six. She thinks we're at Jamie's." "Come help me. I've got a list." **You pack by hand**
  (F on a supply, F on Sam's bag); Sam packs the rest: three flashlights, two battery packs, three waters, granola bars,
  the county map, **Alex's camera** (Sam holds it out across the table; you take it).
- **Jamie** arrives late wearing his backpack ("Sorry. Sorry, sorry. My mom."), swings it round, opens it, pulls out
  **one sock**: "…I packed one sock." Sam hands him granola bars without a word. "…Thanks." "You brought a sock."
  "It's a good sock."
- **Why Pine Ridge:** Sam's county map on the table: "Mill Street goes out past the sawhorse. Then it's the Old Reservoir
  Road. Up over the ridge." Jamie: "And down to Pine Ridge. Where the TV said." You: "Pine Ridge Recreation Area. It was on
  the sign. In his picture." Sam: "Where they looked for Danny Whitcomb. In ninety-one. It was in the paper." "It's like
  four miles. Big hill." Jamie: "Alex rode out there. I know he did."
- Sam: "Last night. Under the theater. It said 'come find him.'" ⚠️ **Continuity error**: the accepted Chapter Four
  figure no longer says that (see [Open issues](../08_PLAYTESTING_AND_ISSUES/OPEN_ISSUES.md), OI-01). Sam: "What if that's
  what it wants? Us. Out there." Jamie: "Then Alex is out there too." "I'm going." Sam: "…I know. I packed, didn't I?"
- The plan: **"We stay together. We look. We're back before dark."** "Before dark. Deal." Jamie and Sam walk to their own
  bikes, kick the stands up, get on and wait at the end of the driveway.

### The ride and the park

- **The race to the ridge** (Jamie: "Race you to the top. Loser buys slushies." Sam: "I'm not racing."). Either winner is
  fine. From the crest, the reservoir.
- **Pine Ridge Park.** "It's bigger than I remember." The new park sign "says Pine Ridge Park"; Alex's picture says
  Recreation Area: "Then it's an old picture. Or an old sign." Bikes locked to the rack with Sam's dad's cable lock; on foot
  from here.
- **Skipping stones** (optional): pick up a flat stone, hold F to wind up, release; real skip physics. Jamie's 3, 4, 2;
  Sam's plunk ("…Physics."), then a crouched six. You can wade the shallows.
- **The end of the dock** (optional): all three sit, legs over the water. "He fished off this dock for three hours. And he
  caught one shoe." "Gary." "He named it Gary." "He kept it. It's on the shelf in his garage. With the trophies." "We came
  here like four times last summer." "Five."
- **The place in the picture.** Alex's last picture is a photo of a TV: Alex walking toward whoever held the camera, a
  brown wooden sign, a yellow gate, a gray shed. With the camera up (V), it matches only from the right spot: the **old
  gravel lot**. "…This is it." "He was standing right here." "Walking toward—" "Toward whoever had the camera."
- **The trail map** at the kiosk: the gravel road goes to **Camp Whippoorwill**. "'Youth camp. Permit only.'" "Somebody
  taped CLOSED on it." "Why would Alex go to a summer camp?"
- **The yellow gate: a disagreement.** Jamie: "We're not vehicles." Sam: "Nobody knows we're here, Jamie. Nobody." Jamie:
  "Alex was HERE." **You choose:** *Go with Jamie* ("We're just going to look." "…Fine. But nobody goes anywhere alone.
  Okay?" "Buddy system.") or *Hear Sam out* ("We look. If anything's weird, we leave. No arguing." "And we're back at the
  bikes before dark."). The arm is solid; F at the latch opens it, or Jamie walks it round.

### Camp Whippoorwill (late afternoon)

- The log arch: **CAMP WHIPPOORWILL · ESTABLISHED 1961 · STAY WITH YOUR BUDDY**. Sam hands out flashlights from his bag
  ("Flashlights. For inside."). Free exploration; Owl is swollen shut until dusk.
- **The office: the 1991 register** (A/D to page; read aloud). "'Police called re: missing boy. Mill Street.'" "Danny
  Whitcomb. From the library." On **8/24/1991**: **"Grid seven. Pump house. Two bike tracks at the service gate, fresh."
  "Both lead in. None out."** "That's today." "Twenty years ago today." Also "'Light in the cabins.' After it closed." The
  **search grid map**: grid seven circled, the pump house; "'Bike tracks at gate. Eight twenty-four. Not followed up?'"
  "Nobody followed it up." V photographs evidence.
- **The lodge and pantry:** cans gone from the dust, leaving clean rings. "Kids don't take soup." "Somebody's been eating
  here." Camp photographs: "Every summer. Sixty-four to ninety." "Then it just stops."
- **Bluejay: the batteries.** Your light flickers and dies in the dark cabin. "My light's dead." Sam: "Hang on." He gets a
  battery pack out of his bag and holds it out. "You brought batteries?" "I brought batteries for the batteries."
- **The campfire** (a short rest, about a minute of talk): Sam passes water to Jamie. "This is nice. That's messed up,
  right? That it's nice?" "My mom keeps saying 'when he comes home.' Not 'if.' 'When.'" "I don't think she believes it. I
  think she says it so I'll believe it." "What if we find him and he's not— what if it's—" "Never mind." "We'll find him."
  Then: "Owl. The last cabin. We didn't look in Owl." "Then the bikes. Before dark. That was the deal." *(Unseen: a
  picture of the three of them is taken from the trees during this rest.)*

### Dusk and Owl

- **Wren's window** lights for a moment. "It's the sun. On the glass."
- **Owl** (west end): **Alex's gold shirt** on a nail. "That's Alex's. That's the one from the flyers." "It's still wet."
  **JSA cut fresh into the back wall**: "Like at the lookout. Like he wrote in chalk." "It's new. The wood's still white."
  "Four marks." "Sunday. Monday. Tuesday. Today." "And an arrow. Pointing… that way." Sam: "I'm taking it." He takes the
  shirt off its nail and puts it in his bag.
- **Calling.** "ALEX!" A **light in the trees** toward the pump house: "Somebody fishing. Or a ranger." "ALEX? Is that
  you?" It stops, **turns its beam on them**, and goes out. "A ranger would have said something." "We're going. Back to the
  bikes."

### Night

- **Three lights** come in at the camp gate, about 100 m away: "There's a light. At the gate." "Two." "Three." "A search
  party." "Then why aren't they calling?" They walk where the boys walked: the office ("So? It's the first building."),
  the map board, where they stop ("Where we stood."). Jamie: flash your light at them. **One copies your flashlight**, off
  and on. "It's doing what you do. Exactly what you do." They go to the fire and **sit where the boys sat**. "That's us.
  They're doing what we did." **The creature** is by the lodge, watching them: "It's the thing. From the tunnel." "It's
  scared of them." It runs from them. The lights turn their beams on the boys and go out together.
- **The camp that wants them apart.** Owl's window lit behind them; the office porch light ahead (the way out). A voice
  from Owl: "…Jamie?" ("That's him. That's HIM."). A voice by the office: "Sam! Sam, honey, time to come in!" ("That's my
  mom. … She's at WORK."). The dinner bell rings by itself. The camp pulls at whichever friend you are not with. Sam's
  compromise: "We look. From the porch. We don't go in." "Together. And then we go. Together."
- **Owl from the porch.** Real Jamie beside you. Standing where the shirt hung: **Jamie** — his cap, his shirt. It turns its
  head to look at Jamie. "…That's my hat." "That's me." Sam: "Jamie. Look at me. Don't look at it." Then **it comes out**,
  through the door, across the porch, toward the three of you, at a walk, smiling with Jamie's face. "Back up. Back UP."
  When it is close, **every light in the camp comes on**. Sam: **"RUN."**
- **The escape** (read from where you run):
  - **Route A, the road:** "The road! The gate!" At the camp gate both leaves **slam shut in front of you**. "The gate—!"
    Sam: "I got it. I GOT it!" He shoves a leaf open and holds it (or you do, F). Through. Behind, **every light goes out
    at once**.
  - **Route C, the dam:** "The dam! It's open, it's open, go!" Through the service yard, behind the pump house, over the
    dam. The **dinner bell rings by itself** across the water. "Nobody's there. Nobody's at the bell."
  - Afterwards, the long walk back to the bikes: "Don't look back. Walk." "Is it following us?" "Don't look."

### Aftermath and the last image

- **The lamp in the lot.** A shaky laugh: "You ran like a duck." "I did not run like a duck." "Like a DUCK, Sam." The
  shirt: "His shirt. It's in my bag. I don't know why I took it." "We give it to his mom." "And tell her what?" "It didn't
  start till we found it. Nothing happened. Then we found the shirt." "Like it was waiting." "Like it knew we'd come."
  "…I was really scared." "Me too." "Me too."
- **The second discovery.** Sam wants to reread the register on the camera. "…That's not the register." "That's us. At the
  fire." "From the trees. Behind us." Sam reads the time it was taken aloud (the rest's own time; 6:34 PM in one test
  run). "The camera was in your pocket. The whole time. Nobody took that." "…Alex?" "It's his camera. Maybe he— maybe he
  was right there." "Then why didn't he say anything?" "Maybe he couldn't."
- **The last image.** "I'm starving." "You brought a sock." "It's a good sock." "Tomorrow we tell somebody." "Tell them
  what?" "…Everything." "Guys." Across the dark water, **one light** is on in Owl. End card.

## Discoveries and clues

| Clue | Label |
|---|---|
| The picture of the TV matches the old gravel lot: Alex was really there | 🟡 |
| Camp Whippoorwill, est. 1961, closed; the 1991 search for Danny Whitcomb was based there | 🟡 |
| 8/24/1991: two bike tracks at the service gate, both in, none out; grid seven, the pump house; "not followed up" | 🟡 |
| Someone has recently taken food from the pantry | 🟡 |
| Alex's gold shirt, still wet, in Owl; **JSA** freshly carved; four marks (Sun–Wed); an arrow toward the pump house | 🟡 |
| A light that answers, then goes out; three lights that copy the boys | 🟡 |
| The creature fears the lights | 🟡 (consistent with Ch4) |
| Voices of Alex ("Jamie?") and Sam's mother; the bell ringing itself | 🟡 |
| Jamie's double | 🟡 |
| A photograph of the three of them taken from the trees, on a camera that never left your pocket | 🟡 |

## Supernatural events

All of the night sequence above. In code it is "the Presence again … here it has a camp to work with"
(`chapter5-presence.js`). Nothing is explained, no one fights, all three boys get out. See
[The Presence behavior](../05_HORROR_DESIGN/THE_PRESENCE_BEHAVIOR.md).

## Connections

- From Chapter Four: the Pine Ridge picture; Danny Whitcomb and the 1991 search; the creature that is afraid; the mimicry.
- From the Prologue: JSA; "before dark" / "until the streetlights come on".
- Open threads it leaves: the pump house; the second bike track in 1991; who took the picture; who ate the cans; the one
  light in Owl. See [Unanswered questions](../01_STORY_BIBLE/UNANSWERED_QUESTIONS.md).

## What changed from the first draft (`claude/chapter5-pine-ridge` @ `cafc27f`)

| First draft | Repair (current baseline) |
|---|---|
| Garage at 1:52 PM; packing is one F press and captions | Garage ~3:37 PM; supplies are real props packed by hand |
| Jamie's bag appears open on the driveway | Jamie wears it, opens it, pulls the sock out |
| Pre-ride talk: "He said 'see you tomorrow.' It's tomorrow." / "It said what WE said. Like it was copying us." | "Last night. Under the theater. It said 'come find him.'" (contradicts Ch4: OI-01) |
| Stones: a random skip count | Pick up, wind up, throw; skip physics |
| Gates could be walked through | Gates are solid; opened by a hand |
| Flashlight died on first use anywhere | Handed out at the camp gate; works by day; dies once in Bluejay |
| ⛔ Campfire lapses ~3 hours to 6:53 ("We've been sitting here three hours?") | A short rest; "It's almost seven." |
| ⛔ Carried lights were glowing spheres | Flashlights with beams and pools |
| ⛔ "Three people are walking into the camp!" at 90 m | Lights, never people |
| The double seen through the door; the lights wake; RUN | The double **walks out toward you**; only then the lights; RUN |
| Route A: Sam shuts the gate behind them; it swings open by itself | The gate slams **in front**; Sam shoves it open |
| The last picture stamped 6:53 | Stamped with the actual time of the rest |
| Escape 89.5 s to the boundary (sim) | Escape 146 s (sim) — then the walk back (~300 m from the dam) |

## Gameplay systems

Goal-based companions with personalities and moods ([Companion AI](../06_GAMEPLAY_SYSTEMS/COMPANION_AI.md)); props and
hands ([Physical interactions](../06_GAMEPLAY_SYSTEMS/PHYSICAL_INTERACTIONS.md)); the inventory (I/Tab/BAG); the
flashlight's state model and battery change; photographs with your hands (V); stone skipping and wading; solid gates;
expressive faces with text-timed mouths; a first-person body you can look down at; the set piece that responds to where
you stand and look; two escape routes. 12 checkpoints (The next afternoon · The Old Reservoir Road · Pine Ridge · The
place in the picture · The yellow gate · Camp Whippoorwill · The campfire · Owl · The camp at night · Run · The lamp in
the lot · One light), 37 QA sections + 27 aliases, 37 DEV scenes.

## Known problems

| Problem | Status |
|---|---|
| The escape after the double is "excessively long, boring, and frighteningly ineffective" (human) | 🔴 Open; Astra redesign in progress |
| Visuals "well below the intended quality" except the sky (human, first draft) | 🔴 Open (Astra) |
| "It said 'come find him'" contradicts Chapter Four | 🔴 Open (OI-01) |
| Faces and mouths provisional; no voices | 💤 Deferred |
| The night grade jumps from pink twilight (first light, 7:44 PM) to near black; the escape sky is brighter than the porch scene | 🔴 Open (Astra) |
| Sam can linger in Owl after taking the shirt in some runs | 🔴 Open (minor) |
| Garage slab 1–2 cm above the walk floor | 🔴 Open (cosmetic) |
| World mesh count 2,259 (over the 2,000 check ceiling) | 🔴 Open (known) |
| Software GL renderer peaks 4–6 GB on jumps; real-GPU memory/FPS unmeasured | 💤 Deferred (human playtest to watch) |

Full lists: [Chapter Five initial feedback](../08_PLAYTESTING_AND_ISSUES/CHAPTER5_INITIAL_FEEDBACK.md),
[Repair summary](../08_PLAYTESTING_AND_ISSUES/CHAPTER5_REPAIR_SUMMARY.md),
[Astra objectives](../08_PLAYTESTING_AND_ISSUES/CHAPTER5_ASTRA_OBJECTIVES.md).

## Release status

🟡 Not approved. Repair verification: 736/736 simulation (Chapter Five alone 81/81); Chromium walkthrough in two
segments (24 + 16 checks, 0 errors); all 37 DEV scenes start. A private playtest build was updated in place (link not in
the repository). Astra's reconstruction (`4bf3902`, 2026-10-23) is in progress and unapproved.
