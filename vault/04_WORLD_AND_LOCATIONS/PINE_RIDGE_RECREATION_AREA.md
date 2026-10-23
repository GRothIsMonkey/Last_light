# Pine Ridge Recreation Area

> 🟡 IMPLEMENTED BUT UNAPPROVED (Chapter Five). First named in ✅ Chapter Four (the 1991 search; the sign on the TV).
> Sources: [first-draft handoff](../../docs/CHAPTER5_PINE_RIDGE_HANDOFF.md) §1–2, [repair](../../docs/CHAPTER5_GAMEPLAY_STORY_REPAIR.md) Stage D–E;
> code [pine-plan.js](../../dist/pine-plan.js) (`SPOT`, `BLD`, `WADE`, `GATES`), [pine-build.js](../../dist/pine-build.js),
> [pine-art.js](../../dist/pine-art.js), [chapter5-park.js](../../dist/chapter5-park.js).

## What is there

| Place | Detail |
|---|---|
| Entrance | Fee booth; a **new** park sign — "Pine Ridge Park" — not the brown one in Alex's picture |
| Paved lot | **Bike rack** (the bikes are locked here with Sam's dad's cable lock; on foot from here on) and the **lot lamp** (the aftermath happens under it) |
| Lawn | Picnic shelter on a mown lawn running down to the water; playground; restroom; **trail kiosk** with the trail map ("The map's by the bathrooms") |
| Beach | A pebble beach by the public dock with **22 flat stones**; wade zones where the bed is under water (walkable, slower, rings at each step) |
| Public dock | All three sit on the end, legs over the water; Alex and Gary the shoe |
| **The old gravel lot** | At the north end of the lawn, from before the paved lot: the **original brown wooden sign**, a **yellow swing gate** across a gravel road (boulders either side of its posts), and the **Reservoir Authority's gray shed** by the water. **The place in the picture.** |
| Gravel road | About 190 m along the north shore to Camp Whippoorwill; "Power poles. No wires." |

## The place in the picture

Alex's last picture (the photograph of the Lantern Video's TV) shows Alex walking toward whoever held the camera, a brown
wooden sign, a yellow gate and a gray shed. It matches **only by looking from the right spot** with the camera up (V):
where Alex stood is `ALEX_STOOD` in `dist/chapter5.js`. "…This is it." "He was standing right here." "Walking toward—"
"Toward whoever had the camera." Hints come if you are lost; the match gets easier to line up after four minutes; it is
never done for you.

## The yellow gate

Solid: the arm blocks where it is drawn and turns live on screen. **F at the latch** opens it; otherwise Jamie lifts the
latch and walks the arm round on its post. It stops against a player standing in its way. This is where **the player
decides** how they go on (*Go with Jamie* / *Hear Sam out*). Code: `GATES.swing`, [chapter5-gates.js](../../dist/chapter5-gates.js).

## Story beats here

Arrival ("It's bigger than I remember.") · the rack · stones · the dock · the photo match · the trail map · the gate ·
(night) the walk back along the shore after the escape · the lamp in the lot · the last picture · the last image: Jamie
and Sam at the edge of the lawn, one light across the water in Owl.

## Known visual problems (Astra)

Water is a flat pale sheet with hard-edged ripples; shallows are opaque (feet vanish); the beach turns flat olive looking
down; the dirt road texture is noisy; the lot has no visible lamp post at the aftermath; bike spokes glow white. See the
[Astra prep handoff](../../docs/CHAPTER5_ASTRA_PREP_HANDOFF.md) and [Water and vegetation](../07_VISUAL_AND_AUDIO/WATER_AND_VEGETATION.md).
