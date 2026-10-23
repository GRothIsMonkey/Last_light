# Performance budget

> All numbers come from **software rendering (Chromium + SwiftShader)** or the Node simulation. Draw and triangle counts are
> real; frame times are not GPU measurements. **Real-GPU FPS has never been measured.**

## Geometry policy (updated brief, recorded in the Chapter One release)

| | Normal target | Needs profiling |
|---|---|---|
| Static world triangles | ~4 million | 6 million |
| Static merged meshes | ~1,500 | 2,000 |
| Ordinary frame | 600–700k triangles, ~300 draw calls | — |
| Complex scene | up to ~1M triangles, ~450 calls | — |

(The original prologue caps of 1.7M triangles / 900 meshes were superseded.)

## Measured over time

| Build | Static world | Notes |
|---|---|---|
| Prologue final | 1.62M tris / 893 meshes | |
| Chapter One | 1.72M / 935 | Night captures 57–549 calls (Sam's side-door view an outlier) |
| Chapter Two | 1.76M / 949 | Heaviest frame 927k tris / 579 calls |
| Chapter Three rebuild/creature chase | 2.51M / 1,131 | Drain views 24–70k tris; creature 23,820 tris, one draw |
| Chapter Three Astra | 2.72M / 1,361 browser merged meshes | Quality/culling trade-off |
| Chapter Four | Downtown 136–1,047 calls, 83–417k tris | Library 198k tris after polish; three canvas atlases 32 MiB |
| Chapter Five | **2,259 merged meshes** (over the 2,000 world-geometry check; the QUICK suite skips it) | Ridge crest and old lot views just under 1M tris |

## Memory (Chromium, SwiftShader, Chapter Five repair)

| | Value |
|---|---|
| JS heap at the title | ~1,085 MB (927 MB before Chapter Five; Pine Ridge adds ~151 MB of vertex data, mostly 6,235 trees) |
| JS heap through Chapter Five | 1,089–1,099 MB, flat (no leaks across revisits) |
| Renderer steady | 1.67–1.82 GB in Chapter Five |
| Renderer peak on a jump | 4–6 GB under software GL (5.9 GB at Chapter Four's end) |
| Container limits hit | The Chapter Four Astra continuous run was killed at 8 GiB; the Chapter Five repair's container killed the renderer at 4.5–9.1 GB, so its walkthrough ran in segments |

Available savings not yet taken: instancing Pine Ridge's trees; releasing other chapters' pre-bake groups (touches accepted
Chapters 0–4).

## Rules

1. **Constant light count** within a chapter; attach lights behind a black card.
2. **Keep new detail inside the batching** (vertex colors, shared materials; avoid unique materials per object).
3. **Render-to-texture sparingly** (TVs at 12 Hz only when on, near and in view; photos rendered a few at a time).
4. **Release pre-bake objects** for new regions once merged (`release:true`, as Pine Ridge does).
5. **Report draw-call outliers** rather than hiding them.
6. **The human playtest should watch memory** over a long session (Chrome's task manager) on a real GPU.
