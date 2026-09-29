// One authored route, measured in meters: narrative distances remain unchanged.
export const ROAD_HALF=4.7;
export const LATERAL_LIMIT=3.75;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export function heading(d){return .55*smooth((d-120)/140)-.95*smooth((d-400)/140)+1.1*smooth((d-650)/150)-.62*smooth((d-940)/140);}
export const roadHeight=d=>1.65*Math.sin(d*.013)+.65*Math.sin(d*.027)-.45*Math.sin(d*.005);
export const roadGrade=d=>.02145*Math.cos(d*.013)+.01755*Math.cos(d*.027)-.00225*Math.cos(d*.005);
const first=-160,step=.5,last=1700,points=[{x:0,z:160}];
for(let d=first;d<last;d+=step){const p=points[points.length-1],a=heading(d+step/2);points.push({x:p.x+Math.sin(a)*step,z:p.z-Math.cos(a)*step});}
export function roadFrame(d){const t=clamp((d-first)/step,0,points.length-1),i=Math.min(Math.floor(t),points.length-2),u=t-i,a=heading(d);return {x:points[i].x+(points[i+1].x-points[i].x)*u,z:points[i].z+(points[i+1].z-points[i].z)*u,y:roadHeight(d),heading:a,rightX:Math.cos(a),rightZ:Math.sin(a),pitch:Math.atan(roadGrade(d))};}
export function groundPoint(d,offset=0){const p=roadFrame(d);const verge=smooth((Math.abs(offset)-ROAD_HALF)/12);const yard=verge*(.20*Math.sin(d*.021+offset*.055)+.08*Math.sin(offset*.17));return {x:p.x+offset*p.rightX,y:p.y+yard,z:p.z+offset*p.rightZ};}
export function roadSurface(d,offset=0){return roadHeight(d)+.025+.035*(1-Math.min(1,(offset/ROAD_HALF)**2));}
