// Where things are. Street-coordinate layout of the neighborhood, kept apart from
// the builders so it can be read (and tuned) at a glance. d = meters along the ride,
// lat = meters to the right of the street's center line.

// Street names on every sign. The ride is on Oak Hollow Drive; the old oak waits at its end.
export const STREETS={main:'OAK HOLLOW DR',mainFull:'Oak Hollow Drive'};
// Both cross streets leave from straight stretches of the ride and continue out of sight.
// Briarwood curves to the right a little past its first houses, where the creek (a concrete
// storm channel in a strip of trees) passes under it; Alex lives just around that curve.
// lots: side-street lot centers (default every 26 m from 46); creek: the drainage strip.
export const JUNCTIONS=[
 {d:595,side:1,name:'BRIARWOOD LN',full:'Briarwood Lane',half:4.2,length:250,bend:.9,bendAt:62,bendLen:50,rise:2.4,fall:1.8,corner:6.5,
  lots:[46,70,127,154,180,206],fullTo:160,farFrom:150,curbCars:[[44,-1],[150,-1]],creek:{u:100,half:12.6,depth:1.7,end:29.5}},
 {d:870,side:-1,name:'SUMMERFIELD RD',full:'Summerfield Road',half:4.2,length:250,bend:-.34,bendAt:122,rise:2.1,fall:1.6,corner:6.5},
];
// The main street starts well behind the first frame and ends in a cul-de-sac.
export const ROAD_START=-430;
export const BULB={d:1142,r:11};
export const ROAD_END=1140;
export const LOOKOUT={stop:{d:1136.5,lat:-.9},fenceD:1173,bounds:{d0:1121,d1:1171.2,l0:-12.2,l1:12.2},swing:{d:1161.5,lat:5.2},bench:{d:1166,lat:-4.2},oak:{d:1162,lat:7.6},chalk:{d:1149.5,lat:-1.4}};
// Street cross-section, measured from the center line.
export const SECTION={curbFace:4.7,curbBack:5.0,walk0:6.35,walk1:7.85,lawnEnd:36,rearFence:33.5};
// First-row lots: one every LOT_SPACING meters on each side, from LOT_FIRST to LOT_LAST.
export const LOT_FIRST=-427,LOT_LAST=1116,LOT_SPACING=29;
// Friends' homes on Oak Hollow and the two scripted neighbors. o = explicit house options.
// Alex turns off first, onto Briarwood; Jamie and Sam live farther along, so they go home later.
// sneak: the ground-floor bedroom window that opens later that night.
export const FRIEND_HOMES={
 jamie:{dc:791,side:1,o:{style:'colonial',garageSide:'near',dynamicDoor:true,interior:'foyer',porch:'stoop',setback:18.4,w:10.6,depth:9.7,gw:4,garage:true,fence:false,door:0x7a2f2a,wall:0xc6b28c,shutters:0x3a4a5a,sneak:'back'}},
 sam:{dc:994,side:-1,o:{style:'ranch',roof:'side',garageSide:'far',dynamicGarage:true,interior:'garage',porch:'stoop',setback:19,w:12.6,depth:9.7,gw:4.4,garage:true,fence:false,wall:0x9ea9a2,sneak:'back',sideDoor:true}},
 car:{dc:522,side:-1,o:{style:'colonial',garageSide:'far',dynamicGarage:true,interior:'garage-car',gw:6.4,garage:true,porch:'porch',wall:0xb9ab92}},
 hoop:{dc:153,side:-1,o:{style:'ranch',garageSide:'near',gw:6.4,garage:true,porch:'stoop',wall:0xa9b2b6}},
};
// Alex's house, just around Briarwood's curve past the creek. The front door and the garage
// both open for real; the garage keeps an empty hook where a bike would hang.
export const SIDE_HOMES={
 alex:{junction:0,u:127,side:1,o:{style:'colonial',garageSide:'near',dynamicDoor:true,dynamicGarage:true,interior:'foyer',garageBike:'empty',porch:'porch',porchW:5.2,setback:18.4,w:11.4,gw:4,garage:true,fence:false,wall:0xd4cfc1,door:0x2f3d55,shutters:0x3a4a5a,alexWindow:true}},
};
// Things that must stay clear of scattered props and trees (street coordinates).
export const KEEP_CLEAR=[
 {d0:1118,d1:1180,l0:-16,l1:16}, // the cul-de-sac and the lookout
];
