LAST LIGHT — PROLOGUE PAVEMENT RECONSTRUCTION (offline playtest)
==============================================================

Roads, asphalt, gutters, curbs, sidewalks, driveway cuts, driveways and front walks of Oak Hollow Drive, Briarwood Lane
and Summerfield Road, their corners and the cul-de-sac, rebuilt as physically based surfaces in the running game.

No installation and no internet connection are needed. Everything (the game, the authored bicycles, houses and
vegetation, and the six pavement textures) is inside Last-Light-Playtest.html.

1. Unzip the folder anywhere.
2. Open Last-Light-Playtest.html in desktop Chrome or Edge (WebGL 2; only Chromium was tested).
3. Add one of these to the end of the address in the address bar and press Enter:

     ?pavement                          the reconstructed pavement alone
     ?bikes&houses&vegetation&pavement  with the authored bicycles, houses and vegetation (recommended)

   Without ?pavement the Prologue is exactly the approved game.

4. Press any key on the title screen, choose New Game, and ride (W to pedal, mouse to look, Space for the bell). Ride on
   the sidewalks and over the driveway cuts too: the riding and the collisions are unchanged.

The key added by the benchmark (it does nothing in the normal game):
   O   RECONSTRUCTED <-> ORIGINAL pavement, in the same frame (an honest before/after). ORIGINAL shows the surfaces
       exactly as the default game draws them (with their old decal patches, crack lines and joint bars).

The other benchmarks' keys still work: B (bikes), H (houses), K / Y (vegetation, lawns), etc.

The small DEV label at the top-left says what loaded and how much it costs. If something failed to load it says so in
red, and the original surfaces simply stay.

The reconstruction is shown in the Prologue only. From the night chapters on (and in the credits and the 2026 coda) the
original surfaces show, so Chapter Eight's damaged streets and Aftermath I are exactly as before.

What to look at (review-gallery/index.html in this folder has the same views as before/after pairs, with a slider):
   - the asphalt under the bike and ahead of it: aggregate, wheel paths, the crown's paving seam, sealed cracks, patches
   - the gutter pans and curbs: joints, the flow line, leaves near the inlets, chips and scuffs at the driveway cuts
   - the sidewalks: tooled panels with broom finish, control and expansion joints, a heaved panel by a big tree
   - the driveways: slabs and joints, tire tracks, oil under the cars, each house's own condition
   - Briarwood and Summerfield, the cul-de-sac and the lookout

Texture sources: two CC0 (public-domain) photogrammetry sets from Poly Haven — "Asphalt 07" (Charlotte Baglioni) and
"Gravel Concrete 04" (Dimitrios Savva) — processed by Last Light's own tool. See THIRD_PARTY_ASSETS.md.

Not verified: real-GPU frame rate (only software rendering was checked) and a full human playthrough.
