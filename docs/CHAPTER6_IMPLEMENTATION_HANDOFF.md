# Last Light — Chapter Six: Someone Was Here (implementation handoff)

**Status: Chapter Six — implemented, awaiting human playtest approval.**

The first complete, playable Chapter Six: the next day, Thursday, August 25, 2011, from your bed a little before nine
to the Mill Creek isolation works at a quarter to eight that evening. Story, places, people, gameplay, the horror
beats, the emergency, checkpoints, the DEV selector and tests are implemented. Chapter Six ends on its end card and
does not begin Chapter Seven. This document is not an acceptance: nothing here has been played by a person yet.

## Source and branch

| | |
|---|---|
| Starting branch | `codex/astra-chapter5-ultra-visual-reconstruction` (not modified) |
| Starting SHA | `7db770d6ee491dd8f8b758d82cb43664ab386386` |
| Chapter Six branch | `claude/chapter6-someone-was-here`, created from that SHA |
| History | Linear commits on top of the starting SHA. No rebase, squash, merge or force-push; nothing to `main`. |
| Final SHA | The branch head at delivery (reported in the delivery message; the commit that adds this document or a later docs-only commit). |
| Vault | `docs/last-light-vault` was read, not changed. What it should record once the chapter is accepted is at the end of this document. |

Serve `dist/` over HTTP as before. `?qa` exposes `window.lastLight.chapter6`; `lastLight.jump(section)` starts any
section below; **Continue** on the title returns to the last checkpoint; the private build's **DEV** panel has
**Chapter Six** and its scenes.

## Length

The scripted, direct simulation player (it goes straight to each objective and reads each optional thing once) takes
**about 35 minutes** of game time from Chapter Five's end card to Chapter Six's (see the test report for the measured
number per act). It never wanders: no exploring the streets, the yard, the gatehouse or the chambers beyond what the
story asks. A first-time player who looks around should land in the requested **40–50 minutes**; that is an estimate,
not a measurement, and the human playtest is what will confirm it. Nothing is timed against the player, and every beat
has a time fallback, so a player who stands still is carried on (the sim's idle check runs every beat that way).

How the requested acts map onto the chapter, with the measured direct time of each part (from the report):

| Act | Requested | What it contains |
|---|---|---|
| I. The Morning After | 8–10 min | your room, the camera, Sam's call, the ride, the meeting in Sam's garage |
| II. Familiar Streets | 7–9 min | the oak, back down Oak Hollow, Jamie's house, Briarwood with Reyes |
| III. The Missing Connection | 8–10 min | two o'clock: the weather radio, the camera back, the plan and the file, the argument |
| IV. Below the Neighborhood | 12–15 min | the works: yard, gatehouse, gallery, the radio, the landing, the prints, Line Two, the grille; the water and the gate |
| V. Two of Them | 5–7 min | the other Sam, the gate, after the gate, the bank, two hours later, the end card |

## 1. The story as implemented

Chapter Five's end card (LAST LIGHT / Chapter Five / August 24, 2011) now has a **Chapter Six →** button. It leads to
black and the chapter card: **LAST LIGHT · Chapter Six · SOMEONE WAS HERE · THURSDAY, AUGUST 25, 2011**.

### Act I — The Morning After

**Your room, a little before nine.** You wake lying in bed ("Thursday." / "For a second it was just a morning."). Any movement key
gets you up. The room (your house is Chapter Two's): the desk under the front window with Alex's camera on it, the
calendar (crossed off to the twenty-fourth, school on the thirtieth), the photo strip on the corkboard, the trophies,
the planets poster, the school bag; a mower down the street, the radio in the kitchen. **F** on what you look at.
**F** picks up the camera; **V** raises it; the last picture is the one from the trees, the three of you at the fire,
time-stamped 6:45 PM ("The camera never left your pocket.").

**Sam's call.** The phone rings in the hall ("Can you get that? My hands are wet!"). **F** answers. Sam: his dad knows
everything; he called Alex's dad and the police; Officer Reyes at nine-thirty, "with whatever you found"; the shirt is
still in his bag. Then: Jamie called him at two in the morning from his back yard — "Sam, come to the window. I need to
show you something." Sam didn't go. Jamie says he was asleep; his mom says so; "He doesn't even know our number."
"So who called you?" Mom: "And hey— stay together, okay? All of you." (Never answered: after 55 s Mom picks it up in
the kitchen and calls you to it.)

**Sam's garage, 9:13 AM.** Sam's dad, Alex's dad, and **Officer Reyes** — Sunday night's officer behind Briarwood,
the one who said "Okay." ("You said 'okay.'" / "I did."). Sam takes the gold shirt out of his bag and lays it on the
card table. Alex's dad comes to it: "Where." He holds it: "…It's damp." "His mother bought this at the outlet mall. He
hated the collar." "He wore it anyway. Because she liked it." Reyes: "Sir. I'm going to need to take it." Alex's dad
folds it and hands it over; it goes into a paper evidence bag with its label filled in (case 11-0821, item 3, from
Camp Whippoorwill, "Owl", 8/24/11 ~1930). Reyes asks who touched it; Jamie: the initials carved in the wall, the
four marks.

**The pictures.** **F** by Reyes: you hold the camera, he looks over your shoulder. Each picture gets its own words
(the 1991 register, the search map, the fire). In the picture from the trees, magnified, there is a shape up the bank
behind the three of them that nobody remembers. Reyes: "That's a post. Or a stump." Sam: "There's no post there."
Jamie: "It wasn't there last night." Alex's dad looks at it for a long time and says nothing. (Not found by the
player: after a while Sam zooms to it himself.) Reyes needs to copy the card: **F** gives him the camera ("You'll have
it back this afternoon. I promise."). Jamie tells them about the other Jamie in the cabin ("…It smiled."). Reyes: what
he can do today (the county and dogs to the camp, the 1991 Whitcomb file pulled), and the rest written down. Alex's
dad goes with the deputies. Sam asks where the Mill Street culvert pipe goes. Reyes: meet him at the corner of
Briarwood at eleven; Jamie: start at the oak.

### Act II — Familiar Streets

**The old oak.** The three of them. Jamie: "I didn't call him. I swear." … "It looked exactly like me." … "It looked
at me like I was the one who wasn't supposed to be there." Sam: Jamie had a pine needle stuck to his hat the whole way
back; the other one's hat was clean ("That's how I knew which one was you."). Alex going over the bars at this curb,
"chose to dismount." The chalk (J S A) and the carving (A R) to look at.

**Jamie's house.** On the way down Oak Hollow Jamie stops to tell his mom. The door left open; "Mom?" — her car's
gone, she works Thursdays. Jamie comes back down the walk to you, and on the stairs inside the open door stands Jamie:
his hat, his shirt, his face. It is there only while you look through the doorway with the real Jamie beside you; the
first moment nobody is watching (or when the foyer lamp blinks after a few seconds of watching) it is gone. The view is
never turned toward it. Never looked at: Sam sees it ("Jamie. …Is somebody home?"), and it is gone without you. "Who's
in your house?" … "…Was it me?" Jamie locks the door.

**Briarwood.** Reyes at the creek where Alex turned. His questions; the gap in the fence; the dog that sat down at the
culvert and would not go past it; the helmet they left on the ledge in the drain ("We ran." / "…From what?" — nobody
answers). Thunder far off. Dispatch: the deputies are at the camp, the father with them. "Go home. Eat something. I'll
come by Sam's around two."

### Act III — The Missing Connection

**Sam's garage, a little after two.** The weather radio: a severe thunderstorm warning, rapid rises in small streams and
storm drains. Reyes comes back with the camera (the pictures copied to a disk at the station; **F** takes it), the
county's news (the pump house open and empty; the dogs went round grid seven and sat down), and a borrowed Public Works
plan: the township storm sewer, sheet 3 of 7, 1958, revised 1974. **F** on the plan: Sam reads it, pencilling as he
goes — Briarwood's creek into the culvert, **Line Four** through the woods to the outfall; the creek north to the **Mill
Creek Isolation Works, Gate Structure No. 2**; **Line Two**, Mill Street, brick, 1908, coming in from the other side;
1991's pale thing in the culvert under the Mill Street bridge; Reyes reading from his folder, 1966, Ruth Ann Carver and
the bell at the Mill Street culvert; and 1991's Public Works report: gate 2B found open, the padlock missing, the dog
would not enter Line Two. "…They meet. Right here." Then the trash rack: Public Works pulled a kid's helmet out of it
yesterday morning. "Red? With a seventeen?" Reyes radios for Brandt: "if you're coming, come now. The creek's coming
up." **F** on the photocopies (optional): the 1991 supplementary report and the 1966 blotter.

**The argument.** Reyes: "You three stay here." Sam: somebody has to say if it's his; his dad is at the camp. Sam's
dad: "Absolutely not." Reyes, after a while: they ride with him, look at the helmet in the gatehouse, up top where it's
dry, then straight home. "…Twenty minutes. And Sam stays where you can see him." / "Where I can see him." / "Sam." /
"…Stay with him." / "I will." **F** at Reyes's car.

### Act IV — Below the Neighborhood

**The Mill Creek works, 3:31 PM.** A realistic 1958 municipal flood-isolation structure in a creek valley under a
building thunderstorm: a fenced gravel yard, a block-and-brick gatehouse with switchgear, the creek's concrete channel
with its bar screen (trash rack), two main sluice gates and their operating bridge, a staff gauge, an underground
gallery, and below it the landing (chamber L), gate **2B** in its guides, the junction chamber (J) and Line Two's brick
mouth behind a padlocked grille. **Mr. Brandt** (Ray), thirty-one years with the township, in a hi-vis jacket, with his
Public Works pickup. **F** takes a flashlight from him (T switches it). Optional looks: the channel, the bar screen
where the helmet hung by its strap.

**The gatehouse.** **F** on the bin: the helmet. "That's his." "Seventeen. And the strap's broken. He caught it on the
fence at the pool. In June." Reyes bags it. The gate log (optional): Brandt's entries — yesterday, the helmet; 1991,
2B wide open, the lock gone, "like somebody had the key". The switchgear (optional): 2B on its own breaker. Brandt:
2B is below, where Line Two comes in. Reyes: the boys stay on the gallery, "not one step past it". Sam gets Brandt's
spare radio ("Because you'll answer it.").

**The gallery.** Under the yard, along the gates. A lamp at the dead end comes on by itself and goes out ("Old wiring.").
Sam's radio: Reyes, "Sam, it's Reyes. Stay right where you are. Don't come down." Then the same words, the same voice,
from **behind them**, out of the old intercom horn at the dead end — whose cable is cut, green with corrosion. "Did you
just say it twice?" "…I said it once." Brandt: bleed-over. Reyes: "Come down here. All three of you. Right now."

**The landing and 2B.** Brandt: if the power goes, 2B drops by itself, weight and a brake, so the river can't come back
up Line Two into town. Sam reads the plate on the red hand brake: "Pull and hold to stop leaf. Release: leaf lowers.
Fail-safe." Brandt: the return spring's been broken since June: "If you ever have to use it, you hold it. You let go,
she drops." Then the **prints**: small wet sneaker prints, the checkerboard sole of Alex's Vans, out from under 2B to
the foot of the stairs, where both feet stand side by side pointing up toward the gallery, and back. Everything else
down here is dry. "Up at the gallery." "…At us." Reyes calls for county ID; they're committed at the camp.

**Line Two.** At the grille Brandt locked in March: a mile of brick under town. A bike bell up the pipe, twice. Then
the lamp at the end comes on, and up the pipe stands **Alex** — the figure that is not Alex. Jamie: "…Alex? ALEX! It's
me!" Reyes: "Police! Stay right there!" It runs at them and hits the grille (the chapter's major jump scare): the bars
ring, Jamie goes over backwards into the water, the lights go out, and when they come back it is gone. "That was a
kid. That was a kid!" Reyes calls it in. Brandt: "Reyes. The level."

### Act V — Two of Them

**The water.** The power goes: the alarm, and 2B coming down on its own. "OUT! Everybody under the gate!" Sam,
standing at the brake, takes hold of it and **holds the leaf** a little over a meter and a half up — his hands on the
release, not his weight under anything ("GO! I've got it! GO!"). You get yourself under it (walking; carried after 48 s
if you don't). The river comes through the ports into J. Reyes: let go and come under; Sam: "If I let go it drops! It
doesn't stop, it slams!" Brandt on the radio: the locking pin, red handle, on your side. **F** pulls the pin; **F**
pushes it at the guide: the holes don't line up ("It won't go in!" / "She has to come up another inch!" / "It won't
go UP! It only stops!"). The crank (optional) spins with nothing on the other end of it.

**The other Sam.** The lamp at the far end of J comes on with the power dead, and under it stands **Sam** — while Sam
is at the brake, both seen through the gap under the leaf, both in Reyes's line of sight where he crouches at the gate.
"Sam?" "What?" "…Who's that?" Jamie: "Don't look at him. Sam. Don't look at him." It holds still, copying the real
Sam's pose a beat late, smiles, takes a step, and runs at the brake (the second jump scare). The leaf slams down.
"GUYS—" The light at the end goes out. **Sam is on the other side, and then he isn't anywhere.**

**After the gate.** Jamie at the steel, "SAM! SAM!"; Reyes calls fire and rescue and a dive team. What you can do:
**F** to bang on the gate, pull at it, turn the crank, open the inspection port (brown water against the glass;
"Then, for a moment, a light. Far back. Then not."). Brandt: the junction chamber has a manhole on the bank. Up the
stairs, through the gallery and the gatehouse, out of the yard by the south gate, down the bank to the pad. **F** helps
Reyes lift the cover: black water a meter down, turning on itself. "SAM!" Sirens on Old Mill Road.

**Two hours later, 7:54 PM.** The yard full of lights: the cruisers, a fire engine, a generator. Jamie on the cruiser's
back seat in a blanket: "I should've been faster." … "He held it for me." A firefighter to Reyes: they went in both
chambers; the grille at the end of Line Two was **open**; two hundred yards up the pipe on a line, nothing. "…Go
again." Sam's dad across the yard with Reyes (you can't hear them). Jamie: "Sam, do you have any—" … "…I was gonna ask
him for gum." The other officer: "You put out a call for a second juvenile." Reyes: "He looked exactly like Sam." …
"**I saw them both. At the same time.**" The other officer doesn't write anything down. Then Reyes's radio, one last
time: "…I've got it." Jamie: "That's him. That's Sam." Reyes: "…Sam?" Static. Black, and the end card:
**LAST LIGHT · Chapter Six · SOMEONE WAS HERE · August 25, 2011**, with no Chapter Seven button.

Sam is missing. Nothing in the chapter says or shows that he is dead; the only words used are "gone", "missing" and
what the firefighters did not find.

## 2. How it is built

| File | What it is |
|---|---|
| `dist/chapter6.js` | The director: phases (`c6-`, `d6-`, `e6-`, `n6-`), every beat and its lines, the time fallbacks, F-spots, the camera view, checkpoints, QA jumps and DEV entry, the inventory items. Ported Chapter Five helpers (close looks, stand/guard/make-way, follow-on-bike). |
| `dist/chapter6-home.js` | Your room and hall in Chapter Two's house: furniture, the desk camera, the phone and handset, its own walkable floor. |
| `dist/chapter6-works.js` | The Mill Creek works: valley ground, yard, gatehouse, channel and bar screen, sluice gates and bridge, gallery, stairs, landing, 2B (rack, brake lever, pin, crank, inspection port), junction chamber, Line Two grille and conduit, lamps (mains and emergency), the water (levels, flow shader, falls, jet, spray, debris), the pickup, the prints, its walkable floor (seamless across joins; the gate as a wall when low; deep water not walkable). |
| `dist/chapter6-cast.js` | Sam's dad, Brandt, two firefighters; the three figures (Alex, the other Sam, the other Jamie) with their copy/lag/reach/hit behaviour; the rescue engine. |
| `dist/chapter6-props.js` | The 1958 plan (and Sam's pencil marks), the 1991/1966 photocopies, the evidence bag and label, Reyes's notebook and radios, the weather radio, Alex's helmet, the bin, the gate log, the blanket. |
| `dist/chapter6-storm.js` | Rain streaks (wind, indoor fade), lightning, thunder delayed by distance. |
| `dist/chapter6-kit.js` | Small shared helpers: damping, canvas textures, geometry baking. |
| `dist/chapter5.js` | Hands Chapter Six its phases and calls (`next`); its end card offers **Chapter Six**. Unchanged when Chapter Six is not running. |
| `dist/game.js` | Imports and creates Chapter Six; the sky's storm cover and lightning; storm/flash/cave lighting (all no-ops at 0); `nextChapter` → Chapter Six. |
| `dist/audio.js` | Storm, gate, alarm, generator and phone sounds (synthesised, as before). |
| `dist/pine-forest.js` | Accepts a placement function (the works' trees). Chapter Five's call is unchanged. |
| `dist/index.html`, `dist/style.css` | The chapter card's subtitle line; the DEV Chapter Six button. |
| `dist/dev-chapters.js`, `dist/dev-chapter-history.js` | DEV: Chapter Six and its 25 scenes; its start through Chapter Five's own end card; the history file regenerated by `ONLY=dev-record` (now including Chapter Six's arrival). |

People: **Reyes** is Chapter One/Two's second officer (`officer2`, the one who said "Okay."); **Alex's dad** is the
existing `dad`; the officer at the end is the existing first officer. Jamie and Sam are the existing companions with
the companion brain (moods and points of interest per beat).

Controls are the game's own: WASD/mouse, **F** (what the prompt offers; in tight rooms and at the gate, what you look
at), **V** (Alex's camera; A/D browse, W/S zoom, mouse to pan), **T** (flashlight), **I** (bag), **C** (crouch).

## 3. Checkpoints, QA jumps, DEV scenes

Checkpoints (Continue): The morning after · Sam calls · Oak Hollow, morning · Sam's garage · The old oak · Briarwood ·
The plan · The Mill Creek works · The gallery · Line Two · The water · The gate · Sam · Later · Someone was here.

QA jumps (`lastLight.jump`): `chapter6-start`, `c6-room`, `c6-camera`, `c6-phone`, `c6-ride`, `c6-meeting`, `c6-shirt`,
`c6-photos`, `c6-plan`, `c6-oak`, `c6-street`, `c6-anomaly`, `c6-creek`, `c6-records`, `c6-map`, `c6-works`,
`c6-gatehouse`, `c6-gallery`, `c6-radio`, `c6-lower`, `c6-grille`, `c6-grate-scare`, `c6-emergency`, `c6-hold`, `c6-pin`,
`c6-double`, `c6-sealed`, `c6-rescue`, `c6-manhole`, `c6-aftermath`, `c6-testimony`, `chapter6-end` (plus aliases such
as `c6-duplicate`, `c6-disappearance`, `c6-reyes`).

DEV → Chapter Six: Chapter Six Start (through Chapter Five's end card and its button) and 24 scenes: the morning after,
Sam's call, the adult meeting, the gold shirt, the pictures, the oak, familiar streets, the neighborhood anomaly, the
creek drain, drainage records, the 1958 plan, drainage works entry, the gatehouse, the radio anomaly, the lower chamber,
the grate scare, rising water, the gate release, the duplicate reveal, post-disappearance, the rescue attempt, the
aftermath, Reyes's testimony, the end card.

## 4. Earlier chapters

Chapter Six's behaviour runs only in its own phases. Everything it changes in shared code is a no-op at zero (sky
storm/flash, storm/cave lighting) or routed through `chapter5.next`. Its world (room, works, storm, figures) is
attached only while it runs and is removed by its reset, which every Start over, Continue, jump and DEV start calls.
The test suite checks, after Chapter Six has run, that Chapter Five, Four, Three and Two start with no works, no storm,
no room and no storm sky. Chapter Five's end-card check now expects its Chapter Six button (it used to expect none).

## 5. Known limitations and risks (for the playtest)

- **Runtime** is measured only for the direct simulation player; the 40–50 minute figure for a person is an estimate.
- **Audio** was exercised (every event fires its sound) but never listened to: all automated runs are muted. The
  storm, the gate, the alarm and the phone are synthesised like the rest of the game's sound.
- **Art** is a coherent first draft that reuses the game's people, faces, Chapter Five's garage and forest kit; the
  works and your room are new and simpler than Chapter Five's Pine Ridge. Software-rendered captures only (no GPU).
- The other Sam's stillness and run are tuned so that you and Reyes see both at once through the gap; a player who
  refuses to look still gets the gate after 16 s (Reyes sees it either way).
- Three hidden background people in the shared scene (pre-existing, not Chapter Six's) have unbuilt face geometry until
  first shown; Chromium logs one bounding-sphere warning for it. Chapter Six's own faces are built at creation.

## 6. For the vault (once accepted — not done here)

When a person has played and accepted the chapter, the vault (`docs/last-light-vault`) should record:

- the files above and this handoff and its test report (`docs/CHAPTER6_TEST_REPORT.md`, `docs/qa/chapter6-someone-was-here/`);
- canon introduced by Chapter Six: Officer **Reyes** (badge 212) is Sunday night's second officer; **Ray Brandt**,
  Oak Hollow Township Public Works, thirty-one years; the **Mill Creek Isolation Works, Gate Structure No. 2** (1958),
  where **Line Four** (Briarwood, via the creek) and **Line Two** (Mill Street, brick, 1908) meet; gate **2B**'s
  fail-safe brake and its broken return spring; 1991: 2B found open on August 27, padlock missing, K-9 would not enter
  Line Two; 1966: Ruth Ann Carver, the Lyric, the bell at the Mill Street culvert (W. Keller); Alex's helmet (red, 17)
  recovered from the bar screen on August 24; the shirt in evidence (case 11-0821, item 3);
- events: Sam's 2 a.m. call from "Jamie"; the shape up the bank in the campfire picture; the other Jamie on his stairs;
  the voice twice from the cut intercom; Alex's prints on the landing; the Alex figure at the grille; **Sam missing
  since about 4:20 PM, August 25, 2011, in the junction chamber; not found; not confirmed dead**; Reyes saw both Sams
  at once and said so; the grille found open afterward; Reyes's radio: "…I've got it."
