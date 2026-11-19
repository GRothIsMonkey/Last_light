# Stage A — what the four supplied Sketchfab models actually contain

Offline inspection in Blender 5.0.1 (headless `bpy`) and direct glTF parsing. Renders here are **offline Cycles renders
of the files as supplied (rank 6 evidence), not the game.** Measurements: `inspect.json`.
Rebuild: `python tools/blender/vegetation/inspect_sources.py`, `python tools/blender/vegetation/inspect_scan.py`.

| Source (CC BY 4.0) | What is in the file | Verdict |
|---|---|---|
| **200 year old oak tree** — kungphil | **A coloured laser scan, not a model**: 4,635,119 points (`oak_RGB_2cm.ply`, glTF POINTS, POSITION + COLOR_0, unlit), 71 chunks, no faces, normals, UVs or textures. A real open-grown oak, **19.8 m tall, crown 25.8 × 28.2 m**, trunk 1.26 m across at chest height (measured), forking at 3.3–4.3 m, one low limb sweeping nearly to the ground; scanned in leaf. | Unusable as geometry; **the best possible reference**: its dimensions match the art bible's §6 targets. Used as the measured source of the hero oak's architecture and crown (reconstruction, Stage B). A4_*.jpg |
| **Realistic Trees Collection** — Jungle Jim | 7 EZ-Tree trees (127,462 tris), modelled at ≈10× real size: 4 oaks (oak-leaf twig cards), 2 ash-type (pinnate twig cards), 1 small pine. 14 materials but only **5 unique textures**: one photographic mossy oak bark (+ normal, 1024², not quite seamless), one oak twig photo, one pinnate (ash) twig photo, one pine sprig (1024² RGBA, alpha-BLEND). No maple, no birch. | Branch architectures re-used for the oak and ash street-tree families (Stage C); the oak and ash twig photos become the oak/ash leaf atlases; the bark photo becomes the micro-detail layer of the bark library. A1b_*.jpg |
| **Bush models pack (gameready, LODs)** — LOLIPOP | 15 shrubs (5 big 1.2–1.6 m, 5 medium 0.9–1.1 m, 5 small 0.5–0.6 m), each LOD0/LOD1/LOD2 + a 16-tri billboard (23,301 tris total). One branch atlas (privet-like small leaves, 1024², alpha-BLEND), one bark strip (128×1024), per-bush billboard textures; plus a checker floor and a human scale figure (excluded). | Geometry and LOD chain kept as the residential shrub foundation (Stage C); materials re-done to the shared standard (alpha-tested, graded). A2_*.jpg |
| **Grass And Bush – Mobile GameReady** — Ali haghshenas | 4 cards (20 tris) on one 1024² atlas that is mostly **not grass**: hay bale, saguaro cactus, crate, barrel, chain, planks. Usable: a seeded green grass tuft (stored upside down), a dry grass tuft, a small sprig and a dried seed stalk. | Only the four plant sprites are used (meadow tufts, dry patches, weeds at the lookout); lawn blades are original. A3_*.jpg |

Reuse strategy (detail in `docs/VEGETATION_BENCHMARK_REPORT.md`): nothing is scattered raw. Every asset is rebuilt on
one skeleton → bark tubes + leaf cards kit (`tools/blender/vegetation/veg_mesh.py`) with one texture library
(`veg_textures.py`, one late-August grade), one wind/occlusion vertex standard and one runtime material.
