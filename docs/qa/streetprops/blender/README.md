# Blender inspection renders (NOT game captures)

Offline Cycles renders of the built assets, made by `tools/blender/streetprops/render_inspection.py` (Blender 5.1.2 as a
Python module, CPU, 48 samples). They show the models themselves; they are not evidence of how the game looks. The
in-game evidence is `../browser/` (game-renderer captures, software WebGL).

- `blender-vehicles-lineup--BLENDER-RENDER.jpg`: the six cars at LOD0 (hatchback, sedan, wagon, minivan, SUV, pickup),
  each in one of its period paints, with the game's paint rule (atlas × paint through the paint mask).
- `blender-props-kit--BLENDER-RENDER.jpg`: a wood pole with crossarms and transformer, the cobra-head lamp, the four
  mailboxes, the hydrant, the cart and galvanized can, the portable hoop, privacy / gate / picket bays.
- `blender-mailboxes--BLENDER-RENDER.jpg`: the four mailboxes close (white vinyl post, stained cedar post, black scroll
  post, brick column), the box in one paint (after the mailbox rework that followed the first review).
