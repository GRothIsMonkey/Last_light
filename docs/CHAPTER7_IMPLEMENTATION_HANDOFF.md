# Last Light — Chapter Seven: The Street That Wasn't There (implementation handoff)

**Status: CHAPTER SEVEN — IMPLEMENTED, AWAITING HUMAN PLAYTEST APPROVAL.**

The first complete, playable rough draft of Chapter Seven: Friday, August 26, 2011, from Sam's front step at about
9:40 in the morning to Sam's room at about half past ten that night. Story, places, people, the new creature and its
AI, stealth, the chase, the abduction, the forgetting, checkpoints, the DEV selector and tests are implemented. The
chapter ends on its own end card and does not begin Chapter Eight. Nothing here has been played by a person yet; this
document is not an acceptance.

## Source and branch

| | |
|---|---|
| Starting branch | `codex/astra-chapter6-visual-reconstruction` (not modified) |
| Starting SHA | `910bca199f25fb92e8fc33156f97d056c202b4c0` |
| Chapter Seven branch | `claude/chapter7-the-street-that-wasnt-there`, created from that SHA |
| History | Linear commits on top of the starting SHA. No rebase, squash, merge or force-push; nothing to `main`. |
| Final SHA | The branch head at delivery (reported in the delivery message). |
| Vault | Not merged into this branch and not changed. What it should record once the chapter is accepted is in section 7. |

Serve `dist/` over HTTP as before. `?qa` exposes `window.lastLight.chapter7`; `lastLight.jump(section)` starts any
section in section 3; **Continue** on the title returns to the last checkpoint; the private build's **DEV** panel has
**Chapter Seven** and its 40 scenes.

## Length

See `docs/CHAPTER7_TEST_REPORT.md` for the measured numbers per segment. The scripted simulation player goes straight
to each objective and reads only a couple of optional things, so its time is a floor, not an estimate of a first
play. Beats that only need time (conversations, waiting for an adult, the room's moment before the garage, the map —
Jamie points if you are stuck for a minute and a half —, the fence, the hallway reveal, the boy's room, the gum in the
grass, the aftermath) carry on by themselves. Beats that need you to go somewhere or do something (knock, the garage,
the ride, the lane, the window, the stealth, the door, the porch roof, the bikes, the chase, the names, the window at
the end) wait for you, with an objective and hints. **No fallback skips a scare or the abduction**: they wait for you to
be there (the dining-room window needs you at the glass; the hallway reveal needs you in the house; the hunter at the
oak waits until you are out of the lane), and a fallback can only make them happen, never pass them.

## 1. The story as implemented

### Act I — The House Without Sam (Friday morning, ~9:40)

Black, then the card: LAST LIGHT · Chapter Seven · THE STREET THAT WASN'T THERE · FRIDAY, AUGUST 26, 2011. Outside
Sam's house on Oak Hollow. Jamie is sitting on the step: *"I couldn't knock."* You knock (F).

Sam's mother answers: organised, holding it together, the list on the fridge (call the detective's office at 9:00,
flyers for the library, Kroger, the pool and the church, Brandt / Public Works, feed the cat, and at the bottom just
*SAM*). Sam's father is on the couch with the phone in his hand and the TV on with the sound off. They are different
people and grieve differently: she talks and organises; he barely moves.

**Sam's room**, untouched since Thursday, built to be handled: the box fan running by the bed; the group photograph in
its frame on the desk; Sam's spiral notebook; a pack of spearmint gum on the nightstand; flashlights and two bags of
batteries on the shelf (*batteries for the batteries*); his helmet on the doorknob; his hoodie over the chair; the game
he borrowed in June; a wooden fish from Pine Ridge; the window (a police car with nobody in it, Mrs. Kowalski watching
from her porch); a bed made, which he never did.

* **The fan.** Turn it off (F). Sam's dad comes in from the hall, turns it back on and says *"He can't sleep without
  that."*, and goes.
* **The photograph** is a physical object you pick up and turn: the four of you at the oak last July, with your bikes
  (rendered from the game's own world and people, the studio cast in `chapter7-cast.js`; a drawn fallback if render
  targets are missing). It is the same object at night.
* **The notebook.** Take it; read it (a page torn out; *"Why does Line Four bend around nothing."*, *"Culvert goes
  under a street that isn't there."*). It is yours to carry for the rest of the chapter.
* **The gum.** Jamie finds it on the nightstand, pockets it (*"He always had gum. He never gave anybody any unless you
  asked twice."* … *"I'm gonna give it back to him."*). The gum is tracked: nightstand → Jamie → the grass → you.
* **The garage.** A crash, a can, something dragging. Out the front and round to the open garage door. Low by the side
  door, a long thing with a hand flat on the concrete, its head turned to you. It goes out the side door, fast and low,
  and the door bangs. *"What was THAT? That was a— its ARMS—"*. Sam's dad: *"Probably a raccoon. They get in."* Jamie:
  *"It wasn't a raccoon."*

### Act II — The Search Continues (~10:45; then 4:15 PM)

Officer Reyes at the kitchen table. The county's divers went through both chambers twice, Public Works walked Line Two
as far as a person can: nothing. The grille was open; it was locked in March and only Brandt has a key. Show him Sam's
notebook (F).

**The map.** Reyes has sheet two of the 1958 storm-line plan from Brandt. The plan and the 2009 township map, one over
the other (A/D or the mouse wheel: how much of the old plan shows over the new; the mouse moves a pencil; F marks). Hints come if you are lost (*"Look at the end of
Oak Hollow. Where the two don't match."*, *"Surveyors drew the trees they meant to keep. Find something that's on
both."* — the oak, EXIST. OAK TO REMAIN). Mark where the plan's street runs past the oak: **Old Mill Court**, VACATED
1974 (the stamp on the plan). *"Line Four bends around it. Like it's still there."* The dates are handled carefully:
in 1966 and in 1991 the search dogs went down Line Four to the end of the court's right-of-way and sat down (*"That
doesn't mean anything."*). Reyes will look this afternoon: *"Four-thirty. You stay where I can see you. The whole
time."*

**That afternoon**, Jamie on the curb outside his house: *"I keep thinking I'm gonna tell him about this."* A short
three-way choice (1–3) for what you say back; Jamie answers each differently. Reyes pulls up; you will ride down and he
will follow in the car; he gives Jamie a radio (channel three).

### Act III — The Wrong Street (~4:30 PM to dusk)

The ride to the end of Oak Hollow Drive with Reyes's car behind you. On the way Jamie says the first thing he said on
a bike in the Prologue, *"Race you to the end of the street."*, and then, *"…That's what I said on Sunday. Before any of
it."* Nobody races. At the lookout: an old curb line in the grass, a
post, the chalk; *"the court started about… there."* The township right-of-way behind the oak, a lane down toward the
creek. Reyes takes a dispatch call and stays at the mouth: *"Stay where I can see you. Don't go past the bend."*

**The crossing is never shown.** The lane has two bends. In the middle stretch, out of sight of both ends, the world
moves you (and Jamie, your bikes and your trail) by one translation into an identical copy of the lane whose far end
opens onto a street. Nothing is spawned in front of the camera: the street was built before you turned the corner and
is only ever seen round the second bend.

**Old Mill Court** is an ordinary suburban street on a slow curve: ranch houses and two-storeys with drives, garages,
porches, hedges, mailboxes, streetlights, wires on poles, trash cans, cars at the curb. The inconsistencies are
restrained: two '59s and a wagon, one boxy mid-eighties sedan; a newspaper on a lawn dated TUESDAY, AUGUST 23, 1966;
a street sign, OLD MILL CT. Reyes on the radio: *"Seeing what? I'm right behind you. I'm in the bend."* … *"It's the
field. There's nobody here."* When you go back, the lane you came through is shut by a board fence (*"This was
OPEN."*). Jamie: somebody must have a phone. **Knock** (optional, prompted): at the first door nobody comes, a
television somewhere inside with the sound turned low; knock again and footsteps come to the door from inside and stop
on the other side of it, and nobody opens it (*"There's somebody right there. Right behind it."*). The names on the
mailboxes can be read: the house with its lights on is the CARVERs' (Ruth Ann Carver, 1966, from Chapters Four and
Six), the house with the green door the WHITCOMBs' (Danny Whitcomb, 1991). Reyes again, impossibly: *"…I can see you.
By the fence."* The light goes faster than it should.

**The dining room.** A house with its lights on. Through the front window a family at dinner with the television on —
father, mother, a girl, a boy, dressed for 1966. They do not move, not even to breathe. Then their heads turn to the
window, one by one. Then the father gets up, crosses the room in two strides and hits the glass with both hands and
his face, and the glass cracks; he stays there, mouth open, then walks back to his chair and sits down with his head
still turned to you. The crack can be examined afterwards (optional).

### Act IV — Something Is Hunting Us (~7:15 to ~8:20 PM)

Sam's voice on Jamie's radio: *"I'm in the house. The one with the green door. Upstairs. Hurry—"*. Jamie: *"It did that
before. With Reyes's voice. With Sam's."* … *"But what if it's him."*

**The green-door house** is a real two-storey house: a foyer, a living room (a console set playing a test pattern, a
starburst clock stopped at 7:42), a den, a back hall, a kitchen with a pantry, a dining room; a closed core around the
stair with a closet under it; upstairs a boy's room, a storeroom, the parents' room and a hall window over the porch
roof. The front door sticks, then swings shut behind you and sticks again. Footsteps overhead stop.

**The reveal.** At the foot of the stairs, looking up through the stairwell: at the top, on the left, a long hand
comes round the newel post from the hall where it has been standing out of sight (the stairwell shows only a slot of the
upstairs, so the corner of the stair opening is the frame it comes round); the head leans out after it and turns to you;
a shoulder; the body follows it out onto the landing, a hunched silhouette against the hall; it stands; it comes down,
one tread at a time. Jamie: *"Back. Back, back—"* and runs for the pantry.

**The stealth.** Hide (F: the pantry, the den closet, the closet under the stairs). It walks the ground floor in a
loop, stops in doorways to listen and turns its head. It sees with a field of view, range and line of sight (walls,
doors, tall furniture block it; crouching, standing still and staying in the dark slow it). It hears running and doors,
goes to the last place it saw or heard you, looks round, tries a couple of rooms, then patrols again. If it sees you it
comes, fast; if it reaches you it has you (a short, physical end) and you are back at the stealth checkpoint, hidden in
the pantry with Jamie. After a failure Jamie tells you the pattern; after two it is slightly slower and shorter-sighted.
Jamie stays hidden until you move, then follows crouched behind you, never in front; once he throws a can across the
room to draw it off you (*"GO!"*). Get round to the stairs while it is on the far side of its loop.

**The door.** The room at the top: shut the door, push the dresser against it (Jamie helps). It comes up the stairs
and hits the door twice; then it goes, out of the house and up the street, toward where you left the bikes.

**Upstairs, quietly.** A boy's room from August 1991: a wall calendar crossed off up to the 21st and then nothing
(*"August twenty-first. That's the same day as—"*). On the desk a page from a spiral notebook in Sam's square printing,
yellow and soft as if it had been lying there for twenty years: *BATTERIES FOR THE BATTERIES*, *THE WATER GOES BOTH
WAYS*, *DONT LET J GO FIRST* (*"That's his WRITING."* … *"It could do that. It did his voice. It could do his
writing."*) — ambiguous by design. In the storeroom the old green bike — the 1958 Meadowlark from Chapter Four's archive — wet, a
puddle under it: the township sticker OAK HOLLOW TWP. 0417 on the frame and A R scratched into the paint. Its bell, which has only ever clicked, rings, clear, twice. In the parents'
room, a wedding picture of the couple from the dining room.

**The large thing.** From the hall window: behind the roofs at the end of the court something moves that is far too
large to be there — a back, a ridge, then a limb that unfolds over the far house and comes down on it; the roof gives,
a pole leans; then it settles away. Never fully seen; no glow; no boss. Then red and blue lights past a hedge and
Reyes on the radio: *"I'm at the oak. With the car… lights on…"*. Out the hall window onto the porch roof, and drop.

### Act V — Jamie's Last Ride (~8:25 PM; later that night)

**The bikes.** They are where you left them. It is there, low behind the nearest cover (a parked car, a lamppost, the
street sign), if you look. Get on. It comes out at Jamie and lands past him; he swerves; *"GO! GO GO GO!"*

**The chase** (measured about 46 seconds of riding by the sim player; a slower rider takes longer): down the court,
round its bend, up the other leg and into the other lane. It runs behind you on all fours at the speed your own riding
earns it, and closes on a rider who slows; it cuts across the back yards at the bend and comes at you from the side,
clipping your back wheel. Jamie rides ahead, paced to you, and at the far lane pulls over to let you in first (the lane
is one bike wide). A rider it reaches who is not getting away is caught (back to the bikes' checkpoint); the first
seconds are always yours. The lane takes you back through the middle and out at the oak.

**The oak.** Reyes's car, its lights going, empty; Reyes out in the field with a flashlight. When you and Jamie are both
out on the grass, it comes out of the lane behind you and takes Jamie off his bike; you go down too.

**The rescue that fails.** Its hand is on Jamie's ankle and it backs toward the lane, dragging him; he claws at the
grass: *"HELP ME— GRAB MY HAND—"*. Get to him and take his hand (F). Hold on (hold F), pull back (S). It yanks; the gum
comes out of his pocket and falls in the grass; it gets him to the lane in its own time whatever you do. His hand goes
out of yours (*"PLEASE—"*). It drags him into the lane and round the bend, and he is gone. (He is never seen dead, and
never seen again in this chapter.) The lane is only a lane; it comes out in the field. Call his name (F). Pick up the
gum. Reyes: *"Where's Jamie? WHERE'S JAMIE?"* … *"I have a second missing juvenile."*

**Later, the forgetting begins** — gradually, and only with adults:

* At the lookout at night: Jamie's mother (*"You were WITH him."*). She shows the other officer pictures on her phone;
  he says *"Ma'am— there's nobody in this one."* She: *"He's in all of these."* Reyes has to read Sam's name off the
  notebook: *"…S—"* … *"His name is Sam."* *"Your bike's in my trunk. Jamie's too."*
* Sam's house, that night: Sam's mother remembers (*"Sam would've made you all stay home today. He'd have been
  right."*). Sam's father is in Sam's room; the fan is on. Turn it off: he turns it back on and does not know why
  (*"Was it always on? I don't…"* … *"I keep coming in here and turning this on. I don't know why."*).
* **The photograph**, the same frame, the same composition: only you, at the oak, with your bike. His dad, looking
  over: *"That's a nice one of you."*
* **The names.** Open Sam's notebook to a clean page and write (hold F; your hand writes, letter by letter):
  ALEX / JAMIE / SAM. *"I thought I remembered everyone."*
* **The last image.** Look out Sam's window: under the streetlight across the street four bikes stand in a row, the way
  you used to ride. *"Alex's. Jamie's. Sam's."* … *"Yours."* (Reyes has yours and Jamie's in his trunk.)

End card: LAST LIGHT · Chapter Seven · THE STREET THAT WASN'T THERE · August 26, 2011. There is no Chapter Eight
button.

## 2. How it is built

| File | What it is |
|---|---|
| `dist/chapter7.js` | The director: phases, beats, dialogue, checkpoints, QA jumps, spots (what F does), the chase, the struggle, the forgetting, the photograph's states, the names. |
| `dist/chapter7-house.js` | Sam's house inside (the living room, kitchen, hall, Sam's room, the back), its objects, window views. |
| `dist/chapter7-court.js` | The lane at the lookout, its two copies, Old Mill Court, its houses, cars, lamps, poles, the far row and the large thing, the region's nav, the portal. |
| `dist/chapter7-interiors.js` | The green-door house (two floors, nav per level, sight, hiding places, the hunter's room graph, the dresser) and the dining room. |
| `dist/chapter7-build.js` | A small building kit (walls with holes, doors on pivots, furniture, period cars, streetlights, poles, fences, hedges). |
| `dist/chapter7-cast.js` | The family at the table, Jamie's mother, the studio people and bikes for the photograph. |
| `dist/chapter7-props.js` | Paper: the plan and the map, the notebook pages, the 1966 newspaper, the 1991 calendar, Sam's page. |
| `dist/chapter7-creature.js` | The hunter's adapter and its temporary stand-in (see `docs/CHAPTER7_CREATURE_ASSET_GUIDE.md`). |
| `dist/chapter7-hunter.js` | The hunter's mind: patrol, search, pursue, attack, the chase, scripted beats; perception (sight meter, field of view, line of sight, hearing); a fine-grid path planner indoors with stuck recovery. |

Shared files touched, minimally: `chapter6.js` (hands Chapter Seven its phases and sections, its end card offers
Chapter Seven), `game.js` (creates Chapter Seven, the next-chapter button, `shift()` for the crossing), `nav.js` (three
opt-in hooks a room can answer: rideable, surface, headingAt), `audio.js` (Chapter Seven's synthesized sounds),
`dev-chapters.js` and `index.html` (the DEV selector's Chapter Seven). Chapters Zero to Six are not otherwise changed.

**The crossing** is a pure translation (player, Jamie, both bikes, the companions' trail) across identical geometry,
done in the lane's middle stretch where neither mouth can be seen; the copy B lane brings you back the same way.

**Two-level nav** in the green-door house uses one level flag for the player (set by the stair), Jamie's own level
while he is updated, and the hunter's own level through its nav proxy.

**Save for Chapter Eight.** At the names, `localStorage['lastlight.chapter7']` gets
`{names:['ALEX','JAMIE','SAM'], photo:'altered', gum, notebook:'player', jamie:'taken', sam:'missing'}`. Nothing reads
it yet.

**The photograph's two states** are part of the chapter's state, not of a moment: `'four'` until the evening, `'one'`
from the forgetting on, for play, every QA jump and every checkpoint (the chapter's checks jump to each section and
read it).

**Sound** is synthesized at runtime like the rest of the game (no audio files). It has **not been listened to**: every
automated run here is muted or has no audio device. The checks only prove that the right sounds are asked for at the
right moments.

## 3. Checkpoints, QA jumps, DEV scenes

Checkpoints (silent; **Continue** on the title comes back here): The house without Sam · Sam's room · The garage ·
Officer Reyes · That afternoon · The end of the street · Old Mill Court · The house with the green door · Something is
hunting us (the stealth: hidden in the pantry with Jamie) · Upstairs · Jamie's last ride (the bikes: the chase's
retry point) · Later · Sam's room, that night.

QA sections (`lastLight.jump(id)`, also the DEV scenes): `chapter7-start`, `c7-step`, `c7-family`, `c7-bedroom`,
`c7-fan`, `c7-gum`, `c7-garage`, `c7-reyes`, `c7-map`, `c7-curb`, `c7-ride`, `c7-lookout`, `c7-lane`, `c7-court`,
`c7-separation`, `c7-dining`, `c7-dining-scare`, `c7-house`, `c7-reveal`, `c7-stalk`, `c7-door`, `c7-clues`,
`c7-trace`, `c7-old-bike`, `c7-giant`, `c7-out`, `c7-bikes`, `c7-chase`, `c7-lookout-attack`, `c7-grab`,
`c7-struggle`, `c7-taken`, `c7-gum-pickup`, `c7-after`, `c7-forgetting`, `c7-sams`, `c7-photo`, `c7-names`,
`c7-window`, `chapter7-end` (plus readable aliases, e.g. `c7-stealth`, `c7-rescue`, `c7-final-image`). The DEV panel's
40 Chapter Seven scenes are listed in `docs/DEV_CHAPTER_SELECTOR.md`.

## 4. Earlier chapters

Chapter Six's end card now offers **Chapter Seven** (it offered nothing before). Starting a Chapter Six, Five or Four
scene after Chapter Seven leaves nothing of Chapter Seven in the world (checked). No earlier chapter's story, places or
assets were changed. See the test report for the regression runs.

## 5. Known limitations and risks (for the playtest)

* **The length is short of the request.** The simulation's direct player takes about 23–26 game minutes from Chapter
  Six's end card to Chapter Seven's (the test report has the number per segment) against the requested 45–55. A
  first-time player who reads the room, the map, the court, the boy's room and the forgetting will take longer — by the
  ratio earlier chapters used (direct × 1.3–1.5) roughly 30–40 minutes — but that is an estimate, and it is still under
  the target. The playtest should time it; the cheapest places to deepen it are the court (more doors, more to read),
  the green-door house's ground floor and the aftermath.
* **The hunter is a placeholder.** A procedural stand-in, not an authored model: no skin, no texture, IK-driven
  limbs. It is dark and staged to read in silhouette (it is good on the landing at the top of the stairs and on the
  road at dusk), but close up in daylight (the garage) it looks like what it is. The adapter is ready for a real model
  (the guide).
* **Rough-draft art.** Sam's house, the court's houses, the green-door house and the large thing are first-draft
  geometry with runtime materials.
* **Audio is unverified by ear** (muted runs only).
* **Stealth tuning** is from simulation only: how readable the patrol is, and whether the house is too easy or too
  hard for a person, needs a human.
* **The chase** is at the short end for a hard rider in direct play (about 51–56 s for the sim's player, who holds
  Shift the whole way, against a 60–90 s target); a person riding normally will take longer, but this needs timing.
* **The garage glimpse** depends on the player looking toward the side door; if they don't, it goes anyway after a few
  seconds (heard, barely seen).
* **Jamie in tight places**: he steps back when walked into; where there is no room to (a doorway, between a car and a
  porch) he steps round you after a moment and comes on behind you. It works, but it is a small pop, not an animation.
* **Jamie down is re-posed by the chapter every frame.** While he is on the ground (taken off his bike, held, dragged)
  the friends' system still treats him as riding and stands his body back on his bike each frame; the chapter lays him
  down again after it (position, lying orientation, and the hand you hold, kept in its own state). It is correct in
  every check and frame, but a proper "down" state in `companions.js` would be cleaner and is the first thing to do if
  the abduction is reworked.
* **The lawn at the lane's mouth has an edge.** Beside the old paving the open grass is walkable for 6 m (Chapter Seven
  only); past that the lookout's own bounds still stop you, in grass that looks the same. Nobody needs to go there, but
  a player wandering off the paving will meet it.
* **The large thing** is out of the dusk haze so that it reads against the sky; it is a crisp dark shape, which a real
  silhouette model should keep.
* **Software rendering** in every automated browser run: frame times say nothing about a real GPU.

## 6. Private playtest

See the delivery message and the test report for whether a private build was published and its link. No link is
recorded here unless it was actually created.

## 7. For the vault (once accepted — not done here)

The vault was not merged into this branch and was not changed. After a person has played and accepted the chapter,
these are the updates it needs.

**Chapter index.** Chapter Seven — *The Street That Wasn't There* — Friday, August 26, 2011, ~9:40 AM to ~10:30 PM.
Files: the table in section 2; this handoff; `docs/CHAPTER7_TEST_REPORT.md`; `docs/CHAPTER7_CREATURE_ASSET_GUIDE.md`;
`docs/qa/chapter7-the-street-that-wasnt-there/`. Entered from Chapter Six's end card; ends on its own card with no next
chapter.

**Story timeline (Aug 26, 2011).** ~9:40 Sam's house (the fan, the photograph, the notebook, the gum) · ~10:00 the
garage: something long and low goes out the side door ("a raccoon") · ~10:45 Reyes: nothing in the works, the grille
found open; the 1958 plan: Old Mill Court, vacated 1974, under Line Four's bend · 4:15 PM Jamie on the curb · ~4:40 the
lookout; the right-of-way behind the oak · ~5:00 Old Mill Court; Reyes in an empty field on the radio; the fence ·
~7:15 the dining room (1966 family; the window) · ~7:30 Sam's voice: the green door · the reveal, the stealth, the
door · upstairs: August 1991, Sam's page, the old bike (0417, AR) and its bell · the large thing behind the roofs ·
~8:25 the chase · ~8:30 at the oak: **Jamie taken** into the lane; the gum · ~9:40 the lookout: forgetting begins
(Jamie's mother's pictures, Reyes and Sam's name) · ~10:25 Sam's room: the fan, the altered photograph, the names, four
bikes under the streetlight.

**Mystery tracker (new or advanced; nothing explained).** Old Mill Court: vacated in 1974, still reachable through the
lane's middle; an older street's people at dinner who turn and come at the glass, in the house whose mailbox says CARVER (Ruth
Ann Carver went missing on Tuesday, August 23, 1966 — the date on the court's newspaper); the green door's mailbox says
WHITCOMB (Danny Whitcomb, August 21, 1991 — the boy's room upstairs, the calendar); somebody behind a door who comes to
it and does not open it; the clock running fast there. A
second creature (the long, low hunter) distinct from the smiling one: it hunts by sight and sound, takes Jamie, and is
seen first in Sam's garage. Something far larger behind the court's roofs. Voices on the radio that are not their
owners (Sam's; Reyes's "I can see you. By the fence."). A boy's room stopped in August 1991 (the 21st). Sam's page,
twenty years old, in his hand. The old green bike: OAK HOLLOW TWP. 0417, A R; wet; its bell rings now. Forgetting: the
adults lose the taken (photos empty, names missing, a fan kept on without knowing why); the player keeps the names in
writing. Sam's and Jamie's fates: open.

**Character relationships.** Reyes: from procedure to following children down a lane he can't find, to "a second
missing juvenile"; the first adult seen forgetting a name. Sam's mother: remembers; Sam's father: grief that turns into
not knowing why. Jamie: the gum ("I'm gonna give it back to him"), the curb, the radio, ahead of you on the ride,
taken. Jamie's mother: "You were WITH him."

**New mechanics.** A map-comparison puzzle (overlay, mark, hints). A crossing done by translation behind a bend. A
stealth house with a patrolling, listening, searching hunter and hiding places, with failure and checkpoint retry. A
door held with furniture. A paced chase along a route with a catch. A struggle (hold F, pull S) that cannot be won.
Writing names by hand. A photograph with two states.

**Playtest issues to watch** (section 5 and the test report).

**Release history.** `claude/chapter7-the-street-that-wasnt-there` from `910bca1` (Chapter Six Astra
reconstruction): Chapter Seven implemented and verified by simulation and Chromium (numbers in the test report);
**awaiting human playtest approval**. Nothing merged to `main`; earlier branches unchanged.
