// A small pinned cloth, simulated in world space. Structural/shear/bend constraints,
// gravity, inertia, table contact and a damped fold guide; no rigid shirt shell.
import * as THREE from './three.module.js';
import {paper,clamp} from './chapter6-kit.js';

export function createEvidenceCloth(group){group.clear();const N=28,M=28,rest=[],uv=[],lookup=new Map(),tris=[],edges=[],positions=[],previous=[];
 const id=(x,y)=>lookup.get(x+','+y);
 for(let j=0;j<=M;j++)for(let i=0;i<=N;i++){const x=(i/N-.5)*.68,y=j/M*.56;
  const top=.018+Math.max(0,Math.abs(x)-.17)*.45;
  if(y<top||y>.17&&Math.abs(x)>.205||y<.047&&Math.abs(x)<.048)continue;
  lookup.set(i+','+j,rest.length);rest.push(new THREE.Vector3(x,-y,.004*Math.sin(x*35+y*8)));uv.push(i/N,1-j/M);positions.push(new THREE.Vector3());previous.push(new THREE.Vector3());}
 for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=id(i,j),b=id(i+1,j),c=id(i,j+1),d=id(i+1,j+1);if([a,b,c,d].every(n=>n!==undefined)){tris.push(a,c,b,b,c,d);}}
 for(let j=0;j<=M;j++)for(let i=0;i<=N;i++){const a=id(i,j);if(a===undefined)continue;for(const [dx,dy,k] of [[1,0,1],[0,1,1],[1,1,.66],[-1,1,.66],[2,0,.20],[0,2,.20]]){const b=id(i+dx,j+dy);if(b!==undefined)edges.push([a,b,rest[a].distanceTo(rest[b]),k]);}}
 const nearest=(x,y)=>rest.reduce((a,p,i)=>p.distanceToSquared(new THREE.Vector3(x,y,0))<rest[a].distanceToSquared(new THREE.Vector3(x,y,0))?i:a,0);
 const pins=[nearest(-.15,-.025),nearest(.15,-.025)],middle=nearest(.06,-.047);
 const tex=paper(256,256,(g,w,h)=>{g.fillStyle='#b7954f';g.fillRect(0,0,w,h);for(let j=0;j<h;j+=2){g.fillStyle=j%4?'#b99752':'#b3914d';g.fillRect(0,j,w,1);}
  g.fillStyle='#dbcdad';g.beginPath();g.moveTo(106,6);g.lineTo(108,23);g.lineTo(121,37);g.lineTo(128,15);g.lineTo(135,37);g.lineTo(148,23);g.lineTo(150,6);g.closePath();g.fill();g.fillRect(125,18,6,65);
  g.fillStyle='#8f7c57';for(let y=30;y<80;y+=17){g.beginPath();g.arc(128,y,1.6,0,7);g.fill();}g.strokeStyle='rgba(64,47,23,.25)';g.lineWidth=1;g.strokeRect(1,1,w-2,h-2);});
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(rest.length*3,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(tris);
 const material=new THREE.MeshStandardMaterial({color:tex?0xffffff:0xb7954f,map:tex,roughness:.97,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(geo,material);mesh.name='c6-simulated-shirt';mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;group.add(mesh);
 let initialized=false,fold=0,wantFold=0,clock=0,lastState=null,settle=0;const delta=new THREE.Vector3(),local=new THREE.Vector3(),inv=new THREE.Matrix4(),q=new THREE.Quaternion(),origin=new THREE.Vector3(),target=new THREE.Vector3();
 const stats={steps:0,maxStrain:0,finite:true,fold:0,pinned:0,mode:'hidden',moving:0};
 function folded(p,u,out){out.copy(p);const side=Math.sign(p.x),edge=.11,d=Math.max(0,Math.abs(p.x)-edge),a=u*Math.PI*.97;if(d){out.x=side*(edge+d*Math.cos(a));out.z+=Math.sin(a)*d+u*.008;}if(p.y<-.285){const v=p.y+.285;out.y=-.285+v*Math.cos(a);out.z-=v*Math.sin(a)+u*.012;}return out;}
 function reset(){initialized=false;fold=wantFold=clock=0;lastState=null;settle=0;Object.assign(stats,{steps:0,maxStrain:0,finite:true,fold:0,pinned:0,mode:'hidden',moving:0});}
 function update(dt,{prop,left=null,right=null,floor=null}={}){if(!group.visible||!['held','placed'].includes(prop.state)){initialized=false;stats.mode=prop.state;return;}
  group.updateMatrixWorld(true);inv.copy(group.matrixWorld).invert();group.getWorldQuaternion(q);group.getWorldPosition(origin);clock+=dt;fold+=(wantFold-fold)*(1-Math.exp(-dt*3.8));stats.fold=fold;stats.mode=prop.state;if(prop.state==='placed'&&lastState==='held')settle=1.2;settle=Math.max(0,settle-dt);
  if(!initialized){rest.forEach((r,i)=>{folded(r,fold,positions[i]).applyMatrix4(group.matrixWorld);previous[i].copy(positions[i]);});initialized=true;}
  const anchors=new Map();if(prop.held){if(left&&right){anchors.set(pins[0],left);anchors.set(pins[1],right);}else{anchors.set(middle,right||origin);}}stats.pinned=anchors.size;
  const n=Math.max(1,Math.ceil(Math.min(dt,.10)/(.011111))),h=Math.min(dt,.10)/n;let move=0;
  for(let step=0;step<n;step++){for(let i=0;i<positions.length;i++){const p=positions[i],old=previous[i];if(anchors.has(i))continue;delta.copy(p).sub(old).multiplyScalar(.975);old.copy(p);p.add(delta);p.y-=9.81*h*h;
    if(settle>0&&prop.state==='placed'){target.copy(rest[i]).applyMatrix4(group.matrixWorld);p.lerp(target,Math.min(.15,h*9));}
    if(prop.held&&fold>.01){folded(rest[i],fold,target).applyQuaternion(q).add(origin);p.lerp(target,Math.min(.15,h*fold*7));}
    if(floor!==null&&p.y<floor){p.y=floor;old.x+=(p.x-old.x)*.45;old.z+=(p.z-old.z)*.45;}}
   for(let iter=0;iter<12;iter++){for(const [a,b,len,k] of edges){delta.copy(positions[b]).sub(positions[a]);const d=delta.length();if(d<1e-7)continue;const pa=anchors.has(a),pb=anchors.has(b),corr=(d-len)/d*k/(pa||pb?1:2);if(!pa)positions[a].addScaledVector(delta,corr);if(!pb)positions[b].addScaledVector(delta,-corr);}
    for(const [i,a] of anchors){positions[i].copy(a);previous[i].copy(a);}if(floor!==null)for(const p of positions)if(p.y<floor)p.y=floor;}
   stats.steps++;
  }
  const p=geo.attributes.position;let finite=true;for(let i=0;i<positions.length;i++){local.copy(positions[i]).applyMatrix4(inv);p.setXYZ(i,local.x,local.y,local.z);finite&&=Number.isFinite(local.x+local.y+local.z);move+=positions[i].distanceToSquared(previous[i]);}
  p.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere();stats.finite=finite;stats.moving=Math.sqrt(move/positions.length);stats.maxStrain=0;
  for(const [a,b,len,k] of edges)if(k===1)stats.maxStrain=Math.max(stats.maxStrain,Math.abs(positions[a].distanceTo(positions[b])/len-1));lastState=prop.state;
 }
 group.userData.setFold=u=>{wantFold=clamp(u,0,1);};Object.defineProperty(group.userData,'fold',{get:()=>fold});
 return {update,reset,setFold:u=>{wantFold=clamp(u,0,1);},stats,mesh,positions,rest,pins};
}
