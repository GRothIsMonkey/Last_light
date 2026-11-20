# Street-props kit — model-to-game mapping

Part of the Prologue vehicles & street-props benchmark (`?streetprops`; report:
[../STREET_PROPS_RECONSTRUCTION_REPORT.md](../STREET_PROPS_RECONSTRUCTION_REPORT.md)). How each procedural object of the
Prologue street maps to an authored piece, in which frame the piece is modelled, and how to rebuild everything.

## Conventions

- Every **prop** piece is modelled in the procedural object's own local frame (x right, y up, the object's +z), so the game
  places it with the recorded group's world matrix and nothing else. Blender holds it as (x, −z, y); the glTF export maps it
  back (`G()` in `build_props.py`).
- **Cars** are modelled front to glTF +Z (the asset-pipeline convention) and turned half a turn about Y at placement
  (`ROT_PI`), so their front is the game's −Z like the procedural cars.
- Node names keep dots in Blender (`veh.sedan.lod0`); three.js drops them on load (`PropertyBinding.sanitizeNodeName`):
  the loader looks names up through the same function.
- The GLBs carry geometry, UVs and material *names* only: `veh_A`, `veh_B`, `veh_glass` (cars); `props_A`, `props_cut`,
  `props_lens` (props). The game builds the materials from the atlases (`dist/assets/street/*.jpg|png`).
- Atlas UVs (PIL pixel layout, origin top-left) are listed in `assets/source/street/textures/vehicle_atlas.json` and
  `props_atlas.json`.

## Cars (`street.vehicles.glb`)

| Recorded (`props.js makeCar` kind) | Authored type | Nodes | Paint |
|---|---|---|---|
| `sedan` | `sedan` (2 in 3, by a hash of the position) or `hatchback` (1 in 3) | `veh.<type>.lod{0,1,2}` (+ `.glass`) | the recorded colour's period paint (`PAINT` in `streetprops-assets.js`) |
| `van` | `minivan` | same; `veh.minivan.shell` + `veh.minivan.wheel` for the moving car | same |
| `suv`, `pickup`, `wagon` | `suv`, `pickup`, `wagon` | same | same |

Per-instance attributes: `iPaint` (linear RGB), `iWear` (age, dirt, seed, metallic flake). The root node's extras
`veh_<type>` hold each car's measurements (length, width, height, wheelbase, track, tyre radius, the four wheel centres,
belt and roof heights, lamp centres; Blender coordinates). LOD distances 26 / 75 / 420 m. Oak Hollow's cars are pitched and
rolled to the ground under their four tyres (`world.groundY`).

## Props (`street.props.glb`)

| Recorded (W.sp) | Pieces | Placement | LOD distances (m) |
|---|---|---|---|
| `poles` (39) | `pole.shaft`, `pole.arm`, `pole.rack`; `pole.xfmr` on transformer poles; `pole.sidepin` where conductors run along a turned crossarm; `pole.guard` at the guy's anchor (turned along the guy) | the pole's group (rotation = −heading + arm) | 40 / 110 / 420 (shaft), 35 / 95 / 300 (arm, transformer) |
| `spans`, `drops`, `guys` (157 wires) | one ribbon mesh (`sp:wires`) | recomputed between the hardware attachments below, same sag | — |
| `lamps` (27) | `lamp`, `lamp.lens` (attribute `iLamp` = the lamp's level slot) | the lamp's group (arm toward −x) | 40 / 110 / 420 |
| `mailboxes` (133) | `mailbox.brick` (style brick), `mailbox.white` (seed < 0.40), `mailbox.deco` (0.40–0.60), `mailbox.wood` (≥ 0.60) | the mailbox group (door +z) | 22 / 55 / 170 |
| `hydrants` (8) | `hydrant` | the hydrant group (pumper +z) | 22 / 55 / 170 |
| `bins` (54 sets) | `cart` at x 0 and 0.75 (pairs), or `can` (a hash: about 1 in 4 single bins) | the bins group | 22 / 55 / 170 |
| `hoops` (13) | `hoop.portable` (the curb hoop), `hoop.garage`, `hoop.old` (the friend's older board) | the curb hoop's group; garage hoops from the plan's board position (`P.toWorld`), facing out; skipped on house-benchmark lots | 22 / 55 / 170 |
| `fences` (500 runs) | `fence.privacy` / `fence.privacy_grey` (45 % of runs), `fence.picket`, `fence.rail`, `fence.chain`, `fence.gate` (side-yard runs' first bay); `post.wood`, `post.white`, `post.chain` | each bay: a matrix whose x column is the bay (post to post on the ground, slope included), y up, +z the finished face (rails and the gate's brace on −z); side-yard runs turned so +z faces the street; posts scaled to the run's post height | 18 / 52 / 190 |

Per-instance attributes for props: `iTint` (linear RGB for the masked paint: mailbox boxes, carts), `iVar` (seed, age,
kind: 1 = wood pole, 2 = fence wood).

**Attachment points** (pole local, metres; root extras `sp_attach`): primaries (x ±0.934, y 8.925) on the insulators, the
pair of a double arm at z ±0.131; neutral (0.19, 6.80) and drops (0.19, 6.62) on the secondary rack; the junction pole's
along-arm conductors on side pins (0, 9.05, +0.2) and (0, 8.10, −0.2); the guy's eye at 8.6 m, 0.12 m toward the anchor.
House ends of the drops: the game's own points.

## Rebuild (deterministic)

```
pip install bpy==5.1.2 numpy pillow        # Blender as a Python module (or run the scripts with blender --background --python)
python3 tools/blender/streetprops/street_textures.py           # all atlases -> assets/source/street/textures/
python3 tools/blender/streetprops/build_vehicles.py            # -> street.vehicles.blend + dist/assets/street/street.vehicles.glb
python3 tools/blender/streetprops/build_props.py               # -> street.props.blend + dist/assets/street/street.props.glb
cp assets/source/street/textures/{veh,props}_*.{jpg,png} dist/assets/street/
python3 tools/blender/streetprops/render_inspection.py docs/qa/streetprops/blender   # optional Blender inspection renders
```

The scripts read only the originals in `assets/source/street/third-party/sketchfab-originals/` (hashes in
`assets/source/street/SHA256SUMS`) and contain no randomness beyond fixed seeds.
