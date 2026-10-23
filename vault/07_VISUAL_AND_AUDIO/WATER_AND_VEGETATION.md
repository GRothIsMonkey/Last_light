# Water and vegetation

## Water

| Where | Implementation | Status |
|---|---|---|
| Creek channel (Ch1) | Concrete channel, synthesized water sound; surface grain, wet silt, stones, leaves, algae (Ch1 polish) | ✅ |
| Easement trickle and culvert (Ch2) | V channel with a trickle; standing water and storm debris in the culvert; tide marks (Ch2 polish) | ✅ |
| Storm drain (Ch3) | Its own water surface over a recessed floor (`Dr.waterAt`, `Dr.floorAt`): dark and slightly glossy, so the hotspot is a wet sheen; ankle-deep in the deep box; splashes per step; never slows you | ✅ |
| Pine Ridge reservoir (Ch5) | One designed level (`WATER`); stones skip on it with rings and splashes; **wade zones** (`WADE`, `PS.shallow`) are walkable water, slower where the bed is under water | 🟡 |

**Chapter Five water problems (Astra):** a flat pale sheet with no shading, reflection or shoreline transition; the shallows
are opaque (feet vanish); ripples and wading rings are hard-edged grey polygons with no splash. Wanted: see-through
shallows, a shoreline transition, real ripples and splash effects.

## Vegetation

- **Trees** ([dist/vegetation.js](../../dist/vegetation.js)): maple, oak, pine, birch, young (staked); LOD full / mid / far;
  every crown hangs from a limb that grows from the trunk; trunks flare into the ground; placed whole (never bent); an
  occupancy grid keeps them off roads, sidewalks and driveways. The **old oak** has a 14-sided trunk and roots.
- **Leaf clusters** varied in scale and tilt; lawns with a wind shader (`ambient.js`); the lookout's tall grass uses bent
  blade clusters (was "spiky cones").
- **Woods** (Ch3): about 470 trees near the access road and about 3,700 far trees (the rebuild handoff calls them instanced; no `InstancedMesh` is used in `woods.js`, so the exact method is not yet verified), shrubs, logs, fronds; Astra
  made canopy, roots and shrubs less geometric.
- **Easement weeds** (Ch2): ~420 tufts, a flattened lane that reads by color more than shape.
- **Pine Ridge** (Ch5): 6,235 trees in the first draft (most of the +151 MB of vertex data); instancing is a known
  available optimization. Astra's branch adds `pine-forest.js` (in progress).

## Rules

- Keep vegetation off walkable/rideable surfaces (occupancy grid).
- Prefer instancing for large tree counts; watch memory (see [Performance budget](PERFORMANCE_BUDGET.md)).
- Fog makes distant tree impostors read pale against a dusk sky (known in the Chapter Five final view).
