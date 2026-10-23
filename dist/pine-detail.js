// Original camp construction, park fixtures and low ground cover. All substantial additions stay within existing solids.
import * as THREE from './three.module.js';
import {PW,BLD,BUILDINGS,SOLIDS,TREES,SPOT,heightAt,shoreSD,ROADS} from './pine-plan.js';
import {pineMaterial} from './pine-materials.js';
import {seeded} from './kit.js';
export function buildPineDetail(W,O){const {K,B,at,root,inn,live,M}=O,r=seeded(59323),metal=pineMaterial(0x696c63,'metal'),rust=pineMaterial(0x755139,'metal'),wood=pineMaterial(0x8b8067,'wood'),cream=pineMaterial(0xb7b39c,'paint'),dark=K.mat(0x353930),green=pineMaterial(0x626d55,'paint');
 for(const b of BUILDINGS){if(!['cabin','office','lodge','wash','mshed','pump','booth','restroom','shelter'].includes(b.kind))continue;const g=at(root,b.c[0],b.c[1],b.y,b.a),f=b.floor||0,h=b.h||2.4,hw=b.w/2,hd=b.d/2,porch=b.porch||0;
  g.name='c5-construction-'+b.id;
  // Rainwater collection and downspouts, brackets and bolts. These run against the existing wall corners.
  for(const side of [-1,1]){K.cyl(g,side*(hw+.12),f+h-.07,-porch*.35,.05,b.d+porch*.7,metal,8,[Math.PI/2,0,0]);
   K.rod(g,[side*(hw+.1),f+h-.1,hd-.15],[side*(hw+.1),f+.12,hd-.15],.038,metal);
   K.rod(g,[side*(hw+.1),f+.12,hd-.15],[side*(hw+.25),f+.03,hd+.12],.038,metal);
   for(const y of [.5,1.6])B(g,side*(hw+.1),f+y,hd-.15,.12,.035,.085,rust);
  }
  // Uneven stain along the bottom boards, without covering doors, windows or clues.
  for(const side of [-1,1])for(let z=-hd+.2;z<hd-.1;z+=.46){const hh=.10+r()*.19;B(g,side*(hw+.009),f+hh*.5,z,.012,hh,.43,K.mat(0x655f4e,{roughness:1}));}
  if(porch){const z=-hd-porch+.12;for(const side of [-1,1]){K.rod(g,[side*(hw-.12),f+h-.1,z],[side*(hw-.85),f+h-.62,z],.045,wood,.045,4);K.rod(g,[side*(hw-.12),f+h-.1,z],[side*(hw-.12),f+h-.62,z+.65],.045,wood,.045,4);
    B(g,side*(hw-.14),f+.055,-hd-.22,.08,.09,.1,rust);}
   B(g,0,f+h-.13,z,hw*2,.16,.13,wood);
  }
  if(b.kind==='pump'||b.kind==='wash'){
   const x=-hw+.7;B(g,x,f+1.3,-hd-.06,.55,.68,.10,metal);B(g,x,f+1.3,-hd-.12,.48,.60,.015,green);K.ball(g,x+.16,f+1.3,-hd-.14,.018,dark);
   K.rod(g,[x,f+.97,-hd-.1],[x,f+.1,-hd-.1],.022,metal);for(let j=0;j<6;j++)B(g,hw+.012,f+1.8+j*.055,.1,.025,.023,.53,dark);
  }
  if(b.kind==='booth'){
   for(const side of [-1,1])B(g,side*.86,f+1.55,-hd-.05,.07,.94,.07,cream);for(const yy of [1.1,2])B(g,0,f+yy,-hd-.05,1.8,.07,.07,cream);B(g,0,f+1.09,-hd-.11,1.87,.065,.19,wood);
   B(g,hw+.02,f+1.0,0,.04,1.9,.8,green);B(g,hw+.045,f+1.04,-.27,.04,.04,.07,metal);
   for(const side of [-1,1])K.rod(g,[side*(hw+.2),f+2.35,-hd-.22],[0,f+2.97,-hd-.22],.052,cream,.052,4);
  }
  if(b.enter){const q=at(inn,b.c[0],b.c[1],b.y,b.a);q.name='c5-room-dressing-'+b.id;
   // Wall base trim, exposed roof ties and end grain at the ceiling.
   for(const side of [-1,1]){B(q,side*(hw-.08),f+.06,0,.04,.12,b.d-.12,wood);for(let z=-hd+.75;z<hd;z+=1.25)K.rod(q,[side*(hw-.12),f+h-.12,z],[0,f+h+.45,z],.045,wood,.045,4);}
   if(b.kind==='cabin'){
    // Old towel pegs, worn camp-number plaque and an enamel cup on the existing back shelf.
    for(let k=0;k<4;k++){const x=-hw+.6+k*.26;K.cyl(q,x,f+1.55,hd-.13,.018,.13,metal,6,[Math.PI/2,0,0]);}
    const x=hw-.5;K.cyl(q,x,f+1.37,hd-.28,.052,.11,cream,16);const ring=new THREE.Mesh(new THREE.TorusGeometry(.035,.008,6,14),cream);ring.position.set(x+.06,f+1.39,hd-.28);q.add(ring);
   }
  }
 }
 // Real hinge straps, pins and a latch on the existing moving gate leaves.
 const gate=O.dyn.campGate;if(gate)for(const side of [gate.left,gate.right]){for(const y of [.36,1.30]){B(side.leaf,-side.s*.38,y,-.045,.8,.045,.025,rust);K.cyl(side.leaf,0,y,0,.034,.15,metal,10);for(const x of [.15,.4,.65])K.ball(side.leaf,-side.s*x,y,-.063,.012,metal);}
  B(side.leaf,-side.s*2.45,.9,-.065,.42,.05,.03,metal);}
 // A tangible fence meets the arch and continues into the wooded edge. Matching nav rectangles are in pine-plan.
 const fence=SOLIDS.filter(s=>s.kind==='camp-fence');for(const s of fence){const g=at(root,...s.c,null,s.a);for(let x=-s.w/2;x<=s.w/2+.01;x+=2){B(g,x,.68,0,.11,1.36,.12,wood);K.rbox(g,x,1.38,0,.13,.04,.15,.01,cream);}for(const y of [.38,.86])B(g,0,y,0,s.w,.10,.075,wood);}
 // A shaded metal reflector around the office's existing porch lamp (no additional dynamic light).
 {const b=BLD.office,g=at(root,...b.c,b.y,b.a),x=b.door[0],z=-b.d/2-b.porch*.5,y=b.floor+b.h-.2;
  K.cyl(g,x,y+.13,z,.20,.07,green,18);K.cyl(g,x,y+.06,z,.13,.09,cream,18);K.cyl(g,x,y+.31,z,.009,.35,metal,6);}
 // Low clusters of ferns and leaf litter replace the bare carpet between trunks. Instancing keeps the cost bounded.
 const fern=new THREE.BufferGeometry(),pos=[];
 for(let arm=0;arm<5;arm++){const a=arm*2.399,dx=Math.cos(a),dz=Math.sin(a);for(let k=1;k<5;k++){const u=k/5,cx=dx*u*.6,cz=dz*u*.6,y=Math.sin(u*Math.PI)*.37,w=.13*(1-u*.5);for(const side of [-1,1]){
   const p=[cx,y,cz],q=[cx-dz*w*side,y+.025,cz+dx*w*side],t=[cx+dx*.16,y-.045,cz+dz*.16];pos.push(...p,...q,...t);}}}
 fern.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));fern.computeVertexNormals();const fm=new THREE.MeshStandardMaterial({color:0x6d7c42,side:THREE.DoubleSide,roughness:1});const places=[];
 for(let i=0;i<TREES.length;i+=4){const t=TREES[i];if(t.n<180||t.lod==='far'||r()>.62)continue;const e=t.e+1+r()*1.8,n=t.n+(r()-.5)*3,p=PW(e,n);if(shoreSD(e,n)<1)continue;let road=false;for(const R of Object.values(ROADS)){const q=R.project(p.x,p.z,3);if(q&&Math.abs(q.t)<(R.half?.(q.s)||2)+.6){road=true;break;}}if(!road)places.push({p,s:.7+r()*.7});}
 const inst=new THREE.InstancedMesh(fern,fm,places.length),obj=new THREE.Object3D();inst.name='c5-forest-floor-ferns';for(let i=0;i<places.length;i++){const {p,s}=places[i];obj.position.set(p.x,heightAt(p.x,p.z)+.015,p.z);obj.rotation.y=r()*6.28;obj.scale.setScalar(s);obj.updateMatrix();inst.setMatrixAt(i,obj.matrix);}inst.computeBoundingSphere();inst.receiveShadow=true;live.add(inst);O.understory=inst;
 // Grass and fallen twigs break up the path edge at eye height without obstructing navigation.
 const blades=[],twig=[];
 for(let j=0;j<13;j++){const a=r()*6.28,x=(r()-.5)*.75,z=(r()-.5)*.75,h=.12+r()*.32,w=.012+r()*.018,dx=Math.cos(a),dz=Math.sin(a);
  blades.push(x-dx*w,0,z-dz*w,x+dx*w,0,z+dz*w,x+dx*.09,h,z+dz*.09);}
 for(let j=0;j<4;j++){const a=r()*6.28,x=(r()-.5)*.9,z=(r()-.5)*.9,dx=Math.cos(a)*.3,dz=Math.sin(a)*.3;twig.push(x,.009,z,x+dx,.014,z+dz,x+dx*.5-dz*.025,.012,z+dz*.5+dx*.025);}
 const patches=[];for(let i=1;i<TREES.length;i+=3){const t=TREES[i];if(t.n<80||t.lod==='far'||r()>.8)continue;const p=PW(t.e+1+r()*2.5,t.n+(r()-.5)*4);if(shoreSD(t.e,t.n)<1)continue;
  if(Object.values(ROADS).some(R=>{const q=R.project(p.x,p.z,3);return q&&Math.abs(q.t)<(R.half?.(q.s)||2)+.25;}))continue;
  if(BUILDINGS.some(b=>{const v=PW(...b.c);return Math.hypot(v.x-p.x,v.z-p.z)<Math.hypot(b.w,b.d)*.55+1;}))continue;patches.push(p);}
 for(const [array,color,name] of [[blades,0x737a49,'c5-dry-grass'],[twig,0x73604a,'c5-fallen-twigs']]){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(array,3));geo.computeVertexNormals();const m=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({color,roughness:1,side:THREE.DoubleSide}),patches.length);m.name=name;m.receiveShadow=true;
  for(let i=0;i<patches.length;i++){const p=patches[i],s=.7+r()*.9;obj.position.set(p.x,heightAt(p.x,p.z)+.012,p.z);obj.rotation.y=r()*6.28;obj.scale.setScalar(s);obj.updateMatrix();m.setMatrixAt(i,obj.matrix);m.setColorAt(i,new THREE.Color().setScalar(.7+r()*.5));}m.computeBoundingSphere();live.add(m);}
}
