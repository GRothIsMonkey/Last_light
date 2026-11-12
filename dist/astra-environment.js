// Full-game industrial dressing. Visual detail only: no colliders, door state or story objects.
import * as THREE from './three.module.js';
import {artSurface} from './art-surfaces.js';
const V=p=>new THREE.Vector3(...p),UP=new THREE.Vector3(0,1,0);
export function dressIsolationWorks(root,cells,openings){
 const g=new THREE.Group();g.name='astra-isolation-age';root.add(g);
 const material=(color,kind,props={})=>artSurface(new THREE.MeshStandardMaterial({color,roughness:.93,...props}),kind);
 const rust=material(0x65452d,'oxidized',{metalness:.34}),iron=material(0x343e3e,'oxidized',{metalness:.5}),black=material(0x171c1d,'oxidized'),salt=material(0x989582,'mineral'),stain=material(0x363c32,'culvert'),chip=material(0x605b50,'mineral');
 const wire=new THREE.MeshStandardMaterial({color:0x282623,roughness:.86}),label=new THREE.MeshStandardMaterial({color:0xb8aa7c,roughness:.7});
 const box=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,10),bolt=new THREE.CylinderGeometry(1,1,1,6);
 const put=(geo,m,p,s,r)=>{const o=new THREE.Mesh(geo,m);o.position.set(...p);if(s)o.scale.set(...s);if(r)o.rotation.set(...r);o.castShadow=o.receiveShadow=true;g.add(o);return o;};
 const pipe=(a,b,r,m)=>{const av=V(a),bv=V(b),d=bv.clone().sub(av);const o=put(cylinder,m,av.add(bv).multiplyScalar(.5).toArray(),[r,d.length(),r]);o.quaternion.setFromUnitVectors(UP,d.normalize());return o;};
 const cable=(p,r=.016)=>put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p.map(V)),20,r,5),wire,[0,0,0]);
 const noise=n=>{const v=Math.sin(n*127.1+7.3)*43758.5453;return v-Math.floor(v);};
 const drip=seed=>{const shape=new THREE.Shape();for(let j=0;j<20;j++){const y=.5-j/19,w=(.12+noise(seed+j)*.38)*(1-j/22);if(j===0)shape.moveTo(-w,y);else shape.lineTo(-w,y);}for(let j=19;j>=0;j--){const y=.5-j/19,w=(.12+noise(seed+j+93)*.38)*(1-j/22);shape.lineTo(w,y);}shape.closePath();return new THREE.ShapeGeometry(shape);};
 for(let ci=0;ci<cells.length;ci++){
  const [id,x0,x1,z0,z1,y,h,o={}]=cells[ci],w=x1-x0,d=z1-z0;
  if(o.ramp||['made','shift','catwalk','ledge','office','review','crew','contact'].includes(o.kind))continue;
  const longX=w>d,span=longX?w:d,lo=longX?x0:z0,edge=longX?z0+.34:x0+.34,top=y+h-.32;
  // Overhead supply pair, aging clamps and offset cable trays. All stay tight against the walls.
  if(span>3){for(let k=0;k<2;k++){
   const off=.15+k*.19,a=longX?[x0+.3,top-k*.18,edge+off]:[edge+off,top-k*.18,z0+.3],b=longX?[x1-.3,top-k*.18,edge+off]:[edge+off,top-k*.18,z1-.3];pipe(a,b,k?.045:.085,k?iron:rust);
   for(let t=lo+1;t<lo+span-.4;t+=2.4){const p=longX?[t,top-k*.18,edge+off]:[edge+off,top-k*.18,t];const ring=put(new THREE.TorusGeometry(k?.051:.091,.012,5,12),iron,p);ring.rotation.set(longX?0:Math.PI/2,longX?Math.PI/2:0,0);}}
   for(let t=lo+.6;t<lo+span-1;t+=4.3){const a=longX?[t,top-.10,edge+.5]:[edge+.5,top-.1,t],b=longX?[Math.min(t+3.7,x1-.4),top-.10,edge+.5]:[edge+.5,top-.1,Math.min(t+3.7,z1-.4)],mid=V(a).add(V(b)).multiplyScalar(.5);mid.y-=.22+noise(t)*.25;cable([a,mid.toArray(),b]);}
  }
  // Patchy mineral runoff and cold joints on solid wall sections, never across an opening.
  for(const side of ['n','s','w','e']){
   const ew=side==='w'||side==='e',wall=side==='w'?x0:side==='e'?x1:side==='n'?z0:z1,start=ew?z0:x0,end=ew?z1:x1,sign=side==='w'||side==='n'?1:-1;
   const holes=openings.filter(v=>(v.a===id||v.b===id)&&(ew?v.x===wall:v.z===wall));
   for(let t=start+.85;t<end-.6;t+=1.9){if(holes.some(v=>t>v.r[0]-.35&&t<v.r[1]+.35))continue;
    const seed=ci*317+t*29,hh=Math.min(h*.78,.6+noise(seed)*2.4),yy=y+h-.25-hh*.5,ww=.1+noise(seed+3)*.34,dep=wall+sign*.226;
    const p=ew?[dep,yy,t]:[t,yy,dep];const patch=put(drip(seed),noise(seed+2)>.6?salt:stain,p,[ww,hh,1]);patch.rotation.y=ew?(side==='w'?Math.PI/2:-Math.PI/2):(side==='n'?0:Math.PI);patch.rotation.z=(noise(seed+1)-.5)*.045;
    // A thin secondary run below the wider deposit, and irregular chipped feet.
    const py=yy-hh*.56;put(box,stain,ew?[dep+.001*sign,py,t+.04]:[t+.04,py,dep+.001*sign],ew?[.014,hh*.4,ww*.2]:[ww*.2,hh*.4,.014]);
    if(h<6&&noise(seed+8)>.45){const q=ew?[wall+sign*.31,y+.035,t]:[t,y+.035,wall+sign*.31];put(box,chip,q,[.12+noise(seed)*.12,.035,.14+noise(seed+1)*.2],[.1,noise(seed+2)*3,.1]);}
   }
  }
  // Low floor channels read as drainage infrastructure without intruding on the route.
  if(!o.visual&&w>2.7&&d>2.7&&o.water==null){const gx=x0+.37;put(box,black,[gx,y+.008,(z0+z1)/2],[.18,.016,d-.7]);for(let z=z0+.45;z<z1-.35;z+=.25)put(box,iron,[gx,y+.02,z],[.20,.026,.025]);}
  // Old junction box, blank inventory tab, screws; no invented text or lore.
  if(span>7){const p=longX?[x0+span*.27,y+1.55,z0+.29]:[x0+.29,y+1.55,z0+span*.27];const ew=!longX,holes=openings.filter(v=>(v.a===id||v.b===id)&&(ew?v.x===x0:v.z===z0)),t=longX?p[0]:p[2];if(!holes.some(v=>t>v.r[0]-.4&&t<v.r[1]+.4)){
   put(box,iron,p,ew?[.16,.52,.38]:[.38,.52,.16]);put(box,label,ew?[p[0]+.084,p[1]+.12,p[2]]:[p[0],p[1]+.12,p[2]+.084],ew?[.007,.065,.17]:[.17,.065,.007]);
   for(const a of [-1,1])for(const b of [-1,1]){const pos=ew?[p[0]+.09,p[1]+a*.22,p[2]+b*.14]:[p[0]+b*.14,p[1]+a*.22,p[2]+.09];put(bolt,rust,pos,[.014,.013,.014],ew?[0,0,Math.PI/2]:[Math.PI/2,0,0]);}}}
 }
 // Main chamber buttress collars: architecture gives the colossal body a readable scale.
 for(const x of [-13.55,15.55])for(let z=55;z<85;z+=5.2){put(box,iron,[x,0,z],[.25,23.2,.29]);for(const y of [-9,-3,3,9]){put(box,rust,[x,y,z],[.38,.14,.55]);for(const dz of [-.2,.2])put(bolt,iron,[x+(x<0?.2:-.2),y,z+dz],[.045,.055,.045],[0,0,Math.PI/2]);}}
 return g;
}
