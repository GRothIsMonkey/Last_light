# Art direction

## The visual goal

> **A grounded, atmospheric, semi-realistic summer-2011 psychological horror experience with strong nostalgia.**
> (Human developer, vault brief, 2026-10-23.)

- **Grounded:** ordinary places built with real proportions (curb returns, lap siding, driveway aprons, culverts sized the
  way a city builds them). Nothing fantastical in the architecture: "ordinary neglected infrastructure" (the drain).
- **Atmospheric:** light and time of day carry the mood — warm sunset → cool dusk → night; fog that dissolves the far
  field; window and porch glow; flashlight pools.
- **Semi-realistic:** stylized procedural geometry pushed toward realism with materials, weathering and light; not
  cartoon, not photoreal. Current art is acknowledged as stylized ("not claims of photorealism").
- **Summer 2011:** flip phones, a 2009 point-and-shoot, CRT TVs and a game console, a video-rental store, BMX and cruiser
  bikes, trampolines and kiddie pools, an August 2011 calendar.
- **Nostalgia:** the golden hour, cicadas, fireflies, streetlights as curfew, lived-in yards.
- **Horror:** comes from the familiar going wrong and from darkness, never from gore ("No blood, writing, symbols, bones,
  dolls or eyes").

## How the art is made

- Everything is generated at runtime in code: geometry (`dist/houses.js`, `streets.js`, `vegetation.js`, `props.js`,
  `town-build.js`, `pine-build.js`, `pine-camp.js`…), canvas textures for signs, flyers, pages and posters
  (`pine-art.js`, `town-build.js`), procedural surface shaders (`materials.js`, `art-surfaces.js`,
  `chapter4-surfaces.js`, `chapter4-textures.js`).
- Colors live in [dist/palette.js](../../dist/palette.js); characters in [dist/cast.js](../../dist/cast.js).
- Static geometry is baked and merged by material and spatial cell; batched materials use vertex colors.
- The only external art asset is the creature model (CC BY 4.0).

## Successful elements to preserve

| Element | Where | Why it works |
|---|---|---|
| The sky and its time-of-day progression | All chapters | The Chapter Five playtester judged **the sky** the one visual element at the intended quality |
| Distinct friend silhouettes, colors and bikes | `cast.js` | Each kid reads as a different person at a distance |
| A continuous world with no visible edge | Background, far land, fog | Any glance finds more neighborhood |
| Lived-in suburban detail | Houses, yards, props | Nostalgia |
| The storm drain's escalating claustrophobia | Ch3 | Spaces close in toward the scare |
| Downtown's lit shop windows, the Lyric marquee | Ch4 | Light as something to lose |
| Practical light sources (porch bulbs, streetlights, marquee, TVs) | Ch1–5 | Darkness becomes meaningful when lights go out |

## Accepted per-chapter art passes

Astra polished each chapter after its structural pass: [Prologue](../../docs/ASTRA_FINAL_RELEASE.md),
[Chapter One](../../docs/ASTRA_CHAPTER1_FINAL_RELEASE.md), [Chapter Two](../../docs/ASTRA_CHAPTER2_FINAL_RELEASE.md),
[Chapter Three](../../docs/ASTRA_CHAPTER3_FINAL_VISUAL_POLISH.md), [Chapter Four](../../docs/ASTRA_CHAPTER4_FINAL_POLISH.md)
(+ repairs). Chapter Five's pass is in progress.

## Related standards

[Character design](CHARACTER_DESIGN.md) · [Environment design](ENVIRONMENT_DESIGN.md) · [Lighting](LIGHTING.md) ·
[Water and vegetation](WATER_AND_VEGETATION.md) · [Animation standards](ANIMATION_STANDARDS.md) ·
[Horror visual standards](HORROR_VISUAL_STANDARDS.md) · [Audio direction](AUDIO_DIRECTION.md) ·
[Performance budget](PERFORMANCE_BUDGET.md)
