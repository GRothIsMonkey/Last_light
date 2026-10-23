# 🔦 LAST LIGHT — Development Vault

> **A first-person horror game about the summer of 2011.** On August 21, 2011, four kids ride their bikes through a
> suburban neighborhood at sunset. One of them, Alex, turns onto Briarwood Lane and never comes home. Over the
> following days the other three (Jamie, Sam and you) follow a bicycle bell, an old green bike that should not exist,
> and a thing that copies them, from the creek behind Alex's house to a closed summer camp on a reservoir.

*Vault last updated: 2026-10-23 · Built from `claude/chapter5-gameplay-story-repair` @ `d4de9ab` · Lives on branch
`docs/last-light-vault`*

---

## 📍 Where the project is right now

| | |
|---|---|
| **Development phase** | Chapter Five: visual reconstruction and escape redesign (Astra), on top of the finished gameplay repair |
| **Newest accepted chapter** | Chapter Four, *Main Street* (✅ CONFIRMED CANON) |
| **Chapter in progress** | Chapter Five, *The Place in the Picture* (🟡 IMPLEMENTED BUT UNAPPROVED) |
| **Gameplay/story baseline** | `claude/chapter5-gameplay-story-repair` @ `d4de9ab` |
| **Active development branch** | `codex/astra-chapter5-ultra-visual-reconstruction` (Astra's; **do not touch**) |
| **This vault's branch** | `docs/last-light-vault` (documentation only) |
| **`main`** | Still the v0.1 prologue release (`21bb7a7`). Nothing later has been merged. |

Full detail: [Current project status](CURRENT_PROJECT_STATUS.md) · [Project dashboard](PROJECT_DASHBOARD.md)

## ⭐ Most important links

1. [How to use this vault](HOW_TO_USE_THIS_VAULT.md) (browser-only instructions, 2 minutes)
2. [Status labels](STATUS_LABELS.md) (what CONFIRMED CANON, PROPOSED etc. mean)
3. [Story overview](../01_STORY_BIBLE/STORY_OVERVIEW.md) and [Master timeline](../01_STORY_BIBLE/MASTER_TIMELINE.md)
4. [Mystery and clue tracker](../01_STORY_BIBLE/MYSTERY_AND_CLUE_TRACKER.md)
5. [Chapter Five](../03_CHAPTERS/CHAPTER_5_THE_PLACE_IN_THE_PICTURE.md) and its [open issues](../08_PLAYTESTING_AND_ISSUES/OPEN_ISSUES.md)
6. [Horror design bible](../05_HORROR_DESIGN/HORROR_DESIGN_BIBLE.md)
7. [Development rules](DEVELOPMENT_RULES.md) and, for AI agents, [Start here for AI](../10_AI_DEVELOPMENT_GUIDES/START_HERE_FOR_AI.md)

## 📖 Chapter status

| # | Chapter | In-world date | Status | Authoritative branch @ commit | Note |
|---|---|---|---|---|---|
| 0 | [Prologue](../03_CHAPTERS/CHAPTER_0_PROLOGUE.md) | Sun Aug 21, 2011, sunset → dusk | ✅ CONFIRMED CANON | `codex/astra-last-light-final-polish` @ `9520b4f` | The last ride together |
| 1 | [Chapter One](../03_CHAPTERS/CHAPTER_1.md) | Sun Aug 21, 2011, night | ✅ CONFIRMED CANON | `codex/astra-chapter1-final-polish` @ `9c4b576` | Police on Briarwood; the reflector; a bell |
| 2 | [Chapter Two](../03_CHAPTERS/CHAPTER_2.md) | Aug 21 night → Mon Aug 22 morning | ✅ CONFIRMED CANON | `codex/astra-chapter2-final-polish` @ `68cc543` | Alex's bike at the culvert; the memory |
| 3 | [Chapter Three](../03_CHAPTERS/CHAPTER_3.md) | Mon Aug 22, day → ~midnight | ✅ CONFIRMED CANON | `codex/astra-chapter3-final-polish` @ `5be6814` | The recording; the storm drain; the creature |
| 4 | [Chapter Four: Main Street](../03_CHAPTERS/CHAPTER_4_MAIN_STREET.md) | Tue Aug 23, 2011 | ✅ CONFIRMED CANON | story `f0120ba`; art/repairs to `c964777` | Alex's camera; the microfilm; the lights go out |
| 5 | [Chapter Five: The Place in the Picture](../03_CHAPTERS/CHAPTER_5_THE_PLACE_IN_THE_PICTURE.md) | Wed Aug 24, 2011 | 🟡 IMPLEMENTED BUT UNAPPROVED | `claude/chapter5-gameplay-story-repair` @ `d4de9ab` | Pine Ridge; Camp Whippoorwill; the double |
| 6–8, epilogue | [Future chapters](../03_CHAPTERS/FUTURE_CHAPTERS/FUTURE_CHAPTERS_INDEX.md) | — | 💡 PROPOSED (no story locked) | — | Not started. Do not start without the human developer. |

## 🛠️ Active tasks

- [ ] **Astra:** Chapter Five visual reconstruction and the redesigned escape from Owl (in progress on
      `codex/astra-chapter5-ultra-visual-reconstruction`, last seen at `4bf3902`). See
      [Chapter Five Astra objectives](../08_PLAYTESTING_AND_ISSUES/CHAPTER5_ASTRA_OBJECTIVES.md).
- [ ] **Human developer:** playtest Chapter Five after Astra's pass; approve or reject it.
- [ ] **Decide:** the continuity error in Chapter Five's garage ("It said 'come find him'"); see
      [Open issues](../08_PLAYTESTING_AND_ISSUES/OPEN_ISSUES.md), item OI-01.
- [ ] **Decide:** when (and whether) to integrate this vault into a release branch.
- [ ] **Later:** Chapter Six direction (only after Chapter Five is approved). See
      [Design direction](../03_CHAPTERS/FUTURE_CHAPTERS/DESIGN_DIRECTION.md).

## ⛔ Known blockers

| Blocker | Why it matters |
|---|---|
| Chapter Five has no human approval | Nothing after it can be locked; the escape is being redesigned. |
| Human complaint: the escape after Jamie's double is "excessively long, boring, and frighteningly ineffective" | The emotional peak of Chapter Five does not work yet. Astra's redesign targets it. |
| Real-GPU frame rate has never been measured | Every test runs in software rendering (SwiftShader). |
| Audio is placeholder synthesis; nobody has done a listening pass; no voice acting | Horror depends heavily on sound. See [Audio direction](../07_VISUAL_AND_AUDIO/AUDIO_DIRECTION.md). |
| `main` is still v0.1 | There is no integrated release of Chapters 1–5 yet. |

## 🧭 Recent decisions

| Date | Decision | Source |
|---|---|---|
| 2026-10-23 | Last Light is a **genuine horror game**: meaningful jumpscares, physical danger, terrifying encounters, effective chases; no long running without visible danger; no threats that exist only as text. | Human developer (vault brief) |
| 2026-10-23 | Build this vault on `docs/last-light-vault` from `d4de9ab`; leave Astra's branch alone. | Human developer (vault brief) |
| 2026-10-20 | Chapter Five gameplay/story repair finished (`d4de9ab`); handed to Astra for the visual pass. | `docs/CHAPTER5_GAMEPLAY_STORY_REPAIR.md` |
| 2026-10-20 | ⛔ REJECTED: the three-hour campfire time-skip, "yellow orb" lights, and RUN without a visible threat. | Same |
| 2026-10-11 | Chapter Four horror revision: the creature is afraid of something; five escape routes; the marquee figure repeats the boys' own words. | `docs/CHAPTER4_HORROR_REVISION_HANDOFF.md` |
| 2026-10-06 | ⛔ REJECTED: Chapter Three's detention-basin night; replaced by the storm drain, then by the creature chase. | `docs/ASTRA_CHAPTER3_REBUILD_HANDOFF.md` |

All decisions: [Decision log](DECISION_LOG.md).

## 🗂️ Sections

| Folder | What is in it |
|---|---|
| [00 Start here](PROJECT_DASHBOARD.md) | Dashboard, status, rules, labels, decision log, maintenance |
| [01 Story bible](../01_STORY_BIBLE/STORY_OVERVIEW.md) | Overview, timeline, canon, clues, lore, unanswered questions, themes |
| [02 Characters](../02_CHARACTERS/CHARACTER_INDEX.md) | The four friends, the adults, the Presence, the creature, the mimic figures |
| [03 Chapters](../03_CHAPTERS/CHAPTER_INDEX.md) | One detailed note per chapter, plus future proposals |
| [04 World and locations](../04_WORLD_AND_LOCATIONS/LOCATION_INDEX.md) | Oak Hollow, the creek and drains, downtown, Pine Ridge, the camp |
| [05 Horror design](../05_HORROR_DESIGN/HORROR_DESIGN_BIBLE.md) | Rules for fear: the Presence, the creature, jumpscares, chases, sound, pacing |
| [06 Gameplay systems](../06_GAMEPLAY_SYSTEMS/SYSTEMS_INDEX.md) | Controls, cycling, companions, props, camera, flashlights, saves, DEV selector |
| [07 Visual and audio](../07_VISUAL_AND_AUDIO/ART_DIRECTION.md) | Art direction, characters, lighting, water, animation, audio, performance |
| [08 Playtesting and issues](../08_PLAYTESTING_AND_ISSUES/PLAYTEST_INDEX.md) | Human feedback, open issues, accepted fixes, QA standards |
| [09 Development history](../09_DEVELOPMENT_HISTORY/RELEASE_HISTORY.md) | Releases, branches, architecture, milestones, workstreams |
| [10 AI development guides](../10_AI_DEVELOPMENT_GUIDES/START_HERE_FOR_AI.md) | How Claude and Astra should work; source of truth; continuity checklist |
| [11 Templates](../11_TEMPLATES/TEMPLATES_INDEX.md) | Copy-and-fill templates for chapters, playtests, clues, decisions |

**Every note on one page: [Vault map](VAULT_MAP.md).** Also useful: [Themes and emotional direction](../01_STORY_BIBLE/THEMES_AND_EMOTIONAL_DIRECTION.md) ·
[Development milestones](../09_DEVELOPMENT_HISTORY/DEVELOPMENT_MILESTONES.md) · [Future development](../09_DEVELOPMENT_HISTORY/FUTURE_DEVELOPMENT.md).

The existing repository documents (handoffs, test reports, release notes) stay where they are in [`docs/`](../../docs/).
This vault summarizes and links to them; it does not replace them.
