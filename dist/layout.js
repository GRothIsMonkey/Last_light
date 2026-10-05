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
  lots:[46,70,127,154,180,206],fullTo:160,farFrom:160,curbCars:[[44,-1],[150,-1]],creek:{u:100,half:12.6,depth:1.7,end:29.5}},
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
 alex:{junction:0,u:127,side:1,o:{style:'colonial',garageSide:'near',dynamicDoor:true,dynamicGarage:true,interior:'foyer',garageBike:'empty',porch:'porch',porchW:5.2,setback:18.4,w:11.4,gw:4,garage:true,fence:false,wall:0xd4cfc1,door:0x2f3d55,shutters:0x3a4a5a,alexWindow:true,garageRoof:'front',garageRise:.55}},// (a low garage roof: from his side window you see over it to the trees and the creek)
};
// Chapter Two: behind the creek's back fence. Through the gap the stormwater comes out of its pipe into
// an open concrete channel in a wooded utility easement between the back yards, and runs ~30 m to a big
// box culvert set into a wooded rise, where it goes under the neighborhood. Its own straight frame:
// s along the corridor from the fence gap, t across it (+t to the right looking in). turn: how far
// the corridor angles off Briarwood's cross direction (it bends toward the deeper part of the woods).
export const EASEMENT={gap:{u:100.2,v:31.5},turn:-.337,len:47,half:15,
 channel:{s0:3.5,s1:33,bottom:.9,top:2.6,depth0:1.2,depth1:1.55},
 path:{offset:-4.3,half:.85},
 culvert:{s:33,w:2.4,h:2.05,inside:8},
 hill:{s0:31.1,s1:34.3,s2:41,s3:46,h:2.8},
 evidence:{mud:9.2,weeds:17,scrape:25.8},
 bike:{s:30.6},bell:{s:52,y:1.1}};
// The channel's gentle meander (t of its centerline at s).
export const easementChannelT=s=>.85*Math.sin(s*.09)-.25;
// Chapter Three: downstream. Briarwood Lane simply stops a little past its last house; beyond its end
// curb an old municipal stormwater access road (barrier posts, a pipe gate, faded signs) runs off
// through an overgrown field into the woods, winds down through them and comes out on the floor of a
// creek valley, at the outfall where the neighborhood's storm sewer trunk (Chapter Two's culvert drains
// into it) comes out of the hillside: a big concrete box, headwall, wingwalls, riprap.
// World coordinates (x, z; z decreasing is north). road.pts: centerline control points after the two
// that continue Briarwood's own line; profile: road height [s, y] along it (smoothly interpolated).
// region: the outline of the land the woods answer for (older ground and the far neighborhood leave it).
export const WOODS={startU:250.3,
 road:{pts:[[372,-482],[402,-461],[426,-436],[440,-404],[454,-370],[482,-344],[525,-330],[570,-337],[604,-360],[624,-396],[631,-444],[637,-490],[643,-517],[646,-531]],
  profile:[[0,2.36],[60,2.05],[150,1.3],[240,-.5],[327,-2.6],[369,-3.7],[410,-5.1],[460,-6.05],[506,-6.95],[9999,-7.75]],
  half:[[0,2.75],[140,2.6],[260,2.3],[380,2.05],[9999,1.95]]},
 gate:{s:13.5},signs:{flood:31,end:300},poles:{to:200},
 // The creek on the valley floor (it runs north past the outfall); bed heights at z.
 creek:{pts:[[672,-300],[664,-380],[660,-440],[661,-500],[660,-545],[655,-600],[648,-680],[640,-780]],bed:[[-300,-6.4],[-440,-7.45],[-545,-9.1],[-780,-10.6]],floor:26,side:.2},
 sag:{x0:380,x1:620,depth:7},
 region:[[301.4,-465.8],[349.4,-553.6],[385,-650],[470,-775],[835,-775],[835,-215],[470,-215],[385,-300],[335,-405]],
 // The outfall. Outfall frame: a east from the portal face, b south (+z). The pad is the gravel
 // turnaround where the road ends, in front of the mouth and a little south.
 portal:{x:633.6,z:-545.5,floor:-8.45,w:4.6,h:3.6,cap:1.0,wing:6.3,flare:.58},
 pad:{a:12.6,b:13.4,r:7.2},patch:{a0:-7,a1:31,b0:-15,b1:25}};
// The storm sewer trunk behind the outfall: a reinforced concrete box under the woods, the oldest part
// of it older still. s from the portal face; sections: [s0, s1, width, height, kind]. Heading changes:
// [s0, s1, turn] (positive turns right, toward the north here). The floor rises gently upstream, with
// one low spillway step where the older section meets the newer one.
export const DRAIN={len:286,grade:.004,
 sections:[[0,24,4.6,3.6,'mouth'],[24,72,4.6,3.6,'box'],[72,94,4.6,3.6,'bend'],[94,150,3.9,3.15,'old'],[150,214,4.4,3.6,'long'],[214,226,4.4,3.6,'bend'],[226,286,4.2,3.4,'far']],
 turns:[[72,94,.62],[214,226,-.95]],
 step:{s:148.4,len:1.6,h:.5},
 ladder:{s:121},sidePipe:{s:136,r:.55,side:1},junction:{s0:270,s1:286,w:6.2,h:4.2,side:{s:279,w:2.4,h:2.05,sill:.85}},
 evidence:{s0:100,s1:146},oldBike:{s:171,side:-1},figure:{s:220.3,t:-.5},
 walkway:{s0:24,s1:72,side:1,w:.75,h:.32}};
// Alex's room: upstairs, the front corner over the garage (his lit window from Chapter One is its
// front window; a side window looks west over the garage roof toward the creek and the easement).
// x/z in the house's own frame (x across its width, +z toward the street), heights above its ground.
export const ALEX_ROOM={floor:2.86,height:2.42,x0:.95,front:.22,depth:3.95,side:{y:4.3,w:1,h:1.2}};
// Things that must stay clear of scattered props and trees (street coordinates).
export const KEEP_CLEAR=[
 {d0:1118,d1:1180,l0:-16,l1:16}, // the cul-de-sac and the lookout
];
