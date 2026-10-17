# Last Light — Chapter Five: gameplay and story repair (progress record)

Branch `claude/chapter5-gameplay-story-repair`, created from `claude/chapter5-pine-ridge` at
`cafc27f7f6ffd9ce8229b3a1cb7075680c332be8` (descends from Chapter Four `c9647772642c0bbb5478bdb04bf36592fcc74919`).

This file is the repair's working record. It is kept up to date as work lands, so the repair can be resumed.

## Stage A — root causes found in the code

| Playtest complaint | Cause in the code |
|---|---|
| Friends pace while the player stands still | `companions.js` `followWalk`: the target slot is placed relative to the player's *view heading* (`pl.a`), so turning the mouse swings both targets round the player; the slot index also changes every 11 s even at rest (`Math.floor(clock/11)%4`); start/stop thresholds (0.65 m vs 1.1/1.3 m) overlap, so near the goal they start and stop. |
| Friends copy the player's acceleration and stopping | `followRide`: target speed `vT = pv + gap*.5` uses the player's *current* speed with no reaction time; on foot `followWalk` uses `pl.speed + .3`. Both friends react in the same frame. |
| Friends wait for the player to do trivial things | Chapter Five's `match()` only starts mounting when the player is already riding (`want==='ride'`), and the garage's departure waits on the player's bike. |
| Sam's feet sink into the garage floor | `houses.js` `buildGarage`: the foundation box (`y -.05, h .86`) tops out at +0.38 m inside a friend's open garage, hiding the real concrete floor at +0.21 m; walking height (the garage pad) is +0.20 m. Everyone in a friend's garage stood 18 cm "in" the visible floor. |
| Packing is described, not done | `chapter5.js` `pack()`: one F press, then captions name the supplies; no supply props exist. |
| Jamie's sock is invisible / no backpack | The backpack is a prop that appears on the driveway when Jamie speaks (`openBag`); the sock is two boxes on top of it; Jamie never wears or opens it. |
| The yellow gate (and the camp gate) can be walked through | `pine-plan.js`: "The camp's gate leaves and the swing gate are drawn by the builder; the way through is open." Only the posts are solids. |
| Shoreline is a hard wall | `pine-plan.js`: every cell with signed shore distance < −0.35 m is `water` (not walkable); the bed drops 0.55 m within 2.5 m. |
| Skipping stones is not a game | `throwYours()`: F computes a skip count from view pitch and a random number; a stone mesh appears at the hand; friends' counts are fixed arrays. No pickup, no throw, no physics. |
| Dock sitting looks wrong | `sitDock()` only lowers the camera (`pose()`); the first-person body uses the crouch-to-look pose; friends use `sitGesture` (root lowered, feet pulled back) — legs never hang over the edge. |
| Looking down at your body is bad | `on-foot.js`: the camera sits at the head's centre over the body's root, so looking down looks out from inside the neck at the top of the torso; a scripted pose always uses the crouch body. |
| Daytime flashlight "doesn't work" | `updateBatteries()`: the first time the flashlight is switched on anywhere in the camp it dies. In daylight that reads as "the flashlight does not work". |
| Camera has no hands or shutter | `alex-camera.js` hangs the camera model on the view; `photograph()` plays a click; no flash light exists in Chapter Five. |
| No expressions; mouths do not move | `rig.js` `headGeometry` merges the mouth and brows into the head mesh; the kids have no talk animation (adults do, `adult-art.js`). |
| Three-hour campfire | `toFire()` → `C.lapse` jumps the clock from ~4 PM to 6:53 PM over nine seconds. |
| "Yellow orbs" for flashlights | `chapter5-presence.js` carried lights are a sphere and a halo sphere with a point light. |
| "Three people are walking into the camp!" at 90 m | Dialogue names people the player cannot see; lights alone are visible. |
| RUN without a perceived threat | `wake()` → "RUN." after the double is seen; nothing approaches the boys. |
| Shirt vanishes | `owlNext()`: `shirt.visible=false` on a caption. |
