# Last Light — Chapter Two (structural pass)

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
