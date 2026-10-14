// Clip the surrounding land against the exact pavement/lawn boundaries. Removing
// whole 5 m cells left holes; overlapping two differently sampled surfaces flickered.
import {CONN,connAt,SUMMERFIELD,TL,CORE} from './town-plan.js';
function mask(points){
 let area=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];area+=a[0]*b[1]-b[0]*a[1];}if(area<0)points.reverse();
 return {points,x0:Math.min(...points.map(p=>p[0])),x1:Math.max(...points.map(p=>p[0])),z0:Math.min(...points.map(p=>p[1])),z1:Math.max(...points.map(p=>p[1]))};
}
const local=p=>{const q=TL(p.x,p.z);return [q.u,q.v];};
export const landMasks=[mask([[CORE.u0,CORE.v0],[CORE.u1,CORE.v0],[CORE.u1,CORE.v1],[CORE.u0,CORE.v1]])];
for(let s=CONN.straight;s<CONN.len;s+=2)landMasks.push(mask([local(connAt(s,-44)),local(connAt(s+2,-44)),local(connAt(s+2,44)),local(connAt(s,44))]));
// Summerfield already owns its lawns through s=24. Its straight frame continues
// exactly into the first connector segment, including the outer lawn edge.
landMasks.push(mask([local(SUMMERFIELD.point(CONN.u0-80,-44)),local(SUMMERFIELD.point(CONN.u0+24,-44)),local(SUMMERFIELD.point(CONN.u0+24,44)),local(SUMMERFIELD.point(CONN.u0-80,44))]));
function split(poly,a,b){const inside=[],outside=[],d=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
 for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dp=d(p),dq=d(q),ip=dp>=-1e-8,iq=dq>=-1e-8;(ip?inside:outside).push(p);
  if(ip!==iq){const t=dp/(dp-dq),v=[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];inside.push(v);outside.push(v);}}
 return {inside,outside};}
export function outsideMasks(poly){let pieces=[poly];const xs=poly.map(p=>p[0]),zs=poly.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);
 for(const m of landMasks){if(x1<m.x0||x0>m.x1||z1<m.z0||z0>m.z1)continue;const next=[];
  for(const p of pieces){let rest=p;for(let i=0;i<m.points.length&&rest.length>=3;i++){const s=split(rest,m.points[i],m.points[(i+1)%m.points.length]);if(s.outside.length>=3)next.push(s.outside);rest=s.inside;}}
  pieces=next;if(!pieces.length)break;
 }return pieces;}
