// Original, locally generated Chapter Five hero assets. No changes to earlier chapters' prop factories.
import * as THREE from './three.module.js';
import {createKit,roundedBoxGeometry} from './kit.js';
import {loft} from './chapter5-models.js';
import {mergeParts} from './rig.js';
import {pineMaterial} from './pine-materials.js';
const K=createKit(),mat=(c,o={})=>K.mat(c,o);
const tube=(g,points,r,m)=>{const q=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,6,false),m);g.add(q);return q;};
const mesh=(g,geo,m,p=[0,0,0])=>{const q=new THREE.Mesh(geo,m);q.position.set(...p);q.castShadow=q.receiveShadow=true;g.add(q);return q;};
export function backpack(color,{zip=0x9c998c}={}){
 const g=new THREE.Group(),cloth=pineMaterial(color,'fabric'),dark=pineMaterial(new THREE.Color(color).multiplyScalar(.63),'fabric'),thread=mat(0xb5aa8c),metal=mat(zip,{metalness:.55,roughness:.45});
 mesh(g,loft([[0,.10,.055],[.025,.139,.075],[.12,.15,.086],[.28,.144,.077],[.345,.123,.061],[.36,.105,.052]],20,3),cloth,[0,0,0]);
 K.rbox(g,0,.13,.089,.248,.17,.065,.035,dark);K.rbox(g,0,.13,.123,.062,.027,.004,.003,mat(0xc1b595));
 for(const side of [-1,1]){
  tube(g,[[side*.085,.31,-.052],[side*.13,.4,-.075],[side*.17,.3,-.20],[side*.14,.13,-.21],[side*.08,.04,-.065]],.016,dark);
  tube(g,[[side*.087,.31,-.067],[side*.13,.39,-.091],[side*.166,.30,-.217],[side*.139,.13,-.227]],.0014,thread);
  K.rbox(g,side*.134,.13,-.19,.024,.04,.012,.003,metal);
  tube(g,[[side*.10,.02,.068],[side*.136,.08,.075],[side*.135,.29,.065],[side*.10,.345,.05]],.0015,thread);
 }
 tube(g,[[-.045,.35,0],[-.04,.401,0],[.04,.401,0],[.045,.35,0]],.008,dark);
 const hinge=new THREE.Group();hinge.position.set(0,.36,.06);g.add(hinge);
 const flap=K.rbox(hinge,0,-.006,-.06,.25,.025,.14,.025,cloth);
 K.rbox(g,0,.353,0,.214,.005,.098,.019,mat(0x1c1b18));
 tube(g,[[-.11,.21,.12],[0,.219,.128],[.11,.21,.12]],.0022,metal);
 K.rbox(g,.075,.202,.13,.01,.023,.003,.002,metal);
 return {g,hinge,flap};
}
export function flashlightMesh(color=0x33424a){const g=new THREE.Group(),body=pineMaterial(color,'metal'),rubber=mat(0x24272a,{roughness:.87}),silver=mat(0xb6bbc0,{metalness:.85,roughness:.2});
 const shell=mesh(g,loft([[-.082,.018,.018],[-.065,.019,.019],[.058,.019,.019],[.073,.022,.022],[.093,.03,.03],[.111,.03,.03]],20),body);shell.rotation.z=-Math.PI/2;
 for(let i=0;i<7;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(.0195,.0017,5,20),rubber);r.rotation.y=Math.PI/2;r.position.x=-.052+i*.012;g.add(r);}
 const lens=mesh(g,new THREE.CircleGeometry(.025,24),mat(0x93aaa7,{metalness:.55,roughness:.1}),[.112,0,0]);lens.rotation.y=Math.PI/2;
 const rim=mesh(g,new THREE.TorusGeometry(.027,.0028,7,24),silver,[.112,0,0]);rim.rotation.y=Math.PI/2;
 K.rbox(g,.026,.019,0,.024,.007,.014,.004,rubber);K.rbox(g,-.078,.002,.02,.016,.006,.018,.003,rubber);return g;
}
export function bottle(){const g=new THREE.Group(),plastic=mat(0xb5d0d4,{roughness:.22,transparent:true,opacity:.48}),blue=mat(0x355c88,{roughness:.6});
 mesh(g,loft([[0,.026,.026],[.015,.034,.034],[.035,.032,.032],[.13,.032,.032],[.16,.026,.026],[.18,.014,.014],[.195,.014,.014]],20),plastic);
 for(const y of [.025,.045,.065,.135,.15]){const r=mesh(g,new THREE.TorusGeometry(.032,.0018,5,20),plastic,[0,y,0]);r.rotation.x=Math.PI/2;}
 K.cyl(g,0,.199,0,.016,.018,blue,16);K.cyl(g,0,.097,0,.033,.043,blue,20);K.rbox(g,0,.099,-.033,.029,.019,.001,.001,mat(0xdde0cd));
 mesh(g,new THREE.CylinderGeometry(.029,.029,.13,20),mat(0x95b8ba,{transparent:true,opacity:.25,roughness:.1}),[0,.077,0]);return g;
}
export function sockMesh(){const g=new THREE.Group(),cloth=pineMaterial(0xdedbcf,'fabric'),red=pineMaterial(0xa85b4b,'fabric');
 const curve=new THREE.CatmullRomCurve3([[0,0,0],[.005,-.06,.005],[-.008,-.13,0],[0,-.18,-.018],[.004,-.19,-.075]].map(p=>new THREE.Vector3(...p)));
 const geo=new THREE.TubeGeometry(curve,24,.026,12,false);geo.scale(.8,1,1);mesh(g,geo,cloth);K.ball(g,.004,-.19,-.076,.024,cloth,[.82,.75,1]);K.ball(g,0,-.174,.005,.027,cloth,[.8,1,1]);
 for(const y of [-.018,-.033]){const r=mesh(g,new THREE.TorusGeometry(.026,.003,6,20),red,[0,y,0]);r.rotation.x=Math.PI/2;r.scale.x=.82;}return g;
}
export function dressCamera(model){const g=model.group,black=mat(0x20242a),silver=mat(0xaab1b6,{roughness:.3,metalness:.72});
 // Rubber grip, screw heads, a ribbed lens ring and a fabric wrist loop remain correctly scaled at 96 mm wide.
 K.rbox(g,-.038,-.001,.016,.012,.041,.003,.003,black);
 for(const x of [-.043,.043])for(const y of [-.023,.023])K.ball(g,x,y,.015,.0011,silver,[1,1,.35]);
 for(let i=0;i<22;i++){const a=i/22*Math.PI*2;K.box(g,.016+Math.cos(a)*.0185,Math.sin(a)*.0185,.019,.001,.001,.006,black);}
 tube(g,[[-.05,.012,0],[-.067,-.017,.002],[-.055,-.06,.006],[-.036,-.056,.003],[-.05,.012,0]],.0017,black);return model;
}
export function clothShirt(g){g.clear();const gold=pineMaterial(0xc4a052,'fabric'),trim=pineMaterial(0xe4d6b2,'fabric'),parts=[];
 const body=mesh(g,loft([[-.56,.18,.015],[-.51,.202,.02],[-.34,.19,.026],[-.13,.207,.027],[-.07,.16,.026],[-.026,.052,.016]],24,3),gold);parts.push(body);
 for(const s of [-1,1]){const q=mesh(g,loft([[-.18,.069,.024],[-.06,.078,.03],[.012,.071,.024]],16,2.8),gold,[s*.235,-.065,0]);q.rotation.z=s*.85;parts.push(q);K.rbox(g,s*.047,-.045,-.025,.08,.036,.009,.008,trim).rotation.z=s*-.4;}
 K.rbox(g,0,-.155,-.028,.019,.21,.004,.003,trim);for(const y of [-.09,-.15,-.21])K.ball(g,0,y,-.031,.004,trim,[1,1,.4]);
 for(const q of parts){const a=q.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i);a.setZ(i,a.getZ(i)+Math.sin(x*51+y*3)*.009*(.4+Math.abs(y)));}q.geometry.computeVertexNormals();q.userData.hanging=Float32Array.from(a.array);}
 g.userData.fold=0;g.userData.setFold=u=>{g.userData.fold=u;for(const q of parts){const a=q.geometry.attributes.position,base=q.userData.hanging;for(let i=0;i<a.count;i++){const x=base[i*3],y=base[i*3+1],z=base[i*3+2];a.setXYZ(i,x*(1-.42*u),y*(1-.64*u),z+u*Math.sin((y+.56)*15)*.048);}a.needsUpdate=true;q.geometry.computeVertexNormals();}for(const q of g.children)if(!parts.includes(q))q.visible=u<.4;};return g;
}
// Wall-mounted and shallow additions keep the existing walk floor and table/door collision footprints.
export function garageDress(){const g=new THREE.Group(),wood=pineMaterial(0x92836b,'wood'),steel=pineMaterial(0x5a6061,'metal'),peg=pineMaterial(0x9a8d73,'wood'),red=mat(0x813d33),plastic=mat(0x5c6b73);
 for(const x of [-2.32,2.32]){K.box(g,x,1.26,1.55,.045,2.5,4.3,mat(0xb7b2a3));for(let z=-.45;z<3.6;z+=.6)K.box(g,x-.026*Math.sign(x),1.22,z,.055,2.4,.06,wood);}
 K.box(g,0,1.23,3.62,4.6,2.46,.045,mat(0xada99c));
 K.box(g,.2,1.45,3.57,2.55,.86,.035,peg);
 for(let x=-.9;x<1.4;x+=.12)for(let y=1.12;y<1.83;y+=.12)K.ball(g,x,y,3.543,.008,steel,[1,1,.2]);
 K.box(g,.2,.87,3.34,2.7,.07,.5,wood);for(const x of [-1.04,1.44])K.box(g,x,.43,3.37,.065,.85,.065,steel);
 for(let i=0;i<7;i++){const x=-.7+i*.3;K.box(g,x,1.42+(i%2)*.12,3.51,.025,.24,.025,i%2?red:steel);K.box(g,x,1.56+(i%2)*.12,3.50,.11,.035,.03,steel);}
 for(const y of [.24,.83,1.42]){K.box(g,-1.85,y,2.4,.65,.04,1.9,steel);for(let i=0;i<2;i++){K.rbox(g,-1.85,y+.19,1.95+i*.8,.51,.34,.65,.03,plastic);K.box(g,-1.58,y+.21,1.95+i*.8,.004,.08,.17,mat(0xc9c5b8));}}
 for(const x of [-2.15,-1.55])for(const z of [1.47,3.33])K.box(g,x,.9,z,.035,1.8,.035,steel);
 // Door rails and motor hang above head height, not in the doorway.
 for(const x of [-2.03,2.03])K.box(g,x,2.48,1.3,.055,.045,4.4,steel);K.rbox(g,0,2.34,2.48,.32,.18,.45,.025,plastic);K.box(g,0,2.42,.75,.025,.025,3.1,steel);
 const cord=mat(0xa05c36);tube(g,[[1.9,1.9,3.48],[2.02,1.65,3.48],[1.86,1.37,3.48],[1.65,1.55,3.48],[1.9,1.9,3.48]],.012,cord);
 const batches=new Map();g.updateMatrixWorld(true);g.traverse(q=>{if(!q.isMesh)return;const m=q.material,key=(m.userData.c5Surface||'plain')+':'+m.roughness+':'+m.metalness;if(!batches.has(key))batches.set(key,{m,parts:[]});batches.get(key).parts.push({geo:q.geometry,color:m.color,matrix:q.matrixWorld.clone()});});
 g.clear();for(const {m,parts} of batches.values()){const material=m.clone();material.color.setHex(0xffffff);material.vertexColors=true;material.onBeforeCompile=m.onBeforeCompile;material.customProgramCacheKey=m.customProgramCacheKey;mesh(g,mergeParts(parts),material);}
 return g;
}
