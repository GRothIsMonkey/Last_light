# Environment design

## Principles (from the structural handoffs and Astra's passes)

1. **No visible edge.** The world continues in every direction: second-row houses, far houses, pole lines, horizon trees,
   rolling far land dissolving into fog. "A ray 2° below the horizon hits the world in all 192 sampled directions."
2. **Complete from every side.** Houses have foundations, siding, trim, gutters, windows on all four walls, back sliders.
3. **Placement modes keep things undistorted:** *bent* (follows the street: road, curbs, sidewalks, fences), *drape*
   (rigid footprint on the ground: houses), *rigid* (upright whole objects: trees, cars, props), *baked* (already in
   world space). See [Technical architecture](../09_DEVELOPMENT_HISTORY/TECHNICAL_ARCHITECTURE.md).
4. **One ground surface.** Each region (the woods, the town, Pine Ridge) meets the far land at its edges with the far
   land's own heights (`dist/far-land.js`), so there are never two surfaces.
5. **Ordinary infrastructure, rendered truthfully** (culverts, drains, gates, signs), never decorated with horror props.
6. **Detail where it is inspected;** batched and merged everywhere else.

## Environments by chapter

| Environment | Chapters | Builder | Art status |
|---|---|---|---|
| Suburban neighborhood | 0–5 | `world.js`, `houses.js`, `streets.js`, `vegetation.js`, `props.js`, `background.js`, `furniture.js` | Polished (prologue release) |
| Creek strip | 1 | `creek.js` | Polished (Ch1) |
| Drainage easement and culvert | 2 | `easement.js` | Polished (Ch2) |
| Alex's room | 3 | `alex-room.js` | Polished (Ch3) |
| Access road, woods, outfall, storm drain | 3 | `woods.js`, `drain.js`, `art-surfaces.js` | Polished (Ch3) |
| Old Mill Road and downtown | 4 | `town-plan.js`, `town-build.js`, `town-art.js`, `town-houses.js`, `town-ground.js`, `town-repair2.js` | Polished + 2 repairs (Ch4) |
| Pine Ridge and Camp Whippoorwill | 5 | `pine-plan.js`, `pine-build.js`, `pine-camp.js`, `pine-art.js` | **Placeholder**; Astra reconstruction in progress |

## Chapter Five environment deficiencies (Astra prep handoff)

- **Water:** flat pale sheet; no shading, reflection or shoreline transition; opaque shallows; hard-edged ripples.
- **Ground:** noisy dirt road (shimmer); the beach turns flat olive looking down; a dark seam along the gravel road edge.
- **Camp buildings:** flat untextured walls, plastic-looking posts, black porch ceilings, even lighting with no visible
  source. (Wall battens running across openings: repaired.)
- **Camp gate:** no fence line (a slammed gate could be walked round); blank sign; thin rails; no hardware.
- **Yellow gate:** no hinge collar, counterweight or latch mechanism.
- **Porch light:** "a bare white egg on an invisible cord".
- **The lot:** no lamp post visible at the aftermath.
- Astra's priorities list (first draft): camp architecture and materials (weathering, roofing, rot), lakeside atmosphere
  and fog depth, vegetation density near the camp, dusk/night lighting, fine object detail in the office/lodge/pantry,
  composition of the three lights, the double and the final image, optimization of the crest and lot views.

## In progress (observed read-only on Astra's branch, 🟡)

New modules `pine-detail.js`, `pine-forest.js`, `pine-materials.js`, `chapter5-models.js`, `chapter5-props.js` and changes
to `pine-build.js` / `pine-camp.js` (`4f96fdf`, `4bf3902`: "Reconstruct Chapter Five environments, characters and
interactive Owl escape"; "Avoid reserved GLSL identifier in forest-floor material"). Not documented or approved yet.
