# Cycling

Riding is the game's signature verb: the prologue is a bike ride, and every chapter until Pine Ridge moves by bike.
Sources: [docs/ASTRA_HANDOFF.md](../../docs/ASTRA_HANDOFF.md) §2, [docs/ASTRA_FINAL_RELEASE.md](../../docs/ASTRA_FINAL_RELEASE.md);
code [dist/game.js](../../dist/game.js) (`updateRide`, `placePlayerBike`), [dist/ride-contact.js](../../dist/ride-contact.js),
[dist/friends.js](../../dist/friends.js) (`ride`, `cycle`), [dist/rig.js](../../dist/rig.js) (`bikeGeometry`, `createBike`).

## Player riding

| | |
|---|---|
| Cruise | 4.75 m/s |
| Push | Holding W > 5 s eases into a light push; **Shift** pushes up to +30% (~6.3 m/s); stamina drains while pushing hard and recovers when easing off; the push fades once you are ~9 m ahead |
| Steering | Input eases in and out; heading follows a critically damped response (no spring-back; overshoot < 0.012 rad); bar angle from the actual yaw rate; lean from speed² × curvature |
| Surfaces | Road, driveway cuts, both sidewalks almost to their outer edges, the cul-de-sac; curbs and the planting strip can be crossed both ways; lawns and yards cannot |
| Curb contact | Front and rear wheels sample the surface separately; height and pitch settle smoothly; a damped camera impulse capped at 8 mm; quiet tire thump and rattle |
| Head look | Mouse ±1.85 rad left/right, 1.2 down, 0.6 up; Q/E add ±1.1; R recenters; the automatic glance at a departing friend only after 3 s without manual look |
| Bell | Space: left hand reaches, lever presses, strike at ~0.12 s, hand returns; riding friends look back and a bell answers |
| Night riding (Ch1+) | Free world-space riding with turn rate, curb/edge sliding, pivoting when stopped, solid people and cars, hands-off line holding round curves |
| Escape riding (Ch3) | Ride speed ×1.35, wider view; companions ride hard (×1.42), ragged, looking back; a handlebar light |
| Chapter Five | Bikes are locked at the Pine Ridge rack; everything after is on foot |

## The four bikes (`CAST` in `dist/cast.js`)

| Rider | Style | Look | Extras |
|---|---|---|---|
| You | road-kid | teal frame, riser bars | bell, reflector |
| Jamie | BMX | red-brown frame, BMX bars | pegs, pad |
| Sam | mountain bike | teal-blue frame, flat bars, knobby tires | bottle |
| Alex | cruiser | olive-green frame, swept bars, brown saddle, cream grips | rack, **bell**, **red rear reflector** |
| *The old bike* | (Meadowlark, 1958) | sage-green, swept bars, cracked brown saddle, rusted bell | licence No. 0417, AR scratched (`dist/old-bike.js`) |

## Group riding (prologue)

Each friend rides as an individual: own cadence, crank phase, standing bursts, sway, weave, glances, and reaction lag
(0.2–3 s, drawn fresh per surge). When you surge, each decides to stand or stay seated; a standing rider's torso rolls at
most ~13°. Departures ease the pace only 10–15%. Nothing teleports (largest friend step 0.27 m per frame).

## Companions on bikes (Ch1+)

They follow **the path you actually rode** (a trail of your positions), so they go round the same corners, with varied
formations (staggered, alongside, briefly ahead) and continuous catch-up. In Chapter Five they go to their own bikes, kick
the stand up, mount and ride to the end of the driveway by themselves; on the bike they see your speed with a delay and
brake at their own rates (1.5–2.3 s to stop). See [Companion AI](COMPANION_AI.md).

## Contracts (keep)

- The bike sits on what it rides: height and pitch from both wheels.
- Hands on the actual grips; feet on the actual pedals; the bell lever animated.
- Accepted limits: mounting is the dismount played backwards for friends; Jamie's lying-bike lift is approximate; the
  Astra Chapter Five handoff lists mount animation (no visible kickstand kick, stiff reach) as art work.
