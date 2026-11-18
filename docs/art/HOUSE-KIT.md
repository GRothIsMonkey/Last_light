# Last Light: the House Kit (assembly conventions)

Part of the [Final Art Bible](../LAST-LIGHT-FINAL-ART-BIBLE.md); it applies the [Environment Style Guide](ENVIRONMENT-STYLE-GUIDE.md) §2 and the [Blender pipeline](BLENDER-PIPELINE.md) to the houses of Oak Hollow. Built in the Prologue architecture benchmark (`claude/prologue-house-architecture-benchmark`); results and limits are in [../HOUSES_PHASE1_REPORT.md](../HOUSES_PHASE1_REPORT.md). **Awaiting creative-director approval (ART-APPROVAL-REGISTER A-51).**

---

## 0. The path in one picture

```
dist/layout.js + dist/houses.js planLots          (the game's own lot plans: the source of truth for every house)
        │  node tools/assets/house-plans.mjs        (only the lots in dist/house-lots.js BENCHMARK_LOTS)
        ▼
tools/blender/houses/plans.json                    (footprint, door, porch, steps, garage, colours, roof type, chimney, dormers, hoop …)
        │  python tools/blender/houses/house_textures.py   (shared tiling library, once)
        │  python tools/blender/houses/interior_atlas.py   (rooms seen through windows, once)
        │  python tools/blender/houses/build_houses.py     (assemble every house × 3 LODs, save .blend, export)
        ▼
assets/source/house/prologue/house.prologue.blend  +  dist/assets/house/house.prologue.glb
        │  node tools/assets/validate-glb.mjs dist/assets/house/house.prologue.glb --profile house
        ▼
dist/house-assets.js (placement, drape, LOD, materials, evening)  ←  dist/house-benchmark.js (?houses, H/G/V)
```

## 1. Frames and units

| Rule | Value |
|---|---|
| Units | Metres, Unit Scale 1.0. |
| House-local frame (the kit writes in it) | `houses.js`'s: **x across the facade** (+x to the right seen from the street), **y up from the lot ground**, **+z toward the street**. Front wall at z = +depth/2, garage at x = gs·(w/2 + gw/2). |
| Blender | `(X, Y, Z) = (x, −z, y)`: every house faces **−Y** like every Last Light asset (pipeline §3). A proper rotation, so winding is kept. |
| glTF | The exporter's +Y-up conversion makes the file's coordinates **exactly house-local**: no half turn at load (houses are the one asset family placed by a plan frame, not by a −Z-forward convention). |
| Ground | y = 0 is the lot ground at the house origin. Foundations go 0.7 m below grade. At runtime every vertex is **draped**: its height gets the terrain under it (the same 1 m grid world.js uses for a draped layer), so nothing floats on a sloping lot. |
| Placement | `P.toWorld(0,0)` and `P.worldRot` (rigid, checked < 2 mm at the footprint corners at load). |

## 2. What the plan fixes and what the kit decides

The plan (game) fixes: lot, setback, footprint `w × depth`, wall plate height `h` (2.85 ranch, 2.95 cape, 5.6 two-storey), front-door x and threshold height (= porch/stoop floor, the walkable pad), porch type/width/depth and step count (`stepFront`: the riding obstacle ends at `stepFront + 0.3`), garage side/width/front line, the car house's door size (`garageInfo`, the working door), the hoop's board and rim, colours (walls, roof, door, shutters, garage door), brick use (`front` veneer / `lower` wainscot), chimney type, dormer count, AC presence, the service-drop point (furniture.js: the wire ends on the house there).

The kit decides: roof pitch (style guide: ranch 5/12, colonial 7/12, cape ≈ 12/12 from the plan, front-gable 8/12), eaves 0.40 m and rakes 0.25 m, sloped boxed soffits, window placement by rooms, window types and grilles, door styles, trim profiles, materials, wear, interior rooms, lived-in details. Ranch garages are carried under the house's roof (full depth, flush front); cape, colonial and front-gable garages get their own lower side-gable roof dying into the house wall (no rake, fascia or gutter where a roof meets a wall).

## 3. Components (`house_parts.py`)

| Part | Built as | LOD0 → LOD1 → LOD2 |
|---|---|---|
| Wall | Planar wall with rectangular holes (`wall_rects`), reveals 0.10 m deep (painted returns), corner boards, foundation band, siding starter | holes and reveals → holes and reveals → solid wall, windows as cards in front |
| Double-hung window | Frame in the reveal; upper (outer) and lower (inner) sashes at their own depths; GBG muntins (6/6, 6/1, 2/2, 1/1); flat or brick-mould casing with head cap; sill with horns and apron; optional louvred or panel shutters | full → one glass plane + meeting rail, casing, sill, flat shutters → card + casing ring |
| Picture window | Fixed centre lite and two operating flankers, mulled, one casing | full → mid → card |
| Room behind glass (`interior_box`) | A shallow room: back wall card (rendered room), side walls, floor, ceiling, the inside face of the wall around the opening; curtains (pleated panels, tinted fabric), blinds at a set height, a rod | full box → flat card 0.45 m deep with dark returns → card on the wall |
| Entry door | Slab with raised panels (six-panel / craftsman with lites / flush), knob, deadbolt, kick plate, threshold, frame in the reveal, casing; colonial crosshead; aluminium storm door on some | full → slab and casing → flat |
| Garage door | Sectional, four sections with joint grooves, raised short panels (8 or 4 across), optional top-row lites with a dark garage behind, bottom seal | full → sections → flat |
| Porch | Framed deck with boards, lattice skirt, painted steps (risers ≤ 0.19 m), square or turned posts with base and cap or craftsman tapered columns on brick piers (a per-family choice, restrained by style), railings 0.9 m with square balusters at 0.105 m, shed roof with beam, fascia, ceiling, gutter, wall flashing | full → rails without balusters → posts and roof |
| Stoop / portico | Concrete landing and steps, iron rail; gabled hood on brackets (two-storey); portico with round columns and a gabled roof | — |
| Roof | Gable (per-side overhangs; 0 = dies into a wall) or hip; deck/shingle edge, drip edge, fascia, sloped vented soffit, rake boards and rake soffits, ridge and hip caps, gable vents | full → no soffit vents/louvres → planes, fascia, simple gutters |
| Gutters, downspouts | K-style profile with end caps; 2×3" downspouts with offsets, straps, elbow, concrete splash block | full → mid → straight |
| Front gable | A band board at the plate across the facade's gable; on some houses the gable in a light or dark accent tone (vinyl shake panels, 1990s builder detail) | LOD0–1 |
| Chimney | Brick stack, exterior with shoulders and weatherings; concrete crown, clay flue | — |
| Dormer | Sided cheeks, front wall with a real window and room, own gable roof | — |
| Utilities | Service bracket at the game's drop point, cable to the meter (base + glass), gas meter, hose bib with a coiled hose, dryer vent, AC condenser on a pad with line set | LOD0 only (meter and AC at LOD1) |
| Life | Carriage lanterns (the `light` slot glows at night), house numbers, coir mat, porch chairs, planters, the hoop | LOD0 (lanterns LOD1) |
| Car-house garage | Interior shell, opener rail and light, steel shelving with bins, workbench and pegboard, water heater, steps and door into the house; the working door is a separate node in the panel's frame | — |

## 4. Materials and textures (one library for every house)

| Slot (glTF material) | Texture set (runtime 1024²) | Tile | Tinted by vertex colour |
|---|---|---|---|
| `mat.siding.vinyl/house.kit` | lap siding: base, normal, ORM | 2 m | wall colour (palette) |
| `mat.brick/house.kit` | modular brick, recessed mortar | 2 m | — (own colour) |
| `mat.roof.shingle/house.kit` | three-tab shingles, granule blend | 2 m | roof colour |
| `mat.concrete/house.kit` | broom-finished concrete | 2 m | foundation / steps |
| `mat.wood.painted/house.kit` | painted wood grain | 1 m | trim, doors, shutters, porch floor, garage door |
| `mat.metal.painted/house.kit` | — | — | gutters, downspouts, AC, meters |
| `mat.metal.bare/house.kit` | — (metal 1) | — | hardware, rods, well |
| `mat.glass/house.kit` | — (alpha 0.2) | — | tint |
| `mat.interior/house.kit` | interior atlas: 8 rooms + strips; emissive = the rooms' lamps | — | fabric |
| `mat.light/house.kit` | — | — | (lamp; the game drives its emission) |

Vertex colours carry the palette colour divided by the texture's mean (`library.json`), so the game's canonical colours come back exactly. UVs of tiling families are in world metres on each face's plane; roofs are mapped along the eave and down the slope. Every material is single-sided (`use_backface_culling`).

## 5. Naming, nodes and extras

| Thing | Pattern |
|---|---|
| File | `dist/assets/house/house.prologue.glb`, asset id `house.prologue` |
| House node | `house.<key>` (story houses: `house.car`, `house.hoop`) or `house.lot<L|R><d>` (`house.lotLm21` = left side, lot d −21); extras `ll_house`, `ll_lot` (`main:<side>:<lot d>`), `ll_role` (`ordinary` / `story:<key>`), `ll_d`, `ll_side`, `ll_meta` (porch light, service point, address, upkeep) |
| LOD mesh | `<house>:lod<n>` with extras `ll_lod`, `ll_part: house`; the car door `house.car:garage_door:lod<n>` (`ll_part: garage_door`) |
| Root | extras `ll_asset_id`, `ll_asset_version`, `ll_license`, `ll_source`, `ll_frame` |

## 6. Budgets (validator `--profile house`)

Per house: story LOD0 ≤ 35k, background LOD0 ≤ 10k; LOD1 ≤ 8k / 4k; LOD2 ≤ 2k / 1.2k triangles. Textures ≤ 1024², shared by every house. One shadow caster per house at runtime (its LOD1 shell, position only).

## 7. Adding a house

1. Add its lot to `dist/house-lots.js BENCHMARK_LOTS` (or, after approval, the production list).
2. `node tools/assets/house-plans.mjs` → `plans.json`.
3. `python tools/blender/houses/build_houses.py -- --houses all` (≈ 6 s for twelve houses, three LODs; the library is reused).
4. Validate, look at it in the game (`?houses`, H to compare), add a gallery view in `render_gallery.py`.

Rules that keep the kit honest: no geometry may reach past `stepFront + 0.3` toward the street (the riding obstacle) or onto the sidewalk; coplanar overlapping trim faces are not allowed (butt pieces or step them ≥ 2 mm; Cycles renders overlaps black and the game z-fights them); a roof edge with no overhang has no fascia, rake board or gutter.
