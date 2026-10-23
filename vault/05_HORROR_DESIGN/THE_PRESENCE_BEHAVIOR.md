# The Presence: behavior and implementation

Story-side profile: [The Presence](../02_CHARACTERS/THE_PRESENCE.md). This page is how it behaves in play and where the
code lives.

## Chapter Four — the town's lights (✅)

Code: [dist/presence.js](../../dist/presence.js) (`createTownLights`), director [dist/chapter4.js](../../dist/chapter4.js).

- **Two layers** over one array of light levels (every lamp, shop, fixture and sign):
  1. **The schedule** — an ordinary Tuesday: shops close at their hours, each streetlight's photocell comes on between 7:56
     and 8:02 PM, the marquee lights, the diner switches off.
  2. **The Presence mask** — authored stages the chapter drives. A light it reaches gives a small **flicker** and a
     **relay's clunk** and goes out; it can hold a light out or let it come back.
- **Deterministic.** Cascades are ordered by distance along a path at a set speed; the same thing happens every time;
  everything resets to nothing.
- **Slow deaths near the creature** (1.8 s fades) so the player sees what the creature is looking at; sequences answer
  questions ("What's it looking at?").
- **Pursuing dark in the escape** (`darkStep`): a point following the player's **actual trail**; lights within 9 m die as
  it reaches them; the night deepens as it closes (`C.darkTo` 0.62 → 0.84); speed 1.9 → 2.4 m/s over two minutes; hurries
  if more than 16–22 m behind; **never closer than 2.6 m**. Hesitate and it closes; keep moving and it falls back.
- **Point-light assignment**: the handful of real lights go to whatever lit things are nearest the camera; light slots stay
  stable while turning; killed fixtures lose light immediately (Astra polish).
- **Screens**: TVs render the live world from impossible positions at 12 Hz while on, near and in view
  ([dist/footage.js](../../dist/footage.js)); the live picture is from the corner farthest from the player and moves when
  approached; a shot nobody has looked at holds until seen.
- **Stillness**: under the marquee all ambient hooks drop to zero at once ("[It goes quiet. No wind. Nothing.]").
- **Rule**: no spoken line implies a hierarchy (tested).

## Chapter Five — the camp at night (🟡)

Code: [dist/chapter5-presence.js](../../dist/chapter5-presence.js), director [dist/chapter5.js](../../dist/chapter5.js).

| Element | Behavior |
|---|---|
| **Lamps** | Every building's window glow and the office porch bulb is a lamp with a level, a target and optional flicker. The three nearest lit lamps get real lights; far lamps keep a soft glow sprite. |
| **The first light** | 20–40 m off in the trees toward the pump house; stops; **turns its beam onto the boys**; goes out. Calling Alex's name deepens the dusk so it shows. |
| **Three carried lights** | Spot lights with a dark flashlight body, lens, narrow additive beam cone (`BEAM_L`, fades along its length and when it faces you), a glint and a ground pool; always in the scene at intensity 0 when unlit. `carry(n, paths, {speed})` walks them single file along the **recorded trail of the boys' afternoon** (the trail recorder), a step apart where they stop: the office → the map board (stop: "Where we stood.") → the fire (`sitDown`: "That's where we sat."). **One copies the player's flashlight** (off/on); Jamie demonstrates once if the player doesn't. They keep their distance (go out at about 12 m) and finally turn their beams on the boys and go out together. Their holders are never seen (the scene must be dark enough to hide them). |
| **The split (set piece)** | `C.split` tracks each friend's drift (capped at 13 m, where he stops and calls). The camp pulls at whichever friend is farther from the player; looking at Owl's light for over 1.2 s pulls Sam, at the office light pulls Jamie. Holding a friend means being within 3.6 m of him. Voice surges: "…Jamie?" from Owl at 9 s, Sam's mother by the office at 19 s, the bell at 29 s. Resolves when all three stay together 2.6 s after 25 s (or at 66 s): Sam's compromise. |
| **The double** | `doubleWalk(path, {speed})`: Jamie's build, clothes, cap and face (with the expressive face rig); stands where the shirt hung; turns its head to the real Jamie; walks out of the door toward the boys. The run starts once it is out and close, or after 8.5 s. |
| **Wake and boundary** | Every light in the camp on at once (not a line toward them — deliberately different from Chapter Four), then all out at once at the gate (route A) or when the bell rings itself (route C). |

## Escalation so far

Ch4: takes lights, watches, calls, repeats words, makes the world still → Ch5: copies actions, uses family voices,
separates friends, **becomes a friend**, photographs them. For the remaining chapters the human developer wants the
influence to **escalate further** ([Design direction](../03_CHAPTERS/FUTURE_CHAPTERS/DESIGN_DIRECTION.md)).

## Performance contract

The light count is constant through a chapter (carried lights and the flashlight's two spots stay in the scene at
intensity 0). Adding a light mid-scene recompiles every lit material. Chapter Five: hemisphere, sun, 6 point lights,
5 spot lights in every section.
