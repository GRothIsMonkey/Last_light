# Chapter Four Astra — targeted repair pass 2

Source: `codex/astra-chapter4-final-polish-repair` at `91d5dba97728d8f1f9205695998654ee53439c91`, descended from accepted Astra release `4542392c6d18fd9c4bfe395bc5d1e0877a763f4a`.

Continuation branch: `codex/astra-chapter4-repair-pass2`.

## Changes

- Library: removed the decorative solid slab across the entrance. Added two framed glass doors, paired hinges, handles/push bars, stone jambs and threshold, transom lettering and step rails. The existing door state and traversal opening still control access.
- Park: added a small mipmapped lawn texture, flush path edging, planted perimeter beds, two low perennial beds marking the main path, tree mulch and compacted ground beside benches. All navigation paths remain open.
- Distant downtown houses: replaced the separate primitive builder with the existing neighborhood house builder at medium detail. Roofs, trim, windows, doors, stoops and chimneys now share the earlier neighborhood's proportions and materials. Lot positions and the existing random layout stream are retained; foundation skirts meet the land.
- Mill Road Car Wash: added recessed wash bays, blue entrance framing, numbered bay signs, drain grates, hose booms, a payment box, a durable lower wall course and roof coping. The existing non-enterable building envelope is retained.
- Gas station: added a more complete storefront, masonry base, framed glazing and door, ice cabinet, canopy structure and trim, readable pumps, hoses, grade buttons, numbered bays, underside fixtures and a two-sided price sign. Existing light levels still drive the fixtures.
- Transition: replaced the overlapping town/background terrain surfaces with one shared heightfield and grass material, clipped to the accepted street/lawn boundaries. Smoothed and subdivided the connector lawns, kept graded paths above the lawn, closed commercial lot edges and foundation gaps, and fixed triangular slivers at the widening sidewalk. Road alignment and navigation grades are unchanged.

## Preserved

Story, route structure, objectives, companion behavior, controls and DEV selector are unchanged. Chapter Four's only story-module edit supports posing the new double doors. The accepted brick/carpet texture fixes are byte-identical to the source commit.

The original creature GLB is unchanged, SHA-256:
`e86b69df95ce1a96519f0eb720f3dc58cb15d07f3848e35c5f8891047add51b3`.

## Validation

Focused browser harness: `tests/chapter4-repair2-browser.mjs`.
Machine-readable results: `docs/qa/chapter4-repair2/focused-report.json`. Rendered views were inspected during the focused review.

The harness checks the title and Chapter Four DEV start, creature loading, atlas capacity, two-way library traversal and scene progression, park movement, ground coverage at the connector and widening sidewalk edges, and one short real ride from Summerfield into downtown with Jamie and Sam following. The browser uses SwiftShader; its timings are not a hardware performance benchmark. The full chapter walkthrough and giant suites were intentionally not repeated.

### Final focused result

All 11 checks passed. The title and controls loaded; DEV Chapter Four started at the expected opening scene; the original creature decoded without error; sign atlases remained within capacity. Library traversal succeeded in both directions and entered the existing library scene. The park crosspath allowed more than ten metres of walking.

All 754 corridor/sidewalk-edge ground probes found a surface; maximum sampled grade difference was 0.01558 m. The 48-second simulated ride used actual pedal/steering input to travel 228.07 m from the neighborhood into downtown, with Jamie and Sam active in ride-follow mode. Forward and side views were inspected along the ride. No JavaScript errors or failed asset requests were observed.

The six repaired areas were visually reviewed at player-height approach angles. The remaining full human playtest, including the chapter ending, is left to the user; unchanged story/ending files were verified against the source rather than replaying the whole chapter.
