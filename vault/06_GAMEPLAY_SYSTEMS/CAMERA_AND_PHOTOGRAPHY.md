# Cameras and photography

## Alex's camera (Chapter Four, ✅)

Code: [dist/alex-camera.js](../../dist/alex-camera.js). "A cheap 2009 point-and-shoot (silver front, black back, a
2.7-inch screen, a wrist strap), found in the front pocket of his backpack."

- **Playback in your hands:** **A/D** previous/next; **W/S** or the wheel to magnify; the mouse moves round a magnified
  picture; **F** "point it out" (a friend's finger on the screen, magnifying onto the old bike); **V** lowers it. After
  getting it, **V** takes it out or puts it away at any time on foot.
- **Thirteen pictures** of an ordinary summer, each **rendered from a camera placed in this world** with the people, bikes
  and light of that day. The old bike is in the background of four (the field fence by the oak; down Briarwood under a
  light pole; across the creek in the weeds; downtown by a door). The last is Mason Cycle & Sport, dated last Wednesday.
- **Hints:** after 6 s a friend says where to look; after 12 s magnifies onto it; "Go to the last one." at 95 s; a friend
  skips to it at 120 s.
- **The viewfinder** (video store): with the PINE RIDGE sign on the TV, **V** raises the camera as a viewfinder and **F**
  takes the picture (if not, Jamie does after 15 s). The picture is made again after a Continue.

## Live footage (Chapter Four, ✅)

Code: [dist/footage.js](../../dist/footage.js). "Nothing here is a recording: every picture is this world seen from a place
nobody could have filmed it from, rendered live into the screen while it is on." TVs render at **12 Hz** only while on,
near and roughly in view; a screen is hidden while its own picture renders; render targets are toned in a CRT shader.

## Photographs with your hands (Chapter Five, 🟡)

Code: [dist/chapter5-gear.js](../../dist/chapter5-gear.js) (`shootArms`), director [dist/chapter5.js](../../dist/chapter5.js).

- **V** brings up Alex's camera. Held up where his picture was taken, it compares (the **photo match** at the old gravel
  lot). While you look closer at something (the register, the search map, the carving), **V** takes a picture of it.
- **The shot timeline (contract):** up by 0.38 s → the fingertip down on the shutter 0.40–0.46 s → **the picture is
  rendered at 0.46 s** (without your hands in it) and the flash → the picture held on the camera's screen (white-edged,
  with a count; focus brackets while aiming) → down from 1.05 s → done at 1.4 s. The flashlight is hidden and its beam off
  for that time.
- **The flash borrows the flashlight's wide spill light** for a moment: no new light is added, so the scene's light count
  never changes.
- **The picture none of them took:** rendered during the campfire rest from the trees behind the empty log (`fireShot`,
  640×480; a painted fallback if rendering is unavailable), stamped with that time, found at the end (`secondDiscovery`).

## Known placeholders

The camera model is Chapter Four's and is **mirrored** compared with a real compact (shutter at the left as you hold it);
no finger rig (a fingertip mesh); the flash is a flat brightening (wanted: a short burst thrown forward from the front);
cheap-camera look, CRT curvature/bloom/roll are art targets.
