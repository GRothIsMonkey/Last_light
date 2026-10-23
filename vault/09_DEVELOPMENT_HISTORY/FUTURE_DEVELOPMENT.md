# Future development

> 💡 PROPOSED work list, assembled from the "not done / limits" and "for Astra" sections of every handoff. Order is a
> suggestion; the human developer decides.

## Before anything else

1. Finish and playtest **Chapter Five** (Astra's pass); fix the escape; approve or revise.
2. Decide **OI-01** (the "come find him" line).

## Before any public release

| Item | Why | Source |
|---|---|---|
| Remove the **DEV selector** | Temporary playtest tool | `docs/DEV_CHAPTER_SELECTOR.md` |
| Name the creature's author in **Credits** | CC BY 4.0 attribution | Chapter Four handoff §7 |
| A **real-GPU performance pass** | Never measured; heavy views near 1M triangles; renderer memory spikes | Every handoff |
| A **human audio listening pass** and real sound design | Placeholder synthesis everywhere | Every handoff |
| Decide **voice acting** (and audio lip sync via `speakAudio`) | Mouths are text-timed | Chapter Five repair |
| **Touch** controls for sprint/jump/crouch/flashlight; real-device tests | Keyboard-only today | README |
| Cross-browser tests | Chromium only | Chapter One release |
| Update `main` | Still v0.1 | Git |
| Update the root `README.md` and release notes | Stale Chapter Three/Four text | [Continuity discrepancies](../01_STORY_BIBLE/CONTINUITY_DISCREPANCIES.md) |

## Technical debt and options

- Instance Pine Ridge's 6,235 trees; release other chapters' pre-bake groups (touches accepted chapters; careful).
- The world mesh count over the 2,000 check (2,259).
- Chapter Two's `homeAt` second-playthrough pacing quirk.
- The creature: hand-authored locomotion, pathfinding off authored lines.

## Story

Chapters Six, Seven, Eight and a possible epilogue: direction only so far. See
[Future chapters](../03_CHAPTERS/FUTURE_CHAPTERS/FUTURE_CHAPTERS_INDEX.md) and
[Design direction](../03_CHAPTERS/FUTURE_CHAPTERS/DESIGN_DIRECTION.md).

## Process

- Keep the per-chapter rhythm (structure → human playtest → revision → Astra art → freeze).
- Keep this vault updated at each step ([Vault maintenance](../00_START_HERE/VAULT_MAINTENANCE.md)).
