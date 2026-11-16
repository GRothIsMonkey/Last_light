# Aftermath II (August 2021): implementation handoff

Branch `claude/aftermath2-2026-final-coda`, started from `claude/final-art-bible` at
`643c345a0195d34e4c77f2d5de4af4b75f1fc264` (the newest branch that had both the title-screen work and the final art
bible; nothing newer existed). Not merged into `main`; no released branch was changed. The 2026 coda is documented in
[FINAL_CODA_HANDOFF.md](FINAL_CODA_HANDOFF.md), the credits and the release in
[FINAL_CREDITS_AND_RELEASE_HANDOFF.md](FINAL_CREDITS_AND_RELEASE_HANDOFF.md), the tests in
[AFTERMATH2_TEST_REPORT.md](AFTERMATH2_TEST_REPORT.md).

## 1. What it is

One evening, without a cut: August 27, 2021, ten years to the day. The protagonist (twenty-two, still unnamed) drives
back to Oak Hollow, meets Sam (twenty-two) at the old curb, and the two of them walk the neighbourhood at the player's
pace until the streetlights come on. Everything is first person and playable except the title card and the end card.
Jamie and Alex are dead and stay dead: no adult versions, no ghosts, no visions. Nothing supernatural appears, is heard
or is hinted at (no eyes, no roar, no stinger); the official explanation stands; the Presence is not mentioned.

How to reach it: Aftermath I's end card now has **Aftermath II →**; DEV → **Aftermath II** lists every section and the
variants; Continue returns to the last checkpoint. Aftermath II's own end card has **One more lap →** (the coda).

## 2. The scenes, in the order they play

The brief's sixteen scenes, with the one deliberate change of order: Briarwood's corner (d 589) is below Jamie's house
(d 791) on the way up the hill, so Alex's corner and house come before Jamie's. Section ids are what Continue and the
DEV menu use.

| # | Section | What happens | Playable |
|---|---|---|---|
| 1 | `aftermath2-start` | Black; the card **AFTERMATH II / TEN YEARS LATER**. | card |
| 2 | `a2-drive` | Your car at the bottom of Oak Hollow Drive. The restrained title **OAK HOLLOW — AUGUST 2021** over the road. Hold W to drive (S slows); look anywhere; a car passes the other way; a mower, a dog walker. Sam's text on the phone on the vent ("at the curb. the old one"). **F** pulls over across from your old house; take the notebook off the seat (F), his cap too if it is yours (F); get out. | yes (driving) |
| 3 | `a2-street` | Across the street to the old curb. Your house is blue now, somebody else's: a red SUV in the drive, a kid's scooter dropped by the front walk, a pink hopscotch on the sidewalk. The pole opposite, replaced in 2011, gone grey with the rest. Sam on the curb, on his phone, looks up. | yes |
| 4 | `a2-sam` | "You actually came." A choice of what you say, then how you say hello (hug / shake hands / punch his arm), which remembers how you said goodbye in Aftermath I. "You got tall." The calls that turned into birthdays. "Your house is blue." | yes (choices) |
| 5 | `a2-walk` | Up the hill together; Sam walks beside you on whichever side he is already on, at your pace (never blocks, never strands). The hill ("You said that. When we were twelve."), the dog he knows, his mom's text about dinner, what you both do now (the hardware store on Main; he has a key). | yes |
| 6 | `a2-alex` | Briarwood's corner, where Alex said "Alright, I'm this way" and rang the bell twice at every corner (the bell is only remembered: nothing rings). Down Briarwood past the new creek fence to his house; his parents still live there. The Sunday print from the back of the notebook (F). | yes |
| 7 | `a2-jamie` | On the walk back: does Sam still ride ("Same frame"); a shot off a rim further up the street rolls into the gutter — pick it up and throw it back (F), or the kid comes for it. Jamie's house, somebody else's: a different car in the drive, a summer wreath on the red door, his mother's red chair kept on the porch, a kid's bike dropped on the lawn. His mother moved to her sister's and took his bike; the BMX line follows where you left it in Aftermath I; his cap (out of your pocket, or "she took his cap too"). Biscuit, the dog he made up. "He was so stupid and he was the best one of us." | yes |
| 8 | `a2-summerfield` | Where the road went down: a newer square of pavement and fresh crosswalk paint ("They did the whole intersection over. Twice."). The Kowalskis' lot, a house somebody built ("a boat he never takes anywhere"). | yes |
| 9–11 | `a2-streetlight` | The curb under the streetlight across from Sam's, where the four bikes stood. Sit with him (F). His mom on the porch (wave or don't). Ten years: what you remember (choice). Sam's memory: the chain ("Turn the pedal backwards. Slow."; he fixes kids' chains free at the store). The notebook, held open (Q/E turns the pages): ALEX · JAMIE · SAM in your writing; inside the back cover his aunt's number, his dad's e-mail rubbed to an @, **RULE 6. WRITE BACK.**, the Sunday print tucked in below. "You're bad at rule six." | yes (choices, pages) |
| 12 | `a2-trench` | The newer houses where the street went into the ground (d 1047–1095): newer asphalt with a tar seam, new curbs and sidewalk panels, young trees on stakes. The Hendersons are still there (Lily is driving now). Mrs. Pruitt still in hers ("She tells everybody Jamie lifted that awning off her by himself." "I was there." "She leaves you out of it. It's a better story."). | yes |
| 13 | `a2-oak` | The old oak at the end of the street in the golden light ("It's bigger."). At your own pace: put a hand on the trunk, the AR carving (unchanged, older), the foot of it ("Neither of you sits there."), push the swing ("a new rope on it... still swings crooked"), look back down the street, the print again. Under it: a choice of what to say, and "Race you to the end of the street." remembered. | yes (choices) |
| 14 | `a2-children` | Two kids on bikes, real 2021 kids who live here now (never the four of them): round the end of the street, stop about fifteen metres off, argue about seven-thirty, and part — **"See you tomorrow!"** / "Bye!" — then **SAM: "We used to do that." / YOU: "Yeah." / (pause) / SAM: "Feels like it was yesterday."** | yes (free look) |
| 15 | `a2-leave` | The streetlights come on, one after another. "Rule four." (choice: say it, or nod). Sam goes a few steps and waits; look back at the oak if you want; "You coming?" The fade. | yes |
| 16 | `aftermath2-end` | **Aftermath II / TEN YEARS LATER / August, 2021.** — **One more lap →** (the coda), Start over, Back to the title. | card |

The clock runs from 5:44 PM to about 7:30 PM (four times real time, faster at the very end); the sky goes from late
afternoon to golden hour to dusk (`SKY10` in `aftermath2.js`).

## 3. Files

| File | What it is |
|---|---|
| `dist/aftermath2.js` | The chapter director: sections, aliases, labels, phases, the save, what carries over from Aftermath I, the sky and clock, the inventory, inspect/pose/offer/choice plumbing, the end card. Chained after Aftermath I (`aftermath1.next=aftermath2`), delegated to the same way Aftermath I is from Chapter Eight. |
| `dist/aftermath2-scenes.js` | The scene scripts (generators on the director's task runner), the section starts (each a checkpoint), the drive, Sam's following, the neighbours, the hoop, the children, the end. |
| `dist/aftermath2-town.js` | Oak Hollow in 2021 (see §5). |
| `dist/aftermath2-actors.js` | Adult Sam, the adult first-person body, the neighbours, the hoop kid, the two children on bikes, the dog, the mower (see §6). |
| `dist/aftermath2-props.js` | Sam's notebook (one builder for 2021 and 2026, cover and page textures), the Sunday print, the photo-booth strip, Jamie's cap (Aftermath I's design exactly), the phone and its texts, your car with its cabin. |
| `dist/coda2026.js`, `dist/final-credits.js` | The coda and the credits (their own handoffs). |
| `dist/game.js` | Wiring: the chapter, the coda (render path, Prologue ride on autopilot), the credits state, the end screen, QA hooks. |
| `dist/aftermath1.js` | End-card button to Aftermath II and delegation to it (no change to Aftermath I's story). |
| `dist/people.js` | `createActor(..., {refine:false})` so the adults keep their derived faces. |
| `dist/dev-chapters.js`, `dist/index.html` | DEV entries **Aftermath II** and **2026 · Credits**. |
| `dist/audio.js` | `a2Bell` (the kids' bell), `screen(k)` (the room's hush as the monitor recedes), `theme(on)` (the Prologue melody under the title and credits). All synthesized. |
| `dist/style.css` | The place title and the credits. |
| `tests/aftermath2-sim.mjs`, `tests/verify.mjs` | The input-driven test (`ONLY=aftermath2`). |
| `tests/aftermath2-shots.mjs`, `tests/aftermath2-shot-defs.mjs` | Real-renderer captures (Chromium, SwiftShader WebGL). |
| `tools/package-playtest.mjs` | `PLAYTEST_CHAPTER=final` builds the complete-game offline package. |

## 4. Saves and what carries over

- Reads Aftermath I's save `lastlight.aftermath1` and never writes it. Carried over: `cap` (`you`/`mom`), `capWhen`
  (`shelter`/`porch`), `notebook`, `print`, `camera` (always `parents`: Alex's camera is never yours), `told` (what you
  said in Aftermath I: the BMX at the porch, the call, how you said goodbye, the shadow in the picture), `boxed`,
  `wrote`, `bell`. Without an Aftermath I save (DEV, or a fresh browser) the defaults are the most common path: the
  cap kept, the print, the notebook.
- Writes `lastlight.aftermath2` at every checkpoint and at the end card: the carried values, what you said
  (`said`), what you looked at (`looked`, e.g. the notebook pages), `capWith`, `section`, and
  `home:["YOU","SAM"]`, `lost:["JAMIE","ALEX"]`, `presence:"sealed"`, `year:2021`.
- The cap is only ever where Aftermath I left it: on the passenger seat / in your back pocket if you kept it (taken
  out at Jamie's if you want), with his mother if you gave it (Sam tells you she wore it out to the car once). In 2026
  it is on the desk only if you kept it.
- The completion record `lastlight.complete` is written the moment the credits begin (see the credits handoff), so
  skipping them can never lose it.

## 5. The town in 2021 (`aftermath2-town.js`)

The art bible's "rebuilt, not reset": same streets, same lots, recognizable geography, newer things where the night took
the old ones.

- **Lost houses** (Chapter Eight's own story houses and the shared damage map's torn, crushed and burned lots: 895w,
  907e, 937e, the Kowalskis' 939w, 967e, 968w, 995e, the Kesslers' 1026w, 1052w, 1081w, 1081e, 1110w, 1114e) are cut out
  with the exact per-lot physical cut volumes Chapter Eight uses, and new houses stand on the same footprints, built by
  the world's own house builder (`houses.js`) with newer colours, a young tree on a stake, a mailbox, a newer car in
  some drives. The Hendersons' (1026e) is rebuilt in the same style. All of it merges into about fifteen draw batches
  like the world's own houses (build ~250 ms, once).
- **Your house** is the same plan re-sided blue with a new door, a red SUV in the drive, a scooter and a hopscotch.
- **The road**: newer asphalt over the storm line (d 1047–1095) with a thin tar seam, new curb and sidewalk panels and
  sod on its west side; a newer square at Summerfield with crosswalk paint; the patch in front of Sam's.
- **Jamie's** gets a different car and a wreath.
- **The end of the street in 2021 has no 2011 chalk**: the world's chalk there (the sun, the JSA initials, the
  hopscotch) is folded away while 2021 is shown and restored exactly afterwards, and the Prologue ending's own objects
  (`ending.js`: the chalk riders, the faint AR clue, the other bike) are hidden every frame. The ending's per-frame
  logic keeps running in later chapters and treats the call home as done, so without this the faint AR chalk could
  show at the cul-de-sac in 2021 if you looked down at it, or during a fade. A standalone check stands on that spot,
  looks down, and asserts none of it is visible.
- **The hoop**: the kid shoots at one of the street's own garage hoops (`houses.js`), the nearest one past the
  Briarwood corner whose driveway has no parked car; none qualifying, no kid.
- **Traffic**: a car now and then on the right side of the road, slowing for people; one turns into a drive and parks.
- **Lamps**: the streetlights come on one after another at the end (the world's own lamps, by override).
- Everything is removed and every cut restored on reset; no earlier chapter sees any of it.

## 6. The adults (provisional)

All derived from the existing models, never new likenesses, and marked provisional in code for the art pass:

- **Sam at 22** (`SAM21`, A-21): twelve-year-old Sam's face numbers aged (longer jaw, flatter cheek, a little stubble
  and a longer lower face via `ageHead`), adult proportions (scale 1.165, broader shoulders, smaller head ratio), shaggy
  dark hair, a green T-shirt and jeans.
- **You at 22** (`YOU21`, A-20): the protagonist's own model at adult scale, used as the first-person body (your hands
  on the wheel, your legs when you sit). The eye is raised to adult height (+0.22 m).
- **You at 27** (`YOU26`, the coda): see the coda handoff.
- Neighbours (a man mowing, a woman walking a dog, Sam's mom on the porch), the hoop kid and the two children on bikes
  are built on the shared rig as different people with their own face numbers, hair and clothes.

## 7. DEV scenes

**DEV → Aftermath II** (`DEV_SCENES[10]`): Aftermath II Start (from Aftermath I's end card) · The Drive In (Oak Hollow,
August 2021) · The Rebuilt Street (your old house) · Sam (the reunion at the curb) · Sam (you hugged him goodbye in
2011) · Sam (you said "See you, Sam." in 2011) · The Hill (walking the old neighborhood) · Briarwood (Alex's corner, his
house) · Jamie's House (you have his cap) · Jamie's House (cap given at the shelter) · Jamie's House (cap given on her
porch) · Summerfield (where the road went down) · The Streetlight (Sam's memory, the notebook) · The New Houses (the
patched road) · The Old Oak · The Children on Bikes ("See you tomorrow!") · When the Streetlights Come On · Aftermath II
Ending (the end card).

**DEV → 2026 · Credits** (`DEV_SCENES[11]`): 2026 Coda Start (from Aftermath II's end card) · The Prologue Image (the
summer street) · The Camera Pulls Back (the monitor) · The Room in 2026 (you kept his cap) · The Room in 2026 (his
mother has his cap) · The Final Line ("I still remember.") · LAST LIGHT (the title on the monitor) · The Final Credits.

A DEV start is always the same scene (`devFresh`): it never reads a player's own Aftermath I/II choices unless the entry
is that variant. Section ids also accept aliases (`ALIAS10`, e.g. `a2-reunion`, `a2-notebook`, `coda-desk`, `credits`).

## 8. Audio

All synthesized (`audio.js`); no recordings, no music under conversations, nothing that suggests a threat.

- **Ambience** (the world's own layers, set for a summer evening in 2021): insects .34, wind .28, neighbourhood life .6,
  distant traffic .09; no forest, tunnel or water.
- **Sources with a place in the world**: your car's engine while you drive and the engine off when you park, car doors,
  a passing car's engine, the mower, a sprinkler at the end of the street, the dog walker's dog, the hoop kid's dribble
  and the rim, the screen door at Sam's (and one somewhere behind you), the kids' bike bell (a real bell on a real bike:
  `a2Bell`), the lamps' click, the swing's creak, cloth for the hug and the throw, footsteps.
- **Music**: none in Aftermath II. The Prologue's own melody comes back only in the coda (the Prologue ride, then under
  the title on the monitor) and under the credits (`theme()`), see the credits handoff for the cue interface.
- **The coda's room**: as the monitor recedes, the game's sound narrows to two small desk speakers with a computer's fan
  and a lamp's hum under it (`screen(k)`).

## 9. Notes for whoever changes it

- Sam's following is `samWalks()`/`besideYou()` with a safety net (`samNet`) that brings him back if he is ever left
  far behind or stuck; scenes take him off it (`samGo`) and put him back.
- Each section start (`startDrive`, `startStreet`, ...) sets the world, the clock, the people and the car the way the
  story has them at that point, so DEV and Continue start the same way every time.
- In the car the seated body uses a car-seat height (h .2) so the adult body's eyes are at the camera (1.25 m over the
  road) and its feet on the floor; the steering wheel is about .45 m ahead of the shoulders.
- The notebook colour: Chapter Seven's notebook prop is green (`0x3a6a4a`), Aftermath I's (which the protagonist
  carries away) is blue (`0x2c4a7a`). Aftermath II and the coda follow Aftermath I. The art pass should pick one.
- Daytime windows: the world's window-light thresholds are shared with the rest of the game, so by about 6:45 PM some
  windows are lit warm, as on any evening.

## 10. Known issues and limits

- Adult Sam and the adult bodies are provisional derivations; faces are the game's stylized faces at adult proportions.
- The car's cabin is simple (boxes); its exterior is the world's sedan. There is no glass drawn from inside.
- Software-rendered captures cannot show GPU performance; audio, pointer lock and a full human playthrough are on the
  human checklist in the test report.
- Not started, on purpose: the full-game graphics reconstruction. No accepted chapter was rewritten.
