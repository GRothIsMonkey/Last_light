# Earlier playtest feedback (Prologue – Chapter Four)

What the human developer reported on earlier builds, as recorded in the handoffs, and what changed. Useful as a record of
the developer's taste: each round pushed toward **more readable navigation, more reliable companions, more physical and
visible horror**.

## v0.1 / prologue (2026-09-29)

- Perceptual audio review requested but outstanding; on 2026-09-29 the repository owner asked for v0.1 to be published to
  `main` without waiting for it. (`docs/RELEASE_NOTES.md`, v0.1)

## Chapter One (human playtest of the Chapter One pass)

| Feedback | Response (Astra Chapter One final polish) |
|---|---|
| Navigation at night to Jamie's and Sam's houses needed clearer guidance | Sequential objectives (**Find Jamie.** then **Find Sam.**), "I should get Jamie first.", permanent landmarks, short memory-style reminders, prompts within 2.5 m; no arrows/minimap |
| Four bugs (found in the Chapter One release playtest, fixed in Chapter Two): fan audio, the flag, a hoop, **friends stuck at the old oak** | See [Accepted fixes](ACCEPTED_FIXES.md) |

## Chapter Two

The supplemental morning-route test was **scripted**, "not an independent test with an uninformed human participant" —
the docs are explicit that it is not a human playtest.

## Chapter Three (muted human playtest of the rebuild)

Recorded in `docs/ASTRA_CHAPTER3_HORROR_ESCALATION_HANDOFF.md` §0:

> "better but not great"; the run was "basically jogging out of the tunnel"; almost nothing happened during the escape; the
> old bike was somewhat creepy; **the figure was never seen**; the player never wanted to leave; nothing was scary; the big
> tunnel was not ominous.

Response: the escalation (closing drain, helmet, can't-miss reveal, real escape), then the creature chase (a real
creature, a real chase, the boy as lure).

## Chapter Four (human playtest of the structural pass)

Recorded in `docs/CHAPTER4_HORROR_REVISION_HANDOFF.md` §1:

1. The creature slid.
2. The greater evil had no weight.
3. The escape played itself (one scripted route; other routes soft-locked).
4. Jamie and Sam disappeared.
5. The marquee spoke in generic threats.

Response: the horror revision (`f0120ba`). Later, Astra's repair addressed "the original random color flashing" and
continuity problems; its doc says "This candidate requires the user's human playtest and approval".

## Chapter Five

See [Chapter Five feedback](CHAPTER5_INITIAL_FEEDBACK.md): 36 complaints on the first draft; then the escape complaint on
the repair.

## Patterns in the developer's feedback

- Wants to **see** the threat (figure never seen; RUN without danger; orbs; people named at 90 m).
- Wants escapes that **respond** and **frighten**, not jog or play themselves, and are not long and empty.
- Wants companions that behave **like people** and never vanish.
- Wants physical **honesty** (pickups, packing, sitting, gates that block).
- Judges visual quality strictly (Chapter Five: everything but the sky below intent).
