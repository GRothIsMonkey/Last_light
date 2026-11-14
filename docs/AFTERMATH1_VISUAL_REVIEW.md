# Aftermath I — visual review (captures, read by eye)

Captures were made in Chromium with software WebGL (SwiftShader) at 960×540 by `tests/aftermath1-shots.mjs`, each
scene started from its DEV entry and played forward by the capture script. They are in `docs/qa/aftermath1/`
(`dev/` Acts I–II, `act3/` the street and the houses, `act4/` the remembrances, Sam and October). This is a reading of
those images: what reads, and what was wrong and changed because of them. It is not a substitute for looking at the game
on a real GPU (`AFTERMATH1_PLAYTEST_CHECKLIST.md`).

## What reads

| Scene | Capture(s) | What it shows |
|---|---|---|
| The school lot, 6:30 AM | `dev/lot-*` | the drive, the bus, the ambulance, people in blankets on the grass, the rack by the doors, smoke on the skyline; the red sky gone to brown |
| The gym as a shelter | `dev/gym-*` | cots in rows, the board of the missing, the lists by street, first aid, the TV, volunteers; ~30 people |
| Jamie's mother; Alex's parents; the families | `dev/jamiemom-*`, `dev/alexparents-*`, `dev/families-*` | the grown-ups' faces (tears, reddened lids, mouths) read as different states; the two mothers are not the same face |
| Behind the fence (Sep 1) | `act3/street-fence`, `-gate`, `-paint`, `-barricade`, `-oak`, `-sams`, `-kowalski`, `-summerfield`, `-hendersons` | the chain-link line below Summerfield with sawhorses and cones and the crater behind it; the searchers' X (`8/27 · OHFD · 0`) and a RESTRICTED placard by a front door, plywood in the windows; the barricade with the trench, the excavator, workers in vests, 1052 leaning, the ROAD CLOSED sign |
| The bikes | `act3/bikes-found`, `-up`, `-bell`, `-close`, `-dad` | Alex's cruiser on its kickstand and Jamie's BMX on its side in the gutter, then stood up; the bell, rack and reflector on Alex's bars close up |
| Jamie's porch | `act3/porch-*` | the porch light on in daylight; his mother on the step with a mug; the red chair; Lily and Mrs. Henderson on the walk |
| Alex's garage and room | `act3/garage-*` | the bike back on its two hooks high on the garage wall; the Sunday print; his room as it was (unmade bed, RIDE poster, desk, helmet) with his mother on the end of the bed |
| Jamie's lawn at dusk | `act4/lawn-*` | dozens of candles in jars round the steps and along the walk; the porch light; people standing in the grass; his picture on an easel; notes on the step; Brandt in a lawn chair with his leg out; Sam at the curb |
| Alex's pictures | `act4/gym-*` | chairs in rows, the easel with his portrait, the table with the cloth and flowers, his father at the front; the boards of prints along the walls |
| The chain | `act4/chain-*` | your bike upside down on the driveway with its chain hanging off, then on; Sam kneeling; the streetlight on at dusk |
| October | `act4/october-*` | the leaves gone brown and orange; the fence shut at Summerfield with a surveyor behind it and Reyes's car; Jamie's bike still at his rail |
| The kitchen; your room; the curb | `act4/kitchen-*`, `act4/room-*`, `act4/bye-*` | your mother at the nook table with the letter; the room in boxes (dresser, trophies, the planets poster); the moving truck, a mover with a box, Sam at your bike, his notebook in your hands |
| The road out | `act4/road-*` | from the passenger seat: the dash, the wheel on your mother's side, the pillars, the hood beyond the glass and the street ahead; looking back over the rear seat at the street; looking down, your arms, the notebook, the picture and (if you kept it) his cap on your lap |

## What the captures caught (and what was changed)

- **Road crews at the vigil.** The background people who work on the street on September 1 (hi-vis vests, hard hats) were
  being reused as neighbours on Jamie's lawn still wearing them. The crews are now only on the September 1 walk.
- **Jamie's picture faced the house.** The easel (and the notes on the step) were turned 180°; now they face the street,
  where people stand.
- **Hands at the vigil were empty.** People holding a cup pose had nothing in them; five of them (his mother when she
  isn't holding his cap, Lily, Sam's mother and two neighbours) now hold candles.
- **Your mother cut off at the kitchen table.** Seated, the view put her half out of frame; your seat moved to the other
  end of the table and the seated view turns toward her.
- **The dresser drawer opened into the wall.** Its orientation was flipped; it now slides out into the room.
- **The notebook page cut SAM off.** The names are drawn one per line now (ALEX / JAMIE / SAM), as Act II already did.
- **Sam's wave was only narrated.** At the lamp post he now raises his arm and waves while he sits on his bike with a foot
  down.
- **Your mother stood on Sam's parked bike** at the curb; she is by the front walk now.
- **The car was solid inside.** The game's car model is one solid body up to the window line with a solid block of
  glass above it, so from the passenger seat you looked down at the top of a slab. For the drive its shell is hidden and
  a cabin is shown (hood, dash, wheel, pillars, doors with open windows, roof, back seat, rear window). The seat also
  trailed the moving car by a frame (0.3 m), and what you kept sat past your knees; both fixed.
- **The Saturday board.** The FOUND written across Sam's flyer used the Monday version of the board (with Alex's and
  Jamie's flyers already gone); Saturday now has its own state with all three still up.
- **The kitchen line mentioned a coat** she wasn't wearing; changed.
- **The Tour shirt** was a plain blue block; it has its iron-on letters now.

## What does not read well (not fixed)

- **The oak from the barricade.** At 124 m it is one tree among the trees at the end of the street; the prompt and the
  narration have to name it.
- **Seated people's arms.** The seated pose rests the hands on the knees with straight arms; in a full gym of chairs it
  looks stiff.
- **Interior light at night.** The kitchen at 6:20 PM is lit like Chapter Six's morning (its materials carry a little of
  their own light). It reads as a lit kitchen, not as evening.
- **The car interior** on the road out is simple and unlit (dark dash and roof). Looking straight down you see your own shirt's neck from above, as anywhere in first person.
- **The moving truck** is a van cab on a plain box with a stripe.
- **Faces at a distance.** The grown-ups' face overlay reads close up; at more than a few metres it is just a face.
- Software rendering only: shadows, candle glow and the autumn tint have not been seen on a GPU.
