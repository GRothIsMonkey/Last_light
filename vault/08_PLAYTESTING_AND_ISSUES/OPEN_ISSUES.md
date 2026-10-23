# Open issues

Statuses: 🔴 Open · 🔧 Fixed in code · ⏳ Awaiting playtest · ✅ Human-approved · 💤 Deferred. Only the human developer
can set ✅. When an item is approved, move it to [Accepted fixes](ACCEPTED_FIXES.md).

## Story and continuity

| ID | Issue | Where | Status | Notes |
|---|---|---|---|---|
| OI-01 | Sam says "Last night. Under the theater. It said 'come find him.'" — the accepted Chapter Four figure never says that (horror revision removed it) | `dist/chapter5.js` garage dialogue | 🔴 Open | Needs a human decision; see [Continuity discrepancies](../01_STORY_BIBLE/CONTINUITY_DISCREPANCIES.md) C1 |
| OI-02 | Root `README.md` describes the rejected Chapter Three basin night, a "1983 boy", and the old marquee lines | `README.md` | 🔴 Open (docs) | Code is correct; docs drift |
| OI-03 | `dist/chapter5.js` and `dist/chapter4.js` header comments describe superseded versions | Code comments | 🔴 Open (docs) | Harmless at runtime; misleading to readers |
| OI-04 | Root `RELEASE_NOTES.md` stops at Chapter Four; `docs/RELEASE_NOTES.md` stops at Chapter Five's first draft | Release notes | 🔴 Open (docs) | The repair has no release-notes entry |

## Chapter Five gameplay and horror

| ID | Issue | Status | Owner |
|---|---|---|---|
| OI-10 | **The escape after Jamie's double is "excessively long, boring, and frighteningly ineffective"** (human) | 🔴 Open — redesign in progress (🟡) | Astra |
| OI-11 | Night grade: pink twilight at the first light, near black eight minutes later; a bright lavender sky at the escape | 🔴 Open | Astra |
| OI-12 | Camp gate has no fence line, so a slammed gate could be walked round | 🔴 Open | Astra |
| OI-13 | Sam can linger in Owl after taking the shirt in some runs | 🔴 Open (minor) | — |
| OI-14 | The 35 other first-draft complaints | ⏳ Awaiting playtest (29 fixed in code; several "Partly" / "Needs human review") | Human |
| OI-15 | Faces and mouths provisional (text-timed; small, low contrast) | 💤 Deferred | Astra / audio |

## Visual (Chapter Five)

| ID | Issue | Status |
|---|---|---|
| OI-20 | Almost every visual aspect except the sky judged below intended quality (complaint #36) | 🔴 Open (Astra, in progress) |
| OI-21 | Garage slab 1–2 cm above the walk floor | 🔴 Open (cosmetic) |
| OI-22 | Car garage's live footing culled from inside Alex's room (not visible from there) | 💤 Deferred |
| OI-23 | Fog makes distant tree impostors pale against the dusk sky in the final view | 🔴 Open |
| OI-24 | The double can be hidden by Owl's door frame from far to one side (first draft) | 🔴 Open (check after Astra's pass) |

## Technical and release

| ID | Issue | Status |
|---|---|---|
| OI-30 | **Real-GPU frame rate never measured** (all chapters) | 💤 Deferred |
| OI-31 | **Audio never listened to by a person**; placeholder synthesis; no voices (all chapters) | 💤 Deferred |
| OI-32 | World mesh count 2,259 (over the 2,000 world-geometry check; QUICK suite skips it) | 🔴 Open |
| OI-33 | Software-GL renderer peaks 4–6 GB on jumps; the human playtest should watch memory on a real GPU | ⏳ Awaiting playtest |
| OI-34 | Credits do not name the creature's author (CC BY requires attribution in the game before public release) | 🔴 Open (before release) |
| OI-35 | The DEV selector must be removed before any public release | 🔴 Open (before release) |
| OI-36 | Touch controls lack sprint, jump, crouch, flashlight; never tested on real touch devices | 💤 Deferred |
| OI-37 | Chapter Two's `homeAt` (`??=`) lets the "go home" fallback fire early on a second playthrough in the same page | 💤 Deferred (left as shipped) |
| OI-38 | `main` holds only v0.1; no integrated release of Chapters 1–5 | 🔴 Open (human decision) |
| OI-39 | Chapter Three's length: README 13–14 min vs test report 19.1 game min | 🔴 Open (verify) |

## How to add an issue

Add a row with the next free ID in the right table: what, where (file or scene), status, owner. Link the playtest note that
raised it.
