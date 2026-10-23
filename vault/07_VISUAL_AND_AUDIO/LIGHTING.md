# Lighting

## Time of day is the story's clock

| Chapter | Light |
|---|---|
| Prologue | Warm sunset → cool dusk: irregular cloud bands, gentler haze, porch lights and streetlights coming on one by one, fireflies, stars |
| One | Night deepening by phase (`DEEP`, peaking ~0.82 at the creek); police red/blue on the houses; flashlight pools |
| Two | Night in the easement (6–8 active lights); then **morning** daylight (a `day` sky uniform, sun shadows back) |
| Three | Late-morning daylight in Alex's room and street; then 11 PM night, the drain lit only by flashlights (cave lighting, borrowed bounce) |
| Four | Afternoon → gold → violet dusk; photocell streetlights 7:56–8:02 PM; shop glows; then the Presence takes them |
| Five 🟡 | Afternoon → golden hour → dusk → night; camp window lamps; carried beams; every light on / every light off |

Implementation: the sky shader, fog, hemisphere and sun curves and exposure in `update()` in
[dist/game.js](../../dist/game.js); chapter darkness terms (`chapter.night`, `chapter.deep`, `chapter.day`); window and porch
glow through two shared shader materials `glassLit` / `porchLit` (`dist/world.js`), their timing in `dist/ambient.js`.

## Light budget rules

- **Constant light count per chapter**, switched by intensity (adding a light recompiles every lit material).
- Chapter One's extra night lights attach only while the screen is dark; the sun's shadow map switches off then.
- Night shadows are off; one daytime shadow-casting sun with merged shadow proxies (a 120 m frustum following the player).
- Chapter Four: five town point lights reassigned to the nearest lit things each frame, with stable slots.
- Chapter Five: hemisphere, sun, 6 point lights, 5 spots in every section.

## Flashlight exposure

The beam is only as strong as the nearest thing in it can take (no blown-out companion up close); in the storm drain a
dim wide spill shows the walls; friends in the beam get more allowance. See [Flashlights](../06_GAMEPLAY_SYSTEMS/FLASHLIGHTS.md).

## Chapter Five lighting problems (for Astra)

- At the first light (7:44 PM) the sky is still pink twilight and everything is easy to see (no contrast for the scare);
  eight game minutes later it is near black. The **escape (8:12 PM) is under a bright lavender sky, brighter than the porch
  scene before it**, so "every light out" does not read. **The night grade must be smooth and darker from the call on.**
  (The repair already deepens the dusk when they call Alex's name and stopped RUN from lightening the sky.)
- Carried beams: hard cones (repaired to fade); want volumetric dust, bloom or flare. Their holders must stay unseen —
  the scene must be dark enough to hide them (a story requirement).
- Faces at night are near black; fill or bounce light needed so fear reads; the fire gives no warm flicker on faces.
- The camera flash should be a short burst thrown forward.

## Standards

See [Horror visual standards](HORROR_VISUAL_STANDARDS.md) for darkness and readability rules.
