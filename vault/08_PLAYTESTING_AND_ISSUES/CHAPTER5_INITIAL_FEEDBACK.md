# Chapter Five — human playtest feedback

Two rounds of human feedback exist for Chapter Five. **Neither round has produced a recorded approval of anything.**

---

## Round 2 — the repair build: the escape after the double (🔴 Open)

**Build:** `claude/chapter5-gameplay-story-repair` @ `d4de9ab` (or its private playtest copy).
**Reported by:** the human developer, in the vault brief of 2026-10-23. Exact playtest date: **not yet verified**.

> **"The escape after seeing Jamie's duplicate in Owl cabin was excessively long, boring, and frighteningly ineffective."**

| | |
|---|---|
| Status | 🔴 **Open** — redesign in progress by Astra (🟡, unapproved) |
| What the build does | After "RUN.", the boys run back through the camp to the gate (route A, then 190 m of gravel road) or out past the pump house and over the dam (route C, then about 300 m along the south shore) to the bikes. The double is gone when you look back. Simulation: the escape took **146 s**, then the walk back; the first draft's escape was 89.5 s to the boundary. A player still getting nearer to the bikes is never cut short; only one who stops for 90 s (or after 8 minutes) is faded to the rack. |
| Why it fails (analysis against the [Chase design](../05_HORROR_DESIGN/CHASE_DESIGN.md) rules) | No visible pursuer during most of the run; few events after the gate/bell; an empty recovery walk after the peak; total length well past the 45–90 s window that worked in Chapter Three. |
| Intended fix | Astra's redesign (observed read-only on `codex/astra-chapter5-ultra-visual-reconstruction` @ `4bf3902`): the pursuer "takes the path the player actually walked" with "no repositioning on camera turns, no teleporting through buildings"; at the slammed gate Sam holds the latch and **the player pulls the leaf open** ("I have the latch. PULL!"; Jamie: "It's still coming. It's still ME."); a beat at the pump house on route C ("On the walkway. Don't go inside."); "An announced passage of time replaces 190–300 metres of empty recovery walking." Subject to change; not approved. |
| How to close it | The human developer plays the redesigned escape and records the result with the [playtest template](../11_TEMPLATES/PLAYTEST_NOTE_TEMPLATE.md). |

---

## Round 1 — the first draft: 36 complaints

**Build:** `claude/chapter5-pine-ridge` @ `cafc27f` (first complete draft, 2026-10-17).
**Source:** the "Repair report: each playtest complaint" table in
[docs/CHAPTER5_GAMEPLAY_STORY_REPAIR.md](../../docs/CHAPTER5_GAMEPLAY_STORY_REPAIR.md). The human's original wording (the
"repair brief") is **not in the repository**; the complaints below are the repair report's short forms. Overall, the
playtester judged **almost every visual aspect except the sky** "well below the intended quality".

Status key: the repair report's "Yes" = 🔧 Fixed in code and ⏳ Awaiting playtest (no human approval recorded); "Partly"
and "Needs human review" as stated; "No (by design)" = handed to Astra.

| # | Complaint | Repair result | Status |
|---|---|---|---|
| 1 | Sam's packing doesn't match what he says | Sam packs each supply by hand | ⏳ |
| 2 | The player can't help pack | F picks up, F on the bag stores | ⏳ |
| 3 | Sam's feet sink into the floor | Garage footing lowered (live mesh) | ⏳ |
| 4 | Jamie's sock and backpack aren't real | Worn bag, opened, sock pulled out | ⏳ |
| 5 | Friends are followers | Goal-based minds | ⏳ |
| 6 | They wait for you to do trivial things | They get on their own bikes | ⏳ |
| 7 | Acceleration and stopping copy yours | Seen-speed with reaction delays | ⏳ |
| 8 | Pacing, collisions, crowding | Personal space, settle rule, make-way | ⏳ |
| 9 | Why Pine Ridge isn't clear | County map, picture matched at the sign, the register | ⏳ (story; human review of pacing) |
| 10 | Too scripted | Hints before recovery; the player does the actions | ⏳ |
| 11 | Geography and lore | Map, road signs, kiosk map, register | **Partly** |
| 12 | Stones aren't a minigame | Pick up, wind up, release; skip physics | ⏳ |
| 13 | Stones appear without pickup | Stones on the beach, picked up | ⏳ |
| 14 | Must reach down for a stone | Reach with crouch | ⏳ |
| 15 | Throwing animations unconvincing | First-person wind-up; friends crouch and throw | **Partly** |
| 16 | Impacts need interaction | Rings and splashes | ⏳ |
| 17 | Hard shoreline | Wade zones | ⏳ |
| 18 | Enter shallow water | As 17 | ⏳ |
| 19 | Dock sitting is wrong | All three sit, legs over the water | ⏳ |
| 20 | Looking down at yourself is bad | Body under the eye, dipping eye, stance | **Partly** |
| 21 | Walk through a gate | Collision follows the arm; latch by hand | ⏳ |
| 22 | No inventory | I/Tab/BAG | ⏳ |
| 23 | Flashlight by day | Handed out at the gate; works by day; dies only in Bluejay | ⏳ |
| 24 | Camera needs hands and shutter | Both hands, finger on the shutter | ⏳ |
| 25 | Shutter/flash response | Flash, picture on the screen | ⏳ |
| 26 | Little facial expression | Dynamic brows and mouth | **Partly** |
| 27 | Mouths don't move | Text-timed mouths | **Partly (provisional)** |
| 28 | Campfire takes 3.5 hours | Short rest at the real clock rate | ⏳ |
| 29 | Shirt taken without a pickup | Sam takes it off the nail into his bag | ⏳ |
| 30 | Floating yellow orb | Carried flashlights with beams | **Partly** |
| 31 | People too far for the dialogue | They talk about lights | ⏳ |
| 32 | Horror lacks causes | Lights copy you, sit where you sat; the double comes out | ⏳ (needs human review) |
| 33 | RUN without danger | RUN only when the double comes at you | ⏳ |
| 34 | The escape isn't frightening | The gate slams in front; every light out | **Needs human review** → became Round 2's 🔴 complaint |
| 35 | Disconnected triggers | One afternoon to night, each beat caused by the last | **Needs human review** |
| 36 | Visuals below quality | Not addressed (Astra pass) | 🔴 Open (Astra) |

See [Chapter Five repair summary](CHAPTER5_REPAIR_SUMMARY.md) for how they were fixed and
[Chapter Five Astra objectives](CHAPTER5_ASTRA_OBJECTIVES.md) for what remains.
