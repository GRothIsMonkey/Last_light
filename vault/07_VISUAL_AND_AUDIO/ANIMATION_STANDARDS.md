# Animation standards

Standards drawn from what testers and reviewers have rejected, and what the tests measure. Implementation:
[Character animation](../06_GAMEPLAY_SYSTEMS/CHARACTER_ANIMATION.md).

## Hard rules (measured by tests)

| Rule | Measure in the existing tests |
|---|---|
| **No foot sliding** | Creature foot slip 0 in run/stalk/turn; ≤ 0.09 m on a hard stop; accepted ≤ 0.13 m in the Chapter Four encounter |
| **No floating** | Creature float 0.000 m; bikes rest their lowest point on the ground; people grounded per foot |
| **No teleports in view** | Jumps > 1.2 m while visible are counted (0 in the Chapter Three chase); friends' largest per-frame step 0.27 m |
| **Gait driven by real speed** | Speed error median 0.004 m/s for the creature; companions' foot cadence follows distance moved |
| **Hands on grips, feet on pedals** | Within ~1.6–1.7 cm (riders) |
| **No T-pose / unloaded draw** | The creature is drawn only once loaded and posed |
| **Things change hands only at contact** | Chapter Five props (`physical.js`) |
| **No accumulated gesture drift** | Gestures apply to a copy of the pose |

## Quality bar (from human playtests and frame reviews)

- **Weight:** bodies bob, pitch into starts and stops, lean into turns (Chapter Four creature rework after "the creature
  slid").
- **Readable at distance and in the dark:** stance and silhouette carry fear (cower, recoil, hands on knees).
- **Individuality:** Jamie and Sam move differently (reaction times, speeds, gestures); never in lockstep.
- **Faces that act** (Chapter Five onward): expressions per line; mouths that move with speech; currently provisional.
- **Physical honesty:** reaching, bending for low things, a real wind-up and release, sitting with legs over an edge.

## Known gaps to close (Chapter Five Astra handoff)

Bike mount (no visible kickstand kick; stiff straight-arm reach; a frozen leg swing; standing over the top tube); stiff
reach animations; the stone throw should be a **low sidearm with a body turn**; companions' seated legs read straight from
some angles; thin idle variety (long single poses, staring straight at you); the crossed-arms idle passes through itself;
hands-on-hips never reaches the hips; no finger grips; **the double needs a deliberate, wrong-feeling idle and walk**;
Sam's look-at pitches the head back too far (clamp head pitch and aim at the face).

## The creature (wanted)

A hand-authored run/stop/turn set blended with the procedural contacts; a crouched hide pose with the head pulled in; a
dedicated recoil; dust at contacts; a proper rear/claw — keeping the controller states and measured distances.
