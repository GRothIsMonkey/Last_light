// Background evacuees: shared geometry, instanced limbs, economical individual motion.
// Story actors keep their full rigs and contacts. Their paths and grief corner stay clear.
import * as THREE from './three.module.js';
import {artLoft} from './astra-anatomy.js';
import {roundedBoxGeometry} from './kit.js';
export function shelterCrowd(parent){
 const root=new THREE.Group();root.name='a1-evacuee-crowd';parent.add(root);
 const people=[],add=(x,z,pose='sit',seat=.12,a=0,zone='gym',small=false)=>people.push({x,z,pose,seat,a,zone,small,id:people.length});
 // Two occupied bleacher tiers. Pairs and children break up the rows.
 for(let row=0;row<2;row++)for(let col=0;col<16;col++)add(-11.5+col*1.04+(row%2)*.12,-7.24-row*.38,'sit',.88+row*.55,Math.PI,'gym',col%6===2);
 // Families sit on blankets between the cots, away from the main east aisle.
 for(const [x,z]of [[-9.45,-5.4],[-6.25,-2.9],[-3.05,-.1],[-9.45,2.6],[-6.25,2.6],[-9.45,-2.7],[-3.05,2.6]]){
  add(x-.24,z-.35,'floor',.12,.35);add(x+.22,z+.25,'floor',.10,Math.PI+.4,'gym',true);add(x-.18,z+.62,'floor',.12,Math.PI-.4);add(x+.25,z-.65,'floor',.08,.1,'gym',true);
 }
 // Medical and supply groups, with head turns toward the doors and each other.
 for(const [x,z,a]of [[10.8,-6.5,1.4],[11.6,-5.4,-1.6],[9.1,-7.2,.1],[7.5,-6.6,.8],[-11.8,-.8,2.8],[5.9,7.1,2.9],[6.5,6.1,-.6],[11.4,.1,1.2]])add(x,z,'stand',0,a);
 for(let i=0;i<8;i++)add(i%2?15.65:13.85,-7.4+Math.floor(i/2)*3.15,'sit',.44,i%2?-Math.PI/2:Math.PI/2,'corridor',i===5);
 for(let i=0;i<18;i++){const right=i>=9,j=i%9;add((right?20:-24)+(j%3)*1.15,16.2+Math.floor(j/3)*1.4,j%3===0?'stand':'floor',.12,right?-1.2:.6,'lot',j%4===2);}
 // Two volunteers walk short, clear aisles; nobody walks through the grief staging.
 add(6.6,-1.3,'walk',0,0);add(5.2,14.8,'walk',0,-Math.PI/2,'lot');
 const N=people.length,skin=[0xb47c58,0xd6a47d,0xe2ba95,0x835c43,0xc58f6b],cloth=[0x657c83,0x76645c,0x8d6e70,0x4e6260,0x989381,0x5c647e,0x754f46],hair=[0x30251f,0x6c4932,0xb49c73,0x53514b,0x201c1c];
 const mat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9});mat.name='shelter-crowd-cloth';
 const skinMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.76});skinMat.name='shelter-crowd-skin';
 const meshes={},make=(name,geo,count,m=mat)=>{const mesh=new THREE.InstancedMesh(geo,m,count);mesh.name='shelter-crowd-'+name;mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);root.add(mesh);meshes[name]=mesh;return mesh;};
 const headGeo=new THREE.SphereGeometry(1,12,10);for(let i=0;i<headGeo.attributes.position.count;i++){const p=headGeo.attributes.position;p.setX(i,p.getX(i)*(1-.2*Math.max(0,-p.getY(i))));}headGeo.computeVertexNormals();
 make('head',headGeo,N,skinMat);make('hair',new THREE.SphereGeometry(1,12,7,0,Math.PI*2,0,1.48),N);
 make('torso',artLoft([[-.24,.13,.085],[-.17,.17,.105],[.08,.19,.11],[.20,.22,.10],[.25,.09,.08]],12,2,2.6),N);
 make('upper',new THREE.CylinderGeometry(.82,1,1,8),N*4);make('lower',new THREE.CylinderGeometry(.82,1,1,8),N*4,skinMat);make('hand',new THREE.SphereGeometry(1,8,6),N*2,skinMat);make('shoe',roundedBoxGeometry(1,1,1,.18),N*2);
 make('neck',new THREE.CylinderGeometry(1,1,1,8),N,skinMat);make('nose',new THREE.SphereGeometry(1,8,6),N,skinMat);
 make('eyes',new THREE.SphereGeometry(1,6,4),N*2,new THREE.MeshStandardMaterial({color:0x29221e,roughness:.8}));
 const m=new THREE.Matrix4(),q=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0),pos=new THREE.Vector3(),scale=new THREE.Vector3(),A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Color(),rot=new THREE.Euler();
 for(const p of people){const i=p.id,sk=skin[i%skin.length],sh=p.pose==='walk'?0x82935e:cloth[i%cloth.length],pants=[0x48515c,0x695f50,0x3e4347][i%3];
  for(const n of ['head','neck','nose','hand','lower'])for(let k=0;k<(['head','neck','nose'].includes(n)?1:n==='hand'?2:4);k++)meshes[n].setColorAt(i*(['head','neck','nose'].includes(n)?1:n==='hand'?2:4)+k,C.setHex(n==='lower'&&k>=2?pants:sk));
  meshes.hair.setColorAt(i,C.setHex(hair[i%hair.length]));meshes.torso.setColorAt(i,C.setHex(sh));
  for(let k=0;k<4;k++)meshes.upper.setColorAt(i*4+k,C.setHex(k<2?sh:pants));for(let k=0;k<2;k++)meshes.shoe.setColorAt(i*2+k,C.setHex(i%2?0x393a37:0x98968d));
 }
 let mode=null,time=0,last=-1;
 function update(dt){if(!mode)return;time+=dt;if(time-last<1/15)return;last=time;
  for(const p of people){const i=p.id,visible=mode==='shelter'||mode==='thin'&&i%3===0;
   if(!visible){m.makeScale(0,0,0);for(const [name,mesh]of Object.entries(meshes)){const n=name==='upper'||name==='lower'?4:name==='hand'||name==='shoe'||name==='eyes'?2:1;for(let k=0;k<n;k++)mesh.setMatrixAt(i*n+k,m);}continue;}
   const factor=p.small?.72:1,walk=p.pose==='walk',seat=p.pose!=='stand'&&!walk,a=p.a+(walk?Math.cos(time*.16+i)*.10:0),ca=Math.cos(a),sa=Math.sin(a),x=p.x+(walk&&p.zone==='lot'?Math.sin(time*.16)*1.8:0),z=p.z+(walk&&p.zone!=='lot'?Math.sin(time*.16)*1.8:0),s=p.seat;
   const t=time+i*1.83,breathe=Math.sin(t*.63)*.004,lean=.05+.018*Math.sin(t*.21),hips=seat?s+.08:.89,shoulder=hips+.47,head=hips+.70;
   const w=(v,out)=>out.set(x+(v[0]*ca+v[2]*sa)*factor,v[1]*factor+(seat?s*(1-factor):0),z+(-v[0]*sa+v[2]*ca)*factor);
   const part=(name,index,v,sz,rx=0,ry=a,rz=0)=>{w(v,pos);q.setFromEuler(rot.set(rx,ry,rz));scale.set(sz[0]*factor,sz[1]*factor,sz[2]*factor);m.compose(pos,q,scale);meshes[name].setMatrixAt(index,m);};
   const limb=(name,index,v1,v2,r1,r2)=>{w(v1,A);w(v2,B);pos.addVectors(A,B).multiplyScalar(.5);B.sub(A);const len=B.length();q.setFromUnitVectors(up,B.normalize());scale.set(r1*factor,len,r2*factor);m.compose(pos,q,scale);meshes[name].setMatrixAt(index,m);};
   part('torso',i,[0,hips+.25+breathe,-lean],[1,1,1],seat?.12:.04);
   const gaze=.12*Math.sin(t*.19)+(Math.sin(t*.09)>.8?.25:0),hy=a+gaze,hz=-lean-.02;
   part('neck',i,[0,head-.13+breathe,hz+.01],[.045,.10,.044]);part('nose',i,[Math.sin(gaze)*-.11,head-.012+breathe,hz-Math.cos(gaze)*.11],[.015,.025,.022],.06,hy);part('head',i,[0,head+breathe,hz],[.105,.139,.106],.06+(seat?.10:0),hy);part('hair',i,[0,head+.008+breathe,hz+.004],[.110,.144,.112],.06,hy);
   for(const side of [-1,1]){const j=side===-1?0:1,phase=Math.sin(time*2.2+i+j*Math.PI),footZ=seat?-.43:walk?phase*.23:.02;
    const hip=[side*.105,hips,0],knee=seat?[side*(p.pose==='floor'?.25:.14),Math.max(.23,s-.08),-.32]:[side*.115,.47,walk?-phase*.12:-.035],ankle=seat?[side*(p.pose==='floor'?.27:.14),Math.max(.10,s-.43),footZ]:[side*.12,.10+(walk?Math.max(0,phase)*.04:0),footZ];
    limb('upper',i*4+2+j,hip,knee,.068,.073);limb('lower',i*4+2+j,knee,ankle,.047,.054);part('shoe',i*2+j,[ankle[0],ankle[1]-.045,ankle[2]-.06],[.12,.10,.24]);
    const sh=[side*.20,shoulder,-lean],el=[side*.25,shoulder-.23,seat?-.17:-.05+(walk?-phase*.06:0)],hand=seat?[side*.14,Math.max(s+.23,.33),-.26]:[side*.22,shoulder-.45,-.07+(walk?phase*.10:0)];
    if(i%9===0&&j===0){el[2]=-.25;hand[1]=head-.08;hand[2]=hz-.14;}
    limb('upper',i*4+j,sh,el,.054,.058);limb('lower',i*4+j,el,hand,.037,.040);part('hand',i*2+j,hand,[.043,.061,.028],.2);
    const ex=side*.036,ez=-.099;part('eyes',i*2+j,[Math.cos(gaze)*ex+Math.sin(gaze)*ez,head+.014+breathe,hz-Math.sin(gaze)*ex+Math.cos(gaze)*ez],[.013,.005,.0035],.05,hy);
   }
  }
  for(const mesh of Object.values(meshes))mesh.instanceMatrix.needsUpdate=true;
 }
 function show(state){mode=['shelter','thin'].includes(state)?state:null;root.visible=!!mode;last=-1;if(mode)update(0);}
 show(null);return {root,people,show,update,get state(){return {mode,represented:mode==='shelter'?N:mode==='thin'?people.filter(p=>p.id%3===0).length:0,gym:people.filter(p=>p.zone==='gym').length,drawBatches:Object.keys(meshes).length};}};
}
