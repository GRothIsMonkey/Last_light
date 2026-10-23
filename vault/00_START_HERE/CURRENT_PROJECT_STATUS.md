# Current project status (2026-10-23)

## In one paragraph

Chapters Zero to Four are finished, polished by Astra, and accepted. Chapter Five (*The Place in the Picture*) had a
complete first draft (`claude/chapter5-pine-ridge`), a human playtest with 36 complaints, and a major gameplay and
story repair (`claude/chapter5-gameplay-story-repair` @ `d4de9ab`, finished 2026-10-20) that rebuilt the companions,
physical interactions, the beach, gates, gear, the afternoon clock and the night. That repair is the gameplay and
story baseline. The human developer has since reported that the **escape after Jamie's double in Owl is excessively
long, boring, and frighteningly ineffective**. Astra began a visual reconstruction of Chapter Five on 2026-10-23
(`codex/astra-chapter5-ultra-visual-reconstruction`), which also redesigns that escape. Nothing after Chapter Five
has been started, and `main` still holds only the v0.1 prologue.

## What is true right now

| Area | State | Label |
|---|---|---|
| Prologue → Chapter Four story | Finished and accepted | ✅ CONFIRMED CANON |
| Chapter Five story and gameplay | Implemented, repaired, waiting on human approval | 🟡 IMPLEMENTED BUT UNAPPROVED |
| Chapter Five escape (after the double) | Human says it does not work; Astra is redesigning it | 🔴 Open |
| Chapter Five visuals | Placeholder; the human judged almost everything except the sky "well below the intended quality" | 🔴 Open (Astra) |
| Chapter Five faces and lip movement | Provisional (text-timed mouths) | 💤 Deferred |
| Audio, all chapters | Placeholder synthesis; never listened to by a person | 💤 Deferred |
| Real-GPU performance | Never measured | 💤 Deferred |
| Chapter Six, Seven, Eight, epilogue | Not started; no story locked | 💡 PROPOSED |
| DEV chapter selector | Temporary playtest tool; must be removed before any public release | 🟡 (tool) |
| `main` | v0.1 prologue only (`21bb7a7`, 2026-09-29) | — |

## The authoritative code

- **Gameplay and story truth for Chapters 0–5:** `claude/chapter5-gameplay-story-repair` @ `d4de9ab`. It contains every
  accepted chapter unchanged (the repair's shared-code changes are switched on only inside Chapter Five) plus the
  repaired Chapter Five.
- **Visual work in progress:** `codex/astra-chapter5-ultra-visual-reconstruction` @ `95a7e43` (three commits on top of
  `d4de9ab`, 2026-10-23). Astra's, not to be modified by anyone else.
- **Frozen releases** of each earlier chapter: see [Git branches](../09_DEVELOPMENT_HISTORY/GIT_BRANCHES.md).

See [Source of truth](../10_AI_DEVELOPMENT_GUIDES/SOURCE_OF_TRUTH.md) for how to decide which branch wins.

## What the human needs to decide next

1. After Astra's pass: is Chapter Five approved? If not, what exactly is wrong (use the
   [playtest template](../11_TEMPLATES/PLAYTEST_NOTE_TEMPLATE.md)).
2. The garage line "It said 'come find him'" contradicts Chapter Four (OI-01 in [Open issues](../08_PLAYTESTING_AND_ISSUES/OPEN_ISSUES.md)).
3. Whether future chapters keep "no failure state" or introduce real danger that can catch the player
   ([Unanswered questions](../01_STORY_BIBLE/UNANSWERED_QUESTIONS.md), design section).
4. Where and when this vault is merged.
5. The direction for Chapter Six ([Design direction](../03_CHAPTERS/FUTURE_CHAPTERS/DESIGN_DIRECTION.md)).

## Known documentation drift in the repository (not fixed by the vault)

The vault does not edit existing docs. These are recorded so nobody is misled:

- `README.md` still describes **Chapter Three's structural pass** (the pond road and the detention basin), which was
  ⛔ REJECTED and replaced by the storm drain and the creature chase.
- `README.md` describes Chapter Four's microfilm as "a 1983 boy who went missing after riding to the Pine Ridge
  Recreation Area". The code (`dist/chapter4.js`) has **Danny Whitcomb, 1991**, and Ruth Ann Carver, 1966. No 1983 case
  exists in the code.
- `README.md` quotes the Lyric marquee lines of the structural pass ("I know where he is." "Come find him."). The
  accepted horror revision replaced them (see [Chapter Four](../03_CHAPTERS/CHAPTER_4_MAIN_STREET.md)).
- The top comment of `dist/chapter5.js` still describes the first draft (the three-hour campfire, the gate that opens
  by itself). The code below it is the repaired version.
- `docs/RELEASE_NOTES.md`'s first lines and the root `RELEASE_NOTES.md` stop at Chapter Four / Chapter Five's first draft.

Full list: [Continuity discrepancies](../01_STORY_BIBLE/CONTINUITY_DISCREPANCIES.md).
