# Flashlights

## The player's flashlight

| Chapter | How you get it | Behavior |
|---|---|---|
| 1 ✅ | **Jamie gives you a spare** during the creek dialogue | **T** toggles it; a warm spotlight attached to the right hand, following the view smoothly; reduces intensity when aimed at nearby ground. Continue restores it at the creek; Start over removes it. |
| 2 ✅ | Kept | For the search behind the creek |
| 3 ✅ | Your own ("Bring a flashlight.") | Starts **off** at night. In the storm drain: a dim, wide **spill** round the hotspot shows walls and floor nearby; the hotspot is only as strong as whatever is nearest in it can take (no white-flared friends); friends in the beam get more allowance |
| 5 🟡 | **Sam hands one out at the camp gate** from his bag (you take it with F; Jamie takes his from Sam's hand) | **Works by day and night.** State is only: have it · in your hand (out of your pocket with a hand transition, put away the same way) · switched on · batteries. **T** takes it out and on, then toggles. Dies **once**, in the dark inside Bluejay, with a flicker; Sam's battery pack; your hands change them; it comes back **on**. The beam is off during a photograph. |

Code: [dist/on-foot.js](../../dist/on-foot.js) (`light` hotspot SpotLight + `spill` SpotLight, the torch mesh),
[dist/chapter5-gear.js](../../dist/chapter5-gear.js) (Chapter Five state model, `samBatteries`), exposure in
[dist/game.js](../../dist/game.js) (`foot.exposure`).

## Other lights carried by people

- **Jamie's** flashlight is a real light (Ch1+); **Sam's**, the second officer's and volunteers' are additive beam cones
  (Ch2) — not all beams are physical lights.
- **Police**: two pooled emergency point lights and one shared spot (headlights / search) created once and switched by
  intensity ([dist/police.js](../../dist/police.js)).
- **Bike headlight** on the access road (Ch3).
- **The three carried lights** (Ch5 night): spot lights with beams and pools, always in the scene at intensity 0 when unlit
  ([The Presence behavior](../05_HORROR_DESIGN/THE_PRESENCE_BEHAVIOR.md)).

## Contracts (keep)

- **Constant light count** per chapter: the flashlight's two spots are in the scene for the whole chapter; switching is by
  intensity. Adding lights mid-scene recompiles every lit material.
- In Chapter One the extra lights are attached only while the screen is dark (a transition fade, the idle fade or a jump),
  when the sun's shadow map switches off; the night programs are warmed then.
- The Chapter Five flashlight state model (have / in hand / on / batteries).

## Known placeholders

First-person torch reads as a glowing blob with a faint pool by day; companions' torches read as hockey pucks at night;
the battery change is a sealed card pressed to the tail (no cap off, no cells). Wanted: a visible torch in the hand, a
hotspot with falloff.
