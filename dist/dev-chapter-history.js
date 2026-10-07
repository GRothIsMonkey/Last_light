// GENERATED — do not edit by hand. TEMPORARY (private playtest build only).
// Recorded by `ONLY=dev-record node tests/verify.mjs` from a natural playthrough: what the earlier beats leave
// in the shared story state at each chapter's real beginning that the checkpoint scenes do not set.
// chapterNClock values are seconds before the chapter clock at that moment (re-based when applied).
export const HISTORY={
 "2": {
  "chapter1": {
   "flags": {
    "moved": true,
    "night": true,
    "braked": true,
    "talked": true,
    "approaching": false,
    "dadJoining": true,
    "alexDone": true,
    "dadBack": 0,
    "jamieTapped": true,
    "jamieWindow": true,
    "jamieClosing": true,
    "samSignal": true,
    "samWindow": false,
    "samOut": true,
    "sideDoorOpen": true,
    "sideDoorClosing": true,
    "oakTalk": true,
    "patrol": true,
    "r1": true,
    "r2": true,
    "r3": true,
    "cops": true,
    "aimReady": true,
    "jamieSearching": true,
    "nervous": true,
    "pointed": true
   },
   "titleT": -2,
   "siren": {
    "mode": "down",
    "pitch": 1,
    "lastDist": 27.068,
    "muffle": 0,
    "active": false,
    "vr": 0
   },
   "vLock": 15,
   "committed": true,
   "clueT": 20.9,
   "brakeT": -0.033,
   "cruiserSeen": true,
   "samTap": 1,
   "searchT": 77.8,
   "dpRate": -0.177,
   "approachT": 36.267,
   "talkOrigin": {
    "x": 200.065,
    "z": -575.931
   }
  },
  "chapter1Clock": {
   "sirenOff": 1084.966,
   "bellAt": 8.066,
   "dadCall": 86.146,
   "samWait": 474.6
  },
  "save": "investigation"
 },
 "3": {
  "chapter1": {
   "flags": {
    "moved": true,
    "night": true,
    "braked": true,
    "talked": true,
    "approaching": false,
    "dadJoining": true,
    "alexDone": true,
    "dadBack": 0,
    "jamieTapped": true,
    "jamieWindow": true,
    "jamieClosing": true,
    "samSignal": true,
    "samWindow": false,
    "samOut": true,
    "sideDoorOpen": true,
    "sideDoorClosing": true,
    "oakTalk": true,
    "patrol": true,
    "r1": true,
    "r2": true,
    "r3": true,
    "cops": true,
    "aimReady": true,
    "jamieSearching": true,
    "nervous": true,
    "pointed": true
   },
   "titleT": -2,
   "siren": {
    "mode": "down",
    "pitch": 1,
    "lastDist": 15.047,
    "muffle": 0,
    "active": false,
    "vr": 0
   },
   "vLock": 15,
   "committed": true,
   "alexScene": true,
   "jamieIn": true,
   "samIn": true,
   "clueT": 20.9,
   "endT": 4.233,
   "lastDp": 594.877,
   "brakeT": -0.033,
   "cruiserSeen": true,
   "samTap": 1,
   "searchT": 77.8,
   "approachT": 36.267,
   "talkOrigin": {
    "x": 200.065,
    "z": -575.931
   }
  },
  "chapter1Clock": {
   "sirenOff": 1645.033,
   "bellAt": 568.133,
   "dadCall": 646.213,
   "samWait": 1034.667
  },
  "chapter2": {
   "flags": {
    "saidMud": true,
    "path": true,
    "poi-mud": true,
    "saidWeeds": true,
    "found": true,
    "poi-weeds": true,
    "poi-scrape": true,
    "inspected": true,
    "bell": true,
    "called": true,
    "copThere": true,
    "told": true,
    "reported": true,
    "dadThere": true,
    "dadTalk": true,
    "plan": true,
    "leaving": true,
    "dateCard": true,
    "oakTalk": true,
    "corner": true
   },
   "card": 13.267,
   "dawn": 3.033,
   "endT": 4,
   "lingerT": 10.6,
   "rememberWait": 5.867,
   "discT": 8.233,
   "copT": 43.933,
   "homeFrom": {
    "state": "c1-walk",
    "x": 184.351,
    "z": -522.89,
    "a": -2.877,
    "pitch": -0.4,
    "bike": {
     "x": 100.998,
     "z": -555.061,
     "a": 1.184,
     "omega": 0,
     "lock": false,
     "brake": 0,
     "walkLock": false,
     "steer": null,
     "fadeIn": 0
    },
    "speed": 0,
    "riding": false,
    "walking": true,
    "pushing": false,
    "eye": {
     "x": 101.005,
     "z": -555.115
    },
    "clock": 1700.3,
    "manualLook": false,
    "lookInputAt": 330.067,
    "look": 0,
    "captionBusy": true
   }
  },
  "chapter2Clock": {
   "bellAt": 475.033,
   "warned": 381.767,
   "callAt": 460.733,
   "arrive": 417.9,
   "homeAt": 350.667
  },
  "foot": {
   "owned": true,
   "on": true
  },
  "lens": 0.025,
  "save": "chapter2-end"
 }
};
export const TIMESTAMPS={"chapter1":["sirenOff","bellAt","dadCall","samWait"],"chapter2":["bellAt","warned","arrive","callAt","homeAt"]};
// What the natural playthrough had at each DEV scene's moment that the scene's checkpoint start does not set
// (Chapter One's and Two's story flags, who had joined you, the flashlight, the Continue save).
export const SCENE_HISTORY={
 "0/alex-departure": {},
 "0/jamie-departure": {},
 "0/sam-departure": {},
 "1/title": {
  "chapter1Flags": {
   "moved": true,
   "braked": true
  },
  "chapter1": {
   "alexScene": false,
   "committed": true
  }
 },
 "1/alex-house": {
  "chapter1Flags": {
   "moved": true,
   "braked": true
  },
  "chapter1": {
   "committed": true
  },
  "save": "alex-house"
 },
 "1/jamie": {
  "chapter1Flags": {
   "moved": true,
   "braked": true,
   "approaching": false,
   "dadJoining": true,
   "dadBack": 0
  },
  "chapter1": {
   "committed": true
  },
  "save": "jamie"
 },
 "1/sam": {
  "chapter1Flags": {
   "moved": true,
   "braked": true,
   "approaching": false,
   "dadJoining": true,
   "dadBack": 0,
   "jamieWindow": true,
   "jamieClosing": true
  },
  "chapter1": {
   "committed": true
  },
  "save": "sam"
 },
 "1/oak": {
  "chapter1Flags": {
   "moved": true,
   "braked": true,
   "approaching": false,
   "dadJoining": true,
   "dadBack": 0,
   "jamieWindow": true,
   "jamieClosing": true,
   "samWindow": false,
   "sideDoorOpen": true,
   "sideDoorClosing": true
  },
  "chapter1": {
   "committed": true
  },
  "save": "oak"
 },
 "1/retrace": {
  "chapter1Flags": {
   "moved": true,
   "braked": true,
   "approaching": false,
   "dadJoining": true,
   "dadBack": 0,
   "jamieWindow": true,
   "jamieClosing": true,
   "samWindow": false,
   "sideDoorOpen": true,
   "sideDoorClosing": true
  },
  "chapter1": {
   "committed": true
  },
  "save": "retrace"
 },
 "1/investigation": {
  "chapter1Flags": {
   "moved": true,
   "braked": true,
   "approaching": false,
   "dadJoining": true,
   "dadBack": 0,
   "jamieWindow": true,
   "jamieClosing": true,
   "samWindow": false,
   "sideDoorOpen": true,
   "sideDoorClosing": true,
   "nervous": true,
   "pointed": true
  },
  "chapter1": {
   "committed": true
  },
  "save": "investigation"
 },
 "2/chapter2-start": {
  "chapter1": {
   "jamieIn": true,
   "samIn": true,
   "alexScene": true
  },
  "save": "chapter2-start"
 },
 "2/easement": {
  "chapter1": {
   "jamieIn": true,
   "samIn": true,
   "alexScene": true
  },
  "save": "chapter2-start"
 },
 "2/alex-bike": {
  "chapter1": {
   "jamieIn": true,
   "samIn": true,
   "alexScene": true
  },
  "chapter2Flags": {
   "saidMud": true,
   "path": true,
   "poi-mud": true,
   "saidWeeds": true
  },
  "save": "bike-found"
 },
 "2/second-bell": {
  "chapter1": {
   "jamieIn": true,
   "samIn": true,
   "alexScene": true
  },
  "chapter2Flags": {
   "saidMud": true,
   "path": true,
   "poi-mud": true,
   "saidWeeds": true,
   "poi-weeds": true,
   "poi-scrape": true
  },
  "save": "bike-found"
 },
 "2/police-find": {
  "chapter1": {
   "jamieIn": true,
   "samIn": true,
   "alexScene": true
  },
  "chapter2Flags": {
   "saidMud": true,
   "path": true,
   "poi-mud": true,
   "saidWeeds": true,
   "poi-weeds": true,
   "poi-scrape": true
  },
  "save": "police-arrival"
 },
 "2/morning": {
  "chapter1": {
   "jamieIn": true,
   "samIn": true,
   "alexScene": true
  },
  "chapter2Flags": {
   "saidMud": true,
   "path": true,
   "poi-mud": true,
   "saidWeeds": true,
   "found": true,
   "poi-weeds": true,
   "poi-scrape": true,
   "inspected": true,
   "bell": true,
   "called": true,
   "copThere": true,
   "told": true,
   "reported": true,
   "dadThere": true,
   "dadTalk": true,
   "plan": true,
   "leaving": true,
   "dateCard": true
  },
  "foot": {
   "owned": true,
   "on": true
  },
  "save": "morning"
 },
 "2/memory-start": {
  "chapter1": {
   "jamieIn": true,
   "samIn": true,
   "alexScene": true
  },
  "chapter2Flags": {
   "saidMud": true,
   "path": true,
   "poi-mud": true,
   "saidWeeds": true,
   "found": true,
   "poi-weeds": true,
   "poi-scrape": true,
   "inspected": true,
   "bell": true,
   "called": true,
   "copThere": true,
   "told": true,
   "reported": true,
   "dadThere": true,
   "dadTalk": true,
   "plan": true,
   "leaving": true,
   "dateCard": true
  },
  "foot": {
   "owned": true,
   "on": true
  },
  "save": "morning-oak"
 },
 "2/memory-reconstruction": {
  "chapter1": {
   "jamieIn": true,
   "samIn": true,
   "alexScene": true
  },
  "chapter2Flags": {
   "saidMud": true,
   "path": true,
   "poi-mud": true,
   "saidWeeds": true,
   "found": true,
   "poi-weeds": true,
   "poi-scrape": true,
   "inspected": true,
   "bell": true,
   "called": true,
   "copThere": true,
   "told": true,
   "reported": true,
   "dadThere": true,
   "dadTalk": true,
   "plan": true,
   "leaving": true,
   "dateCard": true
  },
  "foot": {
   "owned": true,
   "on": true
  },
  "save": "briarwood-memory"
 },
 "3/c3-alex-house": {
  "foot": {
   "owned": true,
   "on": true
  },
  "save": "c3-alex-house"
 },
 "3/alex-bedroom": {
  "foot": {
   "owned": true,
   "on": true
  },
  "save": "alex-bedroom"
 },
 "3/recording": {
  "foot": {
   "owned": true,
   "on": true
  },
  "save": "phone-recording"
 },
 "3/neighbors": {
  "foot": {
   "owned": true,
   "on": true
  },
  "save": "neighbor-investigation"
 },
 "3/c3-road-day": {
  "foot": {
   "owned": true,
   "on": true
  },
  "save": "neighbor-investigation"
 },
 "3/night-start": {
  "save": "night-start"
 },
 "3/c3-road-night": {
  "save": "c3-road-night"
 },
 "3/c3-forest-deep": {
  "save": "c3-road-night"
 },
 "3/c3-tunnel-entrance": {
  "save": "c3-tunnel-entrance"
 },
 "3/c3-tunnel-deep": {
  "save": "c3-tunnel-deep"
 },
 "3/c3-alex-item": {
  "save": "c3-tunnel-deep"
 },
 "3/c3-old-bike": {
  "save": "c3-old-bike"
 },
 "3/c3-bike-gone": {
  "save": "c3-old-bike"
 },
 "3/c3-figure-reveal": {
  "save": "c3-alex-lure"
 },
 "3/c3-follow-alex": {
  "save": "c3-alex-lure"
 },
 "3/c3-second-sighting": {
  "save": "c3-alex-lure"
 },
 "3/c3-creature-reveal": {
  "save": "c3-alex-lure"
 },
 "3/c3-creature-chase-start": {
  "save": "c3-creature-reveal"
 },
 "3/c3-creature-far": {
  "save": "c3-creature-chase"
 },
 "3/c3-creature-side": {
  "save": "c3-creature-chase"
 },
 "3/c3-bike-block": {
  "save": "c3-creature-chase"
 },
 "3/c3-creature-near": {
  "save": "c3-creature-chase"
 },
 "3/c3-creature-barrier": {
  "save": "c3-creature-chase"
 },
 "3/c3-tunnel-exit": {
  "save": "c3-creature-chase"
 },
 "3/c3-bike-remount": {
  "save": "c3-creature-chase"
 },
 "3/c3-road-escape": {
  "save": "c3-road-escape"
 },
 "3/c3-final-lure": {
  "save": "c3-road-escape"
 },
 "3/chapter3-end": {
  "save": "chapter3-end"
 }
};
