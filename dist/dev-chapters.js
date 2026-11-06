// TEMPORARY — private playtest build only (branch claude/chapter3-private-playtest). NOT part of the
// shipped game: the finished Chapter Three branch does not contain this file, and the release will not.
//
// DEV — CHAPTER → SCENE: begin at the true beginning of the prologue or of Chapter One, Two or Three, or at
// one of the important scenes inside them (DEV_SCENES), in the same state a player reaches by playing
// everything before it. Each scene starts shortly BEFORE its event, so it can be played through.
//
// How the state is made canonical. Each chapter is entered by the game's own code path for entering it:
//   * Prologue: Start over (resetState + start), exactly what a new game does.
//   * Chapter One: the last stretch of the street (the game's own mid-ride warp), then the game itself
//     rides into the lookout, stops, plays the finale (the evening, the call, the "time to go home" hint),
//     and leave() — the function F → "Go home" calls — runs startNight('ride') → chapter.begin('ride').
//   * Chapter Two: Chapter One's last scene (the creek checkpoint), the real F at the reflector
//     (chapter.act('reflector')), then the game runs, muted and behind black, until Chapter One's own
//     ending calls chapter2.begin().
//   * Chapter Three: Chapter Two's last scene (the chapter2-end checkpoint), then the game runs, muted and
//     behind black, until Chapter Two's own end() calls chapter3.begin().
//   * Chapter Four: Chapter Three's last scene (the chapter3-end checkpoint), the game runs, muted, until Chapter
//     Three's own ending card, then the card's own "Chapter Four" button (nextChapter → chapter4.begin()).
//   * Chapter Five: the same from Chapter Four's last scene (chapter4-end): its ending card, then its own "Chapter Five"
//     button (nextChapter → chapter5.begin()).
//   * Chapter Six: the same from Chapter Five's last scene (chapter5-end): its ending card, then its own "Chapter Six"
//     button (nextChapter → chapter6.begin()).
//   * Chapter Seven: the same from Chapter Six's last scene (chapter6-end): its ending card, then its own "Chapter Seven"
//     button (nextChapter → chapter7.begin()).
// The checkpoint scenes cannot know what earlier beats left behind (which windows were tapped, the
// flashlight Jamie gave you, the siren, Chapter Two's evidence and police flags…). That history comes from
// HISTORY (dev-chapter-history.js), which is GENERATED from a natural playthrough
// (`ONLY=dev-record node tests/verify.mjs`), never written by hand; timestamps in it are stored relative to
// the chapter clock and re-based. The simulation test compares every start with a natural arrival.
// Before any of it, everything transient is cleared (clear()), so switching chapters any number of times in
// one session leaves nothing behind.
//
// How a scene is made canonical (startScene). Never coordinates and approximate flags of its own: each
// scene is one of the game's existing ways in, chosen to be reliable:
//   * chapter: the chapter's own start, above;
//   * jump: the QA/Continue checkpoint initializer for that moment (the same jumpTo() Continue uses: Start
//     over's reset, then the chapter's own jump(), which sets the story flags of every earlier beat in that
//     chapter), then the earlier chapters' history from HISTORY (what Chapters One and Two leave behind, as
//     at the chapter's start), then SCENE_HISTORY[scene]: what a natural playthrough had at that very moment that
//     the jump does not set (the story flags of the earlier beats of Chapters One and Two, who has joined you, the
//     flashlight, the Continue save), GENERATED like HISTORY (`ONLY=dev-record`), never written by hand; scenes
//     the natural run does not reach exactly get the Continue save a player has by then (`save`);
//   * warp: the prologue's own mid-ride warp (as its alex-departure jump), only before anyone has left;
//   * ride: that warp, then the game itself rides on (W held, muted, nothing drawn) to just before the
//     moment, through the departures in between, as a player would;
//   * approach: the last stretch of the street to the lookout (the game rides the rest when you do).
import {HISTORY,TIMESTAMPS,SCENE_HISTORY} from './dev-chapter-history.js';
export const DEV_CHAPTERS=[{n:0,label:'Prologue',phase:null},{n:1,label:'Chapter One',phase:'leave'},{n:2,label:'Chapter Two',phase:'c2-black'},{n:3,label:'Chapter Three',phase:'c3-black'},{n:4,label:'Chapter Four',phase:'c4-black'},{n:5,label:'Chapter Five',phase:'c5-black'},{n:6,label:'Chapter Six',phase:'c6-black'}];
// The scenes of each chapter, in story order. The first of each list is the chapter's own start.
export const DEV_SCENES={
 0:[{id:'start',label:'Start (new game)',chapter:0},{id:'group-ride',label:'Group Ride',warp:150},{id:'alex-hears',label:'Alex Before Briarwood (“Did you guys hear that?”)',warp:355},
  {id:'alex-departure',label:'Alex Departure',warp:528},{id:'jamie-departure',label:'Jamie Departure',ride:670},{id:'sam-departure',label:'Sam Departure',ride:870},
  {id:'lookout',label:'Old Oak / Chalk (the lookout)',approach:true},{id:'ride-home',label:'Solo Ride Home',chapter:1},{id:'police',label:'Police Cruiser / Title',jump:'police'}],
 1:[{id:'title',label:'Chapter One Start (title)',jump:'title'},{id:'alex-house',label:'Alex’s House (Briarwood)',jump:'alex-house'},{id:'jamie',label:'Recruit Jamie',jump:'jamie'},
  {id:'sam',label:'Recruit Sam',jump:'sam'},{id:'oak',label:'Old Oak Regroup',jump:'oak'},{id:'retrace',label:'The Way Alex Went (retrace)',jump:'retrace'},
  {id:'investigation',label:'Creek / Utility Strip',jump:'investigation'},{id:'clue',label:'Reflector Discovery',jump:'clue'},{id:'final-bell',label:'Final Bell / Chapter End',jump:'clue',act:'reflector'}],
 2:[{id:'chapter2',label:'Chapter Two Start',chapter:2},{id:'chapter2-start',label:'Follow the Sound',jump:'chapter2-start'},{id:'easement',label:'Easement',jump:'easement'},
  {id:'alex-bike',label:'Alex’s Bike',jump:'alex-bike'},{id:'second-bell',label:'Second Bell / Culvert',jump:'second-bell'},{id:'police-find',label:'Police Arrival',jump:'police-find'},
  {id:'morning',label:'Morning',jump:'morning'},{id:'morning-oak',label:'Morning Old Oak',jump:'morning-oak'},{id:'memory-start',label:'Return to Briarwood',jump:'memory-start'},
  {id:'memory-reconstruction',label:'Memory Reconstruction',jump:'memory-reconstruction'},{id:'chapter2-end',label:'Chapter Two Ending',jump:'chapter2-end'}],
 3:[{id:'chapter3',label:'Chapter Three Start',chapter:3},{id:'c3-alex-house',label:'Alex’s House (his mom)',jump:'c3-alex-house',save:'chapter3-start'},
  {id:'alex-bedroom',label:'Alex’s Bedroom',jump:'alex-bedroom'},{id:'recording',label:'Flip Phone (the recording)',jump:'recording'},
  {id:'neighbors',label:'Neighbor / Storm Road',jump:'neighbors'},{id:'c3-road-day',label:'Day Road Entrance',jump:'c3-road-day',save:'neighbor-investigation'},
  {id:'night-start',label:'Night Start',jump:'night-start'},{id:'c3-road-night',label:'Night Ride to the Road',jump:'c3-road-night'},{id:'c3-forest-deep',label:'Forest Road',jump:'c3-forest-deep',save:'c3-road-night'},
  {id:'c3-tunnel-entrance',label:'Tunnel Entrance',jump:'c3-tunnel-entrance',save:'c3-tunnel-entrance'},{id:'c3-tunnel-deep',label:'Deep Tunnel',jump:'c3-tunnel-deep',save:'c3-tunnel-entrance'},
  {id:'c3-alex-item',label:'Alex Evidence (his helmet)',jump:'c3-alex-item',save:'c3-tunnel-deep'},{id:'c3-old-bike',label:'Old Bike',jump:'c3-old-bike',save:'c3-tunnel-deep'},
  {id:'c3-bike-gone',label:'Old Bike Gone',jump:'c3-bike-gone',save:'c3-old-bike'},{id:'c3-figure-reveal',label:'Alex-Like Figure: First Reveal',jump:'c3-figure-reveal',save:'c3-old-bike'},
  {id:'c3-follow-alex',label:'Follow Alex',jump:'c3-follow-alex',save:'c3-alex-lure'},{id:'c3-second-sighting',label:'Second Alex Sighting',jump:'c3-second-sighting',save:'c3-alex-lure'},
  {id:'c3-creature-reveal',label:'Creature Reveal',jump:'c3-creature-reveal',save:'c3-alex-lure'},{id:'c3-creature-chase-start',label:'RUN / Chase Start',jump:'c3-creature-chase-start'},
  {id:'c3-creature-far',label:'Creature Chase — Far',jump:'c3-creature-far'},{id:'c3-creature-side',label:'Creature Chase — Side Channel',jump:'c3-creature-side'},
  {id:'c3-bike-block',label:'Old Bike Relocated (in the way)',jump:'c3-bike-block'},{id:'c3-creature-near',label:'Creature Chase — Near',jump:'c3-creature-near'},
  {id:'c3-creature-barrier',label:'Creature Chase — Barrier (the gate)',jump:'c3-creature-barrier'},{id:'c3-tunnel-exit',label:'Tunnel Exit',jump:'c3-tunnel-exit'},
  {id:'c3-bike-remount',label:'Bike Remount',jump:'c3-bike-remount',save:'c3-creature-chase'},{id:'c3-road-escape',label:'Forest Escape',jump:'c3-road-escape'},
  {id:'c3-final-lure',label:'Final Alex-Like Road Figure',jump:'c3-final-lure'},{id:'chapter3-end',label:'Chapter Three End',jump:'chapter3-end'}],
 4:[{id:'chapter4',label:'Chapter Four Start',chapter:4},{id:'c4-sam-house',label:'Sam’s House (his mom)',jump:'c4-sam-house',save:'chapter4-start'},
  {id:'c4-backpack',label:'Alex’s Backpack',jump:'c4-backpack',save:'chapter4-start'},{id:'c4-camera',label:'Alex’s Camera (the pictures)',jump:'c4-camera'},
  {id:'c4-photo-bike',label:'Old Bike in a Photo',jump:'c4-photo-bike'},{id:'c4-photo-mason',label:'The Mason Cycle Photo',jump:'c4-photo-mason'},
  {id:'c4-ride',label:'Ride Downtown',jump:'c4-ride',save:'c4-camera'},{id:'c4-old-mill-road',label:'Old Mill Road',jump:'c4-old-mill-road',save:'c4-camera'},
  {id:'c4-downtown-arrival',label:'Downtown Arrival',jump:'c4-downtown-arrival'},{id:'c4-main-street',label:'Main Street by Day',jump:'c4-main-street',save:'c4-downtown-arrival'},
  {id:'c4-mason',label:'Mason Cycle & Sport',jump:'c4-mason',save:'c4-downtown-arrival'},{id:'c4-florist',label:'The Florist',jump:'c4-florist',save:'c4-downtown-arrival'},
  {id:'c4-library',label:'The Library',jump:'c4-library'},{id:'c4-microfilm',label:'Microfilm Room',jump:'c4-microfilm',save:'c4-library'},
  {id:'c4-historical-clue',label:'Microfilm: the Records',jump:'c4-historical-clue'},{id:'c4-closing',label:'Library Closing',jump:'c4-closing'},
  {id:'c4-dusk',label:'Dusk (out of the library)',jump:'c4-dusk'},{id:'c4-alex-across',label:'Alex Across the Street',jump:'c4-alex-across',save:'c4-dusk'},
  {id:'c4-creature',label:'Creature First Appearance',jump:'c4-creature',save:'c4-dusk'},{id:'c4-creature-notices',label:'Creature Notices Presence',jump:'c4-creature-notices',save:'c4-dusk'},
  {id:'c4-creature-hiding',label:'Creature Cowering / Fear',jump:'c4-creature-hiding',save:'c4-dusk'},{id:'c4-presence',label:'Streetlight Cascade',jump:'c4-presence'},
  {id:'c4-tv-window',label:'TV Window (live)',jump:'c4-tv-window'},{id:'c4-video-store',label:'Video Store',jump:'c4-video-store'},
  {id:'c4-store-footage',label:'Store TV: Alex Footage',jump:'c4-store-footage'},{id:'c4-pine-ridge',label:'Store TV: Pine Ridge (the picture)',jump:'c4-pine-ridge'},
  {id:'c4-store-phone',label:'The Phone (“Jamie?”)',jump:'c4-store-phone'},{id:'c4-store-live',label:'Impossible Surveillance (“That’s us.”)',jump:'c4-store-live'},
  {id:'c4-back-door',label:'Video Store Escape (back door)',jump:'c4-back-door'},{id:'c4-escape',label:'Downtown Escape Start',jump:'c4-escape'},
  {id:'c4-route-a',label:'Alley Route A (the narrow way)',jump:'c4-route-a',save:'c4-escape'},{id:'c4-route-b',label:'Alley Route B (the passage to Main)',jump:'c4-route-b',save:'c4-escape'},
  {id:'c4-alley-creature',label:'Creature Flees Past Group',jump:'c4-alley-creature',save:'c4-escape'},{id:'c4-laundromat',label:'Laundromat',jump:'c4-laundromat'},
  {id:'c4-depot-st',label:'Depot Street',jump:'c4-depot-st'},{id:'c4-theater',label:'Theater Approach (the windows)',jump:'c4-theater'},
  {id:'c4-marquee',label:'New Alex Message (under the marquee)',jump:'c4-marquee',save:'c4-theater'},{id:'c4-power-returns',label:'Blackout / Power Returns',jump:'c4-power-returns'},
  {id:'c4-final-clue',label:'Final Clue (the Pine Ridge picture)',jump:'c4-final-clue'},{id:'c4-ride-home',label:'Ride Home',jump:'c4-ride-home',save:'c4-final-clue'},
  {id:'c4-oak',label:'Back on Oak Hollow',jump:'c4-oak',save:'c4-final-clue'},{id:'chapter4-end',label:'Chapter Four Ending (the old oak)',jump:'chapter4-end'}],
 5:[{id:'chapter5',label:'Chapter Five Start',chapter:5},{id:'c5-garage',label:'Sam’s Garage (packing)',jump:'c5-garage',save:'chapter5-start'},
  {id:'c5-departure',label:'Departure (Jamie’s sock)',jump:'c5-departure',save:'chapter5-start'},{id:'c5-ride',label:'The Old Reservoir Road',jump:'c5-ride',save:'c5-ride'},
  {id:'c5-race',label:'The Race (Jamie)',jump:'c5-race',save:'c5-ride'},{id:'c5-crest',label:'Top of the Ridge (first view)',jump:'c5-crest',save:'c5-ride'},
  {id:'c5-arrival',label:'Pine Ridge Arrival (the new sign)',jump:'c5-arrival'},{id:'c5-park',label:'The Park (the bike rack)',jump:'c5-park',save:'c5-arrival'},
  {id:'c5-stones',label:'Skipping Stones',jump:'c5-stones',save:'c5-arrival'},{id:'c5-dock-memory',label:'The Dock (Alex and the shoe)',jump:'c5-dock-memory',save:'c5-arrival'},
  {id:'c5-sign-search',label:'Find the Place in the Picture',jump:'c5-sign-search'},{id:'c5-photo-match',label:'Photo Match (the old sign)',jump:'c5-photo-match',save:'c5-sign-search'},
  {id:'c5-trail-map',label:'The Trail Map',jump:'c5-trail-map',save:'c5-sign-search'},{id:'c5-gate-decision',label:'The Yellow Gate (the decision)',jump:'c5-gate-decision',save:'c5-sign-search'},
  {id:'c5-gravel-road',label:'The Road to the Camp',jump:'c5-gravel-road',save:'c5-gate-decision'},{id:'c5-camp-gate',label:'Camp Whippoorwill (the arch)',jump:'c5-camp-gate',save:'c5-gate-decision'},
  {id:'c5-camp',label:'Camp Exploration',jump:'c5-camp'},{id:'c5-office',label:'The Office',jump:'c5-office',save:'c5-camp-gate'},
  {id:'c5-register',label:'The 1991 Register (the Whitcomb search)',jump:'c5-register',save:'c5-camp-gate'},{id:'c5-lodge',label:'The Lodge',jump:'c5-lodge',save:'c5-camp-gate'},
  {id:'c5-pantry',label:'The Pantry (someone has been here)',jump:'c5-pantry',save:'c5-camp-gate'},{id:'c5-cabins',label:'The Cabins (Sam’s batteries)',jump:'c5-cabins',save:'c5-camp-gate'},
  {id:'c5-campfire',label:'The Campfire (the quiet scene)',jump:'c5-campfire',save:'c5-camp-gate'},{id:'c5-golden-hour',label:'Golden Hour (Wren’s window)',jump:'c5-golden-hour'},
  {id:'c5-owl',label:'Owl (Alex’s shirt)',jump:'c5-owl',save:'c5-campfire'},{id:'c5-calling',label:'Calling for Alex (a light in the trees)',jump:'c5-calling'},
  {id:'c5-three-lights',label:'Three Lights / the Creature',jump:'c5-three-lights',save:'c5-owl'},{id:'c5-split',label:'The Camp That Wants Them Apart',jump:'c5-split'},
  {id:'c5-compromise',label:'Disagreement and Compromise',jump:'c5-compromise',save:'c5-split'},{id:'c5-window',label:'Owl From the Porch (the double)',jump:'c5-window',save:'c5-split'},
  {id:'c5-run',label:'Run (escape start)',jump:'c5-run'},{id:'c5-route-a',label:'Escape Route A (the road)',jump:'c5-route-a',save:'c5-run'},
  {id:'c5-route-c',label:'Escape Route C (the dam)',jump:'c5-route-c',save:'c5-run'},{id:'c5-boundary',label:'Camp Boundary (the gate)',jump:'c5-boundary',save:'c5-run'},
  {id:'c5-aftermath',label:'Aftermath (the lamp in the lot)',jump:'c5-aftermath',save:'c5-run'},{id:'c5-second-discovery',label:'The Last Picture',jump:'c5-second-discovery'},
  {id:'chapter5-end',label:'Chapter Five Ending (one light)',jump:'chapter5-end'}],
 6:[{id:'chapter6',label:'Chapter Six Start',chapter:6},{id:'c6-room',label:'The Morning After (Alex’s camera)',jump:'c6-room'},
  {id:'c6-phone',label:'Sam’s Phone Call',jump:'c6-phone'},{id:'c6-meeting',label:'The Adult Meeting (Sam’s garage)',jump:'c6-meeting'},
  {id:'c6-shirt',label:'The Gold Shirt (Alex’s dad)',jump:'c6-shirt'},{id:'c6-photos',label:'The Pictures (the silhouette)',jump:'c6-photos'},
  {id:'c6-oak',label:'Old Oak (“It looked exactly like me.”)',jump:'c6-oak'},{id:'c6-street',label:'Familiar Streets',jump:'c6-street'},
  {id:'c6-anomaly',label:'Neighborhood Anomaly (the doorway)',jump:'c6-anomaly'},{id:'c6-creek',label:'The Creek Drain (the helmet)',jump:'c6-creek'},
  {id:'c6-records',label:'Drainage Records (Reyes)',jump:'c6-records'},{id:'c6-map',label:'The 1958 Plan (Sam’s map)',jump:'c6-map'},
  {id:'c6-works',label:'Drainage Works Entry (the storm)',jump:'c6-works'},{id:'c6-gatehouse',label:'The Gatehouse (the log)',jump:'c6-gatehouse'},
  {id:'c6-radio',label:'Radio Anomaly (“Behind you.”)',jump:'c6-radio'},{id:'c6-lower',label:'The Lower Chamber (the hand brake)',jump:'c6-lower'},
  {id:'c6-grate-scare',label:'Grate Scare (Alex at the grille)',jump:'c6-grate-scare'},{id:'c6-emergency',label:'Rising Water (the gate comes down)',jump:'c6-emergency'},
  {id:'c6-hold',label:'Gate Release (Sam holds it)',jump:'c6-hold'},{id:'c6-double',label:'Duplicate Reveal (two Sams)',jump:'c6-double'},
  {id:'c6-sealed',label:'Post-Disappearance (the gate shut)',jump:'c6-sealed'},{id:'c6-rescue',label:'Rescue Attempt',jump:'c6-rescue'},
  {id:'c6-aftermath',label:'Aftermath (two hours later)',jump:'c6-aftermath'},{id:'c6-testimony',label:'Reyes (“I saw them both.”)',jump:'c6-testimony'},
  {id:'chapter6-end',label:'Chapter Six Ending (the end card)',jump:'chapter6-end'}],
 7:[{id:'chapter7',label:'Chapter Seven Start',chapter:7},{id:'c7-step',label:'Jamie on the Step (Sam’s house)',jump:'c7-step'},{id:'c7-bedroom',label:'Sam’s Bedroom',jump:'c7-bedroom'},
  {id:'c7-family',label:'Family Conversation (Sam’s parents)',jump:'c7-family'},{id:'c7-fan',label:'The Fan',jump:'c7-fan',save:'c7-bedroom'},
  {id:'c7-gum',label:'The Gum',jump:'c7-gum',save:'c7-bedroom'},{id:'c7-memory',label:'Sam’s Childhood Memory (the Tour de Oak Hollow)',jump:'c7-memory',save:'c7-bedroom'},
  {id:'c7-search',label:'Searching Sam’s Belongings (his dad’s list)',jump:'c7-search'},{id:'c7-machine',label:'The Answering Machine (not plugged in)',jump:'c7-machine',save:'c7-search'},{id:'c7-garage',label:'Garage Disturbance (first glimpse)',jump:'c7-garage'},
  {id:'c7-reyes',label:'Reyes Investigation',jump:'c7-reyes'},{id:'c7-map',label:'Old Map (the 1958 plan)',jump:'c7-map',save:'c7-reyes'},{id:'c7-records',label:'Reyes’s Second Investigation (the plate, the streetlights)',jump:'c7-records'},
  {id:'c7-curb',label:'Jamie on the Curb',jump:'c7-curb'},{id:'c7-ride',label:'The Ride Down Oak Hollow',jump:'c7-ride',save:'c7-curb'},{id:'c7-lookout',label:'The End of the Street (Reyes)',jump:'c7-lookout'},
  {id:'c7-lane',label:'Wrong Street Entrance (the lane)',jump:'c7-lane',save:'c7-lookout'},{id:'c7-court',label:'Old Mill Court',jump:'c7-court'},
  {id:'c7-separation',label:'Reyes Separated (the fence)',jump:'c7-separation',save:'c7-court'},{id:'c7-lange',label:'The Open Door (the Langes’, No. 5)',jump:'c7-lange',save:'c7-court'},
  {id:'c7-lange-in',label:'Inside the Langes’ (dinner still warm, the phone)',jump:'c7-lange-in',save:'c7-lange'},{id:'c7-lange-scare',label:'The Langes’ Bathroom (it comes out)',jump:'c7-lange-scare',save:'c7-lange'},
  {id:'c7-dining',label:'The Lit Window',jump:'c7-dining',save:'c7-court'},
  {id:'c7-dining-scare',label:'Dining-Room Scare',jump:'c7-dining-scare',save:'c7-court'},{id:'c7-house',label:'Horror House (the green door)',jump:'c7-house',save:'c7-court'},
  {id:'c7-green-star',label:'Green-Door House: Before It Comes Down (a star on the stairs)',jump:'c7-green-star',save:'c7-house'},
  {id:'c7-reveal',label:'Creature Reveal (the stairs)',jump:'c7-reveal',save:'c7-house'},{id:'c7-stalk',label:'Stealth Encounter (it looks into the pantry)',jump:'c7-stalk'},
  {id:'c7-stairs',label:'Stealth: It Waits at the Stairs (the timer)',jump:'c7-stairs',save:'c7-stalk'},
  {id:'c7-door',label:'The Door (it hammers)',jump:'c7-door',save:'c7-stairs'},{id:'c7-rug',label:'The Rug and the Dresser (with Jamie)',jump:'c7-rug',save:'c7-stairs'},{id:'c7-clues',label:'Historical Clues (1991)',jump:'c7-clues'},
  {id:'c7-trace',label:'Sam Trace (the page)',jump:'c7-trace',save:'c7-clues'},{id:'c7-old-bike',label:'The Old Green Bike',jump:'c7-old-bike',save:'c7-clues'},
  {id:'c7-giant',label:'Giant Reveal (the window)',jump:'c7-giant',save:'c7-clues'},{id:'c7-out',label:'The Porch Roof',jump:'c7-out',save:'c7-clues'},
  {id:'c7-bikes',label:'Back to the Bikes',jump:'c7-bikes'},{id:'c7-chase',label:'Bicycle Escape',jump:'c7-chase',save:'c7-bikes'},
  {id:'c7-lookout-attack',label:'Out at the Oak (the attack)',jump:'c7-lookout-attack',save:'c7-bikes'},{id:'c7-grab',label:'Jamie Grab',jump:'c7-grab',save:'c7-bikes'},
  {id:'c7-struggle',label:'Rescue Struggle',jump:'c7-struggle',save:'c7-bikes'},{id:'c7-taken',label:'Jamie Taken',jump:'c7-taken',save:'c7-bikes'},
  {id:'c7-gum-pickup',label:'Gum Pickup',jump:'c7-gum-pickup',save:'c7-bikes'},{id:'c7-after',label:'Later (the lookout at night)',jump:'c7-after'},
  {id:'c7-evidence',label:'Showing Reyes (his bike, his cap, the marks, the gum)',jump:'c7-evidence',save:'c7-after'},{id:'c7-mom',label:'Jamie’s Mother Asks You (her phone)',jump:'c7-mom',save:'c7-after'},
  {id:'c7-forgetting',label:'Forgetting (Reyes, the photos)',jump:'c7-forgetting',save:'c7-after'},{id:'c7-record',label:'Reyes’s Page, an Hour Later (the name in the paper)',jump:'c7-record',save:'c7-after'},{id:'c7-sams',label:'Sam’s Room, That Night',jump:'c7-sams'},
  {id:'c7-photo',label:'Final Photograph',jump:'c7-photo',save:'c7-sams'},{id:'c7-names',label:'The Names (the notebook)',jump:'c7-names',save:'c7-sams'},
  {id:'c7-window',label:'The Final Image',jump:'c7-window',save:'c7-sams'},{id:'chapter7-end',label:'Chapter Seven Ending (the end card)',jump:'chapter7-end'}],
 8:[{id:'chapter8',label:'Chapter Eight Start',chapter:8},{id:'c8-bikes',label:'The Four Bikes (Sam’s house)',jump:'c8-bikes'},{id:'c8-cover',label:'The Cover in the Road',jump:'c8-cover'},{id:'c8-reyes',label:'Reyes and the Empty Trunk',jump:'c8-reyes'},
  {id:'c8-field',label:'The Missing Junction (the plans)',jump:'c8-field'},{id:'c8-probe',label:'Finding MH-12',jump:'c8-probe'},{id:'c8-lift',label:'The Dig, the Vent, the Lift',jump:'c8-lift'},{id:'c8-shaft',label:'The Access Chamber',jump:'c8-shaft'},{id:'c8-barrier',label:'The Outer Barrier',jump:'c8-barrier'},
  {id:'c8-gallery',label:'The Construction Gallery',jump:'c8-gallery'},{id:'c8-stealth',label:'Something Is Searching (stealth)',jump:'c8-stealth'},{id:'c8-office',label:'Annie Rowan and 0417',jump:'c8-office'},{id:'c8-film',label:'The Observation Film',jump:'c8-film'},
  {id:'c8-corridor',label:'The Service Corridor',jump:'c8-corridor'},{id:'c8-danny',label:'Danny Whitcomb',jump:'c8-danny'},{id:'c8-bulkhead',label:'Through the Bulkhead',jump:'c8-bulkhead'},
  {id:'c8-wing',label:'The Flooded Wing',jump:'c8-wing'},{id:'c8-ruth',label:'Ruth Ann Carver’s Cell',jump:'c8-ruth'},{id:'c8-sam',label:'Sam',jump:'c8-sam'},{id:'c8-sam-door',label:'Sam’s Door (the valve, the crank)',jump:'c8-sam-door'},
  {id:'c8-retrieval',label:'The Retrieval Wing',jump:'c8-retrieval'},{id:'c8-jamie-door',label:'Jamie’s Door (the grille)',jump:'c8-jamie-door'},{id:'c8-shift',label:'The Corridor That Moves',jump:'c8-shift'},{id:'c8-made',label:'The Room It Made',jump:'c8-made'},
  {id:'c8-alex',label:'Alex',jump:'c8-alex'},{id:'c8-alex-free',label:'The Two Handles',jump:'c8-alex-free'},{id:'c8-reunion',label:'All Four of Them (the crew room)',jump:'c8-reunion'},{id:'c8-truth',label:'The Anchor Board',jump:'c8-truth'},
  {id:'c8-breach',label:'It Breaks Through',jump:'c8-breach'},{id:'c8-escape',label:'The Way Out',jump:'c8-escape'},{id:'c8-surface',label:'Oak Hollow from the Oak',jump:'c8-surface'},{id:'c8-hendersons',label:'The Hendersons’',jump:'c8-hendersons'},
  {id:'c8-staging',label:'The Works (the drawdown)',jump:'c8-staging'},{id:'c8-gates',label:'The Outer Routes',jump:'c8-gates'},{id:'c8-ports',label:'The Ports',jump:'c8-ports'},{id:'c8-plug',label:'The Plug',jump:'c8-plug'},
  {id:'c8-oak',label:'The Oak (Alex)',jump:'c8-oak'},{id:'c8-ride',label:'The Last Ride',jump:'c8-ride'},{id:'chapter8-end',label:'Chapter Eight Ending (the end card)',jump:'chapter8-end'}]};

export function createDevChapters(g){
 const {chapter,chapter2,chapter3,chapter4,chapter5,chapter6,chapter7,chapter8}=g,comp=chapter.companions,K=chapter.kit;
 // Every per-run state object emptied completely before the chapters' own reset()/fresh() refill them
 // (their fresh() functions refill a fixed list of keys; anything else would otherwise survive).
 function clearObject(o,keep=[]){if(!o)return;for(const k of Object.keys(o))if(!keep.includes(k))delete o[k];}
 // The grown-ups of every chapter (police, parents, neighbours, searchers): their walking speed, pose and
 // gesture blend carry over from one run to the next (the chapters place them again but do not reset those),
 // so the selector puts each back exactly as the page created them. The same for the night's free-ride state
 // (roam: where the bike is when you are not on the prologue's road), which keeps the last chapter's spot.
 const actors=[...new Set([...(chapter.adults||[]),...(chapter2.extra||[]),...Object.values(chapter3.people||{}),g.roam].filter(Boolean))];
 const copyOf=v=>ArrayBuffer.isView(v)||Array.isArray(v)?v.slice():v;
 const data=a=>Object.entries(Object.getOwnPropertyDescriptors(a)).filter(([,d])=>'value' in d&&typeof d.value!=='function');
 const born=actors.map(a=>new Map(data(a).map(([k,d])=>[k,copyOf(d.value)])));
 function rebirth(){actors.forEach((a,i)=>{const b=born[i];for(const [k] of data(a))if(!b.has(k))delete a[k];
  for(const [k,v] of b){if(ArrayBuffer.isView(v)&&ArrayBuffer.isView(a[k]))a[k].set(v);else a[k]=copyOf(v);}
  if(a.person?.group)a.person.group.visible=!!b.get('visible');});}
 // restart=false when the caller restarts the game itself next (the checkpoint scenes' jumpTo() does Start
 // over's resetState() + start() as its first step): one start(), so the pointer lock is requested once per click.
 function clear({restart=true}={}){
  g.audio()?.stopRecording?.();
  if(chapter8)clearObject(chapter8.C);if(chapter7)clearObject(chapter7.C);if(chapter6)clearObject(chapter6.C);if(chapter5)clearObject(chapter5.C);if(chapter4)clearObject(chapter4.C);clearObject(chapter3.C);clearObject(chapter2.C);
  // Chapter One's shared state: the dialogue queue array is kept as the same array (other code holds it).
  const q=K.S.queue;clearObject(K.S);K.S.queue=q;q.length=0;
  rebirth();
  for(const c of comp.all){c.script=null;c.route=null;c.poi=null;c.gaze=null;c.lookAt=null;c.lookPlayer=false;}
  if(restart)g.resetGame();// Start over: resetState() (every module's reset, chapters included) and a fresh start()
 }
 // Run the game's own update until the chapter hand-over happens (audio off meanwhile; nothing is drawn).
 function runUntil(done,max=240){const a=g.audio(),was=a?.enabled;a?.setEnabled(false);let t=0;const dt=1/30;
  try{while(t<max&&!done()){g.update(dt);t+=dt;}}finally{a?.reset?.();if(was)a.setEnabled(true);}
  if(!done())throw new Error('dev start: the hand-over did not happen');return t;}
 const phase=()=>K.S.phase,G=()=>g.game();
 // What the earlier beats left behind, from the natural playthrough (see the header).
 function applyHistory(n,{save=true,foot=true}={}){const H=HISTORY[n];if(!H)return;
  const put=(obj,vals,clock,stamps)=>{if(!obj||!vals)return;for(const [k,v] of Object.entries(vals)){if(v===null)delete obj[k];else obj[k]=JSON.parse(JSON.stringify(v));}
   for(const [k,off] of Object.entries(stamps||{}))obj[k]=off===null?undefined:(obj[clock]??0)-off;};
  put(K.S,H.chapter1,'t',H.chapter1Clock);put(chapter2.C,H.chapter2,'t',H.chapter2Clock);put(chapter3.C,H.chapter3,'t',H.chapter3Clock);
  if(foot&&H.foot){g.foot.owned=H.foot.owned;g.foot.on=H.foot.on;}
  if(H.lens!=null&&K.lens)K.lens.emissiveIntensity=H.lens;
  if(save&&H.save)K.checkpointTo(H.save,K.CHECKPOINT[H.save]);}
 function start(n,{history=true}={}){
  clear({restart:n<2});
  if(n===1){g.prologueApproach();g.press('KeyW');runUntil(()=>G().state==='arriving',60);g.release('KeyW');
   runUntil(()=>G().state==='stopped',60);
   // The finale: the call, the hint that it is time to go home, and the night fully fallen (before the
   // fade that would otherwise carry you home asleep, at 100 s).
   runUntil(()=>G().callDone&&G().finaleT>=G().callT+12&&g.skyMat.uniforms.night.value>=.9995,95);g.leave();}
  else if(n===2){g.jumpTo('clue');chapter.act('reflector');runUntil(()=>phase()==='c2-black');}
  else if(n===3){g.jumpTo('chapter2-end');runUntil(()=>phase()==='c3-black');}
  else if(n===4){g.jumpTo('chapter3-end');runUntil(()=>G().state==='ended');g.nextChapter();}
  else if(n===5){g.jumpTo('chapter4-end');runUntil(()=>G().state==='ended');g.nextChapter();}
  else if(n===6){g.jumpTo('chapter5-end');runUntil(()=>G().state==='ended');g.nextChapter();}
  else if(n===7){g.jumpTo('chapter6-end');runUntil(()=>G().state==='ended');g.nextChapter();}
  else if(n===8){g.jumpTo('chapter7-end');runUntil(()=>G().state==='ended');g.nextChapter();}
  else if(n!==0)throw new Error('dev start: no chapter '+n);
  if(history)applyHistory(n);
  return phase();}
 // ---- a scene (DEV_SCENES): see the header for how each kind is made canonical ---------------------------
 const SAVE_KEY='lastlight.chapter1';
 function applySceneHistory(key){const H=SCENE_HISTORY?.[key];if(!H)return false;const merge=(o,vals)=>{if(!o||!vals)return;for(const [k,v] of Object.entries(vals)){if(v===null)delete o[k];else o[k]=JSON.parse(JSON.stringify(v));}};
  if(H.chapter1Flags){K.S.flags||={};merge(K.S.flags,H.chapter1Flags);}merge(K.S,H.chapter1);if(H.chapter2Flags){chapter2.C.flags||={};merge(chapter2.C.flags,H.chapter2Flags);}
  if(H.foot){g.foot.owned=H.foot.owned;g.foot.on=H.foot.on;}if(H.save)K.checkpointTo(H.save,K.CHECKPOINT[H.save]);return true;}
 function startScene(n,id,{sceneHistory=true}={}){const sc=(DEV_SCENES[n]||[]).find(x=>x.id===id);if(!sc)throw new Error('dev scene: no scene '+n+'/'+id);
  if(sc.chapter!=null)return start(sc.chapter);
  if(sc.jump){clear({restart:false});
   // (the save a player has by then: the jump's own checkpoints, if it reaches any, come after it)
   if(sc.save)K.checkpointTo(sc.save,K.CHECKPOINT[sc.save]);
   g.jumpTo(sc.jump);if(sc.act)chapter.act(sc.act);if(n>=2)applyHistory(n,{save:false,foot:false});if(sceneHistory)applySceneHistory(n+'/'+id);return phase();}
  clear();// (Start over: a new game, on the street)
  if(sc.warp!=null)g.prologueAt(sc.warp);
  else if(sc.ride!=null){g.prologueAt(528);g.press('KeyW');try{runUntil(()=>G().distance>=sc.ride,120);}finally{g.release('KeyW');}}
  else if(sc.approach)g.prologueApproach();
  return G().state;}
 const sceneSave=()=>{try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'null')?.section??null;}catch{return null;}};

 // ---- a snapshot of everything that makes up the game's state, for comparing two ways of arriving ---------
 const r=v=>Number.isFinite(v)?Math.round(v*1000)/1000:v;
 const pos=o=>o?{x:r(o.x),z:r(o.z)}:null;
 // Plain data only: numbers rounded, objects that are scene objects or people reduced to what they are.
 function plain(v,d=0){if(v==null||typeof v==='boolean'||typeof v==='string')return v;if(typeof v==='number')return r(v);if(typeof v==='function')return undefined;
  if(v.isVector3||(typeof v.x==='number'&&typeof v.z==='number'&&Object.keys(v).length<=4))return pos(v);if(v.isObject3D)return {object:v.name||v.type,visible:v.visible};
  if(typeof v.key==='string'&&'px' in v)return 'companion:'+v.key;if(v instanceof Set)return [...v].sort();if(v instanceof Map)return [...v.keys()].sort();
  if(Array.isArray(v))return d>1?{length:v.length}:v.map(x=>plain(x,d+1));if(d>2)return '{…}';const o={};for(const k of Object.keys(v)){const p=plain(v[k],d+1);if(p!==undefined)o[k]=p;}return o;}
 const person=a=>{if(!a)return null;const v=!!(a.visible??a.person?.group?.visible);return v?{visible:true,x:r(a.x),z:r(a.z),mode:a.mode||null,gest:a.next??a.gesture??null}:{visible:false};};
 const car=c=>c?{active:c.active,parked:!!c.parked,lights:!!c.lights,siren:!!c.siren,headlights:!!c.headlights,x:c.active?r(c.x):null,z:c.active?r(c.z):null}:null;
 function snapshot(){const G=g.game(),S=K.S,el=id=>g.$(id),body=document.body?.classList;
  return {
   game:G,
   player:{roam:{x:r(g.roam.x),z:r(g.roam.z),a:r(g.roam.a),lock:g.roam.lock,walkLock:g.roam.walkLock,brake:r(g.roam.brake)},walk:G.state==='c1-walk'?g.walk():null,
    foot:{owned:g.foot.owned,on:g.foot.on,stamina:r(g.foot.stamina),crouch:r(g.foot.crouch),height:r(g.foot.height),exhausted:g.foot.exhausted,drain:g.foot.drain,light:!!g.foot.light.parent}},
   chapter1:{...plain(Object.fromEntries(Object.entries(S).filter(([k])=>!['queue','line','pose'].includes(k)))),queue:S.queue.length,line:S.line?.text||null,pose:!!S.pose,
    api:{night:chapter.night,deep:r(chapter.deep),day:chapter.day,pose:!!chapter.pose},state:plain(chapter.state)},
   chapter2:{C:plain(chapter2.C),day:chapter2.day,state:plain(chapter2.state),found:chapter2.found.group.visible,tape:chapter2.tape.visible,flyers:chapter2.flyers.visible,
    extra:chapter2.extra.map(person),beams:chapter2.beams.map(b=>({on:!!b.on,visible:!!b.beam?.visible}))},
   chapter3:{C:plain(chapter3.C),state:plain(chapter3.state),old:chapter3.old.group.visible,evidence:chapter3.evidence.visible,phone:chapter3.phone.visible,figure:chapter3.figure.group.visible,amb:plain(chapter3.amb)},
   chapter4:chapter4?{C:plain(chapter4.C),state:(st=>{if(st?.photos)delete st.photos.rendered;return st;})(plain(chapter4.state))}:null,// (which of Alex's pictures are already rendered is a cache, not state)
   chapter5:chapter5?{C:plain(chapter5.C),state:plain(chapter5.state)}:null,
   chapter6:chapter6?{C:plain(chapter6.C),state:plain(chapter6.state)}:null,
   chapter7:chapter7?{C:plain(chapter7.C),state:plain(chapter7.state)}:null,
   companions:comp.all.map(c=>({key:c.key,active:c.active,mode:c.mode,follow:c.follow||null,script:!!c.script,visible:!!c.person?.group?.visible,bikeVisible:!!c.bike?.group?.visible,
    p:pos({x:c.px,z:c.pz}),b:pos({x:c.bx,z:c.bz}),pa:r(c.pa),ba:r(c.ba),speed:r(c.speed),flash:!!c.flash,lookAt:!!c.lookAt,lookPlayer:!!c.lookPlayer,hidden:!!c.hidden,poi:!!c.poi})),
   people:{officer:person(chapter.officer),officer2:person(chapter.officer2),dad:person(chapter.dad),mom:person(chapter.mom),neighbor:person(chapter.neighbor),adults:(chapter.adults||[]).map(person),
    neighbours3:Object.fromEntries(Object.entries(chapter3.people||{}).map(([k,a])=>[k,person(a)]))},
   police:{carA:car(chapter.carA),carB:car(chapter.carB),attached:!!chapter.police?.attached},
   props:{clue:chapter.clue?.visible,track:chapter.track?.visible,glint:K.glint?.visible,flies:K.flies?.visible,torch:K.torch?.visible,beamJ:K.beamJ?.visible,beamO:K.beamO?.visible,lens:r(K.lens?.emissiveIntensity)},
   world:{sky:{dusk:r(g.skyMat.uniforms.dusk.value),night:r(g.skyMat.uniforms.night.value),day:r(g.skyMat.uniforms.day.value)},sun:r(g.sunlight.intensity),shadows:g.sunlight.castShadow,hemi:r(g.hemi.intensity),
    alexWindow:r(g.world.alexWindow?.emissiveIntensity),doors:Object.fromEntries(Object.entries(g.world.doors||{}).map(([k,d])=>[k,r(d.open??0)])),garages:Object.fromEntries(Object.entries(g.world.garages||{}).map(([k,d])=>[k,r(d.open??0)]))},
   prologue:{friends:g.friends.list.map(f=>({key:f.key,mode:f.mode,inside:!!f.inside,gone:!!f.gone,visible:!!f.person?.group?.visible})),ambient:plain(g.ambient.state),ending:plain(g.ending.state),interact:{pose:g.interact.pose?.id??null,used:g.interact.used}},
   memory:{state:plain(g.memory.state),active:g.memory.active},
   body:{tension:plain(g.tension.state),captions:{mode:g.captionTone.state.mode,source:g.captionTone.state.source}},
   audio:{enabled:!!g.audio()?.enabled,phone:g.audio()?.phone?{i:g.audio().phone.i}:null},
   ui:{date:el('date')?.innerHTML,objective:el('objective')?.textContent||'',objectiveOn:!!el('objective')?.classList.contains('on'),card:!!el('chapter-card')?.classList.contains('on'),
    ending:!!el('ending')?.hidden,fade:r(+(el('fade')?.style.opacity||0)),warm:!!el('fade')?.classList.contains('warm'),
    body:['riding','night1','remembering'].filter(c=>body?.contains(c)),prompt:g.ui.promptText||''},
   save:(()=>{try{return JSON.parse(localStorage.getItem('lastlight.chapter1')||'null')?.section??null;}catch{return null;}})()};}
 return {start,startScene,snapshot,clear,applyHistory,sceneSave,CHAPTERS:DEV_CHAPTERS,SCENES:DEV_SCENES};
}
