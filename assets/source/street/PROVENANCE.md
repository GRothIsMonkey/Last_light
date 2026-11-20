# Prologue vehicles & street props — source provenance

Benchmark `?streetprops` (branch `claude/prologue-vehicles-street-props-benchmark`). What every runtime file in
`dist/assets/street/` is made from, where it came from, under which licence, what was checked, and what was refused.
Credits: `docs/THIRD_PARTY_ASSETS.md`. Hashes of every file here: `SHA256SUMS`.

## Verification (2026-11-20)

The owner supplied ten Sketchfab downloads (GLB, as Sketchfab exports them). For each one:

1. the GLB's own embedded `asset.extras` (title, author, licence, source URL) was read;
2. the model's public record was fetched from the Sketchfab Data API (`https://api.sketchfab.com/v3/models/<uid>`, the
   uid taken from the embedded source URL) — licence, author account, publication date, description, tags. The ten
   responses (trimmed to those fields) are kept in `third-party/sketchfab-api/*.json`;
3. the mesh, UVs, textures and materials were inspected (loose-part analysis, texture contact sheets, Cycles
   renders) for quality, scale, period plausibility and any third-party marks.

All ten pages report **CC Attribution 4.0** ("Author must be credited. Commercial use is allowed."). A licence label on
an upload does not establish that the uploader owns the work; the decisions below weigh authorship as well.

## Used (originals byte for byte in `third-party/sketchfab-originals/`)

| File | Model (Sketchfab) | Author | Short link / source | SHA-256 | Bytes |
|---|---|---|---|---|---|
| `generic_passenger_car_pack.glb` | Generic passenger car pack | Comrade1280 (sketchfab.com/comrade1280) | skfb.ly/6sUFy · /3d-models/generic-passenger-car-pack-20f9af9b8a404d5cb022ac6fe87f21f5 | `1d3869f1afa742a1c401850b2e691cc93ce7255ffd1ff25ebcf1250fcba1add0` | 26,701,140 |
| `utility_pole_pbr.glb` | Utility Pole (PBR) | SLASH / RENDAR (sketchfab.com/SLASH-RENDAR) | skfb.ly/o6ZqN · /3d-models/utility-pole-pbr-92f4d3b0ef38472d8c1c62a28fe15135 | `0142bd5729273414d01a439b3cbc3d7988cb87938dcfc43b35b39c6ae4695f61` | 13,768,916 |
| `fire_hydrant.glb` | Fire hydrant | Spellkaze (sketchfab.com/Spellkaze) | skfb.ly/6WCEO · /3d-models/fire-hydrant-1d74e6c3d0a1417fa0b45ee8baf032ae | `01f599acd0d8f9971604f4747ec3a75f99941be7b21aeb94830f0c3de0b87ae7` | 2,734,776 |
| `trash_cans.glb` | Trash_cans | peyman.khaleghi (sketchfab.com/peyman.khaleghi) | skfb.ly/o8oNK · /3d-models/trash-cans-3fecc117da264b8587417e31c7cf4e93 | `63f00e65141e76fadf34b5321fd2c43c637b16e8cdb50eb7d6d01bb0c9847a97` | 24,761,348 |
| `wooden_fence.glb` | Wooden Fence | DmitriyGDS (sketchfab.com/DmitriyGDS) | skfb.ly/6rNUp · /3d-models/wooden-fence-43f8b3127fba4800bfc3f36078393e87 | `b352051c8ca7332c6b427647a0b60fc03d16da98c5cd5e47740983ad8ee575fb` | 10,313,692 |

Why each is credible: the car pack (2017, Sketchfab staff pick) is the author's own low-poly set and states that its
cars "bear minimum to none similarities to real life cars" and are "trademark claim proof"; the pole (2021) is the
author's own game-ready model (4K PBR set); the hydrant (2018) "made for a game, modeled in Blender, textured in
Substance"; the trash pack (2021) modelled in Maya 2020 and textured in Substance Painter by the author ("You may not
resell any content" — the game does not resell the models); the fence (2017) a simple original model. No brand marks
were found in any of their textures except a generic recycling arrow moulded into the cart, which the build removes.

## Not used (not stored here; recorded so the decision can be reviewed)

| Supplied file | Model / uploader | SHA-256 of the supplied file | Decision |
|---|---|---|---|
| `basketball_hoop_scary_baboon.glb` | "Basketball Hoop Scary Baboon", uploader account **ScaryBaboonRipper** (`sbarchiver`; the GLB's own extras say "ScaryBaboonArchiver"), published 2025-05-17, no description, no tags | `db9ea15dee113b4b7a844eb09df05a5615589dee9dbd01fc0db2ec4f086c67ed` | **Excluded.** The account name says the model was ripped/archived from a game ("Scary Baboon"); the uploader is not the author and no evidence of the right to relicense it exists. Replaced by original hoops. |
| `azlk_moskvich_2141.glb` | "AZLK Moskvich 2141", Mona x Supercars (`Car2022`), 2025 | `4234f2f2be30c975a50f49903912aa2498cb814cd88f9ed042df090f175b1ddc` | **Excluded.** A Soviet sedan never sold in the US: implausible on a 2011 American street. Also: a replica of a real, trademarked car; the descriptions' "Class / Weight / Size" fields and the material names (`Body1Mtl`, `RlWheel1Mtl`) read like a game's car database; authorship could not be established. |
| `peugeot_406.glb` | "Peugeot 406", Mona x Supercars (`Car2022`), 2025 | `4628af224d9d83501701fcf337b8015962b3ca615041df996e3fa89080469eff` | **Excluded.** Peugeot left the US market in 1991; a 1998 406 does not belong in Oak Hollow in 2011. The same authorship doubts as the Moskvich; trademarked design and badge; 67,656 triangles. |
| `home_us_mailbox.glb` | "Home US Mailbox 📫", Glowbox 3D (`glowbox3d`), 2021 | `32c61340387e0d7b94753482dd33490e96c6dc9a6c089deccc99fff7ece1feda` | **Not used, out of respect for the author's stated wish.** Its page says: "NoAI: This model may not be used in datasets for, in the development of, or as inputs to generative AI programs." This reconstruction is carried out by an AI agent, so the model was not imported, edited or rendered (only its file metadata and public record were read). Replaced by original mailboxes. A human artist may wish to review this decision (see the report). |
| `street_light.glb` | "Street Light", KMB3D (`kmb_jr`), 2018 | `3e97c479352bb5c83fca8ae3fd365ff1da156405e7a27b4f1e854318b2b48341` | **Not used.** A slender white modern davit pole with a small flat luminaire (2,658 triangles, no textures): not a 2011 high-pressure-sodium cobra head on the game's existing poles. Replaced by an original cobra head on the game's own lamp path. Licence and authorship raise no concern. |

## What is derived from what

| Runtime | Built by | From |
|---|---|---|
| `dist/assets/street/street.vehicles.glb` | `tools/blender/streetprops/build_vehicles.py` | the car pack's sedan, wagon, minivan, SUV, crew-cab pickup and hatchback bodies, glass, lamp optics and wheels (re-oriented, re-scaled to period US dimensions, UVs remapped to the atlases); original cabin silhouettes and licence plates; LOD1/LOD2 by decimation |
| `dist/assets/street/veh_{a,b}_albedo.jpg`, `veh_{a,b}_orm.png` | `tools/blender/streetprops/street_textures.py` | the car pack's body, wheel and optics textures (paint turned into a neutral shading the game tints; material-ID maps turned into roughness/metalness and the paint mask); original plates and cabin swatches |
| `dist/assets/street/street.props.glb` | `tools/blender/streetprops/build_props.py` | the utility pole's crossarm, insulators, braces, cutouts, jumpers and transformer cans (scaled to the game's 2.1 m crossarm); the hydrant; the trash pack's wheeled cart and galvanized can; original: pole shaft, secondary rack, side pins, guy guard, cobra-head lamp, mailboxes and mounts, hoops, fences, gate, posts |
| `dist/assets/street/props_albedo.jpg`, `props_normal.png`, `props_orm.png`, `props_cutout.png` | `tools/blender/streetprops/street_props_textures.py` | the pole's PBR set (rust toned down), the hydrant's (repainted the game's yellow), the cart's (body neutralised, recycling mark removed), the galvanized can's, the fence's board texture (graded; white-painted and weathered variants); original swatches, backboard, brick, house numbers, refractor, chain link and net |

Editable sources: `vehicles/street.vehicles.blend`, `props/street.props.blend` (atlases linked from `textures/`).
Rebuild everything: see `docs/STREET_PROPS_RECONSTRUCTION_REPORT.md` §12 (deterministic: the same inputs give the same
geometry and textures).
