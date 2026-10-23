# Horror visual standards

How horror must *look*. Story and design rules are in the [Horror design bible](../05_HORROR_DESIGN/HORROR_DESIGN_BIBLE.md).

## Darkness

1. **Darker before the scare than after.** The light grade should deepen smoothly toward each peak. Never brighten the sky
   at RUN (a Chapter Five finding: the escape was under a lavender sky brighter than the porch scene).
2. **Dark enough to hide what must stay hidden** (the holders of the carried lights; the Presence has no body).
3. **Readable darkness:** the player must still read the path, the companions and the threat. Tools: flashlight spill,
   borrowed bounce, catch-light on far figures, practical lights (porch bulbs, lamps), fill on faces.
4. **"Every light out" must read**: preceded by enough light to lose.

## Figures in the dark

- The false Alex and the creature **catch a little more of their own colour** where a beam lands on them far off
  (`catchLight`), never a glow. Up close: nothing extra.
- Silhouettes at 15–20 m must read (Chapter Four restaged the creature from 26–48 m to 15–20 m for this).
- The double must read as **Jamie's face, smiling**, at porch distance.

## Light as threat

Lights going out in order toward you (Ch4); lights coming on all at once (Ch5); screens showing you; beams turning onto
you; flicker and a relay clunk; tubes failing from the one over you outward. Keep each distinct; don't repeat the same
pattern.

## What never appears

No gore, blood, bodies, bones, symbols, writing on walls (except JSA, which is the boys' own), dolls or eyes. No glitch
effects or screen distortion for the supernatural ("There are no glitch effects." — Chapter Two's memory). No forced camera.

## Captions over horror

Adaptive captions must stay readable over flashlit, mixed backgrounds (Chapter Three's Astra polish brought in the soft
backing earlier over such backgrounds). See [Captions and UI](../06_GAMEPLAY_SYSTEMS/CAPTIONS_AND_UI.md).

## Review method

Frame-by-frame review captures (`tests/review-capture.mjs`, `tests/review/*.mjs`, outputs in `docs/qa/chapter5-repair/`)
are for **a person to judge**, not pass/fail. SwiftShader frames do not show real-GPU behavior; dark-screen legibility needs
human review on a real GPU.
