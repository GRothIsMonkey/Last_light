# Last Light v0.1 — verification report

The focused v0.1 implementation pass is complete. No story or runtime expansion was made.

## Automated results

- 18 checks passed.
- Two full simulated playthroughs completed, including replay.
- All 14 original story triggers occurred at their original distance thresholds.
- `dist/story.js` is byte-for-byte unchanged from the published prototype.
- Authored route length: 1,120 meters; cruise duration: 220 seconds plus acceleration.
- Maximum road grade is below 4.3%.
- Camera height varied less than 1.6 cm from nominal clearance in the complete-ride check.

- all local assets resolve.
- gentle continuous route with constant distance scale.
- asphalt faces upward and follows terrain throughout ride.
- side streets connect through curb openings.
- pedal linkage closes and stays above pavement.
- pedaling advances bike, animated feet stay on pedals.
- mouse head-look turns smoothly without steering.
- R returns gaze forward.
- Q looks left.
- E looks right.
- A steering stays inside left road edge.
- D steering stays inside right road edge.
- pause freezes travel and releases mouse.
- browser pointer-lock exit pauses safely.
- drag fallback works when pointer lock unavailable.
- complete ride reaches all 14 original triggers and ending.
- replay resets story, view, bike, friends, and controls.
- second uninterrupted playthrough also completes.

## Method and limitation

Run `node tests/verify.mjs`. The tests execute the actual game module and Three.js scene geometry, substituting a mock WebGL renderer and DOM. Ray intersections validate upward-facing asphalt and connected side streets. Input handlers are exercised with synthetic keyboard, mouse, pointer-lock, and fallback drag events.

JavaScript syntax and local references were also checked. These checks do not establish visual quality, browser performance, or real hardware pointer-lock behavior. The supported browser-testing capability was unavailable, so browser visual and input QA remains outstanding. No unsupported browser workaround was used.

The project remains at the requested v0.1 scope endpoint; no new features or story expansion were added.
