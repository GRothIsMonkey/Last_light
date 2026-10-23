# Source module map

Every runtime module in `dist/` at `d4de9ab` (82 game modules + vendored `three.module.js`), grouped by purpose. Links
open the file on GitHub. An older map with tuning tips: [docs/ASTRA_HANDOFF.md](../../docs/ASTRA_HANDOFF.md) §1.

## Core

| Module | Purpose |
|---|---|
| [game.js](../../dist/game.js) | Renderer, sky and light over time, input, player states, riding and walking, prompts, settings, QA hook, chapter hosting, render-to-texture, memory host |
| [index.html](../../dist/index.html), [style.css](../../dist/style.css), [ui.js](../../dist/ui.js) | Title, pause, settings, credits, cards, prompts, objectives, memory-line overlay |
| [audio.js](../../dist/audio.js) | All synthesized sound (loops, one-shots, bells, voices, heartbeat, siren, recordings) |
| [captions.js](../../dist/captions.js) | Adaptive boxless captions (Ch3+) |
| [tension.js](../../dist/tension.js) | Authored fear value → heartbeat, breath, body |
| [kit.js](../../dist/kit.js), [palette.js](../../dist/palette.js), [materials.js](../../dist/materials.js) | Geometry helpers; all colors; surface shaders |

## World: the neighborhood (Prologue onward)

[world.js](../../dist/world.js) (build, bake, merge, ground queries) · [layout.js](../../dist/layout.js) (street names,
junctions, homes, lookout, `EASEMENT`, `WOODS`, `DRAIN` data) · [terrain.js](../../dist/terrain.js), [route.js](../../dist/route.js)
(street frames, route, terrain) · [streets.js](../../dist/streets.js) · [houses.js](../../dist/houses.js) (lots, houses,
garages, doors, interiors, live garage footing) · [vegetation.js](../../dist/vegetation.js) · [furniture.js](../../dist/furniture.js)
(streetlights, power, signs) · [props.js](../../dist/props.js) (yards, cars, fences, toys, lookout) ·
[background.js](../../dist/background.js) (the world beyond) · [far-land.js](../../dist/far-land.js) (shared far-ground heights) ·
[ambient.js](../../dist/ambient.js) (sprinklers, hoop kid, minivan, birds, fireflies, lights, swing) ·
[art-surfaces.js](../../dist/art-surfaces.js) (Ch3 surface library)

## World: regions

| Region | Modules |
|---|---|
| Creek strip (Ch1) | [creek.js](../../dist/creek.js) |
| Easement and culvert (Ch2) | [easement.js](../../dist/easement.js) |
| Alex's room (Ch3) | [alex-room.js](../../dist/alex-room.js) |
| Access road, woods, outfall (Ch3) | [woods.js](../../dist/woods.js) |
| Storm drain (Ch3) | [drain.js](../../dist/drain.js) |
| Downtown and Old Mill Road (Ch4) | [town-plan.js](../../dist/town-plan.js) (data, walking), [town-build.js](../../dist/town-build.js) (meshes), [town-art.js](../../dist/town-art.js) (Astra detail), [town-props.js](../../dist/town-props.js), [town-houses.js](../../dist/town-houses.js), [town-ground.js](../../dist/town-ground.js), [town-repair2.js](../../dist/town-repair2.js), [town-life.js](../../dist/town-life.js) (people and cars), [chapter4-art.js](../../dist/chapter4-art.js), [chapter4-surfaces.js](../../dist/chapter4-surfaces.js), [chapter4-textures.js](../../dist/chapter4-textures.js) |
| Pine Ridge and the camp (Ch5) | [pine-plan.js](../../dist/pine-plan.js) (plan, heights, nav, solids, doors, gates, spots), [pine-build.js](../../dist/pine-build.js) (land, water, park, road, dam, woods, live gate arm), [pine-camp.js](../../dist/pine-camp.js) (buildings, interiors), [pine-art.js](../../dist/pine-art.js) (signs, register, maps, carving) |
| Navigation (all) | [nav.js](../../dist/nav.js) |

## People, bikes, creatures

[cast.js](../../dist/cast.js) (who everyone is) · [rig.js](../../dist/rig.js) (bodies, heads, bikes, poses, IK) ·
[friends.js](../../dist/friends.js) (prologue group riding and departures) · [companions.js](../../dist/companions.js)
(Jamie and Sam in world space, steps, routing) · [companion-brain.js](../../dist/companion-brain.js) (Ch5 minds) ·
[chapter5-places.js](../../dist/chapter5-places.js) (points of interest) · [people.js](../../dist/people.js) (adult actors) ·
[adult-art.js](../../dist/adult-art.js) · [police.js](../../dist/police.js), [patrol-art.js](../../dist/patrol-art.js) (patrol cars,
emergency lights) · [faces.js](../../dist/faces.js) (Ch5 expressive faces) · [on-foot.js](../../dist/on-foot.js) (walking body,
flashlight) · [ride-contact.js](../../dist/ride-contact.js) (wheel contact) · [old-bike.js](../../dist/old-bike.js) (the one
build of the old bike) · [creature.js](../../dist/creature.js), [creature-asset.js](../../dist/creature-asset.js) (the creature) ·
[chapter3-art.js](../../dist/chapter3-art.js), [chapter3-props.js](../../dist/chapter3-props.js) (Ch3 presentation)

## Story directors

| Chapter | Director | Helpers |
|---|---|---|
| Prologue | (in `game.js`) | [story.js](../../dist/story.js) (lines, sections, memory lines), [nostalgia.js](../../dist/nostalgia.js), [interactions.js](../../dist/interactions.js) (swing, bench, chalk), [ending.js](../../dist/ending.js) (AR, carving, old bike, fifth rider) |
| One | [chapter1.js](../../dist/chapter1.js) | police, people, companions, creek |
| Two | [chapter2.js](../../dist/chapter2.js) | [memory.js](../../dist/memory.js), easement |
| Three | [chapter3.js](../../dist/chapter3.js) | alex-room, woods, drain, old-bike, creature, tension, captions |
| Four | [chapter4.js](../../dist/chapter4.js) | [alex-camera.js](../../dist/alex-camera.js), [footage.js](../../dist/footage.js), [presence.js](../../dist/presence.js), town-* |
| Five | [chapter5.js](../../dist/chapter5.js) | [chapter5-garage.js](../../dist/chapter5-garage.js), [chapter5-park.js](../../dist/chapter5-park.js), [chapter5-gates.js](../../dist/chapter5-gates.js), [chapter5-gear.js](../../dist/chapter5-gear.js), [chapter5-presence.js](../../dist/chapter5-presence.js), [physical.js](../../dist/physical.js), [inventory.js](../../dist/inventory.js), pine-* |

## Temporary (must not ship)

[dev-chapters.js](../../dist/dev-chapters.js), [dev-chapter-history.js](../../dist/dev-chapter-history.js) (generated).

## Assets and tools

- `dist/assets/creature/creature.glb` (runtime creature), `assets/source/creature/smily_horror_monster.glb` (original,
  never loaded), [tools/creature/repack_glb.py](../../tools/creature/repack_glb.py) (made the runtime copy).
- `dist/THREE-LICENSE.txt` (Three.js MIT license).
