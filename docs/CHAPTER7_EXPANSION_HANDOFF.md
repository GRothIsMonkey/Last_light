# Last Light — Chapter Seven: gameplay and horror expansion (handoff)

**Status: CHAPTER SEVEN — EXPANDED ROUGH DRAFT, AWAITING HUMAN PLAYTEST APPROVAL.**

This expands the existing Chapter Seven rough draft (The Street That Wasn't There) in place. Nothing was rebuilt: every
scene of the first draft is still there and still plays in the same order, with five groups of new gameplay set into
it. The ending is unchanged. Nothing here has been played by a person; every number below comes from automated runs.
The earlier reports are kept as they were: `docs/CHAPTER7_IMPLEMENTATION_HANDOFF.md` and `docs/CHAPTER7_TEST_REPORT.md`
describe the first draft, and this file describes what the expansion added on top of it.

## Source and branch

| | |
|---|---|
| Starting commit | `f91dcd8a69a7864b8d38ba063e658b25316f4b88` (the head of `claude/chapter7-the-street-that-wasnt-there`, not modified) |
| Expansion branch | `claude/chapter7-gameplay-horror-expansion`, created from that commit |
| History | Linear commits on top of the starting commit: the eight Chapter Seven commits and everything inherited from the Chapter Six Astra reconstruction are preserved. No rebase, squash, merge or force-push; nothing merged into `main`. |
| Final commit | The branch head at delivery (reported in the delivery message and verified on the remote). |

Serve `dist/` over HTTP as before. `?qa` exposes `window.lastLight.chapter7`; `lastLight.jump(section)` starts any section;
**Continue** on the title returns to the last checkpoint; the private build's **DEV** panel lists **Chapter Seven**'s 53 scenes.

## Length

Measured by the same direct, input-driven simulation player as the first draft (`ONLY=chapter7 node tests/verify.mjs`:
one continuous run from Chapter Six's end card, its **Chapter Seven** button, to Chapter Seven's end card, played only
through inputs: walking, riding, looking, F, holding keys, the mouse on the map, choices). Its time is game time, from
the game's own clock. The player goes straight to each objective, reads what the checks need, and is never caught.

| Segment | First draft (min) | Expanded (min) | Change |
|---|---:|---:|---:|
| Sam's house (the step, his room, the fan, the photograph, the notebook, the gum; now the Tour poster, his dad's list, the machine) | 2.50 | 7.09 | +4.59 |
| The garage | 0.65 | 0.82 | +0.17 |
| Reyes and the map (now MH-12, the streetlights, the crayon) | 2.20 | 3.76 | +1.56 |
| The afternoon (the curb, the ride, the lookout, the lane) | 2.46 | 2.44 | −0.02 |
| Old Mill Court (the lane, the fence, the knocks, Reyes "by the fence") | 3.05 | 3.34 | +0.29 |
| The Langes' (the open door to the lights across the street) | — | 4.02 | +4.02 |
| The dining room | 1.04 | 1.15 | +0.11 |
| The green-door house (now the radio, the prints, the star, the pantry visit, the stairs, the timer, the rug) | 2.31 | 4.07 | +1.76 |
| Upstairs | 1.95 | 1.95 | 0 |
| The chase | 1.63 | 1.63 | 0 |
| The abduction | 1.77 | 1.78 | +0.01 |
| Later (now on your feet: showing Reyes, Jamie's mother, her phone, the page) | 1.28 | 6.01 | +4.73 |
| Sam's room that night | 1.52 | 1.47 | −0.05 |
| **Total** | **22.4** | **39.53** | **+17.2** |

By the brief's five areas: Sam's house **+4.6 min** (asked about +3), Reyes's second investigation **+1.6** (asked about
+3), Old Mill Court with the Langes' **+4.4** (asked about +4: the court, the Langes' and the dining room together, 4.09 →
8.51), the green-door house **+1.8** (asked about +5), the aftermath **+4.7** (asked about +3). The total lands inside
the 38–42 minutes asked for. Two areas are short of their share and two are over it: the green-door house's new beats
are all required and all there, but a player who is never caught gets through the timer and the rug quickly, and the
aftermath runs longer than planned because showing Reyes four things in the dark is a walk.

This is the floor for a player who makes no mistakes. Being caught in the pantry or at the stairs costs about a minute
each time (back to the checkpoint), and a first player reads the Courier, the board, the drawings, the poster and the
page at their own pace. The first draft's report estimated a person at about 1.3–1.5 times the simulation's time.

Nothing was padded: no timer was added that you wait out, the simulation player was not slowed, and no beat repeats.
Every added minute is something you do: walking somewhere with a purpose, looking at something and turning it over,
choosing what to say, hiding and holding your breath, timing a lift, sneaking round. The only waits are ones the
stealth asks for (in the den, until it has gone to the timer; at the dresser, until Jamie has the weight up), and the
lines of dialogue, as before.

New interactions (each a thing you do, not counting walking): Sam's house 8 (take the tube down, turn the poster, the
drawer, the shoe box, the watch, play the machine, its cord, play it again); Reyes 3 (mark MH-12, mark the streetlight
line, lift the tracing paper); the Langes' 13 (the television, the Courier, the table, the cap, the calendar, the phone,
the board, the parents' door, listen at the bathroom door, leave or look, the drawings, getting out, what you say to
Jamie); the green-door house 8 (the radio, the prints, the star, holding your breath, the timer, the optional radio lure,
finding the rug, pulling it on the lift, then the push); later 9 (show the bike, the cap, the marks, the gum, read
Reyes's page, two answers to Jamie's mother, her phone, turn the page to the light). About 41 in all.

New horror encounters: the bathroom at the Langes' (the light under the door, the shadow, the strain, breathing at the
height of your face, the door shoved from inside); Mrs. Lange coming out (the one close-range scare with a physical
cause: the furniture she hits, Jamie between); the pantry visit (its hand on the door, its head in the gap, your held
breath); it waiting at the stairs and learning (it breaks the timer and checks the closets as it goes round). Quieter
uncanny beats: the answering machine, the radio that says Reyes's words, the wet prints, the empty towel, the cap that
becomes nobody's, the name pressed into the paper. One sudden scare was added (Mrs. Lange); the shove at the bathroom
door is a startle you have been warned of. No scare repeats, there are no added chases, and nothing appears and
disappears or flickers to fill time.

## The five expansions, scene by scene

### 1. Sam's house (morning)

* **The Tour de Oak Hollow** (a childhood memory with Jamie). Jamie asks about the tube on top of Sam's shelf. You take
  it down and unroll the poster the four of them made last summer: the route round the block, everyone's lap times,
  Alex disqualified for going through the Hendersons' clothesline, "PROTEST!!!! - ALEX". Turned over (mouse or A/D):
  the tour's rules, among them "WHEN THE STREETLIGHTS COME ON YOU GO HOME" and "NOBODY GETS LEFT BEHIND", and four
  signatures.
* **His dad's list** (helping Sam's father). He needs a recent picture, what Sam had on his feet, and whether he had his
  watch. You look in the desk drawer (this year's school pictures, one wallet cut out), under the desk (the shoe box:
  his Vans are gone, size six and a half) and on the dresser (his watch, left behind, although he sleeps in it).
* **The answering machine** (the disturbing discovery). In the kitchen the machine's light blinks: one message, Thursday,
  3:12 a.m. It plays Sunday night's ride from the prologue ("Did you guys hear that?", "Save me a spot tomorrow."). Its
  cord lies on the counter: it is not plugged in. Played again: "You have no messages."

### 2. Reyes's second investigation

* After the 1958 plan is marked, Reyes shows a photograph from the drainage works: a manhole cover cast
  "OAK HOLLOW TWP / MH-12 / O.M.C. 1959" in a junction chamber that morning. You find MH-12 on the plan (with progressive
  hints): a 1959 structure inside a court that was vacated in 1974.
* The township's streetlight schedule: you find the line still billed for the vacated court, four lamps paid for every
  month since 1974. Reyes: "I watched the meter on it turn."
* Lifting the tracing paper shows the modern map underneath: a crayon circle at the court and "8/21/91", the date Danny
  Whitcomb went missing, in a child's hand. Reyes decides to come with you.

### 3. Old Mill Court: the Langes' (No. 5)

* After Reyes, on the radio, says he can see you "by the fence", a door up the street that was shut swings open on its
  own. Inside, an evening a minute old in the wrong years: a 1959 console set on a test card (WOHT CHANNEL 9, a channel
  that never existed), the Courier of April 11, 1974 ("TOWNSHIP VACATES OLD MILL COURT … Mrs. E. Lange, of No. 5, could
  not be reached for comment"), a cigarette still going in the ashtray, dinner for three with one plate untouched and
  still steaming, a boy's damp cap (T. LANGE), a 1983 calendar.
* The phone: no dial tone, a television far down the line, somebody breathing close to the receiver. Pinned beside it:
  GIRL, 11, MISSING (Ruth Ann Carver, 1966), BOY STILL MISSING (Danny Whitcomb, 1991), and a pin with nothing on it
  (the clue linking the earlier disappearances).
* Something is inside: the light under the bathroom door, a shadow across it, the door straining on its latch; listening
  at the door, breathing at the height of your face; the door shoved from inside, a picture shaken off its nail.
* The choice: leave, or look at the drawings in the boy's room. They are the same picture three times (a streetlight,
  four bikes, nobody on them): R.A.C. 1966, D.W. 1991, and one in faint pencil with no name yet, 2011.
* The scare: Mrs. Lange comes out of the bathroom, fast, bent forward, along the hall (the hall table goes) and in at you
  (the boy's chair, or the couch if you chose to leave), and stops too close with her head rolled over to one side.
  Jamie gets between you with his arms out. She goes back the way she came without turning round; the bathroom door
  slams. A rig person like the Carvers, not the creature (the creature is still first seen at the green door).
* Outside: Jamie wants to climb the fence and wait for Reyes; you answer him (three choices). Then the lights come on
  across the street and the existing dining-room scene plays.

### 4. The house with the green door

* Before it comes down: a transistor radio in the den says Reyes's words back to you ("It's the field. There's nobody
  here."); wet bare prints, too long, come out of the closet under the stairs and go round through the kitchen and the
  dining room; a star folded from a spearmint gum wrapper lies on the second stair (Sam folds these, or anybody could).
  The reveal is unchanged; it waits until you have the star.
* The pantry (the hiding place is unchanged) now gets a visit: its hand on the edge of the door, the door opening wider,
  its head in the gap. Hold your breath (hold Space). Breathing, or coming out, gets you caught (back in the pantry at
  the stealth checkpoint). The hint row says so while it is there, and Jamie whispers it first.
* Then it stands at the foot of the stairs and waits. The egg timer on the kitchen counter: wind it and go out the back
  way (back hall, den) while it ticks; it hears the ring by its own hearing range and goes to it. It breaks the timer,
  looks round, looks into the pantry, and from then on it looks into the closets as it goes round the rooms (it has
  learned). The den radio is a second, optional lure. Jamie's can (unchanged) still saves you if it sees you.
* The room at the top: the door shut (unchanged). The dresser will not slide: it stands on a rug. Jamie lifts it; you
  pull the rug out while it is up (too soon and he tells you to wait); then you push. It comes up the stairs while you
  do this, every tread heard, and waits at the top until the dresser is in place, then hits the door twice (unchanged).
  After it has gone: Jamie, down against the dresser with the star in his hand: "If it's his, he was in this house."

### 5. Later: the forgetting

* Reyes asks you to show him where it happened: his bike in the grass, his cap, the two marks his heels made to the mouth
  of the path, the gum. Reyes photographs each one (a flash) and writes it down; you read the page back to him:
  "2ND JUV. MISSING — JAMIE, 12".
* Jamie's mom asks you two things (what he was wearing; what he said before) and shows you her phone: the pool last
  week, a striped towel with nobody on it, a damp shape where somebody sat. "He's RIGHT THERE."
* The forgetting goes on: the dispatcher says one juvenile; Reyes says two; the cap in her hands becomes nobody's; Reyes
  needs his notebook for Sam's name (unchanged).
* His page, an hour later: no name in the ink, and the word SECOND gone. Turned to the light (A/D), the name is still
  pressed into the paper: JAMIE. You keep it (it is in what you carry). Then Sam's room, the photograph, the names and
  the window: the ending, unchanged.

## How it fits the existing chapter

| Where | Before | Now |
|---|---|---|
| Sam's room | The gum, then the garage noise | The gum, the Tour poster, his dad's list, the machine, then the garage noise |
| Reyes and the map | Mark the court; to the curb | Mark the court; MH-12; the streetlights; the crayon under the plan; to the curb |
| Old Mill Court | Knocks, Reyes "by the fence", the lights come on | Knocks, Reyes "by the fence", the Langes' door opens, the house, the argument, then the lights |
| The green door | In, the reveal, the pantry, the loop, upstairs, the door, the dresser | In, the radio / prints / star, the reveal, the pantry visit, it waits at the stairs, the timer, it learns, upstairs, the door, the rug, the dresser, the star |
| Later | On the bench: Jamie's mom, the forgetting, to Sam's | On your feet: show Reyes, Jamie's mom asks you, her phone, the forgetting, his page, to Sam's |

## Checkpoints and DEV scenes

New checkpoints (Continue comes back to them; a capture comes back to the nearest one):

| Checkpoint | Label | Where it puts you |
|---|---|---|
| `c7-search` | Sam's things | Sam's room, his dad's list |
| `c7-records` | The plate and the streetlights | The kitchen table, Reyes's photograph on the map |
| `c7-lange` | The house with its door open | In front of the Langes' open door |
| `c7-stairs` | It is waiting at the stairs | In the pantry, it at the foot of the stairs (a capture after this point comes back here, not to the pantry visit) |

Thirteen new DEV scenes (53 in all): `c7-memory` (Sam's Childhood Memory), `c7-search` (Searching Sam's Belongings),
`c7-machine` (The Answering Machine), `c7-records` (Reyes's Second Investigation), `c7-lange` (The Open Door),
`c7-lange-in` (Inside the Langes'), `c7-lange-scare` (The Langes' Bathroom), `c7-green-star` (Before It Comes Down),
`c7-stairs` (It Waits at the Stairs), `c7-rug` (The Rug and the Dresser), `c7-evidence` (Showing Reyes), `c7-mom`
(Jamie's Mother Asks You), `c7-record` (Reyes's Page, an Hour Later). Each starts in its own moment with the earlier
beats' flags set as playing sets them, and none places you behind a locked door or inside furniture (checked by start
position and walkability in the DEV run).

## Testing

Every run is automated. Audio was muted or absent in all of them: sound events fire and are counted, nobody listened.

| Check | Result |
|---|---|
| Chapter Seven playthrough (`ONLY=chapter7 node tests/verify.mjs`) | **75 passed, 0 failed.** One continuous run from Chapter Six's end card to Chapter Seven's end card, by inputs only, through every new beat in story order (the Langes' with the choice to look, the green-door house's pantry visit with a held breath, the timer, the rug, the aftermath's evidence, questions, phone and page) and every original one. 39.53 game minutes; stealth failures 0; nothing non-finite; Sam never seen; Jamie never seen after he is taken. |
| Chapter Seven targeted checks (`ONLY=chapter7 CHECKS_ONLY=1`) | **19 passed, 0 failed.** All 53 DEV scenes start in a Chapter Seven phase, and the 13 new ones start where you can stand (or hidden, or holding something); the hunter is its own creature; walking into it gets you caught and back at the stealth checkpoint; hidden in the pantry holding your breath while it looks in, you are not caught and it goes to wait at the stairs; breathing while its head is in the door, it hears you and you are back in the pantry; caught after it has waited at the stairs, you are back at the stairs checkpoint with it still waiting; the egg timer is heard by its hearing range from the stairs and a sound 40 m off is not; inside the Langes' the checkpoint is the Langes'; the Langes' other choice (leave: it comes into the front room through the couch, Jamie between, out, the argument); Reyes's page, turned to the light, goes into what you carry; no sight through the stair core; the chase can be failed; the photograph's two states; the gum's path (nightstand → Jamie → the grass → you → still yours after Reyes); Continue; Chapters Six, Five and Four start clean after Chapter Seven; the creature adapter. |
| Segment runs while building (`FROM=… TO=…`) | Each new segment passed on its own before the continuous run: the court with the Langes' (court 3.42 + Langes' 3.97 + dining 1.15 min), the green-door house (3.93), the aftermath into the night (5.78 + 1.48). |
| Chapter Six regression (`ONLY=chapter6 node tests/verify.mjs`) | **80 passed, 0 failed**, run at `16fb3c3` (the commit that added the Langes', the green-door house and the aftermath). The commits after it change only Chapter Seven's own modules and tests, which no earlier chapter imports. |
| Chromium walkthrough (`SEGMENTED=1 NO_DEV=1 BROWSER_MEMORY_MB=3000 node tests/chapter7-browser.mjs`) | **88 passed, 1 failed, then that segment re-run: all its checks passed.** Chapter Six's end card, a real click on its **Chapter Seven** button, the card; then all eleven segments played in the page (software GL, sound off) by the same input-driven player, each from its checkpoint in a fresh browser, to Chapter Seven's end card. The one failure was the check's own timing (in the browser you were up the stairs before it had finished breaking the timer); the check now asks what the timer must do (it is heard by range and it leaves the stairs), and the green-door segment re-run in Chromium passed every check (`SEGS=green`). Captures in `docs/qa/chapter7-expansion/walkthrough/`. The walkthrough has to run alone: alongside a second long run the software-GL renderer ran out of memory twice. |
| Chromium DEV scenes (`SEGMENTED=1 DEV_ONLY=1 BROWSER_MEMORY_MB=3000 node tests/chapter7-browser.mjs`) | **All 53 scenes start, no JavaScript errors, no WebGL warnings.** The title's DEV panel, **Chapter Seven**, each scene chosen and started with real clicks, captured in `docs/qa/chapter7-expansion/dev/`. Every scene starts in a Chapter Seven phase with Jamie there until he is taken and nobody after. The run reported one failure: the test's own list of scenes after the abduction did not yet include the three new aftermath scenes (which correctly show no Jamie); with the list corrected, the recorded results meet the check for all 53. |
| Chromium frames during the new beats (`node tests/chapter7-frames.mjs`, shots `x01`–`x32`) | **20 frames, 0 page errors**, each taken during its beat after a QA jump and the game's own update, in `docs/qa/chapter7-expansion/frames/`, and looked at (below). |

### Visual review of the new scenes

The frames in `docs/qa/chapter7-expansion/frames/` were taken during the beats (software GL, sound off) and looked at:

| Frame | What it shows | Notes |
|---|---|---|
| x01 The Tour poster | The poster out of the tube: the route, the lap times, Alex's DQ, "PROTEST!!!! - ALEX" | Legible |
| x02 The machine | The answering machine on the kitchen counter, its cord | |
| x03 The map | MH-12 on the plan, Reyes's photograph of the plate, the vacated court | Legible |
| x10 The Langes' door | The blue house, its door standing open, the steps, the walk | Dusk sky still bright at 6:22 |
| x11 The front room | The console set, the couch, the Courier and the ashtray on the coffee table | |
| x12 The kitchen | Dinner for three, one plate untouched, the cap on the chair | |
| x13 The phone | The board: GIRL, 11, MISSING; BOY STILL MISSING; the empty pin; the grocery list | Legible |
| x14 The bathroom door | The hall, the soft light under the bathroom door, the picture beside it | The shadow across the light is faint |
| x15 The drawings | Three drawings: R.A.C. 1966, D.W. 1991, a faint 2011 | Legible, in order |
| x16–x17 Mrs. Lange | In the doorway; then too close, head rolled over, arms hanging; Jamie in front, arms out | A stylised person up close (see limitations) |
| x18 The other choice | She comes into the front room past the couch | |
| x20 The star | The foot of the stairs; the star catches the light on the second step | Small at this distance: its prompt is what most people will notice first |
| x21 The prints | The kitchen floor | Dark, read best with the closer look |
| x22–x23 The pantry visit | Its arm across the door to the edge; then its head in the gap, filling the frame | Mostly silhouette (see limitations) |
| x24 The rug | The dresser on the blue rug, lifted; "Pull the rug" | |
| x30 The evidence | The marks in the grass at night, the cap | Very dark until Reyes's light is on them |
| x31 Her phone | The pool last week on Jamie's mother's phone: the striped towel, nobody on it | |
| x32 The page | Reyes's page, turned to the light: JAMIE pressed into the paper | Legible |

### What the runs found and fixed

* The console set's screen faced into its cabinet: nobody could see it in any house (fixed in the shared builder; the
  green-door house's set now shows its test pattern, the dining room's its picture).
* Being caught while it looked into a closet left its remaining script steps running against a cleared state (an
  exception in the update loop). Its script now stops and every step checks it is still current.
* "Hold your breath" was hidden behind the "Come out" prompt on the hint row; coming out is no longer offered while it
  looks in.
* Hiding was offered from the egg timer on the counter (F could hide you instead of winding it); hiding is now offered
  at each closet's door, and the timer sits at the far end of the counter.
* In a full playthrough Jamie can be caught well up the road; the aftermath sent you 125 m for his bike. The evidence is
  staged by the path in every case and offered by standing near it.
* A DEV scene (Jamie's mother) did nothing because its stage name was already the aftermath's opening stage.
* The aftermath stood you up on a bike when started from its DEV scene; you now stand on your feet.
* Mrs. Lange's arms read as spread wide from the front; she now reaches low and narrow, and her head rolls over in the
  loom. The Langes' windows showed black instead of dusk; the light under the bathroom door was a hard bar; the cap was
  a box; the drawings read right to left. All fixed.
* Jamie trailing you through the Langes' doorways after the scare could jam the boy's doorway: he now runs ahead to the
  lawn.
* The figure skipped the boy's chair when you stood about 1.7 m from the doorway (its route was trimmed too early).

## Known limitations

* The Langes' figure (Mrs. Lange) is a rig.js person posed by code, like the Carvers. It reads as wrong at a distance
  and in motion (bent forward, too fast, her head rolled over), but up close it is clearly a stylised person with fists
  for hands. The creature is unchanged (the stand-in), as asked.
* The pantry visit is lit only from the kitchen behind it: inside the pantry it is mostly a silhouette (its arm across
  the door, its head in the gap). That is intended, but a person may want a little more light on the hand.
* The aftermath is at night in the grass by the lookout; the drag marks and the cap are hard to see until Reyes's
  flashlight is on them (the evidence prompts work without seeing them clearly).
* The green-door house measured shorter than the brief's +5 minutes for the direct player (see Length): its new beats
  are all there and all required, but a player who makes no mistakes moves through the timer and the rug quickly. A
  first player who is caught once in the pantry or at the stairs adds about a minute each time.
* All runs are muted or have no audio device. Sound events fire and are counted (the machine's message is dialogue and
  captions; the timer's ticking and ring, the shove, the breathing, the strikes are counted sound events). Nobody has
  listened to any of it.
* Not human-playtested. Pacing, difficulty of the held breath and the rug timing, and whether the new scenes read as
  frightening rather than busy all need a person.

## Private playtest

* **Private build (claude.ai):** https://claude.ai/artifact/L1fN5BuNwnFqwM96VWYBC5 — "Last Light Chapter Seven
  Expanded", a new link, published from commit `4555571` (the commit after it adds only this section). Private to its
  owner until shared from the page's Share menu. It is `dist/` as is, except that the drain creature's `.glb` (which
  the host does not serve) is carried as base64 text with a staged `creature.js` that decodes it to the identical
  bytes, and the page is titled "Last Light Chapter Seven Expanded". Checked before publishing in Chromium, served the
  way the host serves it: it loads, the creature asset decodes, DEV shows Chapter Seven, and seven scenes across the
  chapter start (Jamie on the step, the Tour memory, the Langes' bathroom, it waits at the stairs, the rug, Reyes's page,
  the final image) with no errors. The first draft's build (https://claude.ai/artifact/635uLM7EZYgWma8PRKQjum) was not
  changed and still plays the first draft.
* **Offline package:** `Last-Light-Chapter7-Expanded-Playtest.zip` (3,863,563 bytes, SHA-256
  `72dfda4ca95f43a90afe25ce46bccfccce55039086ddc0ec6fa73b55263fe10c`; sent with the delivery; built by
  `PLAYTEST_CHAPTER=7 node tools/package-playtest.mjs <dir>` from commit `4555571`, clean tree): one HTML file,
  `Last-Light-Chapter7-Playtest.html`, that opens from disk with no server, plus `START-HERE.txt`, `manifest.json` with
  every source file's hash, and the licences. Checked after extracting the ZIP, from `file://` in headless Chromium:
  four scenes start (the creature reveal, the Langes' bathroom, Reyes's page, the names) with no errors. It has not
  been opened in branded Chrome or Edge, which this environment does not have; both run the same engine.
* Start: title screen → **DEV** → **Chapter Seven** → a scene → **START SCENE**; or play Chapter Six to its end card and
  press **Chapter Seven**. **M** turns the sound on; nobody has listened to it yet.
