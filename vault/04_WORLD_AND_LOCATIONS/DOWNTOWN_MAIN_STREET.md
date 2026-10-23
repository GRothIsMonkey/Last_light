# Downtown Oak Hollow and Old Mill Road

> ✅ CONFIRMED CANON (Chapter Four). Sources: [Ch4 handoff](../../docs/CHAPTER4_MAIN_STREET_HANDOFF.md) §1, §4;
> [horror revision](../../docs/CHAPTER4_HORROR_REVISION_HANDOFF.md) §5; [Astra polish](../../docs/ASTRA_CHAPTER4_FINAL_POLISH.md);
> [repair](../../docs/ASTRA_CHAPTER4_REPAIR.md), [repair pass 2](../../docs/CHAPTER4-REPAIR2.md); code
> [town-plan.js](../../dist/town-plan.js) (data and walking), [town-build.js](../../dist/town-build.js) (meshes),
> [town-life.js](../../dist/town-life.js) (people and cars), [presence.js](../../dist/presence.js) (lights).

## Old Mill Road

A road that carries on from Summerfield's end past **nine older houses** (rebuilt in repair 1 with the neighborhood's
detailed house builder), over a rise with **the water tower** and **a steeple**, down into town. About 630 m from Sam's
driveway. Repair pass 2 added the **Mill Road Car Wash** and a **gas station** at the town end. A community notice board.

## Downtown layout

Main Street with three cross streets (**Mill**, **Second**, **Depot**), a **square**, alleys, garages behind the shops,
and **Mill Creek** behind them. 27 buildings; 60 streetlights, each with its own photocell (on between 7:56 and 8:02 PM).

| Place | Detail | Story |
|---|---|---|
| **Mason Cycle & Sport** | 214 Main St. Painted sign faded on the brick, FOR LEASE, papered windows; inside: dust, empty hooks, a counter, a sun-bleached **MEADOWLARK** poster of a green bike. Closed since 1999. | The last of Alex's old-bike pictures was taken outside it. "This is where he took it." |
| The gangway beside Mason's | A narrow way off Main | The false Alex at dusk walks into it |
| **Florist** (Mrs. Kowalski) | Buckets outside | "Not since Roy Mason died." |
| **Vic's barber shop** | Vic on a folding chair | "Library's got all the old Couriers." |
| **Starlite Diner** | Two men talking outside; turns its sign off at night | — |
| **Carnegie library** | On the square: steps, columns, arched windows; repair pass 2 gave it framed glass double doors; inside: shelves, counters, computers, a local-history room with the **microfilm reader** | Mrs. Albright; the 1988/1991/1966 records; closes at ten to eight |
| **TV shop** | Window full of sets | Every set shows the boys from high above, live |
| **The Lantern Video** | Video store; fictional covers and posters; TV over the counter; a phone; BACK IN 10 MIN — D | Alex footage; the PINE RIDGE sign; "…Jamie?"; "That's us."; the back door |
| **Laundromat** | Lit, warm, empty, dryers; "open till ten" | Escape route A; its TV shows them from behind |
| **The Lyric** | Old theater: chasing marquee bulbs, blade sign, poster cases, upper windows, terracotta relief | Figures in the windows; the false Alex under the marquee; the blackout |
| Night shops | Buildings that stay lit after closing time: `video`, `laundry`, `tap`, `gas`, `oddfellows` (ids from `NIGHT_SHOPS` in `presence.js`; the on-screen names of `tap` and `oddfellows` are not yet verified) | — |
| A park / green | Repair pass 2: lawn texture, path edging, beds | — |

## The five escape routes (horror revision)

From the video store's back door to the Lyric, all complete and reconnecting at Main and Depot under the theater:

| Route | Through |
|---|---|
| A | The alley, the narrow way between the garages, **the laundromat** (in the back, out the side), Depot Street |
| B | The narrow way on to Depot Street |
| C | The passage between the shops up to Main |
| D | The gangway up to Main |
| E | Along the creek behind the garages to Depot Street |

Two back-wall security lights (lamp ids 60, 61) exist along the narrow way so the dark has lights to take there.

## Time and light

An ordinary Tuesday: people and cars by day (the clock runs four times real time in the afternoon), shops closing at their
hours, the streetlights coming on at dusk, then the Presence's cascade. See
[The Presence behavior](../05_HORROR_DESIGN/THE_PRESENCE_BEHAVIOR.md).

## Chapter Five link

Mill Street continues north past its **LOCAL TRAFFIC ONLY** sawhorse as the Old Reservoir Road (closed in Chapter Four,
opened in Chapter Five).
