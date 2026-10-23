# Sam's garage

> ✅ CONFIRMED CANON (Ch0, Ch1, Ch4); 🟡 Chapter Five.

## Physical description

A garage about **7 m deep** on the far side of Sam's ranch house: shelves, bins, a workbench, a pegboard, a water heater,
a mower, bikes on the wall, a ball; a house door at the back with steps; a large roll-down garage door; and a **side
door** (added in Chapter One; Sam's garage was mirrored to the far side so the door had room). Chapter Four's art pass
added storage shelves, boxes, a cooler, a folded lawn chair and a basketball. Code: `buildGarageInterior` in
[dist/houses.js](../../dist/houses.js); Chapter Five's table and supplies in [dist/chapter5-garage.js](../../dist/chapter5-garage.js).

## In the story

| Ch | Scene |
|---|---|
| 0 | Sam rides into the garage, parks, waves, goes through the back door; **the garage door comes down**. |
| 1 | The big door stays shut; Sam comes out of the **side door** pushing his bike: "If my dad finds out, I'm dead." |
| 4 | Sam's mom in the garage door; **Alex's backpack** found in this garage (he left it Saturday); the camera in its front pocket. |
| 5 🟡 | A **card table** just inside the open door with the supplies: three flashlights, two battery packs, three water bottles, Alex's camera, the county map, granola bars. You and Sam pack Sam's backpack by hand; Jamie's sock scene on the driveway; the map and the plan; the boys get on their bikes and wait at the end of the driveway. |

## Technical notes (Chapter Five)

- In Chapters 0–4 a friend's garage is a solid box for navigation; in Chapter Five it is a **walk-in room**
  (`nav.setPine(on)` selects `gRoom` instead of `gBox`).
- The garage **footing** used to top out 0.18 m above the floor people stand on (feet sank into the concrete). It is now a
  live mesh, and Chapter Five lowers it 0.18 m (`P.garageFoundation`, `slabs(true)`). Chapters 0–4 still see it where it
  was.
- Known: the baked concrete slab is still 1–2 cm above the walk height (feet 1–2 cm into it). A re-modelled floor should
  sit at the walk height (+0.2 m).
