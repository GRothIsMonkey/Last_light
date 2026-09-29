// One authored route, measured in meters: narrative distances remain unchanged.
export const ROAD_HALF=4.7;
// Riding limit on the asphalt; sidewalks and driveway cuts are handled by rideable() in world.js.
export const LATERAL_LIMIT=3.75;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export function heading(d){return .55*smooth((d-120)/140)-.95*smooth((d-400)/140)+1.1*smooth((d-650)/150)-.62*smooth((d-940)/140);}
export const roadHeight=d=>1.65*Math.sin(d*.013)+.65*Math.sin(d*.027)-.45*Math.sin(d*.005);
export const roadGrade=d=>.02145*Math.cos(d*.013)+.01755*Math.cos(d*.027)-.00225*Math.cos(d*.005);
const first=-160,step=.5,last=1700,points=[{x:0,z:160}];
for(let d=first;d<last;d+=step){const p=points[points.length-1],a=heading(d+step/2);points.push({x:p.x+Math.sin(a)*step,z:p.z-Math.cos(a)*step});}
// Before the ride starts the street runs straight back (heading is 0 there), so it extrapolates exactly.
export function roadFrame(d){const a=heading(d);let x,z;
 if(d<first){x=points[0].x;z=points[0].z+(first-d);}
 else{const t=clamp((d-first)/step,0,points.length-1),i=Math.min(Math.floor(t),points.length-2),u=t-i;x=points[i].x+(points[i+1].x-points[i].x)*u;z=points[i].z+(points[i+1].z-points[i].z)*u;}
 return {x,z,y:roadHeight(d),heading:a,rightX:Math.cos(a),rightZ:Math.sin(a),pitch:Math.atan(roadGrade(d))};}
export const yardRelief=(d,offset)=>smooth((Math.abs(offset)-ROAD_HALF)/12)*(.20*Math.sin(d*.021+offset*.055)+.08*Math.sin(offset*.17));
export function groundPoint(d,offset=0){const p=roadFrame(d);return {x:p.x+offset*p.rightX,y:p.y+yardRelief(d,offset),z:p.z+offset*p.rightZ};}
export function roadSurface(d,offset=0){return roadHeight(d)+.025+.035*(1-Math.min(1,(offset/ROAD_HALF)**2));}
// World point -> street coordinates (distance along the route, signed lateral offset).
// Newton steps from a guess; unambiguous within ~90 m of the street (the tightest bend radius).
export function projectRoute(x,z,guess=null){
 let d=guess;
 if(d===null){let best=1e18;for(let s=-600;s<=last;s+=8){const p=roadFrame(s),q=(x-p.x)**2+(z-p.z)**2;if(q<best){best=q;d=s;}}}
 for(let k=0;k<8;k++){const p=roadFrame(d),fx=Math.sin(p.heading),fz=-Math.cos(p.heading),along=(x-p.x)*fx+(z-p.z)*fz,lat=(x-p.x)*p.rightX+(z-p.z)*p.rightZ;
  d+=along/Math.max(.25,1-curvature(d)*lat);if(Math.abs(along)<1e-6)break;}
 const p=roadFrame(d);return {d,lat:(x-p.x)*p.rightX+(z-p.z)*p.rightZ};
}
export const curvature=d=>(heading(d+.5)-heading(d-.5));
export const LENGTH=1120;
export const center=d=>Math.sin(d*.006)*15+Math.sin(d*.014)*3;
export const slope=d=>Math.cos(d*.006)*.09+Math.cos(d*.014)*.042;
