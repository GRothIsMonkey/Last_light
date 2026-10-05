// Where the night chapter lets you go, asked in world space. During the prologue the player
// lives in Oak Hollow's own coordinates; later that night you can ride back out of the
// cul-de-sac, up driveways, down Briarwood Lane and walk into the creek strip. This answers
// "how high is the ground here?", "can a bike roll here?" and "can a kid walk here?" for any
// point, by asking whichever street owns it. It builds nothing.
import {streetCoords} from './terrain.js';
import {groundPoint,heading} from './route.js';
import {SECTION,LOOKOUT} from './layout.js';
import {XS} from './streets.js';
import {createSpace} from './kit.js';
import {easementNav} from './easement.js';
import {basinNav} from './basin.js';

const CF=SECTION.curbFace,CUL=1100;
// Things a rider or walker cannot pass through (driveways and walks are registered too, but open).
// Houses are tested against their exact walls and garages instead (see footprints below).
const SOLID=new Set(['porch','tree','mailbox','lamp','pole','sign','hydrant','wall','rail','bins','toy','trampoline','swing','shed','hoop','far-house','fence']);
const WALL=new Set(['wall']);

export function createNav(world){
 const B=world.sideFrames[0],J=B.junction,C=J.creek,H=J.half;
 // Side-street houses that people can stand around, indexed along Briarwood.
 const sideHouses=world.sidePlansAll.filter(p=>p.frameId===B.id);
 const sideDrives=world.sideDrives.filter(d=>d.frameId===B.id);
 // Fences as segments in a coarse grid.
 const fences=new Map(),FC=20,fk=(i,j)=>i+','+j;
 for(const s of world.fenceSegs){const [ax,az,bx,bz]=s;for(let i=Math.floor(Math.min(ax,bx)/FC)-1;i<=Math.floor(Math.max(ax,bx)/FC)+1;i++)for(let j=Math.floor(Math.min(az,bz)/FC)-1;j<=Math.floor(Math.max(az,bz)/FC)+1;j++){const k=fk(i,j);if(!fences.has(k))fences.set(k,[]);fences.get(k).push(s);}}
 // Every house's own walls and garage, and the air conditioner beside it, as exact rectangles:
 // close enough to stand at a side window or a garage's side door.
 const walls=createSpace(20);
 for(const P of new Set([...world.houses,...world.sidePlansAll])){if(!P.toWorld||P.far)continue;const box=(x0,x1,z0,z1)=>{const c=P.toWorld((x0+x1)/2,(z0+z1)/2);walls.rect(c.x,c.z,(x1-x0)/2,(z1-z0)/2,P.worldRot,'wall');};
  box(-P.w/2,P.w/2,-P.depth/2,P.depth/2);if(P.hasGarage)box(P.gx-P.gw/2,P.gx+P.gw/2,P.gfront-P.gd,P.gfront);
  if(P.chimney==='exterior'){const s=P.hasGarage?-P.gs:1,x=s*(P.w/2+.42),z=P.sneak?0:-P.depth*.12;box(x-.4,x+.4,z-.54,z+.54);}
  if(P.ac&&P.lod==='full'){const s=P.hasGarage?-P.gs:1,x=s*(P.w/2+.55),z=P.sneak?P.depth*.15:-P.depth*.225;box(x-.42,x+.42,z-.42,z+.42);}}
 function nearFence(x,z,r){for(const s of fences.get(fk(Math.floor(x/FC),Math.floor(z/FC)))||[]){const [ax,az,bx,bz]=s,dx=bx-ax,dz=bz-az,l=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l));if(Math.hypot(x-ax-dx*t,z-az-dz*t)<r)return true;}return false;}

 // Which street owns a point: Briarwood past its first 24 m (it has its own ground and curve),
 // otherwise Oak Hollow (its lots, the junction mouth, the cul-de-sac and the lookout).
 // Behind the creek's back fence, the drainage easement answers for itself (Chapter Two).
 const EZ=world.easement?.height?world.easement:null,EN=EZ?easementNav(EZ):null;
 // Chapter Three: the old pond road and the detention basin past Alex's house answer for themselves
 // too, and so (only while the story has you up there) does Alex's room.
 const BZ=world.basin?.height?world.basin:null,BN=BZ?basinNav(BZ):null;let room=null;
 let lastU=40,lastD=1136;
 function locate(x,z){if(room&&room.inside(x,z))return {street:'room',d:0,lat:0};const m=streetCoords(x,z,lastD);lastD=m.d;
  if(BZ&&BZ.inside(x,z)){const q=BZ.local(x,z);return {street:'basin',u:q.u,v:q.v,d:m.d,lat:m.lat};}
  if(EZ&&EZ.inside(x,z)){const q=EZ.local(x,z);return {street:'easement',s:q.s,t:q.t,d:m.d,lat:m.lat};}
  if(Math.abs(m.d-J.d)<70&&m.lat*J.side>20){const q=B.project(x,z,Math.max(5,Math.min(B.length,lastU)));if(q.u>24&&q.u<B.length+10&&Math.abs(q.v)<46){lastU=q.u;return {street:'side',u:q.u,v:q.v,d:m.d,lat:m.lat};}}
  return {street:'main',d:m.d,lat:m.lat};}
 function sideAuthored(u,v){let best=null;
  for(const h of sideHouses){if(Math.abs(h.u-u)>16||Math.sign(v)!==h.side)continue;const q=h.localOf(u,v);for(const p of h.localPads)if(q.x>=p.x0&&q.x<=p.x1&&q.z>=p.z0&&q.z<=p.z1){const y=typeof p.y==='function'?p.y(q.x,q.z):p.y;if(best===null||y>best)best=y;}}
  if(best!==null)return best;for(const dr of sideDrives)if(dr.contains(u,v))return dr.y(u,v);return world.sideSurface(J,u,v);}
 // Ground height (the surface you stand on) and the bare ground under curbs and steps.
 function groundY(x,z,L=locate(x,z)){if(L.street==='room')return room.floorAt(x,z);if(L.street==='basin')return BN.groundY(L.u,L.v);if(L.street==='easement')return EN.groundY(L.s,L.t);return L.street==='side'?B.point(L.u,L.v).y+sideAuthored(L.u,L.v):world.groundY(L.d,L.lat);}
 function baseY(x,z,L=locate(x,z)){if(L.street==='room')return room.floorAt(x,z);if(L.street==='basin')return BN.groundY(L.u,L.v);if(L.street==='easement')return EN.groundY(L.s,L.t);return L.street==='side'?B.point(L.u,L.v).y:groundPoint(L.d,L.lat).y;}
 // The street's direction here (for the bike's gentle settling along it), either way along.
 function streetHeading(x,z,L=locate(x,z)){if(L.street==='room')return room.heading||0;if(L.street==='basin')return BZ.heading;if(L.street==='easement')return EZ.heading;return L.street==='side'?B.heading(L.u):heading(Math.min(L.d,CUL));}
 const solid=(x,z,r)=>!!world.space.blocked(x,z,r,SOLID)||!!walls.blocked(x,z,r,WALL);
 const inCreek=(u,v)=>Math.abs(u-C.u)<C.half+.5&&Math.abs(v)>H+XS.walk+.15;
 // Bikes: streets, sidewalks and curbs as before, plus whole driveways and front lawns now.
 function rideable(x,z,{lawn=true,r=.3}={}){const L=locate(x,z);if(L.street==='easement'||L.street==='room')return false;// bikes stay on the street side of the fence
  if(L.street==='basin')return BN.rideable(L.u,L.v)&&!solid(x,z,r*.6);// the drive, as far as the gate
  if(L.street==='side'){const a=Math.abs(L.v);if(L.u<6||L.u>196)return false;if(BN&&BN.onDrive(L.u,L.v))return !solid(x,z,r*.6);
   if(a<=H+XS.walk-.025)return !solid(x,z,r*.6);if(inCreek(L.u,L.v))return false;
   if(sideDrives.some(dr=>dr.contains(L.u,L.v)))return !solid(x,z,r);return lawn&&a<16&&!solid(x,z,r);}
  const {d,lat}=L,a=Math.abs(lat);if(d<-300)return false;
  if(world.rideable(d,lat))return true;
  // Briarwood's own first stretch, from Oak Hollow's curb to where its frame takes over.
  if(Math.abs(d-J.d)<H+12&&lat*J.side>4){const q=B.project(x,z,Math.max(1,Math.min(30,lat*J.side)));if(q.u>3&&q.u<26&&Math.abs(q.v)<=H+XS.walk-.025)return !solid(x,z,r*.6);}
  if(world.obstacles.some(o=>!o.soft&&d>o.d0-.12&&d<o.d1+.12&&lat>o.l0-.12&&lat<o.l1+.12))return false;
  if(world.drivewayOpenings.some(dr=>dr.contains(d,lat)))return true;
  if(d>CUL-1)return false;// the cul-de-sac's lawns and the lookout are walked, not ridden
  return lawn&&a>CF&&a<16.5&&!solid(x,z,r);}
 // Walkers: anywhere a kid could go without climbing a fence or walking into a house.
 function walkable(x,z,{r=.28}={}){const L=locate(x,z);if(L.street==='room')return room.walkable(x,z,r);if(nearFence(x,z,r))return false;
  if(L.street==='basin')return BN.walkable(L.u,L.v)&&!solid(x,z,r*.8);
  if(L.street==='easement')return EN.walkable(L.s,L.t)&&!solid(x,z,r*.8);
  if(L.street==='side'){if(L.u<6||L.u>196||Math.abs(L.v)>31.3)return false;return !solid(x,z,r);}
  const {d,lat}=L,a=Math.abs(lat);
  if(d>LOOKOUT.bounds.d0){const b=LOOKOUT.bounds;if(d>b.d1||lat<b.l0||lat>b.l1)return false;}
  else if(a>31||d<-300)return false;// front, side and back yards, inside the rear fences
  // (house boxes and soft reservations are for riders and scatter; walkers meet the real walls)
  if(world.obstacles.some(o=>!o.house&&!o.soft&&d>o.d0-r&&d<o.d1+r&&lat>o.l0-r&&lat<o.l1+r))return false;
  return !solid(x,z,r*.8);}
 // Surface under a walker's feet, for footsteps.
 function surface(x,z,L=locate(x,z)){if(L.street==='room')return 'floor';if(L.street==='basin')return BN.surface(L.u,L.v);if(L.street==='easement')return EN.surface(L.s,L.t);if(L.street==='side'){const a=Math.abs(L.v);return a<=H?'asphalt':a>=H+XS.strip&&a<=H+XS.walk?'asphalt':inCreek(L.u,L.v)?'grass':'grass';}
  const a=Math.abs(L.lat);return a<=CF||(a>=CF+XS.strip&&a<=CF+XS.walk)||L.d>=CUL&&Math.hypot(L.lat,L.d-1142)<11?'asphalt':'grass';}
 // Is there a house (or the far neighborhood) right here? For sound: walls between you and a siren.
 const FAR=new Set(['far-house']),wallAt=(x,z)=>!!walls.blocked(x,z,0,WALL)||!!world.space.blocked(x,z,0,FAR);
 // Small local A* for a grown-up crossing a driveway. No destination knowledge for companions.
 function walkPath(start,end,obstacles=[]){
  const step=.65,pad=5,minX=Math.min(start.x,end.x)-pad,minZ=Math.min(start.z,end.z)-pad,maxX=Math.max(start.x,end.x)+pad,maxZ=Math.max(start.z,end.z)+pad;
  const point=(i,j)=>({x:minX+i*step,z:minZ+j*step}),ix=p=>Math.round((p.x-minX)/step),iz=p=>Math.round((p.z-minZ)/step),key=(i,j)=>i+','+j;
  const valid=p=>walkable(p.x,p.z,{r:.3})&&!obstacles.some(o=>Math.hypot(o.x-p.x,o.z-p.z)<o.r+.38);
  const clear=(a,b)=>{const n=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.2);for(let i=1;i<=n;i++)if(!valid({x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n}))return false;return true;};
  if(clear(start,end))return [[end.x,end.z]];
  const root={i:ix(start),j:iz(start),g:0,p:start},open=[root],seen=new Map([[key(root.i,root.j),root]]);let done=null;
  for(let n=0;n<5000&&open.length;n++){open.sort((a,b)=>(a.g+Math.hypot(a.p.x-end.x,a.p.z-end.z))-(b.g+Math.hypot(b.p.x-end.x,b.p.z-end.z)));const q=open.shift();if(q.closed)continue;q.closed=true;
   if(Math.hypot(q.p.x-end.x,q.p.z-end.z)<step*1.5&&clear(q.p,end)){done=q;break;}
   for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const i=q.i+di,j=q.j+dj,p=point(i,j);if(p.x<minX||p.x>maxX||p.z<minZ||p.z>maxZ||!clear(q.p,p))continue;const k=key(i,j),g=q.g+Math.hypot(di,dj)*step,old=seen.get(k);if(old&&old.g<=g)continue;const v={i,j,p,g,parent:q};seen.set(k,v);open.push(v);}}
  if(!done)return [];const pts=[end];for(let q=done;q?.parent;q=q.parent)pts.unshift(q.p);pts.unshift(start);
  const path=[];for(let i=0;i<pts.length-1;){let j=pts.length-1;while(j>i+1&&!clear(pts[i],pts[j]))j--;path.push([pts[j].x,pts[j].z]);i=j;}return path;
 }
 // A room you are inside for a while (Chapter Three: Alex's): {inside(x,z), walkable(x,z,r), floorY}; null to leave.
 function setRoom(r){room=r||null;}
 return {locate,groundY,baseY,streetHeading,rideable,walkable,surface,nearFence,wallAt,walkPath,setRoom,get room(){return room;},frame:B,junction:J,creek:C,easement:EZ,basin:BZ,
  side:(u,v)=>B.point(u,v),main:(d,lat)=>groundPoint(d,lat)};
}
