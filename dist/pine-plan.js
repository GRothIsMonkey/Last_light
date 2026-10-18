// Chapter Five: Pine Ridge. Where it is, what is where, how high the ground is and what you can stand on.
// Builds nothing (pine-build.js draws it; nav.js and chapter5.js ask it).
//
// Mill Street does not really end at its LOCAL TRAFFIC ONLY sawhorse: past the last parking lot it goes on north
// out of town as the old Reservoir Road, a narrow two-lane road between fields and a farm, up over the wooded
// ridge the area is named for, and down to the Pine Ridge Recreation Area on the reservoir: a fee booth, a paved
// lot, a picnic shelter on a mown lawn that runs down to the water, a public dock, a playground, a restroom, a
// trail kiosk. At the north end of the lawn is the old gravel lot from before the paved one was built, with the
// original brown sign, a yellow swing gate across a gravel road and the Reservoir Authority's shed by the water
// (the place in the picture on the video store's television). The gravel road goes on along the shore to what was
// Camp Whippoorwill: a gate under a log arch, the office, a clearing with a flagpole and a bell, the lodge, six
// cabins named for birds, a washhouse, a campfire circle and a dock on the water, and behind it all the service
// yard, the pump house and the service road that goes round the west end of the lake over the dam and back along
// the south shore to the picnic lawn.
//
// One frame: e east, n north, in meters from Mill Street's centerline at the town's north edge (P0, downtown's
// u 0, v 85). World x = P0.x + e, z = P0.z - n. A heading (the game's: forward (sin a, -cos a)) of a direction
// (de, dn) is atan2(de, dn): north 0, east π/2. Buildings face along their heading; in their own frame x is to
// the right looking out of the front door and -z is out of the front (three.js, rotation.y = -heading).
//
// The ground is one designed height function (design), sampled on the far ground's own 4 m lattice (2 m where
// anyone can walk) into one triangulated surface that the builder draws and walking reads (heightAt), so the two
// never disagree. Where Pine Ridge's land meets the older ground its heights are the far ground's own (far-land.js),
// and the far ground leaves Pine Ridge's cells out (background.js), so there is one surface, never two.
import {TW,CORE,inRegion as inTown} from './town-plan.js';
import {farLandY} from './far-land.js';
import {curve,nearest,pchip,inPoly,polyDist,smin} from './woods.js';
import {smooth,clamp,lerp,seeded,hashSeed} from './kit.js';

// ---- the frame ----------------------------------------------------------------------------------------------------
export const P0=TW(0,CORE.v1);
export const PW=(e,n)=>({x:P0.x+e,z:P0.z-n});
export const PL=(x,z)=>({e:x-P0.x,n:P0.z-z});
export const hd=(de,dn)=>Math.atan2(de,dn);
export const WATER=1.0;
const wpt=([e,n])=>{const p=PW(e,n);return [p.x,p.z];};
// A building's own frame: local (lx right, lz out of the front) to (e, n), and back.
export function frameOf(c,a){const fe=Math.sin(a),fn=Math.cos(a),re=Math.cos(a),rn=-Math.sin(a);
 return {c,a,to:(lx,lz)=>[c[0]+re*lx+fe*lz,c[1]+rn*lx+fn*lz],of:(e,n)=>{const de=e-c[0],dn=n-c[1];return [de*re+dn*rn,de*fe+dn*fn];}};}

// ---- the reservoir -----------------------------------------------------------------------------------------------
// The waterline (e, n), clockwise from the south shore by the dam. The west end is the dam's upstream face.
export const SHORE=[[-356,350],[-330,338],[-300,331],[-262,325],[-226,326],[-198,330],[-180,337],[-166,346],[-154,358],[-146,373],[-141,390],[-142,404],
 [-148,424],[-157,447],[-168,468],[-182,485],[-200,496],[-222,503],[-246,506],[-270,505],[-292,499],[-310,489],[-326,474],[-340,456],[-351,440],[-357,420],[-361,398],[-362,376],[-361,360]];
function closed(P,step){const n=P.length,out=[];for(let i=0;i<n;i++){const a=P[(i-1+n)%n],b=P[i],c=P[(i+1)%n],d=P[(i+2)%n],L=Math.hypot(c[0]-b[0],c[1]-b[1]),k=Math.max(2,Math.ceil(L/step));
 for(let j=0;j<k;j++){const t=j/k,t2=t*t,t3=t2*t;out.push([0,1].map(q=>.5*((2*b[q])+(-a[q]+c[q])*t+(2*a[q]-5*b[q]+4*c[q]-d[q])*t2+(-a[q]+3*b[q]-3*c[q]+d[q])*t3)));}}return out;}
// The dam: straight, so its stretch of the waterline is straight too (no rounding of the curve there).
export const DAM={a:[-352,442],b:[-363,374],crest:WATER+2.65,width:4.2,toe:-2.6};
const SHORE_PTS=(()=>{const raw=closed(SHORE,1.2),out=[];const onDam=([e,n])=>n>DAM.b[1]-2&&n<DAM.a[1]+2&&e<-345;
 for(const p of raw){if(onDam(p)){const t=clamp((p[1]-DAM.b[1])/(DAM.a[1]-DAM.b[1]),0,1);out.push([lerp(DAM.b[0],DAM.a[0],t)+1.6,p[1]]);}else out.push(p);}return out;})();
export const SHORE_LINE=SHORE_PTS;
const SB=(()=>{let e0=1e9,e1=-1e9,n0=1e9,n1=-1e9;for(const [e,n] of SHORE_PTS){e0=Math.min(e0,e);e1=Math.max(e1,e);n0=Math.min(n0,n);n1=Math.max(n1,n);}return {e0,e1,n0,n1};})();
// Signed distance to the waterline (negative over the water), from a 1 m distance field computed once: exact near the
// line (seeded from its segments), carried outward by nearest-point propagation, signed by a scanline fill.
const SDF=(()=>{const M=92,e0=Math.floor(SB.e0-M),n0=Math.floor(SB.n0-M),ne=Math.ceil(SB.e1+M-e0)+1,nn=Math.ceil(SB.n1+M-n0)+1,N=SHORE_PTS.length;
 const D=new Float32Array(ne*nn).fill(1e9),QE=new Float32Array(ne*nn),QN=new Float32Array(ne*nn),id=(i,j)=>i*nn+j;
 for(let k=0;k<N;k++){const a=SHORE_PTS[k],b=SHORE_PTS[(k+1)%N],dx=b[0]-a[0],dn=b[1]-a[1],l=dx*dx+dn*dn||1;
  for(let i=Math.floor(Math.min(a[0],b[0])-2-e0);i<=Math.ceil(Math.max(a[0],b[0])+2-e0);i++)for(let j=Math.floor(Math.min(a[1],b[1])-2-n0);j<=Math.ceil(Math.max(a[1],b[1])+2-n0);j++){if(i<0||j<0||i>=ne||j>=nn)continue;
   const e=e0+i,n=n0+j,f=clamp(((e-a[0])*dx+(n-a[1])*dn)/l,0,1),pe=a[0]+dx*f,pn=a[1]+dn*f,d=Math.hypot(e-pe,n-pn),q=id(i,j);if(d<D[q]){D[q]=d;QE[q]=pe;QN[q]=pn;}}}
 const relax=(i,j,i2,j2)=>{if(i2<0||j2<0||i2>=ne||j2>=nn)return;const q=id(i,j),o=id(i2,j2);if(D[o]>=1e9)return;const d=Math.hypot(e0+i-QE[o],n0+j-QN[o]);if(d<D[q]){D[q]=d;QE[q]=QE[o];QN[q]=QN[o];}};
 for(let pass=0;pass<2;pass++){for(let i=0;i<ne;i++)for(let j=0;j<nn;j++){relax(i,j,i-1,j);relax(i,j,i,j-1);relax(i,j,i-1,j-1);relax(i,j,i+1,j-1);}
  for(let i=ne-1;i>=0;i--)for(let j=nn-1;j>=0;j--){relax(i,j,i+1,j);relax(i,j,i,j+1);relax(i,j,i+1,j+1);relax(i,j,i-1,j+1);}}
 // the sign: a scanline fill of the polygon along each column
 for(let i=0;i<ne;i++){const e=e0+i,xs=[];for(let k=0;k<N;k++){const a=SHORE_PTS[k],b=SHORE_PTS[(k+1)%N];if((a[0]>e)!==(b[0]>e))xs.push(a[1]+(e-a[0])/(b[0]-a[0])*(b[1]-a[1]));}xs.sort((p,q)=>p-q);
  for(let m=0;m+1<xs.length;m+=2)for(let j=Math.max(0,Math.ceil(xs[m]-n0));j<=Math.min(nn-1,Math.floor(xs[m+1]-n0));j++)D[id(i,j)]=-D[id(i,j)];}
 return {D,e0,n0,ne,nn,M};})();
export function shoreSD(e,n){const S=SDF,fi=e-S.e0,fj=n-S.n0;if(fi<0||fj<0||fi>=S.ne-1||fj>=S.nn-1){const de=Math.max(SB.e0-e,0,e-SB.e1),dn=Math.max(SB.n0-n,0,n-SB.n1);return Math.max(S.M,Math.hypot(de,dn));}
 const i=Math.floor(fi),j=Math.floor(fj),u=fi-i,v=fj-j,D=S.D,nn=S.nn,a=D[i*nn+j],b=D[(i+1)*nn+j],c=D[i*nn+j+1],d=D[(i+1)*nn+j+1];return (a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;}

// ---- roads -------------------------------------------------------------------------------------------------------
// A road: control points (e, n), half width along it, a profile of heights (pinned at points), a surface.
function makeRoad(id,pts,{half=3,kind='gravel',pins=[],smoothR=10,flat=null}={}){const C=curve(pts.map(wpt),.5),near=nearest(C,8,3),L=C.length;
 const at=(s,t=0)=>{const i=clamp(s/C.step,0,C.n-1.0001),k=Math.floor(i),f=i-k,x=C.X[k]+(C.X[k+1]-C.X[k])*f,z=C.Z[k]+(C.Z[k+1]-C.Z[k])*f,a=C.A[k]+(C.A[k+1]-C.A[k])*f;return {x:x+Math.cos(a)*t,z:z+Math.sin(a)*t,a};};
 const project=(x,z,r)=>{const q=near(x,z,r);return q&&!q.out?q:null;};
 const sOf=(e,n)=>{const p=PW(e,n),q=near(p.x,p.z,6);return q?clamp(q.s,0,L):0;};
 return {id,pts,C,L,at,project,sOf,half:typeof half==='function'?half:()=>half,kind,pins,smoothR,flat,y:null};}
// The old Reservoir Road: Mill Street on north, over the ridge, down to the park's lot (the drive is its last stretch).
export const ROADS={
 orr:makeRoad('orr',[[0,0],[0,30],[1,70],[-4,110],[-14,145],[-28,175],[-42,205],[-54,235],[-62,262],[-66,281],[-73,291],[-84,298],[-92,301]],{kind:'asphalt',
  half:s=>s<24?lerp(5,3.2,smooth(s/22)):s>300?lerp(3.2,3.9,smooth((s-300)/16)):3.2,
  pins:[[0,0,1.0],[0,30,1.55],[1,70,2.3],[-4,110,3.55],[-14,145,5.3],[-28,175,6.75],[-42,205,7.05],[-54,235,6.0],[-62,262,4.6],[-66,281,3.9],[-84,298,3.42],[-92,301,3.37]]}),
 // The old gravel road: from the old lot through the swing gate, along the shore to the camp gate, and on into the camp.
 gravel:makeRoad('gravel',[[-118,350],[-118,371],[-119,392],[-124,418],[-133,444],[-145,470],[-157,493],[-166,512],[-177,527]],{kind:'gravel',half:2.5,
  pins:[[-118,350,3.15],[-118,371,3.12],[-166,512,3.42],[-177,527,3.5]],smoothR:12}),
 // The camp's own lane: past the office, round the clearing's east side, up behind the lodge to the kitchen yard and on west to the service yard.
 lane:makeRoad('lane',[[-177,527],[-186,541],[-190,558],[-190,574],[-189,590],[-200,597],[-226,602],[-256,603],[-282,603]],{kind:'gravel',half:1.9,
  pins:[[-177,527,3.5],[-190,574,4.25],[-282,603,5.2]],smoothR:9}),
 // The service road: out of the service yard, behind the pump house, over the dam, along the south shore to the picnic lawn.
 service:makeRoad('service',[[-282,603],[-301,588],[-313,563],[-320,538],[-326,516],[-337,492],[-347,466],[-353,447],[-358,410],[-362,380],[-360,362],[-346,347],[-320,334],[-292,324],[-262,317],[-228,316],[-198,319],[-178,324]],{kind:'track',half:1.9,
  pins:[[-282,603,5.2],[-353,447,DAM.crest],[-358,410,DAM.crest],[-362,380,DAM.crest],[-178,324,2.75]],smoothR:10}),
};
// ---- level places (pads): rectangles (center, w across, d deep, heading) or circles; ground eased to y -------------
export const PADS=[
 {id:'lot',c:[-112,302],w:46,d:24,a:0,y:3.36,fall:6},
 {id:'oldlot',c:[-118,360],w:26,d:18,a:0,y:3.15,fall:5},
 {id:'booth',c:[-79,288],w:5,d:5,a:hd(-1,.6),y:3.7,fall:3},
 {id:'shelter',c:[-148,331],w:13,d:10,a:0,y:2.85,fall:4},
 {id:'restroom',c:[-97,323],w:7,d:6,a:0,y:3.35,fall:3},
 {id:'playground',c:[-122,338],w:14,d:11,a:.2,y:3.02,fall:4},
 {id:'kiosk',c:[-108,318],w:4,d:3,a:0,y:3.36,fall:2},
 {id:'shed',c:[-130,388],w:8,d:7,a:hd(1,-.2),y:2.75,fall:4},
 {id:'clearing',r:17,c:[-208,548],y:3.72,fall:7},
 {id:'campfire',r:6.5,c:[-212,516],y:2.38,fall:4},
 {id:'gate',c:[-166,512],w:9,d:6,a:0,y:3.42,fall:4},
 {id:'yard',c:[-284,604],w:18,d:14,a:0,y:5.2,fall:5},
 {id:'farm',c:[62,112],w:34,d:30,a:-.2,y:2.6,fall:8},
];
// ---- buildings -------------------------------------------------------------------------------------------------------
// c center (e, n), a heading of the front, w across the front, d deep, y the ground pad, floor: its floor over the pad.
// enter: has an interior you can walk into (floor, walls, door); door: [lx across the front, width].
const toward=(c,t)=>hd(t[0]-c[0],t[1]-c[1]);
const CL=[-208,548];// the clearing's center
const cabin=(id,name,c,y,{enter=false}={})=>({id,kind:'cabin',name,c,a:toward(c,CL),w:6.2,d:8.4,y,floor:.58,h:2.55,enter,door:[0,.92],porch:1.7});
export const BUILDINGS=[
 cabin('robin','ROBIN',[-234,529],3.52),cabin('bluejay','BLUEJAY',[-246,550],3.86,{enter:true}),cabin('cardinal','CARDINAL',[-242,571],4.26,{enter:true}),cabin('wren','WREN',[-228,591],4.62),
 cabin('heron','HERON',[-272,536],3.96),cabin('owl','OWL',[-284,564],4.5,{enter:true}),
 {id:'office',kind:'office',name:'OFFICE',c:[-181,531],a:hd(1,-.95),w:6.2,d:5.2,y:3.42,floor:.48,h:2.5,enter:true,door:[-1.2,.92],porch:1.5},
 {id:'lodge',kind:'lodge',name:'LODGE',c:[-208,579],a:Math.PI,w:20,d:11,y:4.3,floor:.72,h:3.4,enter:true,door:[0,1.8],porch:2.4,back:[-6.6,.95]},
 {id:'wash',kind:'wash',name:'WASHHOUSE',c:[-252,606],a:hd(.3,-1),w:8.4,d:5,y:5.0,floor:.18,h:2.6},
 {id:'mshed',kind:'mshed',name:'MAINTENANCE',c:[-295,611],a:hd(1,-.3),w:8,d:6,y:5.2,floor:.1,h:3.2},
 {id:'pump',kind:'pump',name:'PUMP HOUSE',c:[-303,509],a:hd(-.6,1),w:4.6,d:4,y:2.25,floor:.15,h:2.7},
 {id:'arshed',kind:'arshed',name:'RESERVOIR AUTHORITY',c:[-130,388],a:hd(1,-.2),w:5,d:4,y:2.75,floor:.1,h:2.8},
 {id:'restroom',kind:'restroom',name:'RESTROOM',c:[-97,323],a:Math.PI,w:4.4,d:3.4,y:3.35,floor:.12,h:2.7},
 {id:'booth',kind:'booth',name:'FEE BOOTH',c:[-79,288],a:hd(-1,.6),w:2.4,d:2.2,y:3.7,floor:.15,h:2.4},
 {id:'farmhouse',kind:'farmhouse',c:[58,104],a:hd(-1,.1),w:10,d:9,y:2.6,floor:.5,h:5.6},
 {id:'barn',kind:'barn',c:[74,132],a:hd(-1,-.2),w:12,d:16,y:2.6,floor:.05,h:6.4},
].map(b=>({...b,F:frameOf(b.c,b.a),pad:true}));
export const BLD=Object.fromEntries(BUILDINGS.map(b=>[b.id,b]));
for(const b of BUILDINGS)PADS.push({id:'b-'+b.id,c:b.c,w:b.w+(b.kind==='cabin'?2.4:3),d:b.d+(b.porch||0)*2+2.4,a:b.a,y:b.y,fall:b.kind==='barn'||b.kind==='farmhouse'?5:3.6});
// Interiors: floor rect in the building's own frame [x0,x1,z0,z1] (z out of the front), and walls as thin rects.
export function interiorOf(b){const hw=b.w/2,hd2=b.d/2,t=.14;return {x0:-hw+t,x1:hw-t,z0:-hd2+t,z1:hd2-t,floorY:b.y+b.floor};}

// ---- paths (packed dirt), the dock decks, the dam crest ---------------------------------------------------------------
const P=(id,pts,half=.75,kind='dirt')=>({id,pts,half,kind});
export const PATHS=[
 P('lawn-dock',[[-118,316],[-134,326],[-150,338],[-163,347]],.9),P('lawn-old',[[-112,316],[-114,334],[-117,350]],.85),P('lot-rest',[[-100,314],[-98,319]],.8),
 P('gate-office',[[-170,519],[-176,526],[-180,528]],.8),P('office-clear',[[-184,534],[-192,541],[-196,544]],.9),
 P('clear-robin',[[-218,543],[-226,535],[-230,532]],.8),P('clear-blue',[[-222,549],[-235,550],[-240,550]],.8),P('clear-card',[[-221,555],[-232,565],[-236,568]],.8),
 P('clear-wren',[[-214,563],[-220,578],[-224,586]],.8),P('clear-lodge',[[-208,563],[-208,570]],1.1),P('clear-fire',[[-209,532],[-211,522]],.9),
 P('fire-dock',[[-216,513],[-230,510],[-238,509]],.8),P('fire-canoe',[[-232,511],[-250,513]],.7),
 P('robin-heron',[[-238,533],[-258,536],[-266,536]],.7),P('blue-owl',[[-250,553],[-266,559],[-278,563]],.7),P('owl-service',[[-290,566],[-302,566],[-311,566]],.7),
 P('heron-service',[[-278,537],[-300,537],[-318,537]],.7),P('card-wash',[[-244,576],[-248,592],[-251,601]],.7),P('pump-path',[[-303,513],[-312,520],[-322,524]],.7),
];
export const DOCKS=[
 {id:'public',root:[-167,347],a:hd(-.78,.62),len:16,w:1.9,y:WATER+.45},
 {id:'camp',root:[-240,507],a:Math.PI,len:13,w:2.2,y:WATER+.42},
];
// ---- the region ----------------------------------------------------------------------------------------------------------
export const REGION_EN=[[-15,-3],[15,-3],[19,48],[70,90],[160,170],[175,330],[160,520],[105,700],[-20,830],[-230,890],[-470,870],[-660,750],[-720,520],[-690,320],[-590,215],
 [-420,170],[-260,140],[-120,100],[-34,54],[-17,22]];
const REGION=REGION_EN.map(wpt);
const RB=(()=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const [x,z] of REGION){x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);}return {x0,x1,z0,z1};})();
export const REGION_BOX=RB;
export function insideRegion(x,z,m=0){if(x<RB.x0-m||x>RB.x1+m||z<RB.z0-m||z>RB.z1+m)return false;const i=inPoly(REGION,x,z);if(m===0)return i;return i?(m>0||polyDist(REGION,x,z)>-m):(m>0&&polyDist(REGION,x,z)<m);}
export const regionDist=(x,z)=>polyDist(REGION,x,z);
// The far ground's 4 m lattice: a cell is Pine Ridge's when its center is inside the region.
export const LAT=4;
export const ownsCell=(i,j)=>insideRegion(i*LAT+LAT/2,j*LAT+LAT/2);

// ---- the height of the land ------------------------------------------------------------------------------------------------
// The lie of the land before anything was built: a wooded ridge between the town and the reservoir, rising westward
// round its end; the far shore climbing to wooded hills; gentle rolls everywhere; and the basin of the lake itself.
const ridgeN=e=>200-.1*(e+42);
function relief(e,n){const rn=ridgeN(e),rw=n<rn?46:42,r=Math.exp(-(((n-rn)/rw)**2))*(5.4+2.6*smooth((-e-160)/260))*(1-smooth((e-120)/70));
 const north=3*smooth((n-545)/140)+8.5*smooth((n-640)/210)+7*smooth((n-790)/150),west=6.5*smooth((-e-410)/150),east=2.6*smooth((e+30)/110)*smooth((n-235)/90);
 const roll=.75*Math.sin(e*.029+1.1)*Math.sin(n*.024-.6)+.36*Math.sin(e*.061-n*.047+.8)+.16*Math.sin(e*.13+n*.11);
 // below the dam the ground falls to the spillway's channel, running away west
 const dam=(()=>{const t=clamp((n-DAM.b[1])/(DAM.a[1]-DAM.b[1]),0,1),de=e-lerp(DAM.b[0],DAM.a[0],t);if(de>0)return 0;const along=1-smooth((Math.abs(n-408)-22)/40);return -6.2*smooth(-de/18)*along-2*smooth(-de/40)*(1-along);})();
 return 2.35+r+north+west+east+roll+dam;}
// The basin: a bank up from the waterline, then the land as it lies; under water the bed shelves away.
// Where a kid can wade (the pebble beach by the public dock, the edge of the park's lawn): the bed shelves gently, a hand's
// depth for the first metre and a half, under a foot at the edge of what can be walked (WADE), then away as elsewhere.
export const WADE={beach:{c:[-179,337.5],r:9.5,depth:2.8},lawn:{e0:-178,e1:-140,n0:330,n1:392,depth:.95}};
export function wadeZone(e,n){const B=WADE.beach,d=Math.hypot(e-B.c[0],n-B.c[1]),zb=1-smooth((d-B.r+3)/3);const L=WADE.lawn,zl=(e>L.e0-4&&e<L.e1+4&&n>L.n0-4&&n<L.n1+4)?1:0;return {beach:clamp(zb,0,1),lawn:zl};}
function basin(e,n,y,sd){if(sd<0){let b=WATER+.12-.55*smooth(-sd/2.5)-.13*(-sd);const z=wadeZone(e,n).beach;if(z>0){const g=WATER+.1-.11*(-sd)-.1*smooth((-sd-2.6)/2.4);b=lerp(b,Math.min(g,WATER+.06),z);}return Math.max(WATER-4.6,b);}
 if(sd>70)return y;const bank=WATER+.12+1.2*smooth(sd/7)+.05*Math.max(0,sd-4);return lerp(bank,y,smooth((sd-11)/58));}
// A pad: signed distance (negative inside) in its own frame.
function padDist(p,e,n){if(p.r)return Math.hypot(e-p.c[0],n-p.c[1])-p.r;const F=p.F||(p.F=frameOf(p.c,p.a)),[lx,lz]=F.of(e,n),dx=Math.abs(lx)-p.w/2,dz=Math.abs(lz)-p.d/2;return dx>0||dz>0?Math.hypot(Math.max(dx,0),Math.max(dz,0)):Math.max(dx,dz);}
// Road profiles: the pins, and between them the land itself smoothed along the road (so it rides the land, not a ruler).
function profile(R,base){const N=Math.ceil(R.L/2)+1,raw=new Float32Array(N);for(let i=0;i<N;i++){const s=Math.min(R.L,i*2),p=R.at(s),q=PL(p.x,p.z);raw[i]=base(q.e,q.n);}
 const k=Math.round(R.smoothR/2),sm=new Float32Array(N);for(let i=0;i<N;i++){let a=0,w=0;for(let j=-k;j<=k;j++){const q=clamp(i+j,0,N-1),ww=1-Math.abs(j)/(k+1);a+=raw[q]*ww;w+=ww;}sm[i]=a/w;}
 const pins=R.pins.map(([e,n,y])=>[R.sOf(e,n),y]).sort((a,b)=>a[0]-b[0]);
 // between pins: the smoothed land, offset so it meets each pin exactly (the offset itself interpolated)
 const at=s=>{const i=clamp(s/2,0,N-1.0001),k2=Math.floor(i),f=i-k2;return sm[k2]*(1-f)+sm[k2+1]*f;};
 if(!pins.length)return at;if(R.id==='orr'){const P2=pchip(pins);return s=>P2(s);}
 const off=pchip(pins.map(([s,y])=>[s,y-at(s)]));return s=>at(s)+off(s);}
const ROADLIST=Object.values(ROADS);
function natural(e,n){const sd=shoreSD(e,n);return basin(e,n,relief(e,n),sd);}
function padded(e,n,y){for(const p of PADS){const d=padDist(p,e,n);if(d<p.fall){const w=d<=0?1:1-smooth(d/p.fall);y=lerp(y,p.y,w);}}return y;}
// Profiles are computed from the padded natural land, in dependency order (later roads meet earlier ones).
for(const R of ROADLIST)R.y=profile(R,(e,n)=>padded(e,n,natural(e,n)));
// Where a road cuts its bed: the asphalt or gravel at its profile, ditches either side, then banks back up to the land
// (or an embankment down to it). w: how much the road owns this point.
// (the bed is flat a good way past the edge: the 2 m ground under a road never rises through it)
function roadShape(R,x,z,y,q){const a=Math.abs(q.t),s=clamp(q.s,0,R.L),Y=R.y(s)-.035,hw=R.half(s),bed=hw+(R.kind==='asphalt'?1.9:1.5);if(a>bed+16)return {y,w:0};
 const ditch=R.kind==='asphalt'?.28:R.kind==='track'?.08:.14,bank=a<bed?0:a<bed+1.8?-ditch*Math.sin(Math.PI*(a-bed)/1.8):(a-bed-1.8)*.26;
 let r=smin(y,Y+bank,1.4);r=Math.max(r,Y-Math.max(0,a-bed)*.55);const out=a<bed?Y:r,w=1-smooth((a-bed-3)/12);
 return {y:out,w};}
// The road's first stretch leaves downtown's Mill Street: its curbs and lawns, then the country.
function townEdge(s){return 1-smooth((s-5)/14);}
export function design(x,z){const {e,n}=PL(x,z);
 if(!insideRegion(x,z,2))return farLandY(x,z);
 // (inside downtown's own ground, where its Mill Street ends: the town's own surface — its road under the ribbon's lift, its grass)
 if(n<.01&&Math.abs(e)<20)return Math.abs(e)<5.2?ROADS.orr.y(0)-.035:farLandY(x,z);
 let y=padded(e,n,natural(e,n)),own=0;
 for(const R of ROADLIST){const q=R.project(x,z,3);if(!q||q.s<-1||q.s>R.L+1||Math.abs(q.t)>R.half(clamp(q.s,0,R.L))+16)continue;const r=roadShape(R,x,z,y,q);
  if(R.id==='orr'){const k=townEdge(q.s);if(k>0){const a=Math.abs(q.t),hw=R.half(clamp(q.s,0,R.L)),ref=farLandY(x,z);r.y=lerp(r.y,a<hw?R.y(clamp(q.s,0,R.L))-.035:ref,k);}}
  y=lerp(y,r.y,r.w>0?Math.max(r.w,.0):0);own=Math.max(own,r.w);}
 // fade to the older ground at the region's edge (but a road keeps its own shape to the very edge)
 const pd=inPoly(REGION,x,z)?polyDist(REGION,x,z):0;let w=smooth((pd-4)/45);w=Math.max(w,own*smooth((pd-.5)/1.5));
 return w>=1?y:lerp(farLandY(x,z),y,w);}

// ---- the sampled surface: the 2 m lattice (4 m away from everything) -----------------------------------------------------
// Fine where you can go: the box below, on 2 m nodes (aligned with the far ground's 4 m lattice).
export const FINE=(()=>{const a=PW(-392,-6),b=PW(48,660);const x0=Math.floor(Math.min(a.x,b.x)/4)*4,x1=Math.ceil(Math.max(a.x,b.x)/4)*4,z0=Math.floor(Math.min(a.z,b.z)/4)*4,z1=Math.ceil(Math.max(a.z,b.z)/4)*4;
 return {x0,x1,z0,z1,step:2,nx:(x1-x0)/2+1,nz:(z1-z0)/2+1};})();
let HF=null;// heights on the fine nodes (filled lazily: the builder and walking share them)
export function fineHeights(){if(HF)return HF;const F=FINE;HF=new Float32Array(F.nx*F.nz);for(let i=0;i<F.nx;i++)for(let j=0;j<F.nz;j++)HF[i*F.nz+j]=design(F.x0+i*2,F.z0+j*2);
 // nodes on the boundary of Pine Ridge's cells: the far ground's own value (shared exactly with its lattice); the 2 m
 // nodes midway along such an edge: halfway between its ends (the far ground's edge is one straight segment there)
 const own=(x,z)=>ownsCell(Math.floor(x/LAT),Math.floor(z/LAT));
 for(let i=0;i<F.nx;i++)for(let j=0;j<F.nz;j++){const x=F.x0+i*2,z=F.z0+j*2,mx=((x%4)+4)%4!==0,mz=((z%4)+4)%4!==0;if(mx&&mz)continue;
  // the 4 m cells touching this node
  if(PL(x,z).n<.01)continue;// (inside downtown's own ground: no far ground shares these)
  const cells=[];for(const dx of mx?[-2]:[-4,0])for(const dz of mz?[-2]:[-4,0])cells.push(own(x+dx+.01,z+dz+.01));
  if(cells.every(Boolean))continue;
  if(!mx&&!mz){HF[i*F.nz+j]=farLandY(x,z);continue;}
  const a=mx?farLandY(x-2,z):farLandY(x,z-2),b=mx?farLandY(x+2,z):farLandY(x,z+2);HF[i*F.nz+j]=(a+b)/2;}
 // the fine box's own border: where coarse Pine Ridge cells lie beyond it, its midway nodes sit on the coarse edge
 for(let i=0;i<F.nx;i++)for(let j=0;j<F.nz;j++){const border=i===0||j===0||i===F.nx-1||j===F.nz-1;if(!border)continue;const x=F.x0+i*2,z=F.z0+j*2;
  if((i===0||i===F.nx-1)&&j%2===1&&j+1<F.nz)HF[i*F.nz+j]=(HF[i*F.nz+j-1]+HF[i*F.nz+j+1])/2;
  if((j===0||j===F.nz-1)&&i%2===1&&i+1<F.nx)HF[i*F.nz+j]=(HF[(i-1)*F.nz+j]+HF[(i+1)*F.nz+j])/2;void x;void z;}
 return HF;}
// The surface height at a 4 m lattice node outside the fine box (the far ground's own value where Pine Ridge's cells end).
export function coarseY(x,z){const F=FINE;if(x>=F.x0&&x<=F.x1&&z>=F.z0&&z<=F.z1&&((x-F.x0)%2===0)&&((z-F.z0)%2===0)){const H=fineHeights();return H[((x-F.x0)/2)*F.nz+(z-F.z0)/2];}
 const i=Math.round(x/LAT),j=Math.round(z/LAT);for(const [a,b] of [[-1,-1],[0,-1],[-1,0],[0,0]])if(!ownsCell(i+a,j+b))return farLandY(x,z);return design(x,z);}
// The surface height anywhere in the fine box, exactly as triangulated (cells split along the same diagonal as the far
// ground: from (x+s, z) to (x, z+s)).
export function heightAt(x,z){const F=FINE;if(x<F.x0||x>F.x1||z<F.z0||z>F.z1)return design(x,z);const H=fineHeights(),fx=(x-F.x0)/2,fz=(z-F.z0)/2,i=Math.min(F.nx-2,Math.floor(fx)),j=Math.min(F.nz-2,Math.floor(fz)),u=fx-i,v=fz-j;
 const a=H[i*F.nz+j],b=H[(i+1)*F.nz+j],c=H[i*F.nz+j+1],d=H[(i+1)*F.nz+j+1];return u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);}

// ---- what is where for walking: a half-meter surface grid ----------------------------------------------------------------
export const PS={none:0,woods:1,grass:2,lawn:3,dirt:4,gravel:5,asphalt:6,lot:7,shore:8,water:9,wood:10,floor:11,solid:12,concrete:13,step:14,field:15,track:16,shallow:17};
export const PS_INFO=[
 {k:'none',walk:false,ride:false},{k:'woods',walk:true,ride:false,snd:'grass'},{k:'grass',walk:true,ride:true,snd:'grass',lawn:true},{k:'lawn',walk:true,ride:true,snd:'grass',lawn:true},
 {k:'dirt',walk:true,ride:true,snd:'grass',off:.02},{k:'gravel',walk:true,ride:true,snd:'asphalt',off:.035},{k:'asphalt',walk:true,ride:true,snd:'asphalt',off:.035},{k:'lot',walk:true,ride:true,snd:'asphalt',off:.035},
 {k:'shore',walk:true,ride:false,snd:'grass'},{k:'water',walk:false,ride:false},{k:'wood',walk:true,ride:false,snd:'floor'},{k:'floor',walk:true,ride:false,snd:'floor'},{k:'solid',walk:false,ride:false},
 {k:'concrete',walk:true,ride:true,snd:'asphalt'},{k:'step',walk:true,ride:false,snd:'floor'},{k:'field',walk:true,ride:false,snd:'grass'},{k:'track',walk:true,ride:true,snd:'asphalt',off:.03},
 {k:'shallow',walk:true,ride:false,snd:'water',wade:true}];
export const GRID=(()=>{const e0=-388,e1=44,n0=-4,n1=656,c=.5,ne=Math.round((e1-e0)/c),nn=Math.round((n1-n0)/c);return {e0,e1,n0,n1,c,ne,nn,t:new Uint8Array(ne*nn),floor:new Float32Array(ne*nn).fill(NaN)};})();
const G=GRID,gi=(i,j)=>i*G.nn+j;
export function cellOf(e,n){const i=Math.floor((e-G.e0)/G.c),j=Math.floor((n-G.n0)/G.c);if(i<0||j<0||i>=G.ne||j>=G.nn)return -1;return gi(i,j);}
export function typeAt(e,n){const k=cellOf(e,n);return k<0?PS.none:G.t[k];}
// painting helpers (later paints win)
function paintFn(e0,e1,n0,n1,fn){const i0=Math.max(0,Math.floor((e0-G.e0)/G.c)),i1=Math.min(G.ne-1,Math.ceil((e1-G.e0)/G.c)),j0=Math.max(0,Math.floor((n0-G.n0)/G.c)),j1=Math.min(G.nn-1,Math.ceil((n1-G.n0)/G.c));
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const e=G.e0+(i+.5)*G.c,n=G.n0+(j+.5)*G.c,r=fn(e,n);if(r===undefined||r===null)continue;if(typeof r==='number')G.t[gi(i,j)]=r;else{G.t[gi(i,j)]=r.t;if(r.f!==undefined)G.floor[gi(i,j)]=r.f;}}}
function paintPoly(poly,t,{f}={}){let e0=1e9,e1=-1e9,n0=1e9,n1=-1e9;for(const [e,n] of poly){e0=Math.min(e0,e);e1=Math.max(e1,e);n0=Math.min(n0,n);n1=Math.max(n1,n);}paintFn(e0,e1,n0,n1,(e,n)=>inPoly(poly,e,n)?(f===undefined?t:{t,f}):null);}
function paintRoad(R,t,extra=0,{under=null}={}){const pts=[];for(let s=0;s<=R.L;s+=2){const p=R.at(s),q=PL(p.x,p.z);pts.push(q);}let e0=1e9,e1=-1e9,n0=1e9,n1=-1e9;for(const q of pts){e0=Math.min(e0,q.e);e1=Math.max(e1,q.e);n0=Math.min(n0,q.n);n1=Math.max(n1,q.n);}
 const pad=R.half(0)+extra+6;paintFn(e0-pad,e1+pad,n0-pad,n1+pad,(e,n)=>{const w=PW(e,n),q=R.project(w.x,w.z,2);if(!q||q.s<-.5||q.s>R.L+.5)return null;if(Math.abs(q.t)>R.half(clamp(q.s,0,R.L))+extra)return null;if(under!==null&&!under.includes(G.t[cellOf(e,n)]))return null;return t;});}
function polyline(pts,step=.5){const out=[];for(let i=0;i<pts.length-1;i++){const [a,b]=[pts[i],pts[i+1]],L=Math.hypot(b[0]-a[0],b[1]-a[1]),k=Math.max(1,Math.ceil(L/step));for(let j=0;j<k;j++)out.push([lerp(a[0],b[0],j/k),lerp(a[1],b[1],j/k)]);}out.push(pts[pts.length-1]);return out;}
function paintLine(pts,half,t,{under=null}={}){for(const [e,n] of polyline(pts,.35))paintFn(e-half,e+half,n-half,n+half,(e2,n2)=>Math.hypot(e2-e,n2-n)<=half&&(under===null||under.includes(G.t[cellOf(e2,n2)]))?t:null);}
function paintRect(c,a,w,d,t,f){const F=frameOf(c,a),r=Math.hypot(w,d)/2+1;paintFn(c[0]-r,c[0]+r,c[1]-r,c[1]+r,(e,n)=>{const [lx,lz]=F.of(e,n);return Math.abs(lx)<=w/2&&Math.abs(lz)<=d/2?(f===undefined?t:{t,f:typeof f==='function'?f(lx,lz):f}):null;});}
function paintCircle(c,r,t){paintFn(c[0]-r,c[0]+r,c[1]-r,c[1]+r,(e,n)=>Math.hypot(e-c[0],n-c[1])<=r?t:null);}

// ---- things in the way (both walking and the builder read these) -----------------------------------------------------------
export const SOLIDS=[];
const solidC=(kind,e,n,r,o={})=>{const s={kind,e,n,r,...o};SOLIDS.push(s);return s;};
const solidR=(kind,c,a,w,d,o={})=>{const s={kind,c,a,w,d,F:frameOf(c,a),...o};SOLIDS.push(s);return s;};
// Doors: {building, lx, width, open (0..1), swing}. Shut doors are walls.
export const DOORS={};
// ---- trees (planted here, so walking knows the trunks) -------------------------------------------------------------------
export const TREES=[];

// ===================================================== painting the place ===================================================
{const T=PS;
 // Reachable country: the road's verges and the fields' edges, the woods along the roads and the paths, the park, the camp.
 paintRoad(ROADS.orr,T.woods,10.5);
 paintFn(-18,18,-4,20,(e,n)=>Math.abs(e)<=15?T.grass:null);// Mill Street's last lawns
 // the park: lawn from the lot down to the water and up to the old lot
 paintPoly([[-176,300],[-136,286],[-90,286],[-70,276],[-58,282],[-66,300],[-84,312],[-88,330],[-100,356],[-104,378],[-122,382],[-140,376],[-158,356],[-176,340]],T.lawn);
 paintPoly([[-176,340],[-200,322],[-240,312],[-300,318],[-345,334],[-360,352],[-372,362],[-366,346],[-330,322],[-260,304],[-196,302],[-176,300]],T.woods);// the south shore's woods (the service road)
 paintRoad(ROADS.gravel,T.woods,9);paintRoad(ROADS.service,T.woods,7.5);
 // the camp: its ground under the pines, from the shore to the back lane
 paintPoly([[-160,500],[-174,486],[-200,494],[-246,503],[-276,502],[-300,494],[-320,482],[-336,486],[-336,530],[-328,580],[-312,622],[-268,624],[-226,622],[-190,612],[-170,592],[-162,560],[-156,526]],T.woods);
 // the dam's crest and its approach
 // the shore and the water: anything under the waterline is water; a thin band of shore you can stand on
 paintFn(-388,44,-4,656,(e,n)=>{const k=cellOf(e,n);if(G.t[k]===T.none&&!(e<-140&&e>-370&&n>320&&n<512))return null;const sd=shoreSD(e,n);
  // (where you can wade: in, as far as the water is shallow; elsewhere the waterline is the edge)
  if(sd<-.35){const z=wadeZone(e,n);if(z.beach>.6&&sd>-WADE.beach.depth)return T.shallow;if(z.lawn&&sd>-WADE.lawn.depth)return T.shallow;return T.water;}if(sd<1.3&&G.t[k]!==T.none)return T.shore;return null;});
 // the fields by the road, fenced: you can stand at their edge, not wander across them
 paintFn(-30,40,30,160,(e,n)=>{const k=cellOf(e,n);if(G.t[k]!==T.woods)return null;const w=PW(e,n),q=ROADS.orr.project(w.x,w.z,2);if(q&&Math.abs(q.t)>8.6)return T.none;return null;});
 // grass verges along the road
 paintRoad(ROADS.orr,T.grass,6.5,{under:[T.woods,T.grass,T.lawn]});
 // the roads themselves
 paintRoad(ROADS.orr,T.asphalt,0);
 paintRect(PADS[0].c,PADS[0].a,PADS[0].w,PADS[0].d,T.lot);// the paved lot
 paintRect(PADS[1].c,PADS[1].a,PADS[1].w,PADS[1].d,T.gravel);// the old gravel lot
 paintRoad(ROADS.gravel,T.gravel,0);paintRoad(ROADS.lane,T.gravel,0);paintRoad(ROADS.service,T.track,0);
 // the farm's driveway (gravel) — part of the country you ride past, not a way anywhere
 paintLine([[ -3.4,98],[20,100],[46,103]],1.6,T.gravel,{under:[T.woods,T.grass,T.none]});
 // the paths
 for(const p of PATHS)paintLine(p.pts,p.half,T.dirt,{under:[T.woods,T.lawn,T.grass,T.shore,T.dirt,T.none]});
 // the clearing, worn dirt; the campfire terrace
 paintCircle(CL,15.5,T.dirt);paintCircle([-212,516],5.6,T.dirt);
 // the docks: decks over the water at their own height
 for(const D of DOCKS){const F=frameOf(D.root,D.a);paintFn(D.root[0]-D.len-3,D.root[0]+D.len+3,D.root[1]-D.len-3,D.root[1]+D.len+3,(e,n)=>{const [lx,lz]=F.of(e,n);return Math.abs(lx)<=D.w/2&&lz>=-1.2&&lz<=D.len?{t:lz<.2?T.step:T.wood,f:D.y}:null;});}// (its landward end a step: on and off it from the bank, wherever the bank is)
 // the dam: the crest is concrete at its own height; its faces and the water past it are not walkable
 {const a=DAM.a,b=DAM.b,L=Math.hypot(b[0]-a[0],b[1]-a[1]),dir=[(b[0]-a[0])/L,(b[1]-a[1])/L];paintFn(-376,-340,360,456,(e,n)=>{const de=e-a[0],dn=n-a[1],s=de*dir[0]+dn*dir[1],t=de*dir[1]-dn*dir[0];if(s<-3||s>L+3)return null;
  if(Math.abs(t)<=DAM.width/2-.25)return {t:T.concrete,f:DAM.crest};if(Math.abs(t)<=DAM.width/2+.4&&s>-.5&&s<L+.5)return T.solid;return null;});}
 // buildings: footprints solid, porches and steps walkable, interiors with their floors, doors in their walls
 for(const b of BUILDINGS){const {F}=b,hw=b.w/2,hd2=b.d/2,fy=b.y+b.floor;
  // porch across the front (cabins, office, lodge): a deck at the floor height, steps down in front of the door
  if(b.porch){paintRect(F.to(0,hd2+b.porch/2),b.a,b.w,b.porch,T.wood,fy);
   const sw=b.kind==='lodge'?3.2:1.4,steps=Math.max(1,Math.round(b.floor/.19)),run=steps*.28;
   paintRect(F.to(b.door[0],hd2+b.porch+run/2),b.a,sw,run,T.step,(lx,lz)=>{const f=clamp((lz+run/2)/run,0,1),k=Math.min(steps-1,Math.floor((1-f)*steps));return b.y+b.floor*(steps-k-1)/steps+.02;});}
  paintRect(b.c,b.a,b.w,b.d,T.solid);
  if(b.enter){const I=interiorOf(b);paintRect(F.to((I.x0+I.x1)/2,(I.z0+I.z1)/2),b.a,I.x1-I.x0,I.z1-I.z0,T.floor,I.floorY);
   const dw=b.door[1];DOORS[b.id]={b:b.id,lx:b.door[0],lz:hd2,w:dw,open:0,swing:1};paintRect(F.to(b.door[0],hd2-.05),b.a,dw,.42,T.floor,I.floorY);
   if(b.back){DOORS[b.id+'-back']={b:b.id,lx:b.back[0],lz:-hd2,w:b.back[1],open:0,swing:1,back:true};paintRect(F.to(b.back[0],-hd2+.05),b.a,b.back[1],.42,T.floor,I.floorY);
    // the kitchen's back step
    paintRect(F.to(b.back[0],-hd2-.8),b.a,1.6,1.4,T.step,b.y+b.floor*.5);}}}
}
// Furniture and fixtures that stand in the way (interiors in their building's frame; outside in e, n).
{const add=(b,lx,lz,w,d,kind,o={})=>{const B=BLD[b];solidR(kind,B.F.to(lx,lz),B.a,w,d,{inside:b,...o});};
 // the walls of the rooms you can walk into (thinner than the half-metre grid, so they are solids, not painted cells),
 // open where their doors are (a shut door is a wall of its own: shutAt)
 for(const B of BUILDINGS.filter(b=>b.enter)){const hw=B.w/2,hd2=B.d/2,t=.26,wall=(lx0,lx1,lz)=>{if(lx1-lx0>.05)add(B.id,(lx0+lx1)/2,lz,lx1-lx0,t,'wall');};
  // (the openings a little wider than the doors themselves: a doorway you can walk through without threading it)
  const gaps=(lz,dr)=>{if(!dr){wall(-hw,hw,lz);return;}wall(-hw,dr[0]-dr[1]/2-.12,lz);wall(dr[0]+dr[1]/2+.12,hw,lz);};
  gaps(hd2-.06,B.door);gaps(-hd2+.06,B.back||null);for(const s of [-1,1])add(B.id,s*(hw-.06),0,t,B.d,'wall');}
 // cabins: four bunks (two each side), a shelf at the back
 for(const id of ['bluejay','cardinal','owl']){const B=BLD[id],I=interiorOf(B);for(const s of [-1,1])for(const lz of [-1.9,1.05]){add(id,s*(B.w/2-.62),lz,1.0,2.05,'bunk',{side:s});}add(id,0,I.z0+.24,2.4,.4,'shelf');}
 // the office: a counter inside the door, a desk, a filing cabinet, a bench
 add('office',-.3,.6,2.2,.55,'counter');add('office',1.6,-1.4,1.4,.75,'desk');add('office',-2.55,-1.75,.5,.6,'cabinet');add('office',2.65,1.2,.45,1.4,'bench');
 // the lodge: four long tables with their benches, the stage, the kitchen wall and its counter, the hearth
 // (looking out of the front door, south: the stage at the west end on your right, the kitchen at the east end by the lane)
 // (two columns of tables with a wide aisle down the middle from the doors, room round their ends and between the rows)
 for(const lx of [-1.8,4.6])for(const lz of [-1.4,2.2]){add('lodge',lx,lz,3.0,.85,'table');for(const s of [-1,1])add('lodge',lx,lz+s*.72,2.8,.3,'bench');}
 add('lodge',8.6,0,1.6,9.8,'stage');add('lodge',-4.6,-.5,.2,9.6,'kwall',{gap:[-1.2,.2]});add('lodge',-7.6,-3.6,4.2,.7,'kcounter');add('lodge',-8.9,1.2,.6,4,'pantry');add('lodge',3,-5.05,2.2,.7,'hearth');
 // outside: the flagpole, the bell, the tetherball, benches, the map board, the signpost; the picnic tables, grills, barrels
 solidC('flagpole',CL[0],CL[1],.18);solidC('bellpost',-196,566,.22);solidC('tether',-222,541,.12);solidR('mapboard',[-190,541],hd(1,-.2),1.8,.3);solidC('signpost',-193,546,.14);
 for(const [e,n,a] of [[-201,539,.3],[-217,556,-.6],[-214,537,2.2],[-199,555,-2.6]])solidR('bench',[e,n],a,1.8,.5);
 solidR('buddyboard',[-229,511],hd(0,-1),2.4,.25);solidR('canoerack',[-256,513],hd(1,-.1),5.2,1.5);
 for(let k=0;k<6;k++){const a=k/6*Math.PI*2+.3;solidR('log',[-212+Math.sin(a)*4.3,516+Math.cos(a)*4.3],a,2.1,.42,{low:true});}// (benches round the ring: each along the circle)
 solidC('firering',-212,516,1.05,{low:true});
 // the park
 for(const [e,n,a] of [[-142,326,.1],[-153,326,-.1],[-141,336,.05],[-154,337,-.2],[-131,346,.4],[-163,321,.6],[-121,323,-.3],[-104,345,.2],[-170,330,1.2]])solidR('table',[e,n],a,1.9,1.6);
 for(const [e,n] of [[-158,329],[-139,320],[-126,349]])solidC('grill',e,n,.3);
 for(const [e,n] of [[-133,318],[-160,342],[-110,313],[-92,312],[-119,352]])solidC('barrel',e,n,.34);
 solidR('kiosk',[-108,318],0,2,.6);solidR('oldsign',[-113.4,368.9],hd(-.343,-.94),3.4,.3);
 for(const s of [-1,1])solidC('gatepost',-118+s*2.8,371,.12);
 // (boulders either side of the posts, the way they keep trucks from driving round a gate: the road through is the gate)
 for(const s of [-1,1])for(const [d,r,dn] of [[3.45,.42,.1],[4.35,.5,-.08],[5.35,.55,.12],[6.4,.5,-.05]])solidC('gaterock',-118+s*d,371+dn,r);
 // the playground: swing set, slide, merry-go-round
 solidR('swings',[-118,340],.2,4.6,.4);solidR('slide',[-127,336],.2,.8,3.6);solidC('merry',-121,333.2,1.3);
 solidC('lamp',-112,315.3,.2);for(let k=0;k<6;k++)solidC('bollard',-146+k*2.2,314.6,.12);
 // the gate under the arch
 for(const s of [-1,1]){const g=frameOf([-166,512],hd(.43,-.9));solidC('archpost',...g.to(s*2.9,0),.25);}
}
// The camp's gate leaves and the swing gate are drawn by the builder; the way through is open.

// ---- trees -------------------------------------------------------------------------------------------------------------------------
// Pines on the ridge and round the lake, a few maples and oaks; big shade trees on the park lawn; tall camp pines between the
// cabins. Kept off roads, paths, pads, buildings, the docks and the water. lod: 'near' (what you walk among), 'mid', 'far'.
{const rnd=seeded(5024),clear=(e,n,r)=>{const k=cellOf(e,n);if(k>=0){const t=G.t[k];if(t!==PS.woods&&t!==PS.none&&t!==PS.grass)return false;}
  for(const b of BUILDINGS)if(padDist({c:b.c,a:b.a,w:b.w+2,d:b.d+(b.porch||0)*2+2,F:b.F},e,n)<r)return false;
  for(const p of PADS)if(padDist(p,e,n)<r-1)return false;
  for(const s of SOLIDS){const d=s.r!==undefined?Math.hypot(e-s.e,n-s.n)-s.r:padDist({c:s.c,a:s.a,w:s.w,d:s.d,F:s.F},e,n);if(d<r)return false;}
  const w=PW(e,n);for(const R of ROADLIST){const q=R.project(w.x,w.z,2);if(q&&q.s>-1&&q.s<R.L+1&&Math.abs(q.t)<R.half(clamp(q.s,0,R.L))+r+.8)return false;}
  for(const p of PATHS){const pl=polyline(p.pts,1);for(const [pe,pn] of pl)if(Math.hypot(e-pe,n-pn)<p.half+r)return false;}
  if(shoreSD(e,n)<2.2+r*.5)return false;return true;};
 const near=(e,n)=>{const k=cellOf(e,n);return k>=0&&G.t[k]!==PS.none;};
 const add=(e,n,kind,size,o={})=>{TREES.push({e,n,kind,size,seed:hashSeed(77,e,n),...o});};
 // the park's shade trees (placed)
 for(const [e,n,k,s] of [[-128,306,'oak',1.25],[-160,312,'maple',1.15],[-136,352,'oak',1.35],[-98,302,'maple',1.05],[-170,355,'pine',1.3],[-86,336,'maple',1.1],[-110,365,'pine',1.2],[-145,312,'pine',1.15],[-100,280,'oak',1.2],[-74,302,'pine',1.25]])if(clear(e,n,1.2))add(e,n,k,s,{lod:'near'});
 // the camp's pines (taller, bare-trunked: the classic camp sky)
 for(let e=-332;e<=-158;e+=8.5)for(let n=488;n<=626;n+=8.5){const je=e+(rnd()-.5)*6,jn=n+(rnd()-.5)*6,pk=rnd(),sz=1.15+rnd()*.5;if(pk<.36)continue;if(Math.hypot(je-CL[0],jn-CL[1])<19)continue;if(!clear(je,jn,1.3))continue;add(je,jn,rnd()<.86?'pine':'oak',sz,{lod:'near',camp:true});}
 // the woods everywhere else: an 8 m jittered lattice over the region, thinned by where it is
 const fine=(e,n)=>e>-392&&e<48&&n>-6&&n<660;
 for(let e=-700;e<=172;e+=8)for(let n=40;n<=880;n+=8){const je=e+(rnd()-.5)*6.5,jn=n+(rnd()-.5)*6.5,pk=rnd(),sz=.9+rnd()*.65,kp=rnd(),kind=kp<.74?'pine':kp<.88?'maple':kp<.95?'oak':'birch';
  const w=PW(je,jn);if(!insideRegion(w.x,w.z,-6))continue;
  // open country: the fields by the road (n < 150 near it) and the farm stay open
  const q=ROADS.orr.project(w.x,w.z,3);if(jn<160&&q&&Math.abs(q.t)<46)continue;if(Math.hypot(je-62,jn-115)<38)continue;
  if(shoreSD(je,jn)<3)continue;
  // the park's lawn and lots are open; the camp is its own planting
  if(je>-178&&je<-56&&jn>270&&jn<384&&!(je>-104&&jn>356))continue;if(je>-336&&je<-154&&jn>484&&jn<628)continue;
  const dense=jn>150?.82:.5;if(pk>dense)continue;
  if(!clear(je,jn,1))continue;
  const reach=near(je,jn),lod=reach?'near':fine(je,jn)&&TREES.length%3?'mid':'far';add(je,jn,kind,sz,{lod});}
 // trunks you could walk into are solids
 for(const t of TREES)if(near(t.e,t.n)||t.lod==='near')solidC('tree',t.e,t.n,Math.max(.32,.25*t.size));
}

// The spatial index of solids, for walking.
const SC=4,SH=new Map(),sk=(i,j)=>i*100003+j;
for(const s of SOLIDS){const r=s.r??Math.hypot(s.w,s.d)/2,ce=s.e??s.c[0],cn=s.n??s.c[1];for(let i=Math.floor((ce-r)/SC);i<=Math.floor((ce+r)/SC);i++)for(let j=Math.floor((cn-r)/SC);j<=Math.floor((cn+r)/SC);j++){const k=sk(i,j);if(!SH.has(k))SH.set(k,[]);SH.get(k).push(s);}}
export function solidAt(e,n,r=0,{low=false}={}){for(let i=Math.floor((e-r)/SC);i<=Math.floor((e+r)/SC);i++)for(let j=Math.floor((n-r)/SC);j<=Math.floor((n+r)/SC);j++)for(const s of SH.get(sk(i,j))||[]){
 if(low&&s.low)continue;if(s.r!==undefined){if(Math.hypot(e-s.e,n-s.n)<s.r+r)return s;continue;}const [lx,lz]=s.F.of(e,n);if(Math.abs(lx)<s.w/2+r&&Math.abs(lz)<s.d/2+r){if(s.gap&&lz>s.gap[0]-r*0&&lz<s.gap[1])continue;return s;}}return null;}
// A shut door is a wall across its opening.
export function shutAt(e,n,r=0){for(const D of Object.values(DOORS)){if((D.cur??D.open)>.55)continue;// (the door as drawn now: shut until it has swung open, again as soon as it swings to)
 const B=BLD[D.b],[lx,lz]=B.F.of(e,n);if(Math.abs(lx-D.lx)<D.w/2+r&&Math.abs(lz-D.lz)<.28+r)return D;}return null;}

// ---- named places (the story uses these) -------------------------------------------------------------------------------------------
export const SPOT={
 // the park
 rack:{c:[-133,317.5],a:Math.PI/2},// the bike rack at the lawn's edge by the shelter path
 dockEnd:frameOf(DOCKS[0].root,DOCKS[0].a).to(0,DOCKS[0].len-1.2),dockSit:frameOf(DOCKS[0].root,DOCKS[0].a).to(.2,DOCKS[0].len-.55),
 shoreStones:[-178,338],// the pebbly shore beside the dock: flat stones
 entrance:[-60,277],newSign:[-56,276],booth:[-79,288],
 // the place in the picture (Chapter Four's footage, at its own scale): the old lot, the sign, the gate, the shed
 L0:[-118,362],oldSign:[-113.4,368.9],gate:[-118,371],arshed:[-130,388],vantage:[-111.6,362.9],
 // the camp
 campGate:[-166,512],office:BLD.office.c,clearing:CL,lodge:BLD.lodge.c,campfire:[-212,516],campDock:DOCKS[1].root,buddy:[-229,511],mapBoard:[-190,541],bell:[-196,566],
 pump:BLD.pump.c,yard:[-284,604],damN:DAM.a,damS:DAM.b,
};

// ---- gates that swing --------------------------------------------------------------------------------------------------------------------
// The yellow arm across the gravel road and the camp gate's two leaves. Each is a bar from its hinge (in the frame c,a: hx
// along the frame's x, at its middle) that turns about the post; ux is which way the bar runs from the hinge when shut.
// What blocks is the bar where it is drawn now (pine-build.js turns it toward want and writes ang back each frame), so
// a gate shuts in your way as it swings to and lets you by only once it has swung clear: never an invisible gate, never
// one you can walk through. want: where it is going (the story sets it); ang: where it is.
export const GATES={};
{const g=(id,c,a,hx,ux,len,ang,o={})=>{GATES[id]={id,c,a,hx,ux,len,ang,want:ang,shut:ang,...o};};
 g('swing',SPOT.gate,0,-2.8,1,5.6,0,{open:1.62,label:'the yellow gate'});
 const ca=hd(.43,-.9);g('campL',SPOT.campGate,ca,-2.75,1,2.7,-1.25,{label:'the camp gate'});g('campR',SPOT.campGate,ca,2.75,-1,2.7,.05,{label:'the camp gate'});}
// the bar's ends in the plan, as it stands now
export function gateBar(G,ang=G.ang){const ca=Math.cos(G.a),sa=Math.sin(G.a),he=G.c[0]+G.hx*ca,hn=G.c[1]-G.hx*sa,dx=G.ux*Math.cos(ang),dz=-G.ux*Math.sin(ang);
 return [he,hn,he+G.len*(dx*ca-dz*sa),hn+G.len*(-dx*sa-dz*ca)];}
export function gateAt(e,n,r=0){for(const G of Object.values(GATES)){const [a0,b0,a1,b1]=gateBar(G),de=a1-a0,dn=b1-b0,l2=de*de+dn*dn,t=Math.max(0,Math.min(1,((e-a0)*de+(n-b0)*dn)/l2));
  if(Math.hypot(e-a0-de*t,n-b0-dn*t)<r+.08)return G;}return null;}

// ---- the frame for the builders (reserve the land; older ground and scatter keep out) -------------------------------------------------
export function pineFrame(W){
 // keep far houses, yard props and trees off Pine Ridge (background.js, town-build.js ask inside())
 const box=RB;
 return {inside:insideRegion,box,ownsCell,design,heightAt,P0,PW,PL,zone:'pine'};}

// ---- walking and riding -----------------------------------------------------------------------------------------------------------------
// Answers for world points inside the surface grid (the road from Mill Street, the park, the shore, the camp). Null elsewhere.
export function pineNav(){
 const NB=(()=>{const a=PW(G.e0,G.n0),b=PW(G.e1,G.n1);return {x0:Math.min(a.x,b.x),x1:Math.max(a.x,b.x),z0:Math.min(a.z,b.z),z1:Math.max(a.z,b.z)};})();
 function where(x,z){if(x<NB.x0||x>NB.x1||z<NB.z0||z>NB.z1)return null;const {e,n}=PL(x,z);
  // (Mill Street's own last stretch, inside downtown's grid, stays downtown's)
  if(n<0)return null;const k=cellOf(e,n);if(k<0)return null;const t=G.t[k];if(t===PS.none&&!insideRegion(x,z))return null;return {e,n,k,t};}
 const info=t=>PS_INFO[t]||PS_INFO[0];
 function groundY(x,z,W=where(x,z)){if(!W)return null;const f=G.floor[W.k];if(!Number.isNaN(f))return f;return heightAt(x,z)+(info(W.t).off||0);}
 function baseY(x,z,W=where(x,z)){if(!W)return null;const f=G.floor[W.k];if(!Number.isNaN(f))return f;return heightAt(x,z);}
 const okAt=(e,n,ride,lawn)=>{const t=typeAt(e,n),I=info(t);if(!(ride?I.ride:I.walk))return false;if(ride&&I.lawn&&!lawn)return false;return true;};
 function walkable(x,z,{r=.28}={},W=where(x,z)){if(!W)return null;const {e,n}=W;if(!okAt(e,n,false,true))return false;
  for(const [de,dn] of [[r,0],[-r,0],[0,r],[0,-r]])if(!okAt(e+de,n+dn,false,true))return false;
  // (no stepping straight off a deck or a porch onto the ground below)
  const f0=G.floor[W.k];for(const [de,dn] of [[r,0],[-r,0],[0,r],[0,-r]]){const k=cellOf(e+de,n+dn),f=k>=0?G.floor[k]:NaN;if(Number.isNaN(f)!==Number.isNaN(f0)&&G.t[k]!==PS.step&&W.t!==PS.step){const a=Number.isNaN(f0)?heightAt(x,z):f0,b=Number.isNaN(f)?heightAt(...Object.values(PW(e+de,n+dn))):f;if(Math.abs(a-b)>.42)return false;}}
  if(solidAt(e,n,r*.9))return false;if(shutAt(e,n,r*.6))return false;if(gateAt(e,n,r*.9))return false;return true;}
 function rideable(x,z,{lawn=true,r=.3}={},W=where(x,z)){if(!W)return null;const {e,n}=W;if(!okAt(e,n,true,lawn))return false;for(const [de,dn] of [[r*.6,0],[-r*.6,0],[0,r*.6],[0,-r*.6]])if(!okAt(e+de,n+dn,true,lawn))return false;if(solidAt(e,n,r*.6,{low:false}))return false;if(gateAt(e,n,r*.6))return false;return true;}
 function surface(x,z,W=where(x,z)){if(!W)return null;return info(W.t).snd||'grass';}
 function heading(x,z,W=where(x,z)){if(!W)return null;let best=null,bd=1e9;for(const R of ROADLIST){const q=R.project(x,z,2);if(q&&Math.abs(q.t)<bd&&q.s>-1&&q.s<R.L+1){bd=Math.abs(q.t);best=q.a;}}return best??0;}
 return {where,groundY,baseY,walkable,rideable,surface,heading,box:NB};
}
