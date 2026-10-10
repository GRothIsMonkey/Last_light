# Last Light — Chapter Four: Main Street (handoff)

This is the structural, gameplay and story pass for Chapter Four, built on the accepted Chapter Three release.
Everything described here works and is tested in the simulation and in Chromium (software rendering). It is
deliberately plain wherever art direction and sound belong to Astra (see **Future targets for Astra**).

## Source and branch

| | |
|---|---|
| Source branch | `codex/astra-chapter3-final-polish` (frozen; not modified) |
| Source SHA | `5be68143c13dfdb24ccec24afbd7ec0b4769f469` (Chapter Three final release, verified as HEAD before branching) |
| Chapter Four branch | `claude/chapter4-main-street` (new; created from the source SHA) |
| History | Linear on top of the source SHA. No merge, no rebase, nothing pushed to `main` or to any release branch. |
| Creature | "Smily horror monster" by Bento (CC BY 4.0). The asset, its source copy, its attribution and `docs/THIRD_PARTY_ASSETS.md` are unchanged. Chapter Four reuses Chapter Three's instance; two optional drive values were added (`cower`, `back`), both 0 by default, so Chapter Three's creature behaves exactly as before. |

Serve `dist/` over HTTP as before. `?qa` exposes `window.lastLight` (now with `chapter4` and `nextChapter`);
`lastLight.jump(section)` starts at any QA section below. **Continue** on the title returns to the last checkpoint.

## 1. What the player experiences

Chapter Three's end card (LAST LIGHT / Chapter Three / August 22, 2011) now has a **Chapter Four →** button.
It fades to black; a quiet **CHAPTER FOUR · MAIN STREET** card; then the next afternoon.

**Sam's house (Tuesday, August 23, 1:52 PM).** Sam's mother in the garage door, tired and careful: "Officer Reyes
called again. Nothing new." She found Alex's backpack in their garage this morning (he left it Saturday); his mom
said the boys can bring it by. "And I want all three of you home before the streetlights come on. I mean it." She
goes in. **F** at the backpack: the zipper of the front pocket. "His camera."

**Alex's camera.** A cheap 2009 point-and-shoot held up in your hands in playback mode: **A/D** previous/next,
**W/S** (or the wheel) magnify, the mouse moves round a magnified picture, **F** "point it out" (a friend's finger
on the screen), **V** lowers it. Thirteen pictures of an ordinary summer — Sam pulling a face, Jamie's bunny hop, a
dog, Alex's bike, a lawn by accident, the ice-cream-truck day, the end of Oak Hollow, the three of them by the oak —
each a real picture of this world, rendered from a camera placed in it with the people, bikes and light of that day.
In the background of four of them, in four places (the field fence by the old oak; down Briarwood under a light
pole; across the creek in the weeds; downtown, leaning by a door), **the old bike**: sage frame, swept bars, the
cracked brown saddle, the rusted bell. Magnify on it and they see it ("Wait. That's the bike. The old one." … "It's
in all of them."). The last one is dated last Wednesday: **Mason Cycle & Sport**, Main Street, a shop closed for
twelve years. "We're going." "My mom said—" "Before the streetlights. We've got hours."

**The ride downtown.** Back along Oak Hollow, all of **Summerfield Road**, then **Old Mill Road**: a new road that
carries on from Summerfield's end past older houses, over a rise (the water tower, the steeple) and down into town.
Physically connected; about 630 m from Sam's driveway. Jamie and Sam ride with you as on every ride.

**Main Street by day.** An ordinary Tuesday: Vic outside his barber shop on a folding chair, Mr. Dutton carrying
boxes in from a delivery truck, the florist's buckets, two men talking outside the Starlite Diner, people looking in
windows, cars parked and leaving, one now and then going up Main and stopping for anyone in front of it. Optional:
Vic ("Closed up in ninety-nine, when Roy passed… Library's got all the old Couriers"). **Mason Cycle & Sport**: the
painted sign faded on the brick, FOR LEASE, papered windows. "This is where he took it." **F: Look in the window**:
dust, empty hooks, a counter, a sun-bleached **MEADOWLARK** poster of a green bike. "That's the bike." The florist
next door: Roy Mason died in ninety-nine; "Roy had a lot of bikes."; the library has the Courier on microfilm.

**The library.** A Carnegie library on the square (steps, columns, arched windows). Mrs. Albright at the desk: the
local history room in the back; try 1988, the shop's anniversary; "I close at eight, boys." **F: Sit at the
microfilm reader**, standing close: the page fills the view, and each record is also a caption. **A/D** winds the
film. Five things, fictional, from the township's own paper:

1. *June 14, 1988* — **MASON CYCLE MARKS 30 YEARS ON MAIN**: Roy Mason with the 1958 Meadowlark he built, "the first
   bike I ever sold, and I bought it back"; it still wears the township's license sticker, **No. 0417** ("That's the
   sticker. On the bike.").
2. *August 26, 1991* — **SEARCH FOR MISSING BOY ENTERS FIFTH DAY**: Daniel "Danny" Whitcomb, 12, last seen riding a
   green bicycle on Mill Street the evening of **August 21**; volunteers searched the creek, the rail yard and the
   **Pine Ridge reservoir** ("August twenty-first." "…Twenty years ago.").
3. *September 4, 1991* — **'IT WAS HIM,' NEIGHBORS SAY**: seen on the Mill Street bridge at dusk two weeks after; "He
   didn't answer. He looked at me, and then he walked off toward the creek." ("Like we did.")
4. *September 11, 1991* — **POLICE BLOTTER**: a pale person crouched in the storm culvert under the Mill Street bridge;
   a bicycle bell ringing; nothing found. And: streetlights out on Main between Second and Depot, restored by morning.
5. *August 30, 1966* — **GIRL, 11, STILL MISSING**: Ruth Ann Carver, last seen at dusk on **August 23** riding to the
   Lyric. "The case remains open." ("That's today.")

The afternoon goes by a reel at a time (3:18 … 7:35). "Boys? I'm sorry. I'm closing up." "What time is it?" "Ten to
eight." "Eight?"

**Dusk (7:52 PM).** The square in the last light, the sky going from gold to violet. The bikes are on the rack.
Across Main, at the mouth of the gangway beside Mason's: **Alex**. Jamie: "…Alex?" He stands, looks at them, turns,
walks into the gangway and is not there. Sam holds Jamie's arm: "Jamie. Don't." Nobody follows. "That was him." "It
wasn't. It wasn't him in the tunnel either." "…I know." **The streetlights come on one by one** (each its own
photocell, 7:56–8:02). Going home up Main, at Second Street: at the end of the block by the creek, under the last
light, **the thing from the drain**. It watches them. It comes a little way up the middle of the street. It stops dead.
It looks past them, up Main. It cowers, shivering, and backs away. It turns and runs, and drops into the creek
channel. ("What's it doing?" "It's looking at something." "It ran.")

**The streetlights go out** — one after another, far up Main toward the road home, coming toward them at a steady
walking-into-running pace, each with a small flicker and a relay's clunk. Just past the closed TV shop it stops, and
every set in the shop's window comes on at once ("Look. The TVs."). Go up to the window and they show **the three of
them, from high above, now** ("That's us. That's us, right now."). Then the dark comes on again. The video store is
still lit. "The video store. Go. GO!"

**The Lantern Video (8:08 PM).** Nobody behind the counter: BACK IN 10 MIN — D. The door shuts behind them. The TV
over the counter: static, then **Alex riding Briarwood seen from forty feet up**; **Alex in his yard from low behind a
hedge across the street**; Alex at dusk walking past a brown park sign, and the picture drifts in on it and holds:
**PINE RIDGE RECREATION AREA**. "Take a picture of it!" **V** raises Alex's camera as a viewfinder; **F** takes the
picture of the screen. Then **Alex on his bed at night, seen from the corner of his ceiling** ("That's his room.").
The phone on the counter rings. **F: Answer the phone**: static, something like wind; **"…Jamie?"**; "Jamie?"; the
line goes dead. "Alex? ALEX!" The TV: **the three of them in the store, from the far corner, now**. "That's us." The
lights go from the front of the store to the back. "The back. There's a back door." **F: Push the door open.**

**Out the back (8:12 PM).** The light over the back door goes out as they come out under it. Dark alley, the lot,
one pole light, then that too. "The laundromat. It's open till ten." In the narrow way between the shops' backs and
the garages: "Something's coming—" "The wall!" **It comes from behind them, fast, and runs past them** (on the garage
side, or over the garage roofs if there is no room) and away into Depot Street. "It went right past us." "It didn't
even look at us." The laundromat: lit, warm, empty, dryers; its TV shows them from behind for a moment; its lights go
out behind them, back to front. The side door onto **Depot Street**, under the Lyric's side wall: in each of its
upper windows, against a faint warm light, **someone standing**, too tall and too still, and when you look straight
at one, the window is empty ("Jamie. The windows." "Don't look at them. Keep walking.").

**The Lyric.** At the corner, the only light left on Main is the old theater's marquee, its bulbs chasing. Under it,
on the sidewalk: **Alex**. "Jamie." — Jamie: "…Where is he?" — "I know where he is." — Sam: "Don't listen to him." —
"Come find him." The bulbs go out, then the letters, then the blade sign. Black. When the lights come back, a wave
of them outward from the marquee down every street, he is gone.

**The picture.** The bikes, where they dropped them. "The picture. Did it come out?" On Alex's camera: the screen,
its scanlines, the brown sign: **PINE RIDGE RECREATION AREA**. "That's the reservoir. Out past the county road."
"That's where they looked for Danny Whitcomb. In the paper." "Tomorrow." "…Tomorrow." (If you never took it, Jamie
took it: "Give it—".)

**Home.** Back up Old Mill Road, Summerfield, Oak Hollow, to the old oak at the end of the street. "That thing in the
tunnel…" "It was scared." "Of what?" Down the street a streetlight goes out for a moment, and comes back. Fade.
**LAST LIGHT / Chapter Four / August 23, 2011.** (No further button: Chapter Five is not begun.)

Nothing is explained. The darkness that takes the lights is never shown, never named (in code it is *the
Presence*, `dist/presence.js`), and has no model. No one fights anything; nothing can hurt you; no game over.

## 2. Controls added

| Key | Where | Does |
|---|---|---|
| **V** | on foot, once you have Alex's camera | raise / lower it (playback; in the video store while the sign is on screen, the viewfinder) |
| **A / D**, ← / → | camera playback; microfilm reader | previous / next picture; previous / next record |
| **W / S**, ↑ / ↓, wheel | camera playback | magnify / less |
| mouse | camera playback, magnified | move round the picture |
| **F** | camera playback | point out the old bike (magnifies onto it) |
| **F** | viewfinder, aimed at the TV | take the picture |
| **S** | microfilm reader | get up |

Everything else is as before (W/A/S/D, mouse, F, Space, Shift, T, Esc). Every key's prompt appears at the bottom.

## 3. Timing, fairness, fallbacks

Played straight through, with no detours, the chapter takes about 21 minutes of game time in the simulation (20.8;
see the test report); a player who looks around, reads the pictures and lingers downtown takes longer. The town clock runs at four times real time in the afternoon and at
dusk, twice at night; the microfilm moves it a reel at a time; when an event must happen at an hour (the lamps on
before the creature, say) the clock catches up a minute a second instead of the story waiting.

Nothing waits forever on the player, and nothing turns the player's view: the poses (backpack, window, reader,
phone) begin only with **F**; on the bike the head glances toward what the boys point at, as in earlier chapters,
only while you are not looking yourself.

| If you… | then |
|---|---|
| browse but never find the bike in a picture | after 6 s a friend says where ("Zoom in. Back by the field fence…"), after 12 s magnifies onto it |
| never reach the last picture | "Go to the last one." (95 s), then a friend skips to it (120 s) |
| never find Mason's / never go in the library | Jamie points the way (130 s); the florist can be skipped (Jamie: the library) |
| idle at the microfilm | "Next one." (22 s ×2), then it winds on |
| wander at dusk | the Alex scene happens by the rack after 80 s anyway; at 170 s a fade brings you to Second Street |
| never go up to the TV shop's window | Sam says it anyway after 16 s, and the dark moves on |
| stand in the dark street | "Come on!" (8 s), "Please. In here!" (18 s), then a fade: they pulled you into the store (32 s) |
| miss the picture of the sign | after 15 s Jamie takes it with the camera |
| let the phone ring | Sam answers it (14 s) |
| stay in the dark store | "Come ON." (26 s); Jamie opens the back door (44 s); a fade out the back (80 s) |
| stand still in the alley / laundromat / Depot Street / never go back for the bikes | a fade carries the three of them a little further on (100 s / 90 s / 110 s / 140 s) |

## 4. Places and systems (files)

| File | What |
|---|---|
| `dist/town-plan.js` | Downtown as data: Main Street (the approach, Mill, Second, Depot), the square, alleys, Mill Creek; Old Mill Road (the connector, its curve and climb, its houses); buildings (closing hours, which are lit), walk-in interiors (library, video store, laundromat), doors, street furniture, 60 lamps, named spots; a 0.5 m surface grid and `townNav()` (where, groundY, walkable, rideable, surface, heading). |
| `dist/town-build.js` | The meshes (baked into zones `town`, `town-int`), canvas-atlas signs and posters, the Lyric (marquee, blade, poster cases, upper windows), the library, the interiors and their props, CRT televisions, and the live layer: lamp heads and pools, fixtures, neon, marquee bulbs, doors, five point lights. |
| `dist/nav.js` | Summerfield Road and the town answer for themselves when Chapter Four opens them (`setTown`); earlier chapters' reachable world is unchanged. |
| `dist/presence.js` | The town's lights through the evening (schedule) and the Presence's mask (ordered kills, restores, cascades, waves), relay hooks, and the point-light assignment. |
| `dist/town-life.js` | The day's people and cars. |
| `dist/alex-camera.js` | The camera model, the 13 photographs and their staging, playback, viewfinder, captured pictures. |
| `dist/footage.js` | The TV shots (Alex riding, in his yard, at the Pine Ridge sign, in his room; the live views of the boys) and the Pine Ridge set. |
| `dist/chapter4.js` | The director: phases `c4-`/`d4-`/`e4-`/`n4-`, dialogue, objectives, scenes, fallbacks, checkpoints, QA jumps, reset. |
| `dist/chapter3.js` | Hands Chapter Four its phases, sections, input and hooks; its own behaviour is unchanged. Its end card shows the next-chapter button. |
| `dist/game.js` | Chapter Four's light (sky, sun, dusk, night, a lit room's own fixtures), keys, mouse pan and wheel, `shoot()`/`readPixels()` (render-to-picture), interior culling, `nextChapter()`. |
| `dist/dev-chapters.js`, `dist/dev-chapter-history.js` | DEV selector: Chapter Four and its 38 scenes; `HISTORY[4]` (what Chapters 0–3 leave behind at Chapter Four's start, generated by `ONLY=dev-record node tests/verify.mjs`, never by hand). |

Photos and footage are rendered from the live world into render targets (not tone-mapped; toned in the picture
or the CRT shader). Photos render a few at a time while the chapter opens; a TV renders at 12 Hz only while it is
on, near, and roughly in view; a screen is hidden while its own picture is rendered.

## 5. Checkpoints, QA jumps, DEV scenes

**Checkpoints** (Continue): `chapter4-start` The next afternoon · `c4-camera` Alex's camera · `c4-downtown-arrival`
Main Street · `c4-library` The library · `c4-historical-clue` The microfilm · `c4-dusk` Ten to eight · `c4-presence` The
streetlights · `c4-video-store` The Lantern Video · `c4-escape` Out the back · `c4-theater` The Lyric · `c4-final-clue`
The picture · `chapter4-end` The old oak. What you carry (the camera, whether the picture is on it, which pictures you
found) is saved in `localStorage['lastlight.chapter4']`; after a Continue past the store the picture of the screen is
made again from the same shot.

**QA jumps** (38, in story order): `chapter4-start`, `c4-sam-house`, `c4-backpack`, `c4-camera`, `c4-photo-bike`,
`c4-photo-mason`, `c4-ride`, `c4-old-mill-road`, `c4-downtown-arrival`, `c4-main-street`, `c4-mason`, `c4-florist`,
`c4-library`, `c4-microfilm`, `c4-historical-clue`, `c4-closing`, `c4-dusk`, `c4-alex-across`, `c4-creature`,
`c4-presence`, `c4-tv-window`, `c4-video-store`, `c4-store-footage`, `c4-pine-ridge`, `c4-store-phone`, `c4-store-live`,
`c4-back-door`, `c4-escape`, `c4-alley-creature`, `c4-laundromat`, `c4-depot-st`, `c4-theater`, `c4-marquee`,
`c4-power-returns`, `c4-final-clue`, `c4-ride-home`, `c4-oak`, `chapter4-end`; aliases `c4-start`, `c4-photos`,
`c4-downtown`, `c4-bike-shop`, `c4-archive`, `c4-streetlights`, `c4-cascade`, `c4-store`, `c4-alley`, `c4-lyric`,
`c4-alex-marquee`, `c4-lead`, `c4-end`.

**DEV selector** (temporary, playtest build): **Chapter Four** is a fifth chapter button; its start goes through the
game's own hand-over (Chapter Three's last scene → its ending → the card's button). Its 38 scenes are the QA jumps
above, labelled (Sam's House, Alex's Backpack, Alex's Camera, Old Bike in a Photo, The Mason Cycle Photo, Ride
Downtown, Old Mill Road, Downtown Arrival, Main Street by Day, Mason Cycle & Sport, The Florist, The Library,
Microfilm Room, Microfilm: the Records, Library Closing, Dusk, Alex Across the Street, Creature at Dusk (afraid),
Streetlight Cascade, TV Window (live), Video Store, Store TV: Alex Footage, Store TV: Pine Ridge, The Phone, "That's
us.", Back Door, Alley Escape, Creature Passes, Laundromat, Depot Street, Theater Windows, Alex Under the Marquee,
Blackout / Power Returns, Final Clue, Ride Home, Back on Oak Hollow, Old Oak Ending). The other chapters' 58 scenes
are unchanged.

## 6. Tests

See [TEST_REPORT.md](TEST_REPORT.md) for the figures of this pass.

- `tests/chapter4-sim.mjs` (run by `npm test` after Chapter Three; `QUICK=1 ONLY=chapter4 node tests/verify.mjs` alone):
  Chapter Four played with inputs straight on from Chapter Three's end card (each beat checked: the lines, the
  pictures found, the streets ridden in order with no teleport, the people and cars and their distance from you, the
  five records and the clock, Alex seen and nobody following, the lamps coming on gradually and the sky never
  brightening, the creature's stages in order at a distance and never rearing or clawing, the lamps going out in
  order, the TV window, the store's shots and picture and phone and live view, the pass in the narrow way, the
  windows, the marquee's five lines in order, the lights back, the picture of the sign, the ride home, the oak's three
  lines, the end card); every jump and alias; every checkpoint with Continue; the picture remade after a Continue;
  Start over from inside and jumps back to earlier chapters leaving nothing behind; seeded randomized runs through the
  fallbacks; the DEV start against the natural arrival; DEV switching 4→1→4→3→4→0→2→4 with no leaks; all 38 DEV
  scenes; 10 key scenes start before their event; a replay of the whole chapter in the same page.
- `tests/chapter4-browser.mjs` (Chromium, sound off): the walkthrough from Chapter Three's ending with inputs and
  real clicks (no QA jump inside it), captured at every beat; then each DEV scene started from the selector with real
  clicks and captured. Output: `docs/qa/chapter4-main-street/` (gallery `index.html`, report JSON).
- Chapters 0–3: the full existing suite runs unchanged before Chapter Four.

## 7. Known limitations

- **Audio is deferred.** Sound hooks fire (relay clunks, the phone, the shutter and flash, doors, static, the
  creature's steps and splash, a dryer hum) and are counted by the tests; most have no sound yet. No voices.
- **Rendering was checked in SwiftShader only.** Render counts are real; frame rates are not a real-GPU measure.
  The town adds geometry (see the test report's inventory); the TVs and photographs render the scene again (TVs at
  12 Hz while visible). Needs a real-GPU pass.
- The town's art is functional: flat-shaded storefronts, canvas signs, simple interiors, box-built cars and props.
- The microfilm page is drawn on a canvas (legible standing at the reader); its photographs are drawings, not
  renders.
- The apparent Alex uses the ordinary Alex character; the theater-window figures are flat silhouettes.
- The title's Credits screen does not name the creature's author (since Chapter Three; see `docs/THIRD_PARTY_ASSETS.md`). Worth one line there before any public release.

## 8. Future targets for Astra

1. **Main Street's look**: brick and stone materials, window glass with reflections and depth, awnings with cloth,
   signage with real paint/neon treatment, sidewalk and asphalt detail, the Lyric's marquee letters and bulbs, the
   library's interior finish, the video store's shelves of covers, the laundromat.
2. **Light**: the dusk sky over town, the streetlight pools and their flicker as they go, the marquee's chase, shop
   glows; the darkness after the cascade (readable, frightening); the lights' return wave.
3. **The Presence**: how the dark arrives (its edge, the relay sound, the flicker character) — never a model.
4. **The creature at dusk and in the alley**: its fear (cower, shiver, back-away) and its run past them, staged
   for a real GPU with its contact shadow and lamp lighting.
5. **The apparent Alex**: the gangway and the marquee figure (light, stillness, the turn, the disappearance).
6. **Photos and TV footage**: the cheap-camera look (lens, noise, flash), the CRT (curvature, bloom, roll), the
   live views; the Pine Ridge set itself (it will matter in Chapter Five).
7. **Sound**: everything in §7, plus the town's ambience (traffic, voices, a radio from the barber's, insects at
   dusk, the silence after the cascade), the phone's voice, the dryers, the marquee's hum.
8. **Performance** on real hardware: the town's batches, TV render cadence, the photograph renders at the start.
