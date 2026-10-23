# Movement and controls

Source of truth for the key list: the **Play** section of the root [README.md](../../README.md) and the title screen
(`dist/index.html`). Implementation: [dist/game.js](../../dist/game.js) (input, states, riding, walking),
[dist/on-foot.js](../../dist/on-foot.js) (walking body, sprint, crouch, jump, flashlight).

## Controls (all chapters)

| Key | Action |
|---|---|
| **W / ↑** | Pedal (hold a while, or add **Shift**, to push harder; you tire) / walk |
| **S / ↓** | Brake / walk back |
| **A / D**, **← / →** | Steer / strafe; stopped on the bike, walks the bike round |
| **Mouse** | Look (pointer lock; if unavailable, hold and drag). Sensitivity is a setting. |
| **Q / E** | Look left / right (turn on foot) |
| **R** | Center the view |
| **Space** | On the bike: ring the bell (the left hand reaches, the lever presses, the sound at ~0.12 s). On foot: jump |
| **Shift** (on foot) | Sprint, with a small stamina bar |
| **C / Ctrl** | Hold to crouch |
| **F** | The contextual action (get off/on, look closer, tap a window, talk, open, pick up, sit, remember, take…) |
| **T** | Flashlight (once you have one) |
| **V** | Alex's camera (Ch4–5) |
| **I** or **Tab** | What you carry (Ch5) |
| **Esc** | Pause: Keep going, Settings, Start over, Back to the title |
| **M** | Toggle sound |

Chapter-specific keys: microfilm A/D (Ch4); register A/D (Ch5); hold F to wind a stone throw (Ch5); camera playback
A/D, W/S, wheel, mouse pan (Ch4).

## On foot

| | Value |
|---|---|
| Walk | 2.05 m/s (eased acceleration and braking; foot cadence follows distance moved) |
| Sprint | 3.65 m/s; about 13 s of sustained sprint drains the stamina; an exhaustion threshold prevents toggling |
| Crouch | 0.95 m/s; eye height, torso, hands and legs move together |
| Jump | A modest ~0.5 m apex with gravity and a landing recovery; never changes horizontal collision |
| Careful walk | In the storm drain, about three quarters of normal walking |
| Story escape | 5.25 m/s in the drain, no stamina spent, forward runs you *out* (see [Chase design](../05_HORROR_DESIGN/CHASE_DESIGN.md)) |
| Wading | Slower where the bed is under water (Ch5 shallows) |
| Collision | You can always step out of something you overlap (a fix from the Ch3 rebuild); you slide along people and bikes |

## The first-person body

- **Riding:** the whole body is present; IK keeps hands on the actual grips (within ~1.6 cm) and feet on the pedals; the
  head is shadow-only (layer 1), so you see your chest, arms, knees and shoes looking down, and still cast a full shadow.
- **On foot:** the same rig, visible; the head and neck excluded from the camera.
- **Chapter Five only (`foot.fpBody`):** a first-person stance, the body set back under the eye, an eye that dips looking
  down, and a deeper look-down limit; seated poses at the dock. Switched off for Chapters 0–4.

## Settings (remembered in `localStorage['lastlight.settings']`)

Volume · mouse sensitivity · graphics quality (low/medium/high: pixel ratio 1/1.35/2, shadow map 1024/2048/3072) ·
**Show dialogue captions** (all spoken lines; objectives stay visible) · memory lines on/off · full screen.

## Touch

Hold the on-screen pedal and steering buttons, drag to look; the extra button does what F does; in Chapter Five the BAG
button opens the inventory. Sprint, jump, crouch and flashlight are keyboard-only. Not validated on real touch devices.
