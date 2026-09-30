// Where things are. Street-coordinate layout of the neighborhood, kept apart from
// the builders so it can be read (and tuned) at a glance. d = meters along the ride,
// lat = meters to the right of the street's center line.

// Street names on every sign. The ride is on Oak Hollow Drive; the old oak waits at its end.
export const STREETS={main:'OAK HOLLOW DR',mainFull:'Oak Hollow Drive'};
// Both cross streets leave from straight stretches of the ride and continue out of sight.
export const JUNCTIONS=[
 {d:595,side:1,name:'BRIARWOOD LN',full:'Briarwood Lane',half:4.2,length:250,bend:.36,bendAt:112,rise:2.4,fall:1.8,corner:6.5},
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
// Friends' homes and the two scripted neighbors. o = explicit house options.
export const FRIEND_HOMES={
 jamie:{dc:410,side:1,o:{style:'colonial',garageSide:'near',dynamicDoor:true,interior:'foyer',porch:'stoop',setback:18.4,w:10.6,gw:4,garage:true,fence:false,door:0x7a2f2a,wall:0xc6b28c,shutters:0x3a4a5a}},
 sam:{dc:704,side:-1,o:{style:'ranch',roof:'side',garageSide:'near',dynamicGarage:true,interior:'garage',porch:'stoop',setback:19,w:12.6,gw:4.4,garage:true,fence:false,wall:0x9ea9a2}},
 alex:{dc:994,side:1,o:{style:'colonial',garageSide:'near',dynamicDoor:true,interior:'foyer',porch:'porch',porchW:5.2,setback:19.2,w:11.4,gw:4,garage:true,fence:false,wall:0xd4cfc1,door:0x2f3d55,shutters:0x3a4a5a,alexWindow:true}},
 car:{dc:522,side:-1,o:{style:'colonial',garageSide:'far',dynamicGarage:true,interior:'garage-car',gw:6.4,garage:true,porch:'porch',wall:0xb9ab92}},
 hoop:{dc:153,side:-1,o:{style:'ranch',garageSide:'near',gw:6.4,garage:true,porch:'stoop',wall:0xa9b2b6}},
};
// Things that must stay clear of scattered props and trees (street coordinates).
export const KEEP_CLEAR=[
 {d0:1118,d1:1180,l0:-16,l1:16}, // the cul-de-sac and the lookout
];
