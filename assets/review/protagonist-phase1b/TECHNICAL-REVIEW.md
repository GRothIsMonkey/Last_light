# Protagonist movement · Technical review

## Asset and skeleton

Blender 5.2.2 LTS reopened the character and linked bicycle scene. The editable source contains seven packed file textures and 59 joints. The GLB is 6,505,696 bytes, uses one skin, one material, two skinned primitives and one embedded 1024 × 1024 JPEG atlas (107,088 bytes). Its animation samplers reference 368,620 distinct bytes of binary buffer views. Skinning uses up to four influences per vertex.

| Primitive | Exported vertices | Triangles |
|---|---:|---:|
| PlayerBody | 38065 | 70687 |
| PlayerHead | 41126 | 59849 |

The hierarchy starts at root → hips → spine_01 → spine_02 → chest → neck → head → socket_eye. Each side of the chest supports clavicle → upperarm → lowerarm. The lower arm has a twist joint and a hand. Each hand has fifteen phalanges and a grip socket. The right hand also carries socket_lamp_r. Each leg starts at the hips and continues through thigh → calf → foot → toe. Translation and quaternion rotation are keyed in local bone space. The editable sources use 30 fps. The GLB samples every second Blender frame and interpolates between samples.

| Action | Blender frames | GLB seconds |
|---|---:|---:|
| Idle | 61 | 2.033 |
| Walk | 45 | 1.500 |
| Run | 37 | 1.233 |
| RunLight | 37 | 1.233 |
| Cycle | 41 | 1.367 |
| Bell | 16 | 0.500 |
| Steer | 91 | 3.033 |
| Brake | 65 | 2.167 |
| Dismount | 42 | 1.367 |
| Crouch | 71 | 2.367 |
| GaitChanges | 169 | 5.633 |
| RunStop | 79 | 2.633 |
| RideToWalk | 133 | 4.433 |

## Contact and deformation checks

- For Walk, Run and RunLight, evaluated outsole vertices met the flat ground within 0.001 mm at the sampled stance frames. The maximum fore–aft travel over the measured flat midstance interval was below 0.001 mm after accounting for stride translation. Heel strike and toe-off use a rolling contact. These measurements describe the authored movements on a level plane.
- Across Cycle and Steer, sampled outsole points above the tread ranged from 0.489 mm below to 0.006 mm above the tread surface. The straight-bar Blender grip socket rounded to 0.000 mm from its target. The live rider used the actual crank position, current steer angle, and extended shoulder reach. Real-game grip and ankle-target residuals stayed under 0.001 mm at the captured ride, turn, brake and planted-stop states. Bone-target residuals and outsole-surface measurements are different checks.
- First and last joint positions matched to 0.001 mm for Idle, Walk, Run, RunLight, Cycle and Steer. The closest adjacent long-finger tip axes were 16.73 mm apart in the riding study. This is a joint-axis spacing check. Nail, fingertip, lever and sleeve surfaces still require visual judgment.
- Frames were evaluated for finite transforms in all 13 actions. The largest adjacent sampled calf, arm or hand rotation was 4.5° in Cycle, 24.17° in Dismount and 39.45° in RunStop. The fast recovery portion of the gait is the most important region to judge in motion. No exhaustive cloth or finger-surface collision simulation was performed.
- A fresh arm pose is sampled before the current steering correction. The clavicle extends when necessary, and the planted foot can leave the pedal while braking. Dismount blends from the live steering pose. Walking and running track the game's actual footstep phase and speed. A world-space horizontal stance correction limits slip as the on-foot character translates.
- The first-person head uses its actual geometry only during the sun's shadow pass. The live test counted the submitted shadow geometry and checked that its draw range returned to zero for the eye camera. Fresh third-person instances render their full head. The screenshots show cycling, stopping, dismounting, standing, walking at 2.03 m/s, running at 3.64 m/s and carrying the flashlight. Source pose studies and game captures use their respective cameras.

## Playable integration

The opt-in GLB is loaded through the game's asset library and an isolated update hook in game.js. Existing rig.js, on-foot.js, physical.js, cast.js and the route supply the geometry, movement state and contact targets. The player preview activates during the Prologue ride, dismount and ordinary on-foot movement. Scripted poses and later chapters hand drawing back to the existing character. With the flag absent, the browser benchmark recorded zero requests for the new player GLB. Mechanics and camera navigation continue to use the existing game paths.

A separate detached test checkout at `75f40efb5895f0d2d06d01490e84241a4dc660dc` ran `?qa&bikes&houses&vegetation&pavement&player1b`. The two game hooks applied to the roads revision. The player registry entry was added alongside that revision’s existing entries, and the plugin and GLB were copied across. The four authored bicycle handles loaded, houses reported **refined**, vegetation **authored**, lawn **C**, pavement **reconstructed**, and the player was mounted and steering. A [7.3-second game capture](movement-clips/combined-prologue-ride.mp4) from the independently extracted build follows a continuous ride through both steering directions and braking to rest. The recording uses the actual WebGL camera with the HTML interface outside the frame. The browser and the four environment asset registries reported zero errors in this run. The [combined frame](game-evidence/11-combined-environment.png) records this test. The dedicated character branch and its recovery build use the Phase 1A neighborhood. The recovery ZIP also contains the tested combined runtime and its third-party credits in combined-preview. Run `python serve-review.py --environment` from the extracted Phase 1B review folder to play it.

## Runtime cost

Edge used a physical NVIDIA GeForce RTX 4060 Ti through ANGLE / Direct3D 11. Each pass used the same starting road position, inputs, camera and 800 × 560 drawing buffer. We discarded 10 warm-up frames, then timed 25 simulation-plus-render steps per pass. GPU completion was synchronized with finish and a one-pixel readback. These are per-pass medians in milliseconds on the character branch. They cover the sampled ride and exclude asset loading.

| Pass | Player | Step + render, ms | Update, ms | Draw calls | Triangles |
|---:|---|---:|---:|---:|---:|
| 1 | original | 3.4 | 0.4 | 112 | 209432 |
| 2 | player1b | 4.2 | 0.6 | 97 | 252375 |
| 3 | player1b | 3.7 | 0.5 | 97 | 252375 |
| 4 | original | 3.4 | 0.4 | 112 | 209432 |

The opt-in rider increases the visible geometry load. Mobile hardware, integrated graphics and a sustained frame-time benchmark of the full upgraded environment remain unmeasured. All values and per-frame timings are in [measurements.json](measurements.json).

## Regression results

The default full repository simulation reached its final development-selector checks and stopped on `2/alex-bike`. The Chapter Two bike had different stored coordinates after switching between development scenes. The same scene-switch sequence on the original Phase 1A runtime reproduced exactly the same three differences in x, z and heading. The test harness itself lists this scene as a known-difference example. The repository’s documented DEV_KNOWN setting then reported this same case separately and completed 840 checks. The Prologue player tests ran separately in Edge, including the complete ride-to-foot transition.

## Recovery and reproduction

The recovery ZIP includes the Phase 1A and Phase 1B review directories and the runnable character-branch dist tree. Its root SHA256SUMS.txt covers the archived payload. The ZIP has an independent SHA-256 sibling file. With Blender installed, run `blender --background --factory-startup --python-exit-code 1 --python verify-blender.py` in this review folder to verify the scenes, linked library, motion and 17 videos. The gallery works directly from disk. The playable game and interactive studio use the included localhost launcher.
