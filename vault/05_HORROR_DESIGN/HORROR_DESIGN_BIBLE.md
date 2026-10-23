# Horror design bible

## The mandate (human developer, 2026-10-23)

> *Last Light* is a **genuine horror game**, not merely a suspenseful or sad mystery. It must incorporate meaningful
> jumpscares, terrifying supernatural encounters, physical danger, psychological horror, atmospheric dread, effective
> chase sequences, and emotional storytelling. Avoid excessive repetitive running without visible danger. Avoid
> encounters that exist only as scripted text rather than perceivable threats.

This page turns that mandate, and the lessons of every playtest so far, into working rules. The rest of
`05_HORROR_DESIGN/` goes into detail.

## Lessons from the human playtests (what failed, and why)

| Playtest | What the human said | What it taught |
|---|---|---|
| Chapter Three rebuild (muted) | "Better but not great"; the run was "basically jogging out of the tunnel"; almost nothing happened in the escape; **the figure was never seen**; nothing was scary; the big tunnel was not ominous | Make spaces close in; make the reveal impossible to miss (wait until seen); fill an escape with perceivable events every few seconds |
| Chapter Four structural | The creature **slid**; the greater evil **had no weight**; the escape **played itself**; Jamie and Sam disappeared; the marquee message was generic | Creatures need weight and contact; show the unseen evil through what it does to things the player cares about (and through the creature's fear); escapes must respond to the player; personal words beat generic threats |
| Chapter Five first draft (36 complaints) | "Yellow orbs"; "three people are walking into the camp" at 90 m; **horror lacks causes**; **RUN without danger**; the escape isn't frightening; disconnected triggers | No text-only threats; every scare has a visible cause; RUN only when something visibly comes |
| Chapter Five repair | The escape after Jamie's double is **"excessively long, boring, and frighteningly ineffective"** | After the peak, don't pad with empty walking; keep the threat present and visible during the run, or end the run |

## Core rules

1. **Perceivable threats only.** If the danger is not on screen or clearly audible-and-shown (through Jamie and Sam's
   reactions), it does not exist for the player. Captions describe; they never substitute.
2. **Every scare has a cause the player can trace.** The lights copy *what you did*; the figure says *what you said*; the
   creature is afraid *of the lights going out*. Random events are forbidden; meaningful jumpscares are wanted
   ([Jumpscare design](JUMPSCARE_DESIGN.md)).
3. **Seen before it moves.** Key reveals wait until the player has actually looked (half a second with a clear line of
   sight), with a ladder of cues from Jamie and Sam and a generous fallback. Never seize the camera to force a look.
4. **Escalate within each chapter.** A ladder of small wrong things → something seen → something that comes. See
   [Horror pacing](HORROR_PACING.md).
5. **Escalate across chapters.** The Presence's reach grows chapter to chapter ([The Presence behavior](THE_PRESENCE_BEHAVIOR.md)).
6. **Chases need a visible pursuer and constant events.** 45–90 seconds is the established window (Chapter Three's
   chase). No long running with nothing behind you. See [Chase design](CHASE_DESIGN.md).
7. **Physical danger must be credible.** So far nothing has ever touched the boys. The mandate now asks for physical
   danger; whether the player can be caught or fail is **undecided** (D1 in [Unanswered questions](../01_STORY_BIBLE/UNANSWERED_QUESTIONS.md)).
   Until decided: make danger close, fast and physical (slams, bursts, near passes), without silent rule changes.
8. **Use the familiar.** Faces, voices, places and habits the player already loves are the best material
   ([Psychological horror](PSYCHOLOGICAL_HORROR.md)).
9. **Darkness must support it.** The light grade must be darker before a scare than after; never brighten the sky at RUN
   (a Chapter Five finding). See [Horror visual standards](../07_VISUAL_AND_AUDIO/HORROR_VISUAL_STANDARDS.md).
10. **Readable muted.** Every sound that matters also shows on the companions (heads, lights, bodies) and in captions.
    Sound will make it scarier; silence must not make it unreadable ([Sound and silence](SOUND_AND_SILENCE.md)).
11. **Warmth first.** Fear lands on people the player likes. Keep the jokes and the small kindnesses before the dark.
12. **Keep the mystery.** Never name or explain the Presence or the creature without the human developer's decision.
13. **Nothing waits forever, and the payoff is never skipped.** Every beat has a fallback; a fallback may carry the
    player to a scare, never past it (Chapter Five: "The double is never skipped on a timer").

## The toolkit already built

See the [Horror mechanics registry](HORROR_MECHANICS_REGISTRY.md) for every implemented mechanic, its code and status.
Highlights: reveal gates (Ch3), the tension/heartbeat system (Ch3), the creature chase controller (Ch3), the light
cascade and pursuing dark (Ch4), live impossible footage (Ch4), copying lights, voice lures and the split (Ch5), the
double (Ch5).

## Checklist for any new horror beat

- [ ] What does the player **see**? What do they **hear**? What do Jamie and Sam **do**?
- [ ] What **causes** it, and can the player trace the cause?
- [ ] Does it wait to be **seen**? What are its cues and its fallback?
- [ ] Is it **more** than the beat before it?
- [ ] Is the danger **physical and close** enough to matter?
- [ ] If there is running: is the pursuer **visible**, and does something happen every few seconds? How long is it?
- [ ] Does it read **muted**?
- [ ] Does it respect canon (unnamed, unexplained, never on screen with the false Alex if it is the creature)?
- [ ] Is it recorded in the [registry](HORROR_MECHANICS_REGISTRY.md)?
