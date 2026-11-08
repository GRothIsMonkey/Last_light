# Chapter Eight reconstruction: baseline audit of the rejected draft

Draft audited: `claude/chapter8-fullgame-story-integration` at `c496d53241b7a82adc7edd8800da367503b5b5a4` (the
reconstruction branch `claude/chapter8-major-reconstruction` starts from this exact commit).

Captures: `before/*.jpg`, made by `tests/chapter8-baseline.mjs` in headless Chromium (SwiftShader software GL,
1280×720). Each shot jumps to a section and then **plays the beat on with the game's own update**, completing whatever
the beat waits for through its own offers, so what is seen is the beat happening from the player's first-person view,
not a static DEV frame. `before/shots.json` records phase and caption at the moment of capture.

## What the user reported after playing it

1. Oak Hollow's destruction was nowhere near large, violent or convincing enough.
2. The three rescues felt like opening cells and watching boys walk out.
3. Jamie's and Alex's deaths were flat and abrupt.
4. The lore, sequence of events and mechanics were confusing in practice.
5. Creature presence, animation, audio, staging and atmosphere were too weak for the climax.

## What the captures show (looked at one by one)

| Shot | Moment | What is visibly wrong |
|---|---|---|
| `sam-out` | Sam's door opens, he comes out | Sam is a dark figure standing in a black room. No water, no wing, no threat, no relief or contact between the boys; the containment "consequence" is only a caption ("a long, heavy sound"). |
| `jamie-out` | Jamie's door opens | An empty olive-green corridor. Jamie and the hunter are nowhere in frame; nothing in the space says *retrieval wing* (no worn paths, no captives' objects, no marks). |
| `alex-door` | At Alex's door, the proof | A striped door in a plain wood-panelled box room. The "most unsettling geometry in the level" reads as an ordinary corridor. |
| `alex-out` | Alex out of the made room | Same frame as `alex-door`: the made-room beat did not visibly change anything from this viewpoint. |
| `reunion` | The crew room | Four boys standing stiffly around a table in identical idle poses; no one sits, nothing of theirs is in the room. One line of dialogue. |
| `breach` | The breach through the hall windows | The Presence is a smooth dark cylinder with two tube limbs behind glass — it reads as plumbing, not an organism. No deformation, no scale cues, no debris. |
| `escape` | Junction hall, jammed bulkhead | A dark doorway; nothing failing is visible; Sam's caption carries the whole event. |
| `street` | Coming down from the oak | **The caption says "the road isn't there… the Hendersons' front yard has gone down into it" over a completely intact, peaceful street.** The ruin exists only near the Hendersons' and cannot be seen from the route. |
| `jamie-death` | The moment the hunter reaches Jamie | A black pit with box shards beside a tilted roof; Jamie and the hunter are tiny or off-frame; "a long hand comes up" exists only as text. |
| `jamie-after` | After Jamie | A small shape on a far lawn; no one near him; nothing for the player to approach. |
| `gates` | Gate 1 on the operating bridge | A dark bridge, a yellow handwheel and a flat water plane; the purpose of the gate is not readable from the view. |
| `plug` | The pins and the plug | A large plain cylinder, rounded black blobs under the catwalk; Sam standing in the foreground. |
| `hatch` | Alex at the hatch | The camera faces the inside of a ladder shaft; Alex's injury ("a whole slab of the roof hits him") happens only in the caption — the arbitrary-slab injury the brief forbids. |
| `alex-death` | Alex at the oak | Broad daylight; Alex sits upright, unhurt-looking, neutral face; nothing about him says he is dying. |
| `ride` | The last ride, looking back | Sam on a bike on a pristine street; no ruin or responders are visible on the ride. |

## Structural causes found in the code (to be rebuilt, not tuned)

- **Rescues** are single-room scripts: find the door, operate one mechanism, `stand()` the friend outside, two lines.
  The friend never acts before he is free, and the escape is a walk back.
- **Hunter** in the wings is a patrol on a node graph with a vision cone; it never reacts to anything the player or a
  friend does except being seen.
- **Pacing**: the old sim spent 31.6 simulated minutes in the gallery stealth (waiting out a patrol) against 2.9 / 2.1 /
  1.9 minutes for the three rescues.
- **Destruction** is local to one hole by the Hendersons' (`chapter8-ruin.js`): up to 12 cut volumes and a pit; the rest
  of Oak Hollow Drive is untouched, and nothing changes while the player watches except the heave.
- **Presence** is a sphere mass and instanced tubes (`chapter8-presence.js`), always seen through a window.
- **Lore**: the mechanism (captives as living anchors) is stated in dialogue and documents; nothing physical changes
  when Sam or Jamie is freed except a sound, so the pattern cannot be noticed.
- **Deaths**: Jamie's is a caption over an off-frame event; Alex's injury is a falling slab chosen by a timer.
