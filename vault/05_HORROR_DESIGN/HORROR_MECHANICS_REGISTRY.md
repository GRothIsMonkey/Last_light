# Horror mechanics registry

Every implemented horror mechanic, where it lives, and its status. Add new ones with the
[horror-mechanic template](../11_TEMPLATES/HORROR_MECHANIC_TEMPLATE.md).

| # | Mechanic | What the player perceives | Chapter | Code | Status |
|---|---|---|---|---|---|
| H1 | **Unobserved change** | Objects appear/vanish only when not looked at (old bike, fifth rider, window figures) | 0, 2, 3, 4 | `dist/ending.js`; `C.bike` states in `dist/chapter3.js` | ✅ |
| H2 | **The distant bell** | A two-strike bell from where nobody is | 1, 2, 3 | `audio.bell`, `audio.bell3` (HRTF) | ✅ (audio placeholder) |
| H3 | **Ambience dropout** | The world's sounds stop layer by layer | 3, 4 | `chapter3.amb`; Ch4 marquee ambient zero | ✅ |
| H4 | **Tension → heartbeat/breath/body** | Your heartbeat and breathing rise with authored fear | 3+ | `dist/tension.js`, `audio.updateBody` | ✅ |
| H5 | **Seen-before-it-moves reveal gate** | A figure/creature waits until you have really looked, cues from friends, 40 s fallback | 3, 4 | `FG.state` and creature reveal in `dist/chapter3.js` | ✅ |
| H6 | **The lure** | A figure in Alex's clothes leads you on and goes into a dark place | 3 | `lure-*` states, `dist/chapter3.js` | ✅ |
| H7 | **Voice of a friend** | "Jamie?" in Alex's voice from where he can't be | 3, 4, 5 | `audio.voice` | ✅ / 🟡 |
| H8 | **Creature chase** | A pursuer that closes, vanishes, reappears behind, never touches | 3 | `run`, `updateChase`, `crChase`; `dist/creature.js` | ✅ |
| H9 | **Story escape state** | Forward runs you out; faster; wider view; no exhaustion | 3, 4, 5 | `A.escape` read in `dist/game.js` | ✅ |
| H10 | **Held gate** | A friend holds a gate; it's slammed; the pursuer batters it | 3 | `dist/chapter3.js` | ✅ |
| H11 | **Obstacle from nowhere** | The old bike lying across the way out | 3 | `C.bike='relocated'` | ✅ |
| H12 | **Afraid creature** | The monster is terrified of something you can't see | 4, 5 | `creatureDusk`, `updateCrt` in `dist/chapter4.js`; Ch5 three-lights scene | ✅ / 🟡 |
| H13 | **Light cascade** | Streetlights die one after another toward you | 4 | `dist/presence.js` mask | ✅ |
| H14 | **Pursuing dark** | Darkness follows your actual trail; closes if you hesitate | 4 | `darkStep` in `dist/chapter4.js` | ✅ |
| H15 | **Live impossible footage** | Screens show you, now, from where no camera is; the camera moves when you approach | 4 | `dist/footage.js`, `updateStore` | ✅ |
| H16 | **The creature pass** | It bolts past you, close, from ahead, fleeing what's behind you | 4 | `creaturePass` in `dist/chapter4.js` | ✅ |
| H17 | **Total stillness** | No wind, no insects; a figure that doesn't breathe | 4 | Ch4 marquee | ✅ |
| H18 | **Echoed words** | A figure repeats things said, including where it wasn't | 4 | `MQ` in `dist/chapter4.js` | ✅ |
| H19 | **Answering light** | A light in the trees turns its beam on you and goes out | 5 | `dist/chapter5.js` (calling) | 🟡 |
| H20 | **Copying lights** | Lights retrace your route, copy your flashlight, sit where you sat | 5 | `carry`, `sitDown` in `dist/chapter5-presence.js`; trail recorder | 🟡 |
| H21 | **The split** | The camp pulls at the friend you leave; family voices | 5 | `C.split` in `dist/chapter5.js` | 🟡 |
| H22 | **The double** | A copy of your friend walks toward you | 5 | `doubleWalk` in `dist/chapter5-presence.js` | 🟡 |
| H23 | **Wake / boundary** | Every light at once on; the gate slams shut in front; every light out | 5 | `dist/chapter5.js` | 🟡 |
| H24 | **The impossible photograph** | A picture of you on a camera nobody used | 5 | `fireShot`, `secondDiscovery` in `dist/chapter5.js` | 🟡 |
| H25 | **Pursuer on your walked path** (Astra redesign) | The double follows the path you actually walked | 5 | `pursue()` on Astra's branch `4f96fdf` | 🟡 in progress, observed read-only |

## ⛔ Rejected mechanics

| Mechanic | Why | Source |
|---|---|---|
| Glowing "orb" lights | Read as yellow orbs, not flashlights | Ch5 repair #30 |
| Naming unseen people in captions | Text-only threat | Ch5 repair #31 |
| RUN with nothing coming | No perceived threat | Ch5 repair #33 |
| Splashes-only escape with no pursuer | "Basically jogging out of the tunnel" | Ch3 escalation playtest |
| Timed radial darkness wave | The escape played itself | Ch4 horror revision |
