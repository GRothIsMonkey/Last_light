// Street frames and the ground beyond the street.
// A frame maps street coordinates (u = distance along, v = lateral) to the world.
// MAIN is the ride itself; side streets get their own straight-then-bending frames;
// terrainY covers everything else, continuous with both.
import {groundPoint,heading,projectRoute,roadFrame,roadHeight,curvature,ROAD_HALF} from './route.js';
import {smooth,clamp,lerp} from './kit.js';

export const LAWN=.12,SIDEWALK=.16,CURB_TOP=.15;
// Main-street asphalt height above the street's ground: a gentle crown that flattens into the cul-de-sac.
export const roadCrown=(d,x)=>.025+.035*Math.max(0,1-(x/ROAD_HALF)**2)*(1-smooth((d-1127)/12))+.005*smooth((d-1127)/12);
// Final lookout: a small grassy rise past the cul-de-sac, then the field falls away.
export const knollRise=(d,lat)=>.5*smooth((d-1151)/11)*(1-.4*smooth((Math.abs(lat)-9)/8))-5.5*smooth((d-1176)/48);
export const knoll=(d,lat)=>LAWN+knollRise(d,lat);

const samples=[];for(let d=-640;d<=1700;d+=6){const p=roadFrame(d);samples.push(d,p.x,p.z);}
function nearestD(x,z){let best=1e18,d=0;for(let i=0;i<samples.length;i+=3){const q=(x-samples[i+1])**2+(z-samples[i+2])**2;if(q<best){best=q;d=samples[i];}}return d;}
export function streetCoords(x,z,hint=null){const r=projectRoute(x,z,hint??nearestD(x,z));return {d:clamp(r.d,-760,1760),lat:r.lat};}
// Height of the authored ground in the street corridor (lawn level is +LAWN above it).
export const nearY=(d,lat)=>groundPoint(d,lat).y+(d>1140?knollRise(d,lat):0);

// A slowly varying regional level: the street's own undulation averaged over ~100 m.
const REG=[];for(let d=-640;d<=1700;d+=20){const p=roadFrame(d);REG.push(p.x,p.z,roadHeight(d));}
function regional(x,z){let a=0,b=0;for(let i=0;i<REG.length;i+=3){const w=Math.exp(-((x-REG[i])**2+(z-REG[i+1])**2)/24200);a+=w*REG[i+2];b+=w;}return b>1e-9?a/b:0;}
// Ground height anywhere in the world (base level, without the lawn offset).
// Near the street it equals the street's own ground exactly; farther out it becomes
// gentle rolling land that rises a little toward the horizon, except in front of the
// lookout where the field falls away toward the next town.
export function terrainY(x,z,hint=null){
 const {d,lat}=streetCoords(x,z,hint),a=Math.abs(lat),inner=curvature(d)*lat;
 const w=(1-smooth((a-45)/75))*(1-smooth((inner-.42)/.33));
 const near=nearY(d,lat);if(w>.999)return near;
 const valley=1-smooth((d-1110)/70)*(1-smooth((a-150)/90));
 const hills=(2.2*smooth((a-60)/170)+3.2*smooth((a-210)/160))*valley;
 const noise=.9*Math.sin(x*.011+1.3)*Math.sin(z*.009-.4)+.45*Math.sin(x*.023-z*.017+2.1);
 const far=regional(x,z)+hills+noise*(.4+.6*smooth((a-80)/120))-5.5*smooth((d-1176)/48);
 return lerp(far,near,w);
}

export const MAIN={id:'main',point:(u,v)=>groundPoint(u,v),heading,project:(x,z,g=null)=>{const r=streetCoords(x,z,g);return {u:r.d,v:r.lat};}};

// A side street leaving the main street at a right angle from a straight stretch.
// It runs straight, then bends gently and crests a low rise, so its far end is
// never seen: the neighborhood simply continues out of sight.
export function makeSideFrame(j){
 const O=roadFrame(j.d),a0=heading(j.d)+j.side*Math.PI/2,step=.5,len=j.length+60;
 const hdg=u=>a0+j.bend*smooth((u-j.bendAt)/90);
 const pts=[O.x,O.z];for(let u=0;u<len;u+=step){const n=pts.length,a=hdg(u+step/2);pts.push(pts[n-2]+Math.sin(a)*step,pts[n-1]-Math.cos(a)*step);}
 const count=pts.length/2,hj=roadHeight(j.d);
 const rise=u=>j.rise*smooth((u-40)/150)-j.fall*smooth((u-195)/80);
 function center(u){const t=clamp(u/step,0,count-1),i=Math.min(Math.floor(t),count-2),f=t-i;return [pts[i*2]+(pts[i*2+2]-pts[i*2])*f,pts[i*2+1]+(pts[i*2+3]-pts[i*2+1])*f,hdg(u)];}
 const own=(u,v)=>hj+rise(u)+smooth((Math.abs(v)-4.7)/12)*(.2*Math.sin(u*.021+v*.055)+.08*Math.sin(v*.17));
 // Main-street coordinates of a side-street point, valid on the straight stretch.
 const toMain=(u,v)=>({d:j.d-j.side*v,lat:j.side*u});
 function ground(u,v,x,z){const w=smooth((u-24)/40)*(1-smooth((Math.abs(v)-30)/14));if(w>.999)return own(u,v);
  const m=toMain(u,v),base=u<40&&Math.abs(v)<40?nearY(m.d,m.lat):terrainY(x,z);return lerp(base,own(u,v),w);}
 function point(u,v){const [cx,cz,a]=center(u),x=cx+v*Math.cos(a),z=cz+v*Math.sin(a);return {x,y:ground(u,v,x,z),z};}
 function project(x,z,g=null){let u=g;if(u===null){let best=1e18;for(let i=0;i<count;i+=8){const q=(x-pts[i*2])**2+(z-pts[i*2+1])**2;if(q<best){best=q;u=i*step;}}}
  let v=0;for(let k=0;k<8;k++){const [cx,cz,a]=center(u),fx=Math.sin(a),fz=-Math.cos(a),along=(x-cx)*fx+(z-cz)*fz;v=(x-cx)*Math.cos(a)+(z-cz)*Math.sin(a);
   const kap=hdg(u+.5)-hdg(u-.5);u+=along/Math.max(.25,1-kap*v);if(Math.abs(along)<1e-6)break;}
  return {u,v};}
 return {id:'side-'+j.d,junction:j,point,heading:hdg,project,toMain,center,length:j.length};
}
