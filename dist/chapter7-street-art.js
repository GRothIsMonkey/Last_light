// Low vegetation and the abandoned road are drawn in patches so the ground shows
// through their edges. There is no geometry in the navigation or portal systems.
import * as THREE from './three.module.js';
import {seeded} from './kit.js';
import {makeShapes,paper,bake} from './chapter6-kit.js';

const K=makeShapes();
const leavesMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,side:THREE.DoubleSide});
const limestone=new THREE.MeshStandardMaterial({color:0x9d9988,roughness:.96});
function patch(name,positions,colors,material=leavesMat) {
 const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geom.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geom.computeVertexNormals();geom.computeBoundingSphere();
 const mesh=new THREE.Mesh(geom,material);mesh.name=name;mesh.receiveShadow=true;return mesh;
}
export function verge(parent,points,height,seed) {
 const r=seeded(seed),pos=[],col=[];
 for(const [x,z,rx,rz,n] of points){
  for(let j=0;j<n;j++){const a=r()*6.283,rad=Math.sqrt(r()),cx=x+Math.cos(a)*rx*rad,cz=z+Math.sin(a)*rz*rad,cy=height(cx,cz)+.012;
   const base=new THREE.Color().setHSL(.18+r()*.055,.25+r()*.12,.20+r()*.12),tip=base.clone().multiplyScalar(1.30);
   for(let k=0;k<4;k++){const ang=r()*6.283,w=.0025+r()*.006,dx=Math.cos(ang)*w,dz=Math.sin(ang)*w,hh=.035+r()*.075,bx=.025*Math.cos(a+ang),bz=.025*Math.sin(a+ang);
    const left=[cx-dx,cy,cz-dz],right=[cx+dx,cy,cz+dz],ml=[cx+bx*.32-dx*.6,cy+hh*.52,cz+bz*.32-dz*.6],mr=[cx+bx*.32+dx*.6,cy+hh*.52,cz+bz*.32+dz*.6],end=[cx+bx,cy+hh,cz+bz];
    pos.push(...left,...right,...mr,...left,...mr,...ml,...ml,...mr,...end);
    for(let n=0;n<9;n++){const c=n===8?tip:base;col.push(c.r,c.g,c.b);}}
   if(j%7===0){const leaf=new THREE.Color([0x997b44,0x87744b,0x667048][j%3]);
    pos.push(cx-.04,cy+.007,cz-.015,cx+.10,cy+.014,cz+.032,cx+.015,cy+.022,cz+.055);for(let k=0;k<3;k++)col.push(leaf.r,leaf.g,leaf.b);}
  }
 }
 const m=patch('c7-ground-cover',pos,col),normal=m.geometry.attributes.normal;
 for(let i=0;i<normal.count;i++){const v=new THREE.Vector3(normal.getX(i)*.35,Math.abs(normal.getY(i))+.75,normal.getZ(i)*.35).normalize();normal.setXYZ(i,v.x,v.y,v.z);}
 parent.add(m);return m;
}
export function remnant(parent,a,b,floor) {
 const r=seeded(1958),pos=[],col=[],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;
 const v=(u,w)=>{const x=a[0]+dx*u/len+nx*w,z=a[1]+dz*u/len+nz*w;return [x,floor(x,z)+.017,z];};
 function tri(p,q,t,color){pos.push(...p,...q,...t);for(let i=0;i<3;i++)col.push(color.r,color.g,color.b);}
 for(let i=0;i<320;i++){
  const u=r()*len,l=.10+r()*.48,spread=.88+.21*Math.sin(u*1.7),w=(r()-.5)*2.25*spread,sz=.05+r()*.24;
  const color=new THREE.Color([0x8a8572,0x837d68,0x928c78,0x797969,0x797659][i%5]).multiplyScalar(.72+r()*.27);
  const p=v(u,w),q=v(u+l*.43,w-sz*.7),t=v(u+l,w+sz*.18),v4=v(u+l*.55,w+sz);
  tri(p,q,t,color);tri(p,t,v4,color);
 }
 const m=patch('c7-broken-aggregate',pos,col);parent.add(m);return m;
}
const bark=new THREE.MeshStandardMaterial({color:0x604c37,roughness:1});
const sprigs=new THREE.MeshStandardMaterial({color:0x647650,roughness:.86});
export function dressFacade(g,{w,d,f,top,door,seed,porch}) {
 const r=seeded(seed),hw=w/2,front=-d/2;
 const metal=new THREE.MeshStandardMaterial({color:0xa6a89a,roughness:.58,metalness:.18});
 for(const side of [-1,1]){
  const x=side*(hw-.13);
  K.box(g,x,top*.5,front-.043,.105,top,.072,metal);K.pipe(g,[x,.28,front-.08],[x+.11*side,.075,front-.33],.042,metal,6);
 }
 // A foundation bed stops short of each porch and never enters a driveway or walk.
 const s=door>.3?-1:1,bed=new THREE.Group();bed.position.set(s*hw*.58,0,front-.55);g.add(bed);
 const soil=new THREE.Mesh(new THREE.CylinderGeometry(1,1.12,.07,20),bark);soil.position.y=.035;soil.scale.set(w*.176,1,.46);bed.add(soil);
 for(let k=0;k<9;k++){const a=Math.PI*(k/8),stone=new THREE.Mesh(new THREE.IcosahedronGeometry(.11,0),limestone);stone.scale.set(1.4,.64,.84);stone.position.set(Math.cos(a)*w*.174,.057,-Math.sin(a)*.45);bed.add(stone);}
 for(let k=0;k<4;k++){const x=(k-1.5)*w*.077,sz=.23+r()*.19;
  K.pipe(bed,[x,.02,-.02],[x+.06,sz*.9,0],.021,bark,5);
  for(let n=0;n<3;n++){const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),sprigs);crown.scale.set(sz*.80,sz*(.68+r()*.28),sz*.60);crown.rotation.y=r()*3;crown.position.set(x+(r()-.5)*.33,sz*.80,(r()-.5)*.29);bed.add(crown);}
 }
 if(porch){K.box(g,door, f+.014,front-.64,.83,.022,.41,bark);
  for(const side of [-1,1]){const x=door+side*(porch.w/2-.12);K.box(g,x,f+.80,front-porch.d*.57,.055,.075,porch.d*.75,limestone);}}
}
export function streetJoints(g,legs,bend,road,Y) {
 const m=new THREE.MeshStandardMaterial({color:0x827f70,roughness:1});
 for(const x of legs)for(const side of [-1,1]){
  for(let z=32;z<bend.z;z+=2.65)K.box(g,x+side*5.6,Y+.0703,z,1.21,.0015,.012,m);
  for(let z=33;z<bend.z;z+=6.4)K.box(g,x+side*(road+.15),Y+.131,z,.28,.002,.018,m);
 }
}
// A soft-edged raked print instead of unlit rectangular skidmarks on the grass.
export function heelMark() {
 const map=paper(128,256,(c,w,h)=>{const r=seeded(8701);for(let i=0;i<1200;i++){
  const y=r()*h,u=(r()+r()+r())/3,x=20+u*87;
  c.fillStyle=['rgba(122,100,66,.75)','rgba(168,150,101,.58)','rgba(80,76,48,.72)'][i%3];
  c.fillRect(x,y,.8+r()*2,3+r()*16);}});
 return new THREE.MeshStandardMaterial({map,color:map?0xffffff:0x857856,roughness:.98,transparent:true,opacity:.90,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
}

let hoseMat,flowerMat,leafTint,clay;
export function fridayYards(homes) {
 const root=new THREE.Group();root.name='c7-friday-yards';
 hoseMat??=new THREE.MeshStandardMaterial({color:0x617266,roughness:.76});
 flowerMat??=new THREE.MeshStandardMaterial({color:0xb99b74,roughness:.94});
 leafTint??=new THREE.MeshStandardMaterial({color:0x687757,roughness:.89});
 clay??=new THREE.MeshStandardMaterial({color:0x997057,roughness:.95});
 for(const key of ['sam','jamie']){
  const house=homes[key],anchor=house.toWorld(0,0),g=new THREE.Group();
  g.position.set(anchor.x,anchor.ground,anchor.z);g.rotation.y=house.worldRot;root.add(g);
  const edge=house.doorX+(house.doorX>0?-1:1)*(house.porchW/2-.21);
  K.cyl(g,edge,house.floor+.14,house.front+.32,.12,.27,clay,{r2:.17,sides:16});
  K.cyl(g,edge,house.floor+.27,house.front+.32,.174,.038,clay,{sides:16});
  for(let i=0;i<9;i++){const a=i*2.4,y=house.floor+.48+(i%3)*.04,xx=edge+Math.cos(a)*.14,zz=house.front+.32+Math.sin(a)*.14;
   K.pipe(g,[edge,house.floor+.27,house.front+.32],[xx,y,zz],.005,leafTint,5);
   const head=new THREE.Mesh(new THREE.IcosahedronGeometry(.044,1),i%4===0?flowerMat:leafTint);head.scale.y=.51;head.position.set(xx,y,zz);g.add(head);}
  if(key!=='sam')continue;
  // A hose, reel and a service crate at the back edge of the existing garage.
  const gx=house.gx+house.gs*(house.gw/2-.30),gz=house.gfront-house.gd+1.0;
  for(let i=0;i<5;i++){
   const loop=new THREE.Mesh(new THREE.TorusGeometry(.17+i*.013,.013,6,34),hoseMat);
   loop.position.set(gx,.97+(i%2)*.01,gz);loop.rotation.set(0,Math.PI/2,i*.08);g.add(loop);
  }
  K.box(g,gx,.94,gz,.065,.08,.58,limestone);
  K.box(g,gx,.16,gz+.6,.40,.28,.5,bark);
  for(let i=0;i<3;i++)K.box(g,gx-house.gs*.205,.09+i*.09,gz+.6,.01,.025,.49,limestone);
  K.cyl(g,gx,.32,gz+.6,.058,.07,clay,{r2:.067});
 }
 bake(root);return root;
}
