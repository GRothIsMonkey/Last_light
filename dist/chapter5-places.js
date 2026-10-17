// Chapter Five: what is worth a look at each place, for Jamie and Sam to go and look at on their own (companion-brain.js),
// and where the group is going. Kinds (who likes what is in PERSON): odd, water, climb, view, sign, map, records, supplies.
// W5(e, n[, y]) gives the world point; nothing here changes the world.
import {SPOT,BLD,DOCKS,SOLIDS} from './pine-plan.js';

export function createPlaces(W5){
 const poi=(id,kind,e,n,{y=null,stand=.9,time=null,gesture=null,reach=10,who=null,h=1.1}={})=>{const w=W5(e,n);return {id,kind,x:w.x,z:w.z,y:(y??w.y)+h,stand,time,gesture,reach,who};};
 const front=(id,lz=null)=>{const b=BLD[id],q=b.F.to(b.door?.[0]||0,(lz??b.d/2+(b.porch||0)+.6));return q;};
 const dockEnd=SPOT.dockEnd;
 const PARK=[
  poi('park-shelter','view',-148,331,{stand:1.4,h:1.6}),poi('park-water-edge','water',-171,341,{stand:.4,gesture:'look',h:.2,time:[5,8]}),
  poi('park-playground','climb',-121,333.2,{stand:1.6,h:.8}),poi('park-swings','climb',-118,340,{stand:1.2,h:1.2}),poi('park-kiosk','map',-108,318,{stand:1.1,h:1.5,gesture:'look'}),
  poi('park-grill','odd',-139,320,{stand:.8,h:.7,gesture:'inspect'}),poi('park-dock-root','water',...DOCKS[0].root,{stand:.6,h:.3}),poi('park-new-sign','sign',...SPOT.newSign,{stand:1.4,h:1.4,reach:14}),
  poi('park-barrel','odd',-133,318,{stand:.7,h:.8,gesture:'inspect'}),poi('park-dock-end','water',...dockEnd,{stand:.5,h:.1,gesture:'look'}),
 ];
 const OLDLOT=[poi('old-sign','sign',...SPOT.oldSign,{stand:1.5,h:1.6,gesture:'look'}),poi('old-shed','odd',...SPOT.arshed,{stand:2.4,h:1.4}),poi('old-gate','odd',SPOT.gate[0]+1.5,SPOT.gate[1],{stand:1,h:1})];
 const ROAD=[poi('road-poles','view',-133,444,{stand:2,h:3,reach:14})];
 const b=(id)=>BLD[id].c;
 const CAMP=[
  poi('camp-arch','sign',...SPOT.campGate,{stand:2.4,h:3.2,reach:14,gesture:'look'}),poi('camp-buddy','records',...SPOT.buddy,{stand:1.1,h:1.4,gesture:'look'}),
  poi('camp-flag','odd',...SPOT.clearing,{stand:1.3,h:2.5}),poi('camp-bell','odd',...SPOT.bell,{stand:1,h:1.8,who:'jamie'}),poi('camp-mapboard','map',...SPOT.mapBoard,{stand:1.2,h:1.4,gesture:'look',who:'sam'}),
  poi('camp-tether','odd',-222,541,{stand:.9,h:1.4,who:'jamie'}),poi('camp-canoes','water',-256,513,{stand:1.4,h:.7,gesture:'inspect'}),poi('camp-dock','water',...SPOT.campDock,{stand:.6,h:.2}),
  poi('camp-firering','odd',...SPOT.campfire,{stand:1.6,h:.3,gesture:'inspect'}),poi('camp-office-porch','records',...front('office'),{stand:.9,h:1.6,who:'sam'}),
  poi('camp-lodge-porch','view',...front('lodge'),{stand:1,h:1.8}),poi('camp-robin','odd',...front('robin',BLD.robin.d/2+.4),{stand:1.2,h:1.6,who:'jamie'}),
  poi('camp-wren','odd',...front('wren',BLD.wren.d/2+.4),{stand:1.2,h:1.6}),poi('camp-heron','odd',...front('heron',BLD.heron.d/2+.4),{stand:1.2,h:1.6,who:'jamie'}),
  poi('camp-wash','supplies',...front('wash',BLD.wash.d/2+.6),{stand:1.2,h:1.4,who:'sam'}),poi('camp-pump-path','view',-303,513,{stand:2,h:1.4,reach:14,who:'sam'}),
 ];
 void SOLIDS;void b;
 return {PARK,OLDLOT,ROAD,CAMP};
}
