# Last Light — Chapter One handoff (for Astra)

**Branch:** `claude/relaxed-heisenberg-gv002b` (the session's assigned development branch; the brief suggested a name like `claude/last-light-chapter-1`).
**Base:** `codex/astra-last-light-final-polish` at `9520b4f1d72759b27ac823671bdefae19ce27e55`, verified before any work: clean tree, baseline tests run.
**Not touched:** the release branch and `main`. Nothing was merged.

This pass turns "Go home" into the start of Chapter One: the night Alex did not come home. The scope ends at the first physical clue. It is a structural and gameplay pass. Lighting, materials, character and vehicle art, and performance polish are deliberately left for your pass; the notes below say where to find each part.

---

## 1. What the player experiences

### Prologue (kept almost entirely)
- **Same overall shape.** The ~5-minute ride, the formation riding, the memory lines, the lookout and its interactions are all as before.
- **Alex now leaves first.**
  - At d 556 he says “Alright, I’m this way. See you tomorrow.” He eases off, turns right onto **Briarwood Lane** (d 595), rings his bell twice and waves over his shoulder.
  - He rides on until Briarwood's curve, by the creek strip and its trees, takes him out of sight.
  - Nothing ominous happens. A test asserts that the spot where he leaves the scene is outside the view or occluded.
- **Jamie and Sam keep their full house sequences**, now farther along the street:
  - Jamie at d 791: his mom at the door, the bike dropped on the lawn.
  - Sam at d 994: rides into his garage, and the garage door closes.
- **The optional setup line is in:** Alex “Did you guys hear that?”, Jamie “Hear what?”, Alex “Never mind.” (d 376–405).
- **No immediate end card.**
  - Go home (or the idle fade) leads into the ride home.
  - “We left our bikes wherever we stopped.” then **“I thought I remembered everyone.”** play as the transition.
  - The picture fades briefly and returns a little farther along the ride home, at d ≈ 840, 8:44 PM.
  - The chalk AR still shows plainly in that fade, as it did in the old final fade.

### Chapter One
1. **Ride home (about 25 s of quiet).** Then a siren starts far off, ahead, toward town.
2. **The police car.**
   - It comes up Oak Hollow toward you. Its speed is timed so it passes you just after you cross Briarwood, but only while you are actually riding toward it.
   - It passes about 4.4 m from you with a Doppler drop, braking as it passes.
   - It turns onto Briarwood behind you. Your head turns to follow it and the bike eases briefly.
   - It runs down Briarwood with red and blue lights on the houses.
   - The siren winds down round the bend.
3. **Title card.** After about 1.8 s of quiet, a large, simple **LAST LIGHT** card. Then the objective *See what’s happening on Briarwood.*
4. **Alex's house (u 127, just round Briarwood's curve, past the creek).**
   - **Vehicles:** two patrol cars at the curb, lights going; the second one is yours.
   - **Alex's house:**
     - porch light on, front door open, his bedroom light on;
     - garage open, with empty J-hooks where a bike would hang;
     - **no bike anywhere.**
   - **People:**
     - Alex's mom on the porch on a cordless phone;
     - his dad in the driveway with the officer;
     - a neighbor across the street, arms folded;
     - a second officer at his car on the radio.
   - **The conversation.** Come within about 13 m and the officer walks over:
     - “You were with Alex tonight?” / “Yeah.”
     - “When did he leave you?” / “At Oak Hollow. He turned here.”
     - (his dad) “He never came home.”
     - “Was anyone with him?” / “No.”
     - Then: “Okay. Thank you. Head on home now, alright? We’ll call your folks if we need anything.”
   - **Overheard afterward:**
     - the radio: “…twelve-year-old male, last seen on Oak Hollow around eight, riding a green bicycle…”;
     - now and then his dad's voice calling “Alex!” down the street. This is sound only, quiet, never at the creek.
5. **Find Jamie and Sam.**
   - **Jamie:**
     - Walk to his side bedroom window; **F: Tap on the window.**
     - He appears in his lit room and slides the sash up. “Dude. What are you doing?” → “Ha. Nice try.” → “…Wait. For real?” → “Okay. Hang on.”
     - He climbs out. Concerned, wanting to help: “Is his mom okay? Did they say anything?” … “We have to help look.”
     - He stands his bike up off the lawn and rides with you.
   - **Sam:**
     - Tapping his window gets nothing ("He sleeps with a fan on"), so Jamie throws two pebbles at the glass.
     - Sam at the window, skeptical and nervous: “What? My dad’s still up.” / “That’s not funny.” / “This is so dumb. Okay. Side door. Two minutes.”
     - His big garage door stays shut (the landmark from the prologue).
     - He comes out of the **garage's side door** pushing his bike: “If my dad finds out, I’m dead.”
   - **Without Jamie,** Sam's window doesn't answer and the objective becomes *Find Jamie.*
6. **The old oak.** They stop by the lookout and compare memories:
   - Jamie: “Okay. He turned onto Briarwood. We all saw him.” / You: “He waved. He rang his bell.”
   - Sam: “He stopped first.” / You: “No he didn’t.” / Sam: “Yeah, he did. For a second.”
   - Jamie: “Back on the hill he asked if we heard something. Remember?” / Sam: “That was nothing.”
   - Jamie: “Then let’s go the way he went.”
7. **Retrace his way home.**
   - The night is darker now, with a few lines along the way.
   - On Briarwood, short of the bend, Jamie stops them: “Wait—stop. Cops. If they see us, we’re done.”
   - A second officer is walking the far sidewalk with a flashlight. That is the natural limit; there are no invisible walls.
   - **If you ride on,** the officer tells you kids to go home and Jamie calls you back.
8. **The creek.**
   - They leave the bikes by the culvert railing. Jamie turns on a flashlight (a real light) and they go down the worn path on the inside bank.
   - **Optional:** a faint bike tire line in the soft ground. If you look at it closely, Sam says “Somebody rode down here.”
   - **The clue:** a broken red rear reflector with a black tape band in the weeds by the channel. It catches the flashlight.
   - **F: Look closer.** You crouch to it:
     - **You:** “That’s his.”
     - **Sam:** “Why would he come back here?”
     - Silence: water, katydids.
     - Then, far off and deeper in toward the woods past the fence gap, **a bicycle bell, twice**.
   - Everyone turns toward it. Fade to black.
   - **The end card:** *LAST LIGHT · Chapter One · Briarwood · August 21, 2011*, with Start over and Back to the title.

The mystery rules are kept:
- AR stays separate and unexplained. Alex has no surname in the game, so his initials can never be AR.
- The old bike under the oak is quietly gone that night, and nobody mentions it.
- No supernatural answer is decided.
- Nothing is lifted from Stranger Things: no lab, no monster, no powers, no chase.

---

## 2. Where things are (code map)

| File | What |
|---|---|
| `dist/chapter1.js` | **The director.** Phases (`leave → home → cruiser → title → briarwood → friends → oak → retrace → creek → clue → end`), objectives, dialogue queue, title card, date line, darkness ramp (`DEEP`), clock (`CLOCK`), checkpoints, QA jumps, Alex's-house staging, both window sneaks, the oak, the creek, the clue, flashlights, fireflies at the creek, audio sources, head attention. |
| `dist/police.js` | Reusable patrol cars: build, livery, lightbar, glow sprites, path driving with a turn/brake speed profile, parking. Two pooled emergency `PointLight`s and one shared `SpotLight` (headlights, later Jamie's flashlight) are created once and only switched by intensity. Static parts are merged into about a dozen draw calls per car. |
| `dist/people.js` | Adult NPC specs (`ADULTS`: two officers, Alex's mom and dad, a neighbor) and a world-space actor: place / walk along a path / turn / head-look / gestures (`fold`, `hips`, `phone`, `radio`, `head`, `flashlight`, `talk`, `point`, `wave`) with per-foot ground contact. Also `worldPath` and `headingTo`. |
| `dist/companions.js` | Jamie and Sam in world space. They follow **the path you actually rode** (a trail of your bike's positions), so they go round the same corners. Each keeps a gap and an offset to one side on straights. Scripted steps: rideTo, brake, dismount, mount (dismount reversed), drop, kickstand, lift (a lying bike), walkTo (optionally pushing), turnTo, idle, pebble, climb (out of a window). |
| `dist/nav.js` | "Where can I ride or walk at night" for any world point. It asks whichever street owns the point (Oak Hollow or Briarwood). Includes exact house and garage walls and AC units, fences, the creek, Briarwood's mouth, and yards up to the rear fences. |
| `dist/creek.js` | The drainage strip: the concrete channel, culvert headwalls and railing, the grate wall, chain-link with a back gap, trees, weeds, the dirt path. `W.creekInfo.spots` holds the clue, track, bell, grate and gap positions. |
| `dist/game.js` | Night states `c1-ride`, `c1-dismount`, `c1-walk`, `c1-remount`: free world-space riding with turn rate, curb/edge sliding, pivoting when stopped, solid people and cars, and hands-off line holding round curves; walking anywhere walkable. Also `placePlayer`, `nightRendering`, `jumpTo`, Continue, and the QA autopilot. |
| `dist/audio.js` | New loops: `siren` (wail/yelp/wind-down, Doppler via `pitch`, muffling behind houses), `radio`, `tv`, `water`, `idle`. New one-shots: `tap`, `pebble`, `window`, `click`, `squelch`, `carDoor`. Also `callName()` and night katydids. |
| `dist/layout.js`, `terrain.js`, `houses.js`, `streets.js`, `furniture.js`, `props.js`, `world.js` | Briarwood's bend (0.9 rad from u 62 over 50 m), the creek dip in its ground, Alex's house as a side-street home (`SIDE_HOMES.alex`), the friends' sneak windows with lit bedrooms, Sam's garage side door, Briarwood lamps, lamp heads in one shader. |
| `dist/index.html`, `style.css` | `#title-card`, `#objective`, `#continue` (inside the title menu only), and the new chapter-end `#ending`. Captions and memory lines draw above the fade. |

### Prologue layout changes you will notice
- **Jamie** moved to dc 791 and **Sam** to dc 994.
- **Sam's garage** is now on the far side of his house (`garageSide:'far'`). On the near side, the neighbor's garage left only 0.8 m for his side door.
- **Alex's old Oak Hollow lot** is an ordinary house. Alex lives at Briarwood u 127.
- **On both friends' houses** the AC unit moved off the bedroom wall's back half so it no longer sits under the sneak window.
- **Memory lines** were re-timed to the new departures (see `story.js`). The old Alex line “See you.” became “Alright, I’m this way. See you tomorrow.”

---

## 3. QA jumps and checkpoints

- **In `?qa` mode:** `lastLight.jump(section)`.
- **Outside QA mode:** add `?jump=<section>` to the URL and press the start button.
- **Sections:**
  - `alex-departure` (in the prologue, d 528)
  - `ride-home`
  - `police` (car already coming)
  - `title`
  - `alex-house`
  - `jamie` (at his window)
  - `sam` (at his window, with Jamie)
  - `oak`
  - `retrace`
  - `investigation` (at the creek)
  - `clue` (next to the reflector)
- **Other QA hooks:**
  - `lastLight.drive([[x,z],...])` rides there with W and A/D. It brakes for sharp turns and sidesteps if stopped.
  - `lastLight.placePlayer({x,z,a,mode:'ride'|'walk',bike})`.
  - `lastLight.state.chapter` gives the phase, flags, current line, cars, lights, companions, glint and so on.
  - `lastLight.chapter` gives the director itself: cars, actors, companions, clue.
- **Checkpoints:**
  - Stored in `localStorage['lastlight.chapter1']` at: Alex's house (after the title), Jamie, Sam, the oak, the retrace and the creek.
  - **Invisible during play.** The only UI is a **Continue** button inside the title menu (and Back to the title), with the place name next to it. It never appears in a scene.
  - Start over and the end card's Start over replay from the prologue. Everything is reset (see the replay test).

---

## 4. Tuning knobs (all in `dist/chapter1.js` unless noted)

**Story timing and look**
- `CLOCK` and `DEEP`: the time shown on the date line and how dark each phase gets. Lighting reads `deep` in `game.js` and lowers hemisphere light, sun and exposure gently.
- `toRideHome()`: where the ride home resumes after the fade.
- The `leave` phase: the timing of that fade.
- The `home` phase: the siren start (`d<700` or 28 s).

**The police car**
- `sendCruiser(gap)`: how far away it starts.
- `cruiserSpeed`: target meeting point `M=566`, speeds 8–15 m/s, and the Briarwood speeds.
- `police.js` `go()`: the turn and brake profile (3 m/s² sideways).
- Wig-wag `pattern`, light intensity (`on*100`), glow sprite sizes.

**Alex's house and the friends**
- `nightWorld()` and `arrivedScene()`: who stands where at Alex's house.
- `startAlexTalk()`: the 13.5 m trigger and the 24 m walk-away range.
- `windowInfo()`, `tapJamie`/`jamieOut`/`jamieToBike`, `tapSam`/`samAtWindow`/`samGoes`/`samOut`: the window and garage choreography.

**The creek and the clue**
- `copsAhead()`: the creek stop at Briarwood u > 72, and where the bikes are left.
- `clue`, `track`, `findClue()` (crouch distance and eye height), `updateClue()` (the flashlight glint), and the 38 s fallback where Jamie spots it.
- The bell position: `world.creek.spots.bell` (u 100, v 62, in the woods beyond the fence gap).

---

## 5. Performance notes

**Static world**
- 897 merged meshes and 1.68 M triangles (budget: < 900 and < 1.7 M). It was 893 / 1.62 M before.
- Lamp heads now share one material through a per-lamp uniform level.
- Interior and garage materials are cached per scene.
- Houses past Briarwood u 150 are "far" level of detail.

**Night extras**
- Two cars at roughly a dozen calls each (merged).
- Five adults and two companions on the existing rigs.
- One flashlight cone and one officer's beam cone.
- 26 creek fireflies in one draw.

**Lights and shaders**
- The extra lights (2 point, 1 spot) are attached **only while the screen is dark**: at the transition fade, the idle fade, or a jump. At the same moment the sun's shadow map switches off; the sun is about 0.04 intensity by then, so nothing visible flattens.
- That shader change happens once, out of sight. On replay the prologue's light set comes back.
- Outside QA mode `renderer.compile` warms the night programs during that same dark moment.

**Measured in the browser**
- Draw calls in the night captures reached at most about 430 and triangles about 780 k (SwiftShader). The prologue's own maximum is 462 calls and 809 k.
- **Real-GPU frame rate has not been measured.**

**Siren muffling** is 8 point tests per frame against the wall grid. Companions and adults do a few ground queries each per frame.

---

## 6. Tests and QA material

**Commands**
- `npm test` (`node tests/verify.mjs`; full geometry sweeps included).
- `QA_OUTPUT=docs/qa SOFTWARE_GL=1 npm run test:browser`.

**Simulation coverage.** Chapter One is played through the way a player would, by autopilot:
- the quiet seconds before the siren;
- the pass point and distance, and the turn happening behind you;
- the head turning to follow the car, then the title and objective;
- every scripted line, both window sneaks, the side door, the oak, the retrace, the creek, the clue and the chapter end;
- no non-finite positions anywhere, and companions never hidden or left behind.

It also covers:
- every QA jump;
- Continue living only in the title menu;
- lingering 90 s at Briarwood;
- riding the wrong way while the siren starts;
- replay from mid-chapter, which resets night rendering, adults, companions, windows, doors, the clue, the objective and ambient night mode.

**Browser coverage**
- the same natural chapter run, captured at each beat (`docs/qa/c1-*.jpg`);
- every QA jump (`qa-jump-*`);
- 150 s lingering at four places (`linger-*`);
- unusual angles: straight up, straight down, behind, and from above the police scene and the creek (`angle-*`);
- Continue on the title (`c1-22-title-continue`);
- offline renders of all night sounds (`docs/qa/audio/*.mp3`, `audio-review.html`).

---

## 7. Known issues and limits (for the art and polish pass)

**Window climb.** Jamie's climb out of the window is a simple sit-on-the-sill-and-drop blend. It reads at night from the stand point but would not survive a close look. Hands pass near the sash.

**Bike handling for Jamie and Sam**
- Jamie lifting his lying bike is approximate: he stands at the bike's left while it lies on its right.
- Mounting is the dismount played backwards.

**Companions**
- They have no collision of their own while following. They trust your path and can clip a lawn edge or a curb corner slightly.
- If one ever falls more than 40 m behind out of view, it catches up along your path.

**Police cars**
- No door animation: the arriving officer simply walks from his door.
- The car is the generic sedan body with a simple livery; the lightbar is boxes.
- Wig-wag headlights aren't modelled.
- Emergency light strength (`on*100`, decay 1.6) paints nearby houses strongly at the flash peak; tune to taste.

**Grown-ups**
- No mouths or lip-sync.
- Gestures are layered on a standing pose and are fairly stiff.
- The adult faces reuse the kids' head generator, scaled.

**Captions.** The *Show what your friends say* setting hides every named line (officer, radio and YOU included). Only unnamed narration still shows.

**Lighting**
- Night darkness peaks at `DEEP` 0.82 at the creek. Near roads are dark but readable; peripheral areas go quite dark.
- The flashlight close-up at the reflector is bright on the ground.

**Things that only show in play**
- The siren Doppler and muffling work in play, but the offline audio clips are static excerpts.
- The creek water and katydids are synthesized and quiet.

**QA autopilot.** It is a test tool, not a player model. It needs dense waypoints and occasionally sidesteps people.

**Not done**
- Touch devices, non-Chromium browsers, real-GPU frame rate and human playtesting have not been done on this pass.

---

## 8. Audio limitation

All sounds are synthesized at runtime (Web Audio). They were verified only as signals in offline renders: finite, non-silent, peak below 0.95. **Nobody on this pass has listened to them.** The siren, the radio, the TV through a wall, the dad's call and the distant bell need a listening pass for character and level. `docs/qa/audio-review.html` lists every clip, including the new night sounds.
