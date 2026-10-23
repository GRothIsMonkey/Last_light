# Gameplay systems index

*Last Light* runs entirely from `dist/` (ES modules, Three.js r160 vendored, no build step). Each system below has its own
note with the controls, the behavior, the source modules, and the **contracts** later work must keep.

| System | Note | Main modules | Introduced |
|---|---|---|---|
| Controls, walking, sprint, jump, crouch | [Movement and controls](MOVEMENT_AND_CONTROLS.md) | `game.js`, `on-foot.js` | Ch0–1 |
| Riding | [Cycling](CYCLING.md) | `game.js`, `ride-contact.js`, `friends.js`, `rig.js` | Ch0 |
| Jamie and Sam | [Companion AI](COMPANION_AI.md) | `friends.js`, `companions.js`, `companion-brain.js`, `chapter5-places.js` | Ch0 / Ch1 / Ch5 |
| Bodies, poses, faces | [Character animation](CHARACTER_ANIMATION.md) | `rig.js`, `cast.js`, `faces.js`, `adult-art.js`, `creature.js` | Ch0+ |
| Props and hands | [Physical interactions](PHYSICAL_INTERACTIONS.md) | `physical.js`, `chapter5-garage.js`, `chapter5-park.js`, `chapter5-gates.js` | Ch5 |
| What you carry | [Inventory](INVENTORY.md) | `inventory.js`, `chapter5-gear.js` | Ch5 |
| Alex's camera, photos, TVs | [Cameras and photography](CAMERA_AND_PHOTOGRAPHY.md) | `alex-camera.js`, `footage.js`, `chapter5-gear.js` | Ch4 |
| Flashlights | [Flashlights](FLASHLIGHTS.md) | `on-foot.js`, `chapter5-gear.js`, `police.js` | Ch1 |
| Clues, objectives, hints | [Investigation](INVESTIGATION.md) | chapter directors | Ch1+ |
| Fear | [Tension and heartbeat](TENSION_AND_HEARTBEAT.md) | `tension.js`, `audio.js` | Ch3 |
| Text on screen | [Captions and UI](CAPTIONS_AND_UI.md) | `captions.js`, `ui.js`, `index.html`, `style.css`, `nostalgia.js` | Ch0 / Ch3 |
| Saving | [Checkpoints and saves](CHECKPOINTS_AND_SAVES.md) | chapter directors, `game.js` | Ch1 |
| Testing starts | [DEV scene selector](DEV_SCENE_SELECTOR.md) | `dev-chapters.js`, `dev-chapter-history.js` | Ch3 playtest build |
| Between chapters | [Chapter transitions](CHAPTER_TRANSITIONS.md) | `chapter1.js` … `chapter5.js`, `game.js` | Ch1+ |
| Remembering | (in [Investigation](INVESTIGATION.md)) | `memory.js`, `game.js` | Ch2 |

The world, navigation and rendering architecture are in
[Technical architecture](../09_DEVELOPMENT_HISTORY/TECHNICAL_ARCHITECTURE.md).

## Design rules shared by every system

- No failure state, no game over (so far).
- Nothing turns the player's view in play, except documented fallbacks.
- Nothing waits forever; every beat has a fallback.
- Every key's prompt appears at the bottom only when it matters; the full list is on the title screen.
- Keyboard and mouse are the validated path; touch has pedal/steer/look and an action button (and BAG in Chapter Five),
  but sprint, jump, crouch and the flashlight are keyboard-only.
