# Technical architecture

## Platform

- A browser game: **Three.js r160** (vendored, MIT, `dist/THREE-LICENSE.txt`), WebGL1/2, Web Audio. **No build step**:
  `dist/` is both the editable source and the ready-to-serve game (ES modules; must be served over HTTP, not `file://`).
- **Everything is generated at runtime**: geometry, canvas textures (signs, flyers, pages, posters), shaders, and all
  audio. The only binary asset is the creature model (`dist/assets/creature/creature.glb`).
- **No network at runtime**: no CDN, no APIs, no game data downloads.
- Persistence: `localStorage` (`lastlight.settings`, `lastlight.chapter1`, `lastlight.chapter4`).
- `package.json`: `npm test` → `node tests/verify.mjs`; `npm run test:browser` → `node tests/browser.mjs`.

## Big pieces

```text
index.html / ui.js / style.css          title, pause, settings, prompts, cards, captions
        │
game.js  ── renderer, sky & light over time, input, player states (ride / walk / memory / ended),
        │   riding & walking, prompts, settings, QA hook (?qa → window.lastLight), nextChapter()
        ├── world.js ── builds, bakes & merges the static world; ground/rideable queries
        │      ├─ layout.js, terrain.js, route.js, streets.js, houses.js, vegetation.js, furniture.js,
        │      │  props.js, background.js, kit.js, palette.js, materials.js
        │      ├─ creek.js, easement.js (Ch1–2), woods.js, drain.js, alex-room.js (Ch3)
        │      ├─ town-plan.js, town-build.js, town-*.js (Ch4)
        │      └─ pine-plan.js, pine-build.js, pine-camp.js, pine-art.js, far-land.js (Ch5)
        ├── nav.js ── "where can I ride or walk?" for any world point (delegates to each region)
        ├── on-foot.js, ride-contact.js, rig.js, cast.js, friends.js, companions.js, companion-brain.js,
        │   people.js, adult-art.js, police.js, faces.js, physical.js, creature.js, creature-asset.js
        ├── ambient.js, audio.js, tension.js, captions.js, memory.js, nostalgia.js, story.js, ending.js
        └── chapter1.js → chapter2.js → chapter3.js → chapter4.js → chapter5.js   (the director chain)
                 + presence.js, footage.js, alex-camera.js (Ch4); chapter5-*.js, inventory.js (Ch5)
                 + dev-chapters.js, dev-chapter-history.js (TEMPORARY DEV selector)
```

Module-by-module list: [Source module map](SOURCE_MODULE_MAP.md).

## How the world is built (`dist/world.js`)

- Four **placement modes**: *bent* (authored in street coordinates, each vertex mapped onto the street frame: roads, curbs,
  sidewalks, lawns, fences, chalk), *drape* (rigid footprint, base heights from the ground: houses), *rigid* (upright
  whole objects: trees, cars, props, poles), *baked* (already in world space: driveways, wires, far land).
- Everything static is **baked and merged by material and spatial cell** (110 m; 220 m for far content). Batched materials
  use **vertex colors**, so `palette.js` changes flow through.
- **Shadows** come from position-only **shadow proxies** (50 m cells) on layer 1, which the sun sees and the camera does not.
- Windows and porch lights share two shader materials (`glassLit`, `porchLit`); their switch-on moments are stored in the
  vertex color's red channel.
- Named meshes survive merging as `world.originals` (how tests inspect them); nostalgic objects are registered in
  `world.hooks` for restyling.
- Regions (woods, drain, town, town interiors, Pine Ridge) bake into **zones** culled as wholes by render layer; deep in the
  drain only the tunnel's batches draw and the sky is skipped. Pine Ridge releases its pre-bake objects once merged.

## Navigation (`dist/nav.js`)

`locate()` asks whichever region owns a point (Oak Hollow, Briarwood, the easement, Alex's room `setRoom`, the woods, the
drain, the town `setTown`, Pine Ridge `setPine`), each with its own ground, walkability and surface. Companions use
`nav.walkPath` (A*) only when a straight line is blocked. Chapter Five caches failed searches (45 asks) to avoid freezes.

## The director chain

Chapter One's director runs the shared **kit** (dialogue queue `say`/`talk`, objectives, cast, cars, companions,
flashlights, `checkpointTo`, `me`, `dist`, `camLooksAt`, `inView`…) and hands phases to later directors by prefix
(`api.next.owns(phase)`). Each chapter keeps all its transient state in one object (`C`) emptied by `fresh()`; Start over,
jumps and the DEV selector reset everything. See [Chapter transitions](../06_GAMEPLAY_SYSTEMS/CHAPTER_TRANSITIONS.md).

## Switchable shared features (protecting accepted chapters)

| Switch | Effect | On in |
|---|---|---|
| `nav.setTown(on)` | Opens Summerfield and the town | Ch4–5 |
| `nav.setPine(on)` | Opens Pine Ridge; friends' garages become walk-in rooms (`gRoom`) | Ch5 |
| `foot.fpBody` | First-person stance, body under the eye, dipping eye, deeper look-down | Ch5 |
| `face.enable(on)` | Expressive faces (head without built-in mouth/brows) | Ch5 |
| `slabs(true)` | Lowers friends' live garage footings 0.18 m | Ch5 |
| `camp.attach(true)` | Chapter Five's lights join the scene | Ch5 |

## Rendering-to-texture

Alex's photos and the TVs render the live world from placed cameras into render targets (`game.js` `shoot()` /
`readPixels()`), toned in a picture or CRT shader; TVs at 12 Hz only while visible; photos a few at a time.

## Testing architecture

`tests/verify.mjs` loads the real modules with a **mocked WebGL renderer and DOM** and plays the game with inputs; the
browser suites drive real Chromium (Playwright) with SwiftShader. The DEV selector's history is generated from a natural
playthrough (`ONLY=dev-record`). See [QA standards](../08_PLAYTESTING_AND_ISSUES/QA_STANDARDS.md).

## Critical contracts (do not break)

Listed per system in [06 Gameplay systems](../06_GAMEPLAY_SYSTEMS/SYSTEMS_INDEX.md) and in
[docs/CHAPTER5_ASTRA_PREP_HANDOFF.md](../../docs/CHAPTER5_ASTRA_PREP_HANDOFF.md): constant light counts; rig IK targets;
prop grips and container openings; gate angles written each frame; the shot timeline; the carried-light API; the
switchable shared features above; DEV-start equivalence; checkpoint initializers that set every earlier flag.
