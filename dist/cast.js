// Who everyone is. Each character's look, build, bicycle and riding manner in one
// place, so they read as different people rather than recolored copies. Bone
// lengths are shared (rig.js BODY) so every pose fits every bike; builds vary in
// silhouette, faces, hair, clothes and in how each of them rides.
//
// face: jaw (lower-face width), cheek (fullness), eyeGap, eyeY, browTilt (+ raised,
//   - furrowed), nose ('button' | 'straight' | 'broad'), mouth ('smile' | 'flat' | 'grin'),
//   ears (size), skin, lips, iris.
// hair: style ('cap' | 'messy' | 'swept' | 'shaggy' | 'cropped' | 'ponytail'), color, cap color.
// build: bulk (limb and torso girth), shoulders (torso width), head (head size), posture
//   (extra forward lean on the bike), hunch (head drop).
// ride: cadence (pedal rate factor), phase (crank offset), sway (upper-body sway when
//   pushing hard), stand (tendency to stand on the pedals), weave (steering drift),
//   look (how often they glance around), reaction (seconds before answering a surge).
// bike: style ('bmx' | 'mtb' | 'cruiser' | 'road-kid'), frame, bars ('riser' | 'flat' |
//   'swept' | 'bmx'), wheelR, saddle, grips, tire, extras.
export const CAST={
 jamie:{name:'JAMIE',
  face:{jaw:.95,cheek:1.06,eyeGap:.036,eyeY:.012,browTilt:.12,nose:'button',mouth:'grin',ears:1.05,skin:0xd6a57f,lips:0xb8765e,iris:0x3a2a1c},
  hair:{style:'cap',color:0x3b2a20,cap:0x2d4a7a},
  build:{bulk:1.08,shoulders:1.06,head:1.02,posture:.04,hunch:0},
  clothes:{shirt:0xc8743f,trim:null,sleeves:'short',shorts:0x6b6250,socks:0xf0ece2,shoes:0xe9e4d6,sole:0xf6f3ea},
  bike:{style:'bmx',frame:0xb2553a,bars:'bmx',wheelR:.29,saddle:0x262626,grips:0x1c1c1e,tire:0x2b2c2e,extras:['pegs','pad']},
  ride:{cadence:1.08,phase:.4,sway:1.15,stand:1.3,weave:1.2,look:1.2,reaction:.45}},
 sam:{name:'SAM',
  face:{jaw:.86,cheek:.94,eyeGap:.034,eyeY:.016,browTilt:-.02,nose:'straight',mouth:'flat',ears:.95,skin:0xc4906a,lips:0xa0644a,iris:0x2a1c12},
  hair:{style:'shaggy',color:0x2a1c14},
  build:{bulk:.9,shoulders:.94,head:.97,posture:.1,hunch:.06},
  clothes:{shirt:0x6d9a8a,trim:0xe9e1cf,sleeves:'short',shorts:0x3f4a5c,socks:0x9aa0a8,shoes:0x8a8f96,sole:0xe8e6e0},
  bike:{style:'mtb',frame:0x4d7f8f,bars:'flat',wheelR:.32,saddle:0x1e1e20,grips:0x303032,tire:0x27282a,extras:['bottle','knobby']},
  ride:{cadence:.94,phase:2.1,sway:.8,stand:.7,weave:.8,look:.8,reaction:.8}},
 alex:{name:'ALEX',
  face:{jaw:.9,cheek:1,eyeGap:.038,eyeY:.01,browTilt:.05,nose:'button',mouth:'smile',ears:1,skin:0xe0b595,lips:0xc07c68,iris:0x4a5a3a},
  hair:{style:'swept',color:0x7a5230},
  build:{bulk:1,shoulders:1,head:1,posture:0,hunch:.02},
  clothes:{shirt:0xd4b25a,trim:0xf0e6c8,sleeves:'short',collar:true,shorts:0x5d6a4a,socks:0xf0ece2,shoes:0x3d4450,sole:0xe0ddd6},
  bike:{style:'cruiser',frame:0x8a8f3f,bars:'swept',wheelR:.31,saddle:0x5a3a28,grips:0xd8cfb8,tire:0x2b2c2e,extras:['rack','bell','rear-reflector']},
  ride:{cadence:1,phase:4.2,sway:.95,stand:1,weave:1,look:1,reaction:.6}},
 player:{name:'YOU',
  face:{jaw:.92,cheek:1,eyeGap:.036,eyeY:.012,browTilt:0,nose:'button',mouth:'flat',ears:1,skin:0xd9a883,lips:0xb87a62,iris:0x3a3020},
  hair:{style:'cropped',color:0x5a4030},
  build:{bulk:1,shoulders:1,head:1,posture:-.16,hunch:0},
  clothes:{shirt:0x7f93ab,trim:0x5d6f86,sleeves:'short',shorts:0x4a5a78,socks:0xf0ece2,shoes:0xdcd7cc,sole:0xf4f1ea},
  bike:{style:'road-kid',frame:0x5f8f93,bars:'riser',wheelR:.31,saddle:0x262626,grips:0x303032,tire:0x2b2c2e,extras:['bell','reflector']},
  ride:{cadence:1,phase:0,sway:1,stand:1,weave:0,look:0,reaction:0}},
 mom:{name:'MOM',scale:1.13,
  face:{jaw:.84,cheek:.96,eyeGap:.036,eyeY:.014,browTilt:.08,nose:'straight',mouth:'smile',ears:.95,skin:0xd6a57f,lips:0xb06a5c,iris:0x3a2a1c},
  hair:{style:'ponytail',color:0x6b4a2a},
  build:{bulk:.95,shoulders:.98,head:.95,posture:0,hunch:0},
  clothes:{shirt:0x9c3b3b,trim:null,sleeves:'short',pants:0x3d4a66,socks:0x3d4a66,shoes:0x2f2f33,sole:0x5a5a58}},
 kid:{name:'KID',
  face:{jaw:.97,cheek:1.08,eyeGap:.035,eyeY:.012,browTilt:.1,nose:'broad',mouth:'smile',ears:1.05,skin:0xa5724f,lips:0x7a4a38,iris:0x1a120c},
  hair:{style:'cropped',color:0x1f1a17},
  build:{bulk:.98,shoulders:.98,head:1.02,posture:0,hunch:0},
  clothes:{shirt:0xe6e2d6,trim:0xc04a3a,sleeves:'short',shorts:0x2e4a7a,socks:0xf0ece2,shoes:0xdad6cc,sole:0xf0eee8}},
};
// Where each friend rides relative to you, and when each goes home (distance along the street).
// Alex turns off first, onto Briarwood Lane; Jamie and Sam ride on and go home later.
export const FORMATION={
 jamie:{leaveAt:696,keys:[[0,11,1.7],[8,11,1.7],[16,24,1.35],[42,30,1.2],[85,14,1.6],[300,14,1.8],[470,14,1.6],[525,17,.7],[606,17,.7],[640,14,1.7],[681,14,1.8],[696,14,1.9]]},
 sam:{leaveAt:900,keys:[[0,17,-1.4],[140,15,-1.4],[165,3.3,-2.05],[205,3.3,-2.05],[238,11,-1.6],[330,8,-1.3],[468,3.6,-2.05],[522,3.6,-2.05],[560,6,-1.8],[650,6,-1.8],[700,9,-1.5],[790,4,-2.0],[850,4,-2.0],[884,12,-1.6],[900,12,-1.6]]},
 alex:{leaveAt:572,keys:[[0,7,2.5],[240,7,2.4],[262,2.9,1.95],[292,2.9,1.95],[322,8,2.2],[470,8,2.2],[505,5,2.2],[540,8,2.4],[572,8.5,2.6]]},
};
