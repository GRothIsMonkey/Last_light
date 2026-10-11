# Creature lab sheets

Rendered with `tests/creature-lab.mjs` (Chromium, SwiftShader) from the code in this branch. Each sheet is one motion
program; from top to bottom: **profile**, **front**, **rear**, **three-quarter**; each view is 16 frames, 1/15 s
apart, left to right, top row then bottom row.

| Sheet | Motion | Foot slip (planted hand/foot, max) |
|---|---|---|
| `run.jpg` | the bounding gallop at 8.6 m/s | 0 |
| `trot.jpg` | 3.6 m/s, diagonal pairs | ≤ 0.08 m (one frame at the gait blend) |
| `stalk.jpg` | 1 m/s, crouched | 0 |
| `stop.jpg` | 8.6 m/s to a stop in 1.1 s | ≤ 0.09 m in the last frames |
| `turn.jpg` | a 5 m-radius turn at 5.2 m/s | 0 |
| `back.jpg` | backing away, cowering a little | 0.002 m |
| `cower.jpg` | drawn in, shivering, in place | 0.006 m |
| `flee.jpg` | cowering, then turning and bolting | 0.006 m |

The model, its face, proportions, textures and colours are the asset's own ("Smily horror monster" by Bento, CC BY 4.0).
