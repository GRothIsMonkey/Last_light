// Chapter Four: Main Street. Where the town is, what is where, and what you can stand on. Builds nothing.
//
// Summerfield Road, which used to stop at the foot of a rise past its last house, goes on as Old Mill Road:
// up over the rise between older houses on deep lots, down past a gas station, a car wash and the VFW, and
// into the township's old downtown, where it becomes Main Street. Three blocks of two- and three-story
// commercial buildings from 1890–1960 (the bank, the hardware store, the diner, the drugstore, the video
// store, the old bicycle shop, the laundromat, the Lyric), the town square with the library at its head,
// side streets (Mill, Second, Depot), service alleys behind both sides, parking lots, and Mill Creek in its
// concrete channel along the south edge of town.
//
// Two frames. The connector (Old Mill Road) has its own curve frame: s along it from Summerfield's end, t
// across it (+t to the right looking along it). Downtown has a straight frame: u along Main Street from the
// Mill Street intersection, westward (the way you ride in), v across it, +v to the right (north).
// World x = T0.x - u, z = T0.z - v. Headings (the game's: forward is (sin a, -cos a)): +u is a=-π/2, +v a=0.
//
// Downtown's ground is one surface grid (0.5 m cells, a surface type per cell), used both to draw the ground
// (town-build.js) and to answer walking and riding (townNav below), so the two can never disagree. Things in
// the way (posts, benches, shelves, washers...) are a list of solids, also shared by both.
import {JUNCTIONS} from './layout.js';
import {makeSideFrame,terrainY,LAWN} from './terrain.js';
import {curve,nearest,pchip} from './woods.js';
import {smooth,clamp,lerp} from './kit.js';

export const TY=1.0;// downtown's street level (Main Street's crown edge)
const S2=makeSideFrame(JUNCTIONS[1]);export const SUMMERFIELD=S2;
// ---- Old Mill Road -------------------------------------------------------------------------------------------
export const CONN={u0:250,straight:24,len:170,half:4.2};
const a0=S2.heading(CONN.u0),a1=-Math.PI/2;
const ctrl=(()=>{const P=S2.point(CONN.u0,0),pts=[[P.x,P.z]];let x=P.x,z=P.z;const st=5;
 for(let s=0;s<CONN.len+20-1e-6;s+=st){const a=a0+(a1-a0)*smooth((s+st/2-CONN.straight)/(CONN.len-CONN.straight-10));x+=Math.sin(a)*st;z-=Math.cos(a)*st;pts.push([x,z]);}return pts;})();
export const ROAD=curve(ctrl,.5);
const roadNear=nearest(ROAD,8,3);
// The end of the connector is where downtown's frame starts (u=-80): the town's origin is 80 m on, at Mill St.
const endI=Math.round(CONN.len/ROAD.step);
export const T0={x:ROAD.X[endI]-80,z:ROAD.Z[endI]};
export const TW=(u,v)=>({x:T0.x-u,z:T0.z-v});
export const TL=(x,z)=>({u:T0.x-x,v:T0.z-z});
export const HU=-Math.PI/2,HV=0;// headings of +u (west) and +v (north)
// Old Mill Road: where along it, and across it.
export function connAt(s,t=0){const i=clamp(s/ROAD.step,0,ROAD.n-1.0001),k=Math.floor(i),f=i-k,x=ROAD.X[k]+(ROAD.X[k+1]-ROAD.X[k])*f,z=ROAD.Z[k]+(ROAD.Z[k+1]-ROAD.Z[k])*f,a=ROAD.A[k]+(ROAD.A[k+1]-ROAD.A[k])*f;return {x:x+Math.cos(a)*t,z:z+Math.sin(a)*t,a};}
export function connProject(x,z){const q=roadNear(x,z);return q&&q.d<60&&q.s<=CONN.len+1.5&&!(q.out&&q.s<0)?q:null;}// (a little past its end: the seam with Main Street overlaps)
// Its height: first exactly Summerfield's own (it is Summerfield, there), then up over the rise and down into town.
const climb=pchip([[CONN.straight,S2.point(CONN.u0+CONN.straight,0).y+.025],[44,-.62],[78,1.35],[104,2.62],[128,2.86],[150,2.45],[CONN.len,1.9]]);
export function connBase(s){if(s<=CONN.straight)return S2.point(CONN.u0+Math.max(0,s),0).y+.025;return climb(s);}
// Cross-section (|t|): road to 4.2, curb to 4.5, a grass strip with the street trees to 5.85 (fading out over the last
// 30 m, where the sidewalk meets the curb), sidewalk to 7.35, then front lawns.
export const CONN_X={curb:4.5,strip:5.85,walk:7.35,lawn:24,tree:5.15};// (Summerfield's own cross-section, carried on)
export function connStrip(s){return 1-smooth((s-(CONN.len-34))/24);}// 1: the grass strip is there; 0: sidewalk to the curb
export function connY(s,t){const b=connBase(s),a=Math.abs(t),h=CONN.half;
 if(a<=h)return b+.028*Math.max(0,1-(t/h)**2);// the crown (Summerfield's own)
 if(a<=CONN_X.curb)return b+.15;
 if(a<=CONN_X.strip)return b+(connStrip(s)>.5?.13:.15);
 if(a<=CONN_X.walk)return b+.15;
 return b+.13+Math.min(a-CONN_X.walk,17)*.035*(1-smooth((s-(CONN.len-44))/36));}// front lawns rise gently to the houses (level again where Main Street starts)
export function connSurface(s,t){const a=Math.abs(t);if(a<=CONN.half)return 'asphalt';if(a<=CONN_X.curb)return 'asphalt';if(a<=CONN_X.strip)return connStrip(s)>.5?'grass':'asphalt';if(a<=CONN_X.walk)return 'asphalt';return 'grass';}
// The older houses along it (s, side, kind); their footprints are solids. Lots run deep behind them.
export const CONN_HOUSES=[
 {s:40,side:1,kind:'foursquare',w:9.4,d:9,set:15.5,c:0xb8a98c,roof:0x5a4e48,porch:true},{s:44,side:-1,kind:'bungalow',w:10.5,d:11,set:14,c:0x8a9a86,roof:0x4f4740,porch:true},
 {s:66,side:1,kind:'bungalow',w:9.8,d:10.5,set:14,c:0xc9b48c,roof:0x6a4a3a,porch:true},{s:70,side:-1,kind:'foursquare',w:9.2,d:9,set:15,c:0xd6d0c0,roof:0x4a4e52,porch:true},
 {s:92,side:1,kind:'cape',w:10,d:8.5,set:14.5,c:0xa8b4bc,roof:0x3e4246},{s:96,side:-1,kind:'bungalow',w:10,d:11,set:14,c:0x9c7c64,roof:0x4a3c34,porch:true},
 {s:118,side:1,kind:'foursquare',w:9.6,d:9.2,set:15.5,c:0xe0d8c4,roof:0x5c524a,porch:true},{s:122,side:-1,kind:'cape',w:9.6,d:8.4,set:14.5,c:0xc4a890,roof:0x50453e},
 {s:142,side:-1,kind:'bungalow',w:10.4,d:10.6,set:14,c:0xb4bca6,roof:0x46403a,porch:true}];
// ---- downtown ---------------------------------------------------------------------------------------------------
export const MAIN={u0:-80,u1:276,half:7,walk:11};
// Main Street East (the approach) widens from Old Mill Road's 4.2 m half-width to downtown's 7 over its first 30 m.
export const mainHalf=u=>u>=-50?7:lerp(CONN.half,7,smooth((u+80)/30));
export const mainWalk=u=>u>=-50?11:lerp(CONN_X.walk,11,smooth((u+80)/30));
// ...and drops gently into town.
export const mainBase=u=>u>=-12?TY:pchip([[-80,CONN.len>0?climb(CONN.len):TY],[-46,1.32],[-12,TY]])(u);
export const CROSS=[{name:'MILL ST',u:0,half:5,walk:8.5,v0:-60,v1:66},{name:'SECOND ST',u:90,half:5,walk:8.5,v0:-58,v1:66},{name:'DEPOT ST',u:180,half:5,walk:8.5,v0:-46,v1:66}];
export const CREEK={v0:-63.5,v1:-57.5,bed:TY-2.3,water:TY-2.1};
export const CORE={u0:-80,u1:290,v0:-70,v1:85,cell:.5};
// Surface types (one per 0.5 m cell). h: height over TY; walk / ride: what it allows.
export const SURF={none:0,road:1,walk:2,lot:3,grass:4,gravel:5,paver:6,carpet:7,tile:8,wood:9,creek:10,solid:11,steps:12,lino:13,curb:14};
export const SURF_INFO=[
 {k:'none',walk:false,ride:false,h:.12},{k:'road',walk:true,ride:true,h:0},{k:'walk',walk:true,ride:true,h:.15},{k:'lot',walk:true,ride:true,h:.02},{k:'grass',walk:true,ride:true,h:.12,lawn:true},
 {k:'gravel',walk:true,ride:true,h:.04},{k:'paver',walk:true,ride:true,h:.14},{k:'carpet',walk:true,ride:false,h:null},{k:'tile',walk:true,ride:false,h:null},{k:'wood',walk:true,ride:false,h:null},
 {k:'creek',walk:false,ride:false,h:-2.3},{k:'solid',walk:false,ride:false,h:.15},{k:'steps',walk:true,ride:false,h:null},{k:'lino',walk:true,ride:false,h:null},{k:'curb',walk:true,ride:true,h:.15}];
// The buildings. side N fronts face south onto Main (front at v=11); S fronts face north (front at v=-11).
// kind: shop | bank | diner | church | theater | library | video | laundry | office | gas | carwash | hall
// floors, h (eave height over the sidewalk), c (wall), trim, brick (true: brick bond), sign (the board over the
// storefront), lit (a shop light index, for the storefront glow), close (the hour it closes, 24 h).
export const BUILDINGS=[
 // Block A, north
 {id:'bank',side:'N',u0:8.5,u1:24,d:20,h:9.4,floors:2,kind:'bank',c:0xc8bea6,trim:0xe2dccb,stone:true,sign:'OAK HOLLOW SAVINGS',sub:'EST. 1911',lit:0,close:17},
 {id:'barber',side:'N',u0:24,u1:33,d:16,h:5.2,floors:1,kind:'shop',c:0x8e5a44,trim:0xd8ccb4,brick:true,sign:'VIC’S BARBER SHOP',awning:0xb33a32,stripe:0xf0e8dc,lit:1,close:18},
 {id:'hardware',side:'N',u0:33,u1:52,d:22,h:8.8,floors:2,kind:'shop',c:0x9a4e3a,trim:0xd6c8a8,brick:true,sign:'DUTTON HARDWARE',sub:'PAINT · TOOLS · KEYS CUT',awning:0x2f5a3a,lit:2,close:18},
 {id:'diner',side:'N',u0:52,u1:67,d:20,h:5.8,floors:1,kind:'diner',c:0xd9cba6,trim:0xb9c2c4,sign:'STARLITE DINER',lit:3,close:20.6},
 {id:'oddfellows',side:'N',u0:67,u1:81.5,d:22,h:12.8,floors:3,kind:'shop',c:0x7d4a3c,trim:0xd0c0a0,brick:true,sign:'SECOND STREET PIZZA',plaque:'I.O.O.F. 1898',awning:0x8a2a24,lit:4,close:21},
 // Block A, south
 {id:'drug',side:'S',u0:8.5,u1:26,d:22,h:9.2,floors:2,kind:'shop',c:0x8b5f47,trim:0xe0d4bc,brick:true,sign:'HALE DRUG CO.',sub:'PHARMACY',awning:0x2a4a6a,lit:5,close:19,phone:true},
 {id:'insurance',side:'S',u0:26,u1:36,d:18,h:8.2,floors:2,kind:'office',c:0x6f5a4c,trim:0xcfc4ae,brick:true,sign:'J. R. TEAGUE INSURANCE',sub:'TAX PREPARATION',lit:6,close:17},
 {id:'vacant1',side:'S',u0:36,u1:46,d:18,h:5.4,floors:1,kind:'shop',c:0xa79d88,trim:0x8a8070,sign:'',vacant:true,lit:-1},
 {id:'variety',side:'S',u0:46,u1:64,d:22,h:8.6,floors:2,kind:'shop',c:0x96593f,trim:0xd8c8a8,brick:true,sign:'HOLLIS VARIETY',sub:'SINCE 1946',awning:0xc0782a,lit:7,close:18},
 {id:'acetv',side:'S',u0:64,u1:81.5,d:22,h:8.4,floors:2,kind:'shop',c:0x7a4636,trim:0xcab894,brick:true,sign:'ACE TV & PAWN',sub:'WE BUY · SELL · REPAIR',lit:8,close:19,tvs:true},
 // Block B, south
 {id:'video',side:'S',u0:98.5,u1:116,d:24,h:5.8,floors:1,kind:'video',c:0x56656e,trim:0xe8e2d0,brick:true,sign:'THE LANTERN VIDEO',sub:'MOVIES · GAMES · RENTALS',lit:9,close:22},
 {id:'shoe',side:'S',u0:116,u1:126,d:22,h:7.6,floors:2,kind:'shop',c:0x8c6450,trim:0xcabca0,brick:true,sign:'SAL’S SHOE REPAIR',sub:'KEYS · LEATHER',lit:-1,closed:true},
 {id:'mason',side:'S',u0:127.5,u1:141,d:22,h:8.4,floors:2,kind:'shop',c:0x9b5a40,trim:0xd8c49c,brick:true,sign:'MASON CYCLE & SPORT',sub:'SALES · SERVICE · SINCE 1958',faded:true,vacant:true,lit:-1},
 {id:'florist',side:'S',u0:144.5,u1:156,d:22,ext:{u0:148,v:-37},h:7.6,floors:2,kind:'shop',c:0xb7c2b0,trim:0xf0ece0,sign:'PETAL & STEM',sub:'FLOWERS · GIFTS',awning:0x5a7a5a,lit:10,close:17.5},
 {id:'laundry',side:'S',u0:156,u1:171.5,d:24,ext:{u0:156,v:-37},h:5.6,floors:1,kind:'laundry',c:0xe0dac8,trim:0x3a6a8a,sign:'SUDS CITY LAUNDROMAT',sub:'OPEN 7 AM – 10 PM',lit:11,close:22},
 // Block C
 {id:'church',side:'N',u0:188.5,u1:212,d:24,front:20,h:9,floors:1,kind:'church',c:0x9c9488,trim:0xc8c0b0,stone:true,sign:'',lit:-1},
 {id:'courier',side:'N',u0:212,u1:226,d:20,h:8.2,floors:2,kind:'office',c:0x8a6450,trim:0xd8ccb0,brick:true,sign:'THE OAK HOLLOW COURIER',sub:'EST. 1879',lit:12,close:17},
 {id:'brennans',side:'N',u0:226,u1:262,d:24,h:12.8,floors:3,kind:'shop',c:0xa25c42,trim:0xd8c49c,brick:true,sign:'BRENNAN’S',sub:'DRY GOODS · FURNITURE',faded:true,vacant:true,lit:-1},
 {id:'lyric',side:'S',u0:188.5,u1:212,d:34,h:12.4,floors:3,kind:'theater',c:0x7a3f33,trim:0xe6d8b8,brick:true,sign:'THE LYRIC',lit:13,close:24},
 {id:'tap',side:'S',u0:212,u1:226,d:22,h:7.8,floors:2,kind:'shop',c:0x5e3a30,trim:0xb8a888,brick:true,sign:'THE DEPOT TAP',lit:14,close:24},
 {id:'vacant2',side:'S',u0:226,u1:240,d:20,h:8,floors:2,kind:'shop',c:0x8a7058,trim:0xc4b498,brick:true,sign:'',vacant:true,lit:-1},
 {id:'bridal',side:'S',u0:240,u1:262,d:22,h:8.6,floors:2,kind:'shop',c:0xe6dcd6,trim:0x8a7a8a,sign:'ELAINE’S BRIDAL',sub:'& FORMAL WEAR',awning:0x7a5a6a,lit:15,close:17},
 // The square's library (front faces south onto the square, at v=44)
 {id:'library',side:'N',u0:118,u1:152,d:18,front:44,h:7.4,floors:1,kind:'library',c:0x9a5a46,trim:0xe0d6c0,brick:true,sign:'PUBLIC LIBRARY',sub:'OAK HOLLOW',lit:16,close:20},
 // Main Street East: the approach
 {id:'gas',side:'N',u0:-60,u1:-44,d:10,front:27,h:4.4,floors:1,kind:'gas',c:0xe8e4da,trim:0xb83a2a,sign:'HOLLOW FUEL & FOOD',lit:17,close:23},
 {id:'dentist',side:'N',u0:-30,u1:-14,d:14,front:13,h:4.6,floors:1,kind:'office',c:0x8e6a52,trim:0xe0d8c8,brick:true,sign:'A. PATEL, D.D.S.',sub:'FAMILY DENTISTRY',lit:18,close:17},
 {id:'carwash',side:'S',u0:-72,u1:-56,d:22,front:-14,h:5,floors:1,kind:'carwash',c:0xd8dce0,trim:0x2a6aaa,sign:'MILL ROAD CAR WASH',lit:19,close:20},
 {id:'vfw',side:'S',u0:-46,u1:-20,d:16,front:-15,h:4.8,floors:1,kind:'hall',c:0x8a5a48,trim:0xd8d0c0,brick:true,sign:'V.F.W. POST 4417',lit:20,close:23},
];
export const BLD=Object.fromEntries(BUILDINGS.map(b=>[b.id,b]));
// Footprint in (u,v): front, back, and the rear extension if any.
export function footprint(b){const s=b.side==='N'?1:-1,f=b.front??(s*11),back=f+s*b.d;return {u0:b.u0,u1:b.u1,v0:Math.min(f,back),v1:Math.max(f,back),front:f,back,s};}
// Interiors you can walk into: floor height over TY, floor rect, doors (open), walls inside (solid).
export const INTERIORS={
 library:{h:.75,surf:'carpet',floor:[118.5,151.5,44.5,61.5],doors:[[133,137,44,44.5]],
  walls:[[142.5,143,54.5,61.5],[143,146,54.5,55],[147.5,151.5,54.5,55]],glass:[[143,146,54.5,55],[147.5,151.5,54.5,55]]},
 video:{h:.18,surf:'carpet',floor:[99,115.5,-34.5,-11.5],doors:[[105.5,107.5,-11.5,-11],[103,104.5,-35,-34.5]],walls:[[99,110.5,-28.5,-28],[112,115.5,-28.5,-28]],back:[99,115.5,-34.5,-28.5]},
 laundry:{h:.15,surf:'lino',floor:[156.5,171,-36.5,-11.5],doors:[[163,164.5,-37,-36.5],[171,171.5,-27.5,-26]],walls:[]},
};
// Steps up to the library doors (u0,u1,v0,v1, from height, to height over TY).
export const STEPS=[{u0:131,u1:139,v0:40.5,v1:44,y0:.14,y1:.75,n:4}];
// ---- the surface grid ------------------------------------------------------------------------------------------------
const NU=Math.round((CORE.u1-CORE.u0)/CORE.cell),NV=Math.round((CORE.v1-CORE.v0)/CORE.cell);
export const GRID={nu:NU,nv:NV,cell:CORE.cell,u0:CORE.u0,v0:CORE.v0,t:new Uint8Array(NU*NV),floor:new Float32Array(NU*NV).fill(NaN)};
const gi=(i,j)=>i*NV+j;
function paint(u0,u1,v0,v1,type,floorH=null){const i0=Math.max(0,Math.round((Math.min(u0,u1)-CORE.u0)/CORE.cell)),i1=Math.min(NU,Math.round((Math.max(u0,u1)-CORE.u0)/CORE.cell)),j0=Math.max(0,Math.round((Math.min(v0,v1)-CORE.v0)/CORE.cell)),j1=Math.min(NV,Math.round((Math.max(v0,v1)-CORE.v0)/CORE.cell));
 for(let i=i0;i<i1;i++)for(let j=j0;j<j1;j++){GRID.t[gi(i,j)]=type;if(floorH!==null)GRID.floor[gi(i,j)]=floorH;}}
{const T=SURF;
 paint(CORE.u0,CORE.u1,CORE.v0,CORE.v1,T.grass);
 // the edges of what you can reach: north past the back lots, south past the creek, west past the barricades
 paint(CORE.u0,CORE.u1,66,CORE.v1,T.none);paint(CORE.u0,CORE.u1,CORE.v0,CREEK.v0,T.none);paint(270,CORE.u1,CORE.v0,CORE.v1,T.none);paint(262,270,11,CORE.v1,T.none);paint(262,270,CORE.v0,-11,T.none);
 paint(CORE.u0,-62,11,CORE.v1,T.none);paint(CORE.u0,-74,CORE.v0,-11,T.none);
 // lots and alleys (low): everything behind the buildings is paved; a gravel patch, the church lawn
 paint(8.5,81.5,11,66,T.lot);paint(188.5,262,11,66,T.lot);paint(110,160,62,66,T.lot);
 paint(8.5,81.5,-57,-11,T.lot);paint(98.5,178,-57,-11,T.lot);paint(188.5,262,-57,-11,T.lot);paint(98.5,112,-57,-41,T.gravel);
 paint(188.5,212,11,40,T.grass);
 paint(-60,-26,11,42,T.lot);paint(-74,-54,-36,-11,T.lot);paint(-50,-16,-34,-11,T.lot);
 // streets (lowest)
 for(let u=MAIN.u0;u<MAIN.u1;u+=CORE.cell){const h=mainHalf(u+.25),w=mainWalk(u+.25);paint(u,u+CORE.cell,-h,h,T.road);paint(u,u+CORE.cell,h,w,T.walk);paint(u,u+CORE.cell,-w,-h,T.walk);}
 for(const c of CROSS){paint(c.u-c.half,c.u+c.half,c.v0,c.v1,T.road);for(const s of [-1,1]){paint(c.u+s*c.half,c.u+s*c.walk,c.v0,-MAIN.walk,T.walk);paint(c.u+s*c.half,c.u+s*c.walk,MAIN.walk,c.v1,T.walk);}}
 // the square: lawn, a paved edge along Main, paths (paver), the library forecourt
 paint(98.5,171.5,11,13,T.paver);paint(133,137,13,40.5,T.paver);paint(98.5,171.5,26,28,T.paver);paint(120,150,38,40.5,T.paver);
 // buildings (solid), their interiors cut back out, and the steps
 for(const b of BUILDINGS){const F=footprint(b);paint(F.u0,F.u1,F.v0,F.v1,T.solid);if(b.ext)paint(b.ext.u0,b.u1,b.ext.v,F.v0,T.solid);}
 paint(148,174,-46,-41,T.solid);// a row of old garages along the narrow part of the south alley
 for(const [id,I] of Object.entries(INTERIORS)){const t=SURF[I.surf];const [u0,u1,v0,v1]=I.floor;paint(u0,u1,v0,v1,t,I.h);for(const d of I.doors)paint(d[0],d[1],d[2],d[3],t,I.h);for(const w of I.walls)paint(w[0],w[1],w[2],w[3],T.solid);}
 for(const s of STEPS)paint(s.u0,s.u1,s.v0,s.v1,T.steps);
 // Mill Creek's channel, under the side streets in culverts (the streets end at a railing; Mill St on a closed bridge)
 paint(CORE.u0,CORE.u1,CREEK.v0,CREEK.v1,T.creek);paint(-5,5,CREEK.v0,CREEK.v1,T.road);
}
export function cellAt(u,v){const i=Math.floor((u-CORE.u0)/CORE.cell),j=Math.floor((v-CORE.v0)/CORE.cell);if(i<0||j<0||i>=NU||j>=NV)return -1;return gi(i,j);}
export function typeAt(u,v){const k=cellAt(u,v);return k<0?SURF.none:GRID.t[k];}
// Height of the walking surface over (u,v): street level by surface, interiors and steps by their own floors.
export function townY(u,v){const k=cellAt(u,v);const base=mainBase(u);if(k<0)return base+.12;const t=GRID.t[k];
 if(t===SURF.steps){const s=STEPS.find(q=>u>=q.u0&&u<q.u1&&v>=q.v0&&v<q.v1);if(s){const f=clamp((v-s.v0)/(s.v1-s.v0),0,1),n=s.n,step=Math.min(n,Math.floor(f*(n+1)));return base+s.y0+(s.y1-s.y0)*step/n;}}
 const fl=GRID.floor[k];if(!Number.isNaN(fl))return base+fl;const h=SURF_INFO[t].h;
 return base+(h??.12);}
// ---- things in the way (both nav and the builder read these) ---------------------------------------------------------
// {u,v,r} circles or {u0,u1,v0,v1} rects, with a kind (what the builder draws there) and optional data.
export const SOLIDS=[];
const circ=(kind,u,v,r,o={})=>SOLIDS.push({kind,u,v,r,...o}),rect=(kind,u0,u1,v0,v1,o={})=>SOLIDS.push({kind,u0:Math.min(u0,u1),u1:Math.max(u0,u1),v0:Math.min(v0,v1),v1:Math.max(v0,v1),...o});
// Streetlights. id is the index into the lamp level array (64). kind: acorn (Main), cobra (the approach, side
// streets), globe (the square), wall (security lights in alleys and lots: no post), pole (the parking lot).
export const LAMPS=[];
const lamp=(kind,u,v,o={})=>{const L={id:LAMPS.length,kind,u,v,...o};LAMPS.push(L);if(kind!=='wall')circ('lamp-'+kind,u,v,kind==='pole'?.22:.16,{lamp:L.id});return L;};
for(const u of [14,38,62,78,106,130,154,168,196,220,246])lamp('acorn',u,7.7,{side:1});
for(const u of [22,46,66,110,136,160,204,230,254])lamp('acorn',u,-7.7,{side:-1});
for(const u of [-70,-46,-22])lamp('cobra',u,mainHalf(u)+.6,{side:1,arm:-1});
for(const [u,v] of [[104,24],[166,24],[118,40.2],[152,40.2],[110,13.6],[160,13.6]])lamp('globe',u,v);
// security lights on back walls (at each building's own rear wall), and over the two back doors that matter
for(const id of ['drug','variety','acetv','hardware','oddfellows','courier','brennans','shoe']){const b=BUILDINGS.find(q=>q.id===id),F=footprint(b);lamp('wall',(b.u0+b.u1)/2,F.back+F.s*.12,{face:F.s,on:id});}
lamp('wall',103.75,-35.12,{face:-1,on:'video'});lamp('wall',163.75,-37.12,{face:-1,on:'laundry'});
for(let k=0;k<4;k++){const s=26+k*40;LAMPS.push({id:LAMPS.length,kind:'cobra',conn:true,s,t:CONN_X.tree});}
lamp('pole',130,-49.5);lamp('pole',30,-49);lamp('pole',45,52);lamp('pole',225,52);lamp('pole',176,-43.5);
for(const [c,vs] of [[0,[-24,-46,24,48]],[90,[-24,-46,24,48]],[180,[-26,-40,24,48]]])for(const v of vs)lamp('cobra',c+(v<0?6.3:-6.3),v,{side:v<0?-1:1,cross:c,arm:v<0?-1:1});
// two more security lights on back walls along the narrow way (Chapter Four's escape: at its mouth, and at the Depot Street end)
lamp('wall',151.2,-37.12,{face:-1,on:'narrow'});lamp('wall',170.4,-37.12,{face:-1,on:'narrow'});
// Street furniture. Trees in grates, benches, cans, hydrants, meters, news boxes, the payphone, a mailbox, planters, racks.
const nearLamp=(u,v,d)=>LAMPS.some(L=>Math.hypot(L.u-u,L.v-v)<d);
for(const u of [26,50,70,118,146,208,238])circ('tree-grate',u,8.3,.32);
for(const u of [14,34,56,122,150,166,216,242])circ('tree-grate',u,-8.3,.32);
for(const [u,s,d] of [[18,-1],[60,1],[148,-1],[230,1],[-36,1]])rect('bench',u-.9,u+.9,s*10.2-.28,s*10.2+.28,{dir:s>0?'v-':'v+'});
for(const [u,s] of [[22.5,1],[54,-1],[86.5,1],[96,-1],[147,-1],[186,1],[214,-1]])circ('trashcan',u,s*7.95,.28);
for(const [u,v] of [[9.5,8.1],[-9.5,-8.1],[84.6,-8.1],[95.4,8.1],[175.5,-8.1],[184.5,8.1],[100,-37.6],[150,-37.5]])circ('hydrant',u,v,.2);
for(let u=12;u<82;u+=6.5)for(const s of [-1,1])if(!nearLamp(u,s*7.45,1.2))circ('meter',u,s*7.45,.09);
rect('newsbox',61.4,62,9.9,10.5,{label:'COURIER'});rect('newsbox',62.2,62.8,9.9,10.5,{label:'TODAY'});rect('newsbox',63,63.6,9.9,10.5,{label:'FREE'});
rect('payphone',22,22.9,-10.6,-10.0,{face:1});rect('mailbox',30.4,31,7.9,8.5);rect('vending',44.5,45.4,10.1,10.85,{face:-1});
for(const u of [101.5,168.5])rect('planter',u-.6,u+.6,-10.4,-9.2);
rect('bikerack',126.2,130.2,12.15,12.45,{face:-1});rect('bikerack',112,115,-10.45,-10.15,{face:1});
// The square: gazebo, memorial, flagpole, fountain, benches along the paths, trees.
circ('gazebo',153,35,4.6);circ('memorial',117,20,1.25);circ('flagpole',117,34.5,.15);circ('fountain',153,18.5,.45);
for(const [u,v,d] of [[131.4,20,'u-'],[138.6,20,'u+'],[131.4,33,'u-'],[138.6,33,'u+'],[108,24.4,'v+'],[162,24.4,'v+']])rect('bench',u-(d[0]==='u'?.28:.9),u+(d[0]==='u'?.28:.9),v-(d[0]==='u'?.9:.28),v+(d[0]==='u'?.9:.28),{dir:d,square:true});
for(const [u,v] of [[104,18],[166,18],[104,33],[166,31],[112,47],[158,47],[106,57],[164,57],[124,31],[146,22]])circ('tree',u,v,.3,{size:1.1});
// Alleys: dumpsters, AC units, utility poles, pallets, grease bins, gas meters, back steps.
for(const [u,v,w] of [[16,-37.6,2],[44,-37.6,2],[68,-37.6,2],[118,-38,2],[60,37.6,2],[220,37.6,2],[245,37.6,2]])rect('dumpster',u-w/2,u+w/2,v-.6,v+.6);
for(const [u,v] of [[10,-33.2],[36,-33.6],[56,-33.6],[78,-33.6],[124,-35.6],[136,-35.6],[38,33.6],[214,33.6]])rect('ac',u-.5,u+.5,v-.5,v+.5);
for(const [u,v] of [[6,-38.6],[40,-39.2],[85,-39.3],[127,-39.4],[175,-39.6],[6,38.8],[50,39.3],[200,39.3],[240,39.3]])circ('pole',u,v,.17);
rect('pallets',82.5,84,-39.6,-38.4);rect('pallets',140.5,142,-39.6,-38.6);rect('crates',108,109.6,-39.6,-38.8);
// The parking lot behind the bike shop: a fence along the garages, the light pole, a railing along the creek.
rect('railing',CORE.u0,CORE.u1,CREEK.v1-.12,CREEK.v1+.08,{rail:true});
// Barricades where you cannot go on: Main west (the bridge), Mill St north and south, Depot St north.
rect('barricade',268.5,270,-11,11,{label:'ROAD CLOSED'});rect('barricade',-5,5,-60.3,-59.7,{label:'BRIDGE CLOSED'});for(const c of [0,90,180])rect('sawhorse',c-1.2,c+1.2,63.4,63.8,{label:'LOCAL TRAFFIC ONLY'});
// The approach: gas pumps and canopy posts, the car wash bay, the town sign.
for(const u of [-55,-49])rect('pump',u-.4,u+.4,17.4,18.6);for(const [u,v] of [[-58.5,14.2],[-45.5,14.2],[-58.5,21.8],[-45.5,21.8]])circ('canopy-post',u,v,.22);
rect('townsign',-77.8,-74.2,-12.4,-11.6,{label:'WELCOME TO HISTORIC DOWNTOWN'});
// Inside the library.
{const I=INTERIORS.library;
 rect('desk-circ',129,141,48.5,49.5,{inside:'library'});rect('desk-circ',129,130,49.5,51,{inside:'library'});rect('desk-circ',140,141,49.5,51,{inside:'library'});
 for(const v of [51.5,54,56.5,59])rect('stack',119.5,127.5,v-.3,v+.3,{inside:'library'});rect('stack',118.5,119.1,45,61,{inside:'library',wall:true});
 for(const [u0,u1,v0,v1] of [[141,145,51,52.4],[141,145,53.2,54.6],[145.5,150.5,46,47.4],[145.5,150.5,48.6,50]])rect('table',u0,u1,v0,v1,{inside:'library'});
 rect('computers',129.5,141.5,60.7,61.5,{inside:'library'});rect('microfilm',147,150.6,60.6,61.5,{inside:'library'});rect('cabinets',151,151.5,55.5,60,{inside:'library'});
 rect('kids-shelf',119.1,119.7,45.2,49.5,{inside:'library'});rect('newspapers',141.5,142.4,45.2,47.4,{inside:'library'});
 void I;}
// Inside the video store.
{rect('counter',100.6,101.4,-22,-14,{inside:'video'});rect('counter',99,101.4,-14,-13.2,{inside:'video'});rect('candy',102,103,-13.4,-12.4,{inside:'video'});
 for(const u of [104.6,108.2,111.8])rect('rack',u-.45,u+.45,-25.4,-14.4,{inside:'video',island:true});
 rect('rack',114.9,115.5,-27.6,-12.2,{inside:'video',wall:'w'});rect('rack',112.4,114.9,-28,-27.5,{inside:'video',wall:'b'});rect('rack',101.4,110.4,-28,-27.5,{inside:'video',wall:'b'});
 rect('bins',104.4,107.2,-26.9,-26.1,{inside:'video'});rect('display',112.6,114.2,-12.6,-11.7,{inside:'video'});
 rect('shelving',113.6,115.5,-34.4,-29.4,{inside:'video'});rect('shelving',99,100.4,-34.4,-30.6,{inside:'video'});rect('emp-desk',99,101.8,-30,-28.6,{inside:'video'});
 rect('boxes',108.4,110.4,-34.4,-33.2,{inside:'video'});rect('boxes',106.4,107.6,-30.4,-29.2,{inside:'video'});rect('cart',111.4,112.4,-33.6,-32.6,{inside:'video'});}
// Inside the laundromat.
{rect('washers',162.8,164.2,-31,-14.5,{inside:'laundry'});rect('dryers',156.5,157.5,-33.5,-13.5,{inside:'laundry'});rect('folding',169.9,171,-24.5,-14.5,{inside:'laundry'});
 rect('chairs',165,168,-12.6,-11.6,{inside:'laundry'});rect('soap',168.6,169.8,-36.4,-35.6,{inside:'laundry'});rect('change',157.6,158.4,-36.4,-35.8,{inside:'laundry'});rect('washers',166.6,168,-31,-26.5,{inside:'laundry',front:true});}
// ---- a spatial hash of the solids --------------------------------------------------------------------------------------
const SH=new Map(),SC=4,sk=(i,j)=>i*7919+j;
for(const s of SOLIDS){const b=s.r!==undefined?[s.u-s.r,s.u+s.r,s.v-s.r,s.v+s.r]:[s.u0,s.u1,s.v0,s.v1];for(let i=Math.floor(b[0]/SC);i<=Math.floor(b[1]/SC);i++)for(let j=Math.floor(b[2]/SC);j<=Math.floor(b[3]/SC);j++){const k=sk(i,j);if(!SH.has(k))SH.set(k,[]);SH.get(k).push(s);}}
export function solidAt(u,v,r=0){for(let i=Math.floor((u-r)/SC);i<=Math.floor((u+r)/SC);i++)for(let j=Math.floor((v-r)/SC);j<=Math.floor((v+r)/SC);j++)for(const s of SH.get(sk(i,j))||[]){
 if(s.r!==undefined){if(Math.hypot(u-s.u,v-s.v)<s.r+r)return s;}else if(u>s.u0-r&&u<s.u1+r&&v>s.v0-r&&v<s.v1+r)return s;}return null;}
// Doors that can be shut (the story opens and closes them): their cells are solid while shut.
export const DOORS={
 'video-front':{u0:105.5,u1:107.5,v0:-12,v1:-10.8,open:1},'video-back':{u0:103,u1:104.5,v0:-35.4,v1:-34.2,open:0},'video-office':{u0:110.5,u1:112,v0:-28.6,v1:-27.9,open:1},
 'laundry-back':{u0:163,u1:164.5,v0:-37.6,v1:-36.4,open:1},'laundry-side':{u0:170.8,u1:172,v0:-27.5,v1:-26},'library-front':{u0:133,u1:137,v0:43.5,v1:45,open:1}};
for(const d of Object.values(DOORS))d.open??=1;
const shut=(u,v,r)=>{for(const d of Object.values(DOORS))if(d.open<.5&&u>d.u0-r&&u<d.u1+r&&v>d.v0-r&&v<d.v1+r)return true;return false;};
// ---- the land around it all -------------------------------------------------------------------------------------------
// The region the town answers for (older far ground and far houses leave it out): from Summerfield's end, widening
// westward over the rise to the whole basin downtown sits in. World x, z.
export const REGION=(()=>{const P=(u,v)=>{const p=S2.point(u,v);return [p.x,p.z];},W2=(u,v)=>{const p=TW(u,v);return [p.x,p.z];};
 return [P(CONN.u0+8,-46),P(CONN.u0+70,-60),W2(-90,-130),W2(150,-300),W2(520,-250),W2(560,200),W2(250,340),W2(-90,300),P(CONN.u0+70,62),P(CONN.u0+8,46)];})();
const RB=(()=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const [x,z] of REGION){x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);}return {x0,x1,z0,z1};})();
const inPolyR=(x,z)=>{let c=false;for(let i=0,j=REGION.length-1;i<REGION.length;j=i++){const [xi,zi]=REGION[i],[xj,zj]=REGION[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c;}return c;};
const edgeDist=(x,z)=>{let best=1e18;for(let i=0,j=REGION.length-1;i<REGION.length;j=i++){const [ax,az]=REGION[j],[bx,bz]=REGION[i],dx=bx-ax,dz=bz-az,l=dx*dx+dz*dz||1,f=clamp(((x-ax)*dx+(z-az)*dz)/l,0,1);best=Math.min(best,Math.hypot(x-ax-dx*f,z-az-dz*f));}return best;};
export function inRegion(x,z,m=0){if(x<RB.x0-m||x>RB.x1+m||z<RB.z0-m||z>RB.z1+m)return false;const i=inPolyR(x,z);if(m===0)return i;return i?(m>0||edgeDist(x,z)>-m):(m>0&&edgeDist(x,z)<m);}
// The core rect downtown's own ground covers (the land leaves it out).
export const inCore=(u,v,m=0)=>u>CORE.u0-m&&u<CORE.u1+m&&v>CORE.v0-m&&v<CORE.v1+m;
// The land: what was there at the region's edge (the far ground's own level), sunk into a shallow basin round downtown,
// and graded to Old Mill Road along it (front lawns, then banks up to the natural ground).
const T0land=(x,z)=>terrainY(x,z)+LAWN-.08;
export function landY(x,z){const nat=T0land(x,z),{u,v}=TL(x,z);
 // distance outside the core rect
 const du=Math.max(CORE.u0-u,0,u-CORE.u1),dv=Math.max(CORE.v0-v,0,v-CORE.v1),dc=Math.hypot(du,dv);
 let y=lerp(nat,mainBase(clamp(u,MAIN.u0,MAIN.u1))+.12+dc*.012,1-smooth((dc-10)/170));
 const q=connProject(x,z);if(q){const a=Math.abs(q.t),road=connY(q.s,Math.min(a,CONN_X.walk+17)*Math.sign(q.t||1)),w=1-smooth((a-26)/34);y=lerp(y,road+(a>CONN_X.walk+17?(a-CONN_X.walk-17)*.03:0),w*(1-smooth((q.s-(CONN.len+20))/30)));}
 // ...and Summerfield's own ground where it ends (the seam with its lawns)
 const p=S2.project(x,z,CONN.u0+20);if(p.u>CONN.u0-4&&p.u<CONN.u0+60&&Math.abs(p.v)<70){const w=(1-smooth((p.u-(CONN.u0+24))/30))*(1-smooth((Math.abs(p.v)-44)/22));if(w>0)y=lerp(y,S2.point(p.u,p.v).y+LAWN,w);}
 return lerp(nat,y,smooth(edgeDist(x,z)/45));}
// ---- walking and riding --------------------------------------------------------------------------------------------------
// Answers for world points inside the region. Returns null outside (the rest of the world answers there).
export function townNav(){
 const REACH_T=CONN_X.lawn+2;
 function where(x,z){if(!inRegion(x,z))return null;const {u,v}=TL(x,z);
  if(u>=MAIN.u0+1&&inCore(u,v))return {zone:'core',u,v};
  const q=connProject(x,z);if(q&&q.s>=-.01&&q.s<=CONN.len+1.5&&Math.abs(q.t)<60)return {zone:'conn',s:q.s,t:q.t,q,u,v};
  return {zone:'land',u,v};}
 const connSolid=(s,t,r)=>{for(const h of CONN_HOUSES){if(Math.abs(s-h.s)>h.w/2+3)continue;const tc=h.side*(h.set+h.d/2);if(Math.abs(t-tc)<h.d/2+r&&Math.abs(s-h.s)<h.w/2+r)return true;if(h.porch&&Math.abs(t-h.side*(h.set-1.2))<1.3+r&&Math.abs(s-h.s)<h.w*.36+r)return true;}
  // street trees in the grass strip and the poles
  if(Math.abs(t)>CONN_X.curb&&Math.abs(t)<CONN_X.strip&&connStrip(s)>.5){const k=Math.round((s-18)/16);if(k>=0&&18+k*16<=CONN.len-28&&Math.abs(s-(18+k*16))<.35+r&&Math.abs(Math.abs(t)-CONN_X.tree)<.35+r)return true;}
  if(t>CONN_X.curb&&t<CONN_X.strip){const k=Math.round((s-26)/40);if(k>=0&&k<4&&Math.abs(s-(26+k*40))<.22+r&&Math.abs(t-CONN_X.tree)<.22+r)return true;}
  return false;};
 function groundY(x,z,W=where(x,z)){if(!W)return null;if(W.zone==='core')return townY(W.u,W.v);if(W.zone==='conn'){const a=Math.abs(W.t);return a<=REACH_T?connY(W.s,W.t):landY(x,z);}return landY(x,z);}
 function baseY(x,z,W=where(x,z)){if(!W)return null;if(W.zone==='core'){const t=typeAt(W.u,W.v),k=cellAt(W.u,W.v),fl=k>=0?GRID.floor[k]:NaN;if(!Number.isNaN(fl)||t===SURF.steps)return townY(W.u,W.v);return mainBase(W.u)+(t===SURF.grass||t===SURF.none?.12:t===SURF.lot?.02:t===SURF.gravel?.04:0);}
  if(W.zone==='conn'&&Math.abs(W.t)<=CONN_X.walk)return connBase(W.s);return groundY(x,z,W);}
 // r: the walker's or rider's radius (a few samples round the point, so you stop at a wall, not in it)
 function coreOK(u,v,r,ride,lawn){const t=typeAt(u,v),I=SURF_INFO[t];if(!(ride?I.ride:I.walk))return false;if(ride&&I.lawn&&!lawn)return false;
  if(r>0)for(const [du,dv] of [[r,0],[-r,0],[0,r],[0,-r]]){const t2=typeAt(u+du,v+dv),I2=SURF_INFO[t2];if(!(ride?I2.ride:I2.walk))return false;}
  if(solidAt(u,v,r))return false;if(shut(u,v,r))return false;return true;}
 function walkable(x,z,{r=.28}={},W=where(x,z)){if(!W)return null;if(W.zone==='core')return coreOK(W.u,W.v,r*.9,false,true);
  if(W.zone==='conn'){const a=Math.abs(W.t);if(a>REACH_T-r)return false;return !connSolid(W.s,W.t,r);}return false;}
 function rideable(x,z,{lawn=true,r=.3}={},W=where(x,z)){if(!W)return null;if(W.zone==='core')return coreOK(W.u,W.v,r*.6,true,lawn);
  if(W.zone==='conn'){const a=Math.abs(W.t);if(a>(lawn?16:CONN_X.walk)-r*.5)return false;return !connSolid(W.s,W.t,r*.6);}return false;}
 function surface(x,z,W=where(x,z)){if(!W)return null;if(W.zone==='core'){const t=typeAt(W.u,W.v);return t===SURF.grass||t===SURF.none?'grass':t===SURF.carpet?'floor':t===SURF.lino||t===SURF.tile||t===SURF.wood||t===SURF.steps?'floor':'asphalt';}
  if(W.zone==='conn')return connSurface(W.s,W.t);return 'grass';}
 // The street's direction here (for the bike's settling): Main, a side street, an alley, Old Mill Road.
 function heading(x,z,W=where(x,z)){if(!W)return null;if(W.zone==='conn')return W.q.a;const {u,v}=W;const c=CROSS.find(c=>Math.abs(u-c.u)<c.walk&&Math.abs(v)>MAIN.half+1);return c?HV:HU;}
 return {where,groundY,baseY,walkable,rideable,surface,heading,box:RB};
}
// ---- named places (the story uses these) -----------------------------------------------------------------------------------
export const SPOT={
 arrive:{u:-14,v:-3},mill:{u:0,v:0},second:{u:90,v:0},depot:{u:180,v:0},
 masonWindow:{u:134.4,v:-10.2,look:{u:134.4,v:-12.4,y:1.5}},masonDoor:{u:131,v:-10.6},gangway:{u:126.8,v:-11},
 barber:{u:30.6,v:9.6},barberDoor:{u:28.4,v:10.8},
 rack:{u:128.2,v:12.9},libraryDoor:{u:135,v:44.6},libraryIn:{u:135,v:46.4},desk:{u:135,v:50.6},reader:{u:148.8,v:59.7,look:{u:148.8,v:61.2,y:1.75}},historyDoor:{u:146.8,v:54.7},
 bulletin:{u:129.5,v:45.3,look:{u:129.5,v:44.6,y:1.9}},
 videoDoor:{u:106.5,v:-11.4},videoIn:{u:106.5,v:-13.5},videoTV:{u:99.15,v:-18,y:2.32},videoPhone:{u:101,v:-19.4,y:1.02},videoBack:{u:111.2,v:-28.3},videoRear:{u:103.75,v:-34.9},
 tvWindow:{u:72.8,v:-11.6},creatureDusk:{u:90,v:-50.5},creatureDive:{u:90,v:-58.6},duskStop:{u:92.5,v:3.2},
 lotLight:{u:130,v:-49.5},narrow:{u:158,v:-38.8},alleyEnd:{u:177,v:-38.8},laundryBack:{u:163.75,v:-37},laundrySide:{u:171.4,v:-26.75},
 fireEscape:{u:186.6,v:-22},marquee:{u:200,v:-9.4},corner:{u:178.4,v:-9.6},theaterAlex:{u:200,v:-11.4},
 square:{u:135,v:24},memorial:{u:135,v:18.5},diner:{u:59.5,v:10.4},gas:{u:-52,v:18},
};
