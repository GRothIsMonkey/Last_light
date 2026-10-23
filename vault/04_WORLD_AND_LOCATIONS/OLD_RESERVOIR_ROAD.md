# Old Reservoir Road

> 🟡 IMPLEMENTED BUT UNAPPROVED (Chapter Five). Sources: [first-draft handoff](../../docs/CHAPTER5_PINE_RIDGE_HANDOFF.md) §2;
> code header of [dist/pine-plan.js](../../dist/pine-plan.js), meshes in [dist/pine-build.js](../../dist/pine-build.js).

## Geography

Mill Street does not really end at its **LOCAL TRAFFIC ONLY** sawhorse: past the last parking lot it goes on north out of
town as the old **Reservoir Road**, "a narrow two-lane road between fields and a farm, up over the wooded ridge the area
is named for, and down to the Pine Ridge Recreation Area on the reservoir."

| Segment | Detail |
|---|---|
| Mill Street north | Past the sawhorse (closed in Chapter Four; opened in Chapter Five) |
| Fields and the farm | A farmhouse and barn (`farmhouse`, `barn` in the plan) |
| The ridge | The road climbs a wooded ridge; from the crest the reservoir opens below |
| Down to the park | The park drive and fee booth |
| Length | 327 m of new road plus Mill Street's continuation (first-draft figure). In-world distance: "It's like four miles. Big hill." (Sam) |

The road physically connects to the town: one continuous ground surface, where Pine Ridge's land takes the far ground's
own heights at its edges (`far-land.js`).

## Story

- Sam's county map explains the route: "Mill Street goes out past the sawhorse. Then it's the Old Reservoir Road. Up over
  the ridge." (Ch5 garage)
- **Jamie's race** to the top of the ridge: "Race you to the top. Loser buys slushies." The race adapts; either winner is
  fine. "No way. No WAY. You cheated." / "How do you cheat at riding a bike?" / "…I'll figure it out."
- If you stand still after "Ride to Pine Ridge.", the boys wait at the end of the driveway and call you; only after 160 s
  does the ride come on its own; the ride has an 8-minute fallback.

## Art notes

The ridge crest and the old lot are the heaviest views (just under 1M triangles in software rendering). Fog makes the
distant tree impostors read pale against the dusk sky. Astra priority: technical art optimization of the crest views.
