# Last Light — Chapter Four: Main Street (structural pass)

From `codex/astra-chapter3-final-polish` at `5be68143c13dfdb24ccec24afbd7ec0b4769f469` (the accepted Astra Chapter Three release, unchanged), on `claude/chapter4-main-street`. A complete, playable Chapter Four: story, places, systems, checkpoints, DEV scenes and tests. Not an art pass; audio is hooks only. No merge, and no change to `main` or any release branch.

- **The hand-over.** Chapter Three's end card gains a **Chapter Four** button: black, a quiet CHAPTER FOUR · MAIN STREET card, then Tuesday, August 23, 2011, 1:52 PM, at Sam's. Sam's mother, tired and careful: the police called, nothing new; Alex's backpack was in their garage; home before the streetlights.
- **Alex's camera.** In the backpack's front pocket. Playback in your hands: A/D through 13 pictures, W/S or the wheel to magnify, the mouse to look round a magnified picture, V to lower it. Each picture is rendered from a camera placed in this world. The old bike from the oak is in the background of four, in four places; the last puts it outside **Mason Cycle & Sport**, downtown, last Wednesday.
- **The ride downtown.** One continuous ride: Oak Hollow, all of Summerfield Road, then the new **Old Mill Road** over a rise and down into town (about 630 m). Jamie and Sam ride with you.
- **Downtown Oak Hollow by day.** Main Street and three cross streets (Mill, Second, Depot), alleys, a square, 27 buildings; people about their business and cars that park, leave and stop for you. Mason's window and its faded poster of the bike, the florist who remembers Roy Mason, the Carnegie library and Mrs. Albright.
- **The microfilm.** Five fictional records from the township's paper (1988, three from 1991, 1966), read on a reader that fills the view, each also a caption. The afternoon goes by a reel at a time until the library closes at ten to eight.
- **Dusk.** The sky goes from gold to violet; the streetlights come on one by one, each on its own photocell. Alex across Main, at the mouth of the gangway by Mason's. He walks off; the boys don't follow.
- **The creature, in the open.** At the end of Second Street by the creek: it watches, comes a little way, stops dead, looks past them up Main, cowers, backs away and runs. It never comes close and never rears or claws (two optional drive values on the existing creature, both 0 by default; Chapter Three's creature, its asset, attribution and source copy are unchanged).
- **The streetlights go out**, one after another, up Main toward them. The darkness is never shown or named and has no model (in code: `dist/presence.js`). It waits just past the TV shop while every set in its window shows the three of them from high above, live, then comes on again.
- **The Lantern Video.** Nobody there. The TV over the counter shows Alex from impossible places (from forty feet up, from behind a hedge, in his room from the ceiling) and a brown sign the picture holds on: **PINE RIDGE RECREATION AREA**. V raises Alex's camera as a viewfinder and F takes the picture (if you don't, Jamie does). The phone: "…Jamie?" The TV: the three of them in the store, now ("That's us."). The lights go from the front to the back; the back door.
- **Out the back.** The alley, the lot, the narrow way where the creature comes from behind and runs past them without looking at them, the laundromat, Depot Street and the Lyric's upper windows, where someone stands in each until you look straight at it.
- **The marquee.** Alex under the Lyric's chasing bulbs: "Jamie." "Where is he?" "I know where he is." "Don't listen to him." "Come find him." Every light goes out. When they come back, he is gone. On Alex's camera, the picture of the screen: Pine Ridge Recreation Area, the next lead.
- **Home.** The same roads back to the old oak: "That thing in the tunnel…" "It was scared." "Of what?" LAST LIGHT / Chapter Four / August 23, 2011. Chapter Five is not begun.
- **Fair and quiet.** No combat, no failure, no forced camera; every beat has a fallback (a friend's hint, then a gentle carry-on) and every line is a caption, so the chapter plays fully muted. About 20 minutes played straight through in the simulation.
- **QA.** 12 checkpoints (`chapter4-start`, `c4-camera`, `c4-downtown-arrival`, `c4-library`, `c4-historical-clue`, `c4-dusk`, `c4-presence`, `c4-video-store`, `c4-escape`, `c4-theater`, `c4-final-clue`, `chapter4-end`) with Continue; 38 QA jumps (plus aliases); the picture of the screen is made again after a Continue.
- **DEV selector.** Chapter Four with its 38 scenes added after Chapters 0–3, whose 58 scenes are unchanged.
- **Verification:** **593** simulation checks (Chapters 0–3 as before, Chapter Four played on from Chapter Three's end card and again after its jumps, 18 seeded randomized runs, 38 jumps, 12 checkpoints with Continue, the DEV selector's Chapters 0–4: Chapter Four's start equal to the natural arrival, 0 leaks); in Chromium the chapter played muted by inputs from Chapter Three's ending to Chapter Four's end card, and all 38 DEV scenes from the panel (11 checks, 76 captures); 0 JavaScript or shader errors.

Details: [CHAPTER4_MAIN_STREET_HANDOFF.md](CHAPTER4_MAIN_STREET_HANDOFF.md). Results: [TEST_REPORT.md](TEST_REPORT.md). Automated renders use SwiftShader; no real-GPU frame rate is claimed. Audio is deferred: hooks only, nobody has listened.

---

# Last Light — Astra Chapter Three visual polish

From `claude/chapter3-creature-chase` at `6edcad0bb44426ba29da61fd83d2f35cc94fad5c`, on `codex/astra-chapter3-final-polish`. Runtime commit `797bf62382d5ad5760d13ecb1a4d70eb73cb1a38`; final QA and documentation follow it. No merge to `main` or change to the accepted source branch.

- New filtered material detail for the existing Chapter Three: aged concrete, dampness, wood, fabric, plaster, carpet, road aggregate, leaf litter, bark, shallow rippling water and restrained weathering of the original suburb palette.
- Alex's bedroom: better bedding/clothes silhouettes, fan/chair/controller/shoe details, matching helmet identity, refined phone shell/hardware and room-only daylight/bounce. Alex's exterior gains small construction/household details without changing the street.
- Forest canopy/roots/shrubs and access-road ruts are less geometric. Tunnel spalls, ties, rail/gate hardware and water/flashlight response improve close inspection and navigation readability.
- Jamie/Sam and the Alex-like lure gain refined heads/shirts. NPC fabric response, bicycle hardware, worn old-bike details and grounded contact shadows improve integration. Existing locomotion, character identities and clue interactions remain.
- Room/outside-shadow culling, smaller forest/tunnel batches and cached distance masks reduce unnecessary submission in selected views. Static detail rises to 2,723,522 triangles / 1,361 browser merged meshes. This is a quality/culling tradeoff, not an FPS claim; several draw counts increase.
- Adaptive captions now bring in their temporary soft backing earlier over mixed flashlight backgrounds, fixing a rendered contrast-check failure. Tone changes, fading and the transparent no-box treatment remain.
- Creature assets, skeleton, scale and accepted animation/reveal/chase code are unchanged. Story, navigation, dimensions, controls, chase timings, final lure and ending are preserved. No Chapter Four or audio-production work.
- Validation completed: 551 simulation checks, 83 main-browser checks, 142 DEV-browser checks, two complete muted Chapter Three walkthroughs, 304 QA captures, and zero JavaScript/shader errors in the completed reports. Focused restoration and caption checks also pass. Evidence manifests preserve the fact that art/restoration captures precede only the final caption fix.

See [the full polish report](ASTRA_CHAPTER3_FINAL_VISUAL_POLISH.md) and [current verification](TEST_REPORT.md). Remaining stylized anatomy/animation, dark-screen legibility, material/shadow behaviour and performance require human review on a real GPU. Automated runs here use SwiftShader; audio checks cover hooks only.

## Historical source release — creature chase

Built from `claude/chapter3-horror-escalation` at `e575f069c2f1bec4641253632a3d670ce68c45e3` (unchanged), on `claude/chapter3-creature-chase`. The climax rebuilt around a real creature; the Alex-like boy is now the lure. Chapter Four and Astra's art pass are not started.

- **A real creature.** "Smily horror monster" (https://skfb.ly/6W6ut) by Bento, CC BY 4.0, from the supplied file. The original is kept byte for byte in `assets/source/creature/` (its embedded author and license metadata intact) and never loaded; the game loads a copy with lighter textures (2.6 MB; geometry, skeleton, animation and material unchanged). Attribution in [THIRD_PARTY_ASSETS.md](THIRD_PARTY_ASSETS.md). It is never named.
- **The lure.** Past the first reveal the boy is at the junction, his back to them, by a black side culvert. He walks to it, climbs over the sill and goes in. "Jamie?" from inside. Then something comes up to the lip of the culvert and waits there until you have actually seen it (never a turned camera; cues if you have not; Jamie calls you up if you are standing where the lip cannot be seen). "…That's not—" "That's not Alex." It drops into the water. "RUN!" The boy and the creature are never on screen together.
- **A real chase.** It comes after them along the drain: seen far back (about 19–25 m), lost round the second bend, then out of a low hole in the wall behind them (about 12–15 m), then right behind (about 8–10 m) after the old bike from the oak lies across the way out. It never touches anyone (stop dead and it rears up about 4.6 m away). At the first bend an old maintenance gate: Jamie (or Sam) holds it, you get through, it is slammed; the creature hits and claws at the bars for about 3 s and bursts through. The bikes, the mouth: it stops in the dark inside and watches. About 53–56 s from "RUN!" to the bikes.
- **The road.** Look back over your shoulder and, when you face front again, it is at the treeline ahead, half risen at the side of the road about 20 m off (optional). Farther up, the boy standing in the road. Nobody stops. The streetlight: "That wasn't Alex." "…I know." "Then what did we follow?" Jamie does not answer.
- **Its body.** The file has only an idle; the gait (a bounding four-limbed scramble), rearing, clawing, crouching and the head turning to you are made procedurally on its real skeleton on top of that idle, its speed driven by how fast it actually moves (no sliding, no floating, no T-pose). Two simple colliders, never the mesh.
- **The day, shorter and freer.** Scripted, from Chapter Three's start to the plan for tonight: 554 s → 306 s (−45 %). His mom in about 30 s; Jamie and Sam talk while you look round his room; the phone opens on the recording that matters (the older ones optional); the window without a camera lock; one neighbour who matters (Mr. Okafor: the bell, the gate at the end of Briarwood, the old road to the storm drain).
- **DEV selector: Chapter → Scene** (temporary, playtest only): choose a chapter, then one of 58 scenes, then START SCENE. Each scene starts shortly before its event in the same state as playing there (46 compared with a natural playthrough: 0 differences); switching in one session leaks nothing. Normal play is unchanged.
- **Fixed on the way:** the first frame after a jump out of the drain (DEV or QA) could be lit as if still in the drain (the cave light was read from the last frame's zone, not where you now are). The forest glimpse first rendered as a few pixels at 24 m; it is now staged at the road's edge, closer and half risen.
- **QA:** checkpoints `c3-alex-lure`, `c3-creature-reveal`, `c3-creature-chase`, `c3-road-escape`, `chapter3-end`; 34 jumps, including `c3-creature-reveal`, `-advance`, `-chase-start`, `-far`, `-side`, `-near`, `-barrier`, `c3-tunnel-exit`, `c3-bike-remount`, `c3-final-lure` (the escalation's names kept as aliases).
- **Verification:** **551** simulation checks (Chapters 0–2 regression; Chapter Three three times in one session; the DEV selector: 58 scenes, 46 compared with a natural playthrough, 0 differences, 0 leaks); in Chromium the whole chapter played muted with no QA jump, all 34 jumps, Continue and captions (83 checks, 109 captures) and the DEV panel with real clicks, every scene, the comparisons, the switching order and Chapter Three played from a DEV start to its end card (142 checks); 0 JavaScript or shader errors.

Details: [ASTRA_CHAPTER3_CREATURE_CHASE_HANDOFF.md](ASTRA_CHAPTER3_CREATURE_CHASE_HANDOFF.md). Results: [TEST_REPORT.md](TEST_REPORT.md). Audio is placeholder and deferred: hooks only (no new voices, no heartbeat tuning, no offline or HRTF renders); nobody has listened. SwiftShader only; real-GPU frame rate not measured.

---

# Last Light — Chapter Three horror escalation (the deep drain, the boy, the pursuit)

Built from `claude/chapter3-horror-rebuild` at `26304a9dbc30ce66dcdc0a5e65f4082fc53a55e0` (unchanged), on `claude/chapter3-horror-escalation`. A structural horror pass answering the muted human playtest of the rebuild ("better but not great"; the run was jogging; the figure was never seen; the tunnel was not ominous). Not an art pass.

- **The drain closes in.** Past the first bend it lowers and narrows in steps to a deep box about 3.1 × 2.3 m (7½ ft of headroom): older concrete, flood lines, spalls with rebar, ankle-deep water, a narrow dry ledge, black side drains and pipe openings, a rusted ladder, a sealed hatch, brackets, conduit and pipes overhead, debris and stencilled municipal markings. One way through; no changing geometry.
- **His helmet.** On his desk in the morning ("His helmet's still here." "He never rides without it."); that night, upside down in the silt deep in the drain. Jamie goes to it; Sam turns toward the way out: "We need to tell somebody. Right now."
- **The bike from the oak**, found by the light from a distance; its bell only clicks. Farther on it is no longer where it was (never seen moving). During the run it lies across the way out ahead of them.
- **The boy cannot be missed.** Jamie and Sam stop either side of you with both lights down the tunnel; at the end of them, about 22 m (72 ft) away, a boy in Alex's clothes. He waits until you have actually looked at him (cues, never a turned camera; a 40-second fallback), stays well after (≥ 12.3 s in every trial), turns slowly and walks round the bend. Nobody there. Later someone crosses the tunnel ahead. Voices ahead and behind are acted by Jamie and Sam; a search behind; the bell beside them; "RUN!"
- **A real escape:** a story sprint (no stamina failure, a wider view, splashes, faster companions); he is seen running after them about 16–17 m back, then about 10 m; Jamie goes down and gets up; water bursts from a side pipe; the bike in the way (veer, jump or vault it); the exit glowing ahead; straight onto the bike. 55 s from the bell to the bikes. He never catches anyone.
- **The ride out is faster**, and at a bend he is standing in the road ahead (about 14 m); he walks off into the trees; nobody stops. The streetlight, then "That was him." "No." "You saw him." "…I know."
- **Readability fixes from reviewing the renders:** the reveal framing is measured from you (your line of sight to him runs clear between them); in the drain a friend in your beam no longer leaves the tunnel past him black; the water is a wet sheen rather than a black void; the boy and the bike catch a little more of their own colour when far off in a beam (never a glow).
- **QA:** 33 Chapter Three jumps, including all 18 the escalation lists (old names kept as aliases); checkpoints `c3-tunnel-deep`, `c3-old-bike`, `c3-figure`, `c3-escape`, `c3-road-escape`, `chapter3-end`; the DEV selector kept and still canonically equivalent.
- **Verification:** **475** simulation checks (Chapters 0–2 regression, Chapter Three three times in one session), **79** Chapter Three browser checks (a muted natural walkthrough with no QA jump, 104 captures), **74** DEV-selector browser checks, 0 JavaScript or shader errors.

Details: [ASTRA_CHAPTER3_HORROR_ESCALATION_HANDOFF.md](ASTRA_CHAPTER3_HORROR_ESCALATION_HANDOFF.md). Results: [TEST_REPORT.md](TEST_REPORT.md). Audio is placeholder and deferred: hooks checked only, no offline renders in this pass, nobody has listened. SwiftShader only; real-GPU frame rate not measured.

---

# Last Light — Chapter Three horror rebuild (the access road and the drain)

Rebuilt from `claude/chapter3-horror-investigation` at `8f06b2bb3b8f545243c75f3644627cb8a217d7ec` (unchanged), on `claude/chapter3-horror-rebuild`. A structural rebuild of Chapter Three's horror so that it frightens with the sound off; not an art pass. Chapter Two and the structural pass's own history and evidence are untouched (the section below this one describes the structural pass as it was).

- **The basin is gone.** In its place: an old municipal stormwater access road from the far end of Briarwood (a streetlight, bollards, an END marker, a pipe gate, Public Works and flood signs). About 550 m long, it winds, descends about 10 m and narrows into the woods, from asphalt to broken asphalt to gravel. It ends at a concrete outfall where the creek from behind Alex's house comes out, and behind it a 286 m storm drain walked on foot: a mouth, a straight, a bend that hides the way out, an older damaged section, a long straight, a second bend, a far junction. One way in, never a maze.
- **The day** keeps the investigation (Alex's mother, his room and phone, the window, the neighbours). Mr. Okafor points them to the old road. By day only its start: the gate, a single tire track walked in, weeds pushed down, the road bending down into the trees. No bike. The plan to come back after dark; Sam does not want to.
- **The night:** a two-minute ride down the road in three stages (the houses drop out of sight; a branch swings back behind you, a reflector flares, something crosses between the trees; the creek valley). Bikes left at the outfall; into the drain on foot. Nothing at first. Then shoeprints and a tire line in the silt (nobody says whose), a knock up a shaft, one bell far ahead, **the same old bike from the oak** leaning on the wall (its bell only clicks), a clear bell farther in, and **a boy who looks like Alex, 25 m down the tunnel, seen for one to three seconds**, who steps behind the bend. Jamie follows; past the bend nobody, only things just moved. "Jamie?" from ahead; a long silence; "Guys?" from behind, the way out. They wait. A bell right beside them. Run.
- **Escape:** on foot with more breath than usual, water breaking behind you all the way (never a creature), the bike now lying on the floor; a generous reach to remount; up the road and out under the streetlight. "That was him." "No." "You saw him." "I know." No answers, no monster.
- **Muted readability:** every sound that matters shows on Jamie and Sam (heads, bodies, lights, stopping, clustering) and in the captions; no arrows or HUD indicators. Jamie keeps a few steps ahead in the drain, Sam a step or two behind.
- **Systems:** flashlight exposure set by what is in the beam (no blown-out companion up close), a dim wide spill round the hotspot in the drain (the walls and floor near you read; friends in it are never overexposed), the flashlight hint going after a few seconds when the light is already on (shared code, so also in Chapter One, where the light is handed over already on), cave lighting, borrowed bounce light, zone baking and culling for the woods and the drain (by render layer), a bike headlight, careful walking in the drain, a turn-back response (Jamie will not leave; the bikes wait), per-frame companion targets, 15 checkpoints and 23 QA jumps (plus aliases). The DEV chapter selector of the private playtest build is carried along.
- **Fixed on the way:** on foot, if you had ended up overlapping a person or a bike (a friend parking right where you got off), every step was refused, even away from it, and you were stuck for good; now you slide along them instead of stopping dead, and can always step away (shared movement code; walking clear of everyone is unchanged). Also: the far end of Briarwood was sometimes located as the main road; Start over kept the figure's place; Jamie never took his place at the drain mouth if he was still on his bike when you stepped off. All three were found by playing Chapter Three again in the same session.
- **Verification:** **436 simulation** checks (structural pass 339), including the whole story played with inputs, Chapter Three played three times in one session, 24 randomized escapes, 12 road rides, 12 drain walks, the figure from four facings, and DEV-selector equivalence (0 differences; switching 3→1→3→0→3 with no leaks). **81** checks in the Chapter Three browser pass: the whole chapter played muted with no QA jump, every jump, Continue, captions, audio signals. **65** in the DEV-selector browser pass. **420** in the full release browser suite (structural pass 434: Chapter Three's beats are checked in fewer, larger steps; every Chapter 0–2 check is unchanged and passes), including two natural runs from the prologue through Chapter Three's end card with inputs only and the sound off in Chapter Three; 479 captures. **0** JavaScript or shader errors. 73 inspected captures in `docs/qa/chapter3-rebuild/`. Static world 2,505,240 triangles / 1,124 meshes (targets 4M / 1,500). Drain views draw 24–49k triangles in 45–92 draw calls. Building the world takes about 60 % longer than before (about 5 s more), mostly the woods' trees, and views of Chapters 0–2 that look toward the end of Briarwood or the creek now also draw those trees (up to about +430k triangles per frame, a few more draw calls; peak Chapter 0–2 frame 998k → 1.2M triangles); both noted for Astra.

Details: [ASTRA_CHAPTER3_REBUILD_HANDOFF.md](ASTRA_CHAPTER3_REBUILD_HANDOFF.md). Results: [TEST_REPORT.md](TEST_REPORT.md). Audio is placeholder synthesis, signal-tested only; nobody has listened. SwiftShader only; real-GPU FPS has not been measured. No human playtest yet.

---

# Last Light — Chapter Three (structural pass: the investigation and the basin)

Built on the frozen Chapter Two release `codex/astra-chapter2-final-polish` at `68cc54396bdc2599cfa35b59ba6a4c981db6a8f3`, on `claude/chapter3-horror-investigation`. Tested runtime: `38ff68d309c71a0d3a6d9568fefd7a615940ceae` (later commits change tests and documentation only). Chapter Two's release history and QA evidence are untouched. This is a gameplay and story pass; the art pass is Astra's.

- **Chapter Two → Three:** no end menu; black, a quiet CHAPTER THREE card, the same corner a few minutes later.
- **The day:** Alex's house and his mother (he kept asking about a bike bell at night); his room, walked in first person; his flip phone's recorder: four ordinary recordings, then the night before he disappeared (fan, insects, a bell outside twice, "There it is again."); the view toward the creek; the neighbours; the old pond road (a municipal access drive to a stormwater detention basin, new geography downstream of Chapter Two's culvert); the old bike from the oak at its gate — the same model as the prologue's, its bell rusted silent, flattened grass and a tyre print where it was wheeled in; the plan.
- **The night:** the ordinary street; the night sounds dropping away layer by layer down the pond road; the bike gone; a bell far off, a second bell that moves; at most one ambiguous 0.3 s glimpse; Alex's ordinary voice from inside the culvert, then from behind; the bell right behind you; a playable escape with no chaser; the street light; "That was him." "No." "You heard it." "I know." **LAST LIGHT / Chapter Three**.
- **Systems:** reusable player tension (`tension.js`) driving a beat-scheduled heartbeat, breathing and a very subtle body response; adaptive captions without a box (`captions.js`, asynchronous strip readback with hysteresis; a faint glow only on backgrounds too mixed for either tone); HRTF-placed bells and a small formant voice; Alex's room as a nav zone; the basin's own ground and nav; 14 checkpoints and 15 QA jumps (plus aliases).
- **Fixes found on the way:** companions on foot could wedge against a parked car (now they step along obstacles; the car is gone at night); a stale caption readback after a jump (now discarded); the basin wall's collision box was rotated (now along the wall); Alex's garage roof hid the creek from his window (lower pitch); Chapter Three state (bells heard, waits) survived Start over into a second playthrough (now cleared completely).
- **Verification:** **339 simulation** checks (Chapter Two release 230; +109 Chapter Three, including 33 seeded randomized runs), **77** in the Chapter Three browser pass, **434** in the full release browser suite (two natural runs from the prologue through Chapter Three's end card without a QA jump), **0** JavaScript/shader errors; 60 Chapter Three captures and 19 audio signal renders in `docs/qa/chapter3/`. SwiftShader only; no human listening or playtest.

Details, known roughness and what Astra should polish: [ASTRA_CHAPTER3_HANDOFF.md](ASTRA_CHAPTER3_HANDOFF.md). Results: [TEST_REPORT.md](TEST_REPORT.md). Audio is signal-tested only; nobody has listened. Real-GPU FPS has not been measured.

---

# Last Light — Astra Chapter Two final polish

Continues `claude/optimistic-tesla-obxiv5` at `3384204a42872ad0d3592b6647441582cb48531b` on `codex/astra-chapter2-final-polish`. Tested gameplay commit: `f9ef319d31b01f27a07ec8639c5db3106ce0f04f`. Earlier story and release history remain intact.

- Readable dialogue captions across night and day, with compact charcoal backing and independent objectives/prompts.
- **Go back to where Alex turned.** plus the Briarwood note; a persistent, distinct **F — Remember** interaction on foot or stopped on the bike, broad facing and one gentle reminder.
- Refined culvert concrete, water/terrain joins, tunnel depth, evidence, bicycle dirt/hardware and broken reflector inspection.
- Staggered second-bell reactions, attentive search/flashlight staging, sagging tape and a restrained gesture from Alex's dad.
- Clearer morning light, illustrated missing-person flyers, neighborhood search activity and a warmer memory with improved coasting/glance posing.
- All four prior playtest fixes preserved; 120 reproducible randomized oak departures completed without deadlocks.
- **230 simulation + 311 browser + 10 supplemental route checks passed**, zero browser errors, two continuous full-story walkthroughs, 343 captures and 40 audio signal cases. Runtime hashes match all final evidence.

Full details: [ASTRA_CHAPTER2_FINAL_RELEASE.md](ASTRA_CHAPTER2_FINAL_RELEASE.md), [TEST_REPORT.md](TEST_REPORT.md), [visual review](qa/visual-review.html). Audio validation is signal-only; human listening and real-GPU FPS remain outstanding. The supplemental navigation review is scripted, not an independent human usability study.

---

# Last Light — Chapter Two (historical structural pass)

Built on `codex/astra-chapter1-final-polish` at `9c4b57698efeb7137de8a292b7662dac97a9a2d0`, on `claude/optimistic-tesla-obxiv5`. Chapter One's release history is untouched. This is a gameplay and story pass; the art pass is Astra's.

- **Human-playtest fixes:**
  - **Fan audio:** the bedroom fan/chatter no longer stutters over time.
  - **Flag:** the porch flag flies the right way up and away from its pole.
  - **Hoops:** every basketball hoop faces where it is played (all are checked).
  - **Old oak:** Jamie and Sam follow on the first attempt in every way of leaving that was tried, including the captured failing configuration and a 120-trial randomized sweep.
- **Chapter One → Two:** after the bell, black, a quiet CHAPTER TWO card, and the same creek moments later. There is no end menu in between, and Continue still works.
- **The night:** the disagreement; through a widened gap in the back fence into a drainage easement behind the yards (concrete channel, outfall, power line, weeds and brush, a big culvert in a wooded rise). Along the way are a tire track in the mud, a lane of flattened weeds and a scrape over the channel lip. Alex's own green bicycle lies by the culvert with its rear reflector broken out of the clip; it matches the creek piece, and the two now share one size and color. The bell sounds twice from deep inside the culvert. The police arrive, tape goes up, volunteers come with lights, Alex's dad comes, and the kids are sent home.
- **The morning:** August 22 in daylight: the same street, a search under way, missing-person flyers. At the oak the old bike isn't there; "What if he heard the bell?"
- **Remembering:** a reusable, data-driven memory system (`dist/memory.js`). At the Briarwood corner, F replays the evening ride, warm and muffled, from your own eyes; Alex stops and looks off toward the creek. You come back to the morning exactly as you left it. The realization, then the end card **LAST LIGHT / Chapter Two**.
- **Systems:**
  - Chapter Two takes over Chapter One's phases (`c2-*`, `m-*`).
  - On foot, companions now route round fences and through gaps, and stand across a clue from you when they look at it.
  - The sky has a morning (`day`) uniform.
  - Seven silent checkpoints with Continue labels.
  - Ten QA jumps; full replay reset, including from inside a memory.
- **Verification:** the simulation suite plays prologue → Chapter One → Chapter Two with inputs and checks every Chapter Two beat. The browser suite plays Chapter Two in Chromium/WebGL with captures of each beat, every QA jump, lingering, the wrong way, an alternate approach and Continue, and adds five new audio signal cases. Results: [TEST_REPORT.md](TEST_REPORT.md). Details and known issues: [ASTRA_CHAPTER2_HANDOFF.md](ASTRA_CHAPTER2_HANDOFF.md).

---

# Last Light — Astra Chapter One polish

Continues the existing `codex/astra-chapter1-final-polish` branch from Claude Chapter One source `ed471c04b34bc083da10bdc876f20419246a08e6`. Completed interrupted work and all source ancestry are preserved. No merge to main and no Chapter Two content.

- Sequential **Find Jamie.** / **Find Sam.** objectives, brief memory reminders, distinct permanent house landmarks, warm porch/window lighting, clear side paths and a gentle Sam-first redirect.
- Faster walking, a visible on-foot body, Shift sprint/stamina, Space jump, C/Ctrl crouch and a T-toggle spare flashlight received from Jamie.
- Varied riding and walking formations, bounded continuous catch-up and local obstacle/companion avoidance.
- Officer approach to the player's position, Dad joining naturally and adaptive conversation staging.
- Refined cruiser body/cabin/wheels, steering and braking motion; limited emergency-light falloff; adult face/clothing details and distant silhouettes.
- Supported window climb and bike lift, visible pebble throws and Sam's garage side-door exit.
- Non-glowing sidewalk joints; creek surface/prop detail, chipped taped reflector and softer flashlight exposure; final look toward the distant bell.
- Restrained title/end UI and **Show dialogue captions** semantics.

Final measured results, captures, audio-listening limitation and performance caveats: [ASTRA_CHAPTER1_FINAL_RELEASE.md](ASTRA_CHAPTER1_FINAL_RELEASE.md) and [TEST_REPORT.md](TEST_REPORT.md).

---

# Last Light — Chapter One pass

Built directly on `codex/astra-last-light-final-polish` at `9520b4f1d72759b27ac823671bdefae19ce27e55`, on `claude/relaxed-heisenberg-gv002b`. All preceding history is retained; the release branch and `main` are untouched.

- **Prologue:** Alex now leaves first, down Briarwood Lane (goodbye, bell, wave, gone round the curve); Jamie and Sam keep their full house sequences, farther along the street. Added Alex's “Did you guys hear that?” setup. Go home no longer ends the game: “I thought I remembered everyone.” carries the transition into the ride home.
- **Chapter One**, ending at the first clue: a quiet ride home; a police car passing and turning onto Briarwood behind you with siren Doppler and red/blue light; the LAST LIGHT title; Alex's house with officers, his parents and a neighbor; Jamie woken at his window and Sam got out through his garage side door; the friends comparing memories at the old oak; the retrace down Briarwood in the dark, stopped short by the police; the creek, a tire line, Alex's broken rear reflector, and a distant bell.
- **New systems:** free world-space night riding and walking, objectives, a dialogue queue, a title card, invisible checkpoints with Continue on the title menu, QA jumps (`?qa` / `?jump=`), reusable police cars and emergency lighting, grown-up NPCs, and world-space companions.
- **World:** Briarwood's curve, the creek strip, Alex's house past it, Briarwood streetlights, friends' sneak windows with lit rooms, Sam's garage side door (his garage mirrored to make room).
- **Verification:** 152 browser checks, 171 captures (43 for Chapter One: its story beats, every QA jump, lingering and unusual angles) and 34 audio signal cases, plus the simulation suite with a full scripted Chapter One playthrough (see [TEST_REPORT.md](TEST_REPORT.md)). The new sounds have not been listened to.

See [ASTRA_CHAPTER1_HANDOFF.md](ASTRA_CHAPTER1_HANDOFF.md) for details and known issues.

---

# Last Light — final polish release

Built directly on `claude/epic-planck-cme9eq` at `59c647220e80d12da0d205b1562d483cc5bdb7f3`, on `codex/astra-last-light-final-polish`. All preceding game and structural history is retained.

- Full sidewalk width and curb crossings in both directions, with separate front/rear contact, subtle camera settling and quiet tire/rattle feedback.
- Actual bell-hand reach and lever press, contextual bell/Go home prompts, and individual feet-down stopping poses.
- Refined house surfaces and interiors, bike hardware, garments, hair, blinks, cars, grass and evening light.
- Corrected sign texture batching and post occlusion; reduced house wire clutter while retaining the pole network.
- Pedaling chain sound and coasting freewheel distinction; refreshed title, settings, pause and end-card presentation.
- Two revised memory lines, an unseen fifth chalk child and connected AR bicycle detail; final line: “I thought I remembered everyone.”
- 102 simulation checks, 115 browser checks, 130 rendered captures and 23 audio signal cases. Both ending paths and replay pass. World geometry remains under the existing limits.

See [ASTRA_FINAL_RELEASE.md](ASTRA_FINAL_RELEASE.md) for the complete change record and known limitations, and [TEST_REPORT.md](TEST_REPORT.md) for evidence. Perceptual audio review and real-GPU performance measurements remain outstanding.

---

# Last Light v0.1 — historical release

> These notes describe the v0.1 release (`codex/astra-v0.1-release`). The later structural polish pass on `claude/epic-planck-cme9eq` is described in [ASTRA_HANDOFF.md](ASTRA_HANDOFF.md).

Based directly on Claude's `claude/loving-newton-1vlisx` at `02cbde1`. All original story beats, the three distinct departures, the route, final exploration area and ending text are preserved.

## Visuals

- Corrected invisible roof slopes, degenerate hip-roof triangles and the reversed lookout sidewalk. The sidewalk follows the grassy rise, and the cul-de-sac curb segments follow its circumference.
- Added roof, asphalt, siding and concrete surface variation; curtains, corner boards, gutters, downspouts, a few scooters and doorstep mats.
- Replaced the large polygonal tree crowns with airy leaf clusters. Kept the wind, shrubs, birds, sprinkler sweeps, minivan, porch lights, stars and fireflies.
- Reworked the warm-to-cool light progression, with irregular cloud bands, gentler haze, cooler dusk ambient light and two nearby streetlamps that illuminate passing bikes and pavement.
- Reduced the heavy brown screen overlay so the evening colors remain visible.

## Movement and stability

- Riders lean and turn their shoulders with the handlebars. Tested grip error decreased from up to 8.8 cm in the original rig to at most 1.7 cm, without stretching the arms.
- Added a small welcoming gesture from Jamie's mother. Corrected wrapped-angle steering during departures.
- Manual looking now overrides the automatic departure glance until R recenters the view.
- Corrected a Chromium pointer-lock/capture race, on-foot right-arrow turning, and late audio replies after pause/replay.
- Replay clears the mother's door sound state, ambient timers, wheels, lights, basketball child, ending clue and old audio sources. The ending freezes the world and clears the controls.
- M toggles sound while the mouse is captured.

## Audio

The original locally synthesized sound system remains. The pass removes the final call's feedback echo, softens its harmonic source, adds early bird calls, adjusts rolling/cricket levels, cleans up finished sources and resets old sounds on replay. The evening layers fade beneath the ending chord. A master compressor provides headroom protection.

Real OfflineAudioContext renders and signal checks cover 22 sound cases. They are not a perceptual listening review. The rendered clips and review page accompany the release for the outstanding listening review. On 2026-09-29, the repository owner instructed publication to `main` without waiting for that review.

## Ending detail (spoiler)

One faint additional set of chalk initials appears beside the old initials only during the final fade, after the call home. There is no camera cue, sound cue, second voice, figure, chase or lore text. It is cleared on replay and appears in both natural and idle endings.

## Rendering

Static geometry is batched by spatial cell and compatible material. Vertex colors preserve the existing house and foliage palette while distant cells can be culled. This reduces submitted geometry without stripping neighborhood detail. Real laptop/GPU frame rate is not claimed; the available browser uses SwiftShader.
