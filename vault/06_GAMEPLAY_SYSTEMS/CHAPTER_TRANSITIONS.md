# Chapter transitions

## How each chapter hands over

| From → To | What the player sees | Mechanism |
|---|---|---|
| Prologue → One | At the lookout, **Go home** (or the idle fade after ~100 s): "We left our bikes wherever we stopped." "I thought I remembered everyone." A brief fade; the ride home resumes farther along at 8:44 PM. | `leave()` in the prologue; `chapter1.js` phases start at `leave` |
| One → Two | After the bell, black, a quiet **CHAPTER TWO** card; "You guys heard that too, right?" "Yeah." over black; the same creek moments later. No end menu. | Chapter One's ending calls `chapter2.begin()`; Chapter Two owns phases `c2-*` and `m-*` |
| Two → Three | After "He heard it before he left.", black, a quiet **CHAPTER THREE** card, the same Briarwood corner a few minutes later (9:16 AM). | Chapter Two's `end()` calls `chapter3.begin()`; phases `c3-*`, `d3-*`, `n3-*` |
| Three → Four | End card *LAST LIGHT / Chapter Three / August 22, 2011* with a **Chapter Four →** button; black; **CHAPTER FOUR · MAIN STREET** card; Tuesday 1:52 PM at Sam's. | `nextChapter()`; Chapter Three hands phases `c4-`/`d4-`/`e4-`/`n4-` to `chapter4.js` |
| Four → Five | End card *LAST LIGHT / Chapter Four / August 23, 2011* with **Chapter Five →**; black; **THE PLACE IN THE PICTURE / Chapter Five** card; Sam's garage. | Chapter Four hands phases `c5-`/`d5-`/`e5-`/`n5-` and all hooks to `chapter5.js` |
| Five → | End card *LAST LIGHT / Chapter Five / August 24, 2011*; **no next button** (`#next-chapter` hidden). | `end()` in `chapter5.js` |

## Phase ownership (the director chain)

`chapter1.js` runs the shared kit (dialogue queue, objectives, cast, cars, companions, flashlights, checkpoints) and asks
`api.next.owns(phase)` whether a later chapter owns a phase. Each later director takes over phases by prefix and receives
the hooks (`update`, `spots`, `act`, `key`, `pan`, `wheel`, `hint`, `sources`, `blockers`, `light` …).

| Director | Phase prefixes | Example phases |
|---|---|---|
| `chapter1.js` | `leave`, `home`, `cruiser`, `title`, `briarwood`, `friends`, `oak`, `retrace`, `creek`, `clue`, `end` | — |
| `chapter2.js` | `c2-`, `m-` | `c2-black`, `c2-bell`, `m-memory`, `m-end` |
| `chapter3.js` | `c3-`, `d3-`, `n3-` | `d3-phone`, `n3-run`, `n3-end` |
| `chapter4.js` | `c4-`, `d4-`, `e4-`, `n4-` | `n4-marquee` |
| `chapter5.js` | `c5-`, `d5-`, `e5-`, `n5-` | `d5-garage` … `n5-end` (22 phases) |

## Switching shared features on and off

Each chapter's begin/reset switches chapter-specific shared-code features. Chapter Five's `common()` turns on the
first-person body (`foot.fpBody`), expressive faces (`face.enable`), walk-in garages and Pine Ridge navigation
(`nav.setPine`), and the lowered garage footings (`slabs()`); its `reset()` turns them off, so Chapters 0–4 look and play as
accepted. Chapter Four opens Summerfield and the town (`nav.setTown`). Lights for a chapter are attached behind its black
card, so the one shader recompile happens out of sight.

## Rules for a new chapter's transition

1. Add the next-chapter button to the previous end card (`#next-chapter`) or a black-card hand-over, matching the style.
2. Take over phases by a new prefix; never edit the previous director's phases.
3. Make every new shared-code behavior switchable and off outside the chapter.
4. Add the chapter's **Start** to the DEV selector as the real hand-over, and verify natural vs DEV start equivalence.
