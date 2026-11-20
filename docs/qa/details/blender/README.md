# Blender inspection renders (NOT game captures)

These are offline Cycles renders of the built kit, made by `tools/blender/details/render_details.py` (Blender 5.1.2 as a
Python module, CPU, 48 samples, with the street-props inspection set-up's light and ground). They show the models
themselves, at LOD0. They are not evidence of how the game looks: the in-game evidence is `../browser/` (game-renderer
captures, software WebGL).

- `blender-details-signs--BLENDER-RENDER.jpg`: a junction assembly as the game builds it. It has the perforated post in its
  anchor, the cast cross bracket, OAK HOLLOW DR and SUMMERFIELD RD, and STOP. Beside it are SLOW CHILDREN AT PLAY, SPEED
  LIMIT 25 and NO OUTLET.
- `blender-details-yard--BLENDER-RENDER.jpg`: the front-yard set. It shows:
  - a folding lawn chair and a resin chair;
  - a kettle grill;
  - a hose coil and its bib;
  - a big wheel, a wagon, a scooter and a kid's bike;
  - a basketball and a playground ball;
  - a kiddie pool with water;
  - an impact sprinkler.
- `blender-details-toys--BLENDER-RENDER.jpg`: the toys and chairs closer.
- `blender-details-backyard--BLENDER-RENDER.jpg`: the back-yard set. It shows:
  - the swing set with its slide;
  - the trampoline with its net;
  - the sheds;
  - the clothesline;
  - a chain-link bay and post;
  - a field-fence post and rail.

In the game every piece takes its recorded colour through the paint mask. These renders use one neutral paint for every
painted piece and a shingle brown for the roofs. The inspection sun is strong: surfaces facing it, such as the shed roofs,
wash out toward white. The game captures show the roofs in their own colours (D14).
