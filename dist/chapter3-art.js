// Presentation only. All lights, material swaps and small details are scoped to
// Chapter Three and restore on a DEV jump or replay into an earlier chapter.
import * as THREE from './three.module.js';
import {artSurface,artTime} from './art-surfaces.js';
import {createKit,seeded} from './kit.js';
import {mergeParts} from './rig.js';
import {CAST} from './cast.js';
import {refineChapterThreeProps} from './chapter3-props.js';

function contactMap(){const n=64,a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const r=Math.hypot((x+.5)/n*2-1,(y+.5)/n*2-1),i=(y*n+x)*4;a[i]=a[i+1]=a[i+2]=3;a[i+3]=Math.max(0,1-r)**2*240;}const t=new THREE.DataTexture(a,n,n);t.magFilter=THREE.LinearFilter;t.needsUpdate=true;return t;}
function childHead(spec){
 const K=createKit(),g=new THREE.Group(),F=spec.face,H=spec.hair,skin=F.skin,shade=new THREE.Color(skin).multiplyScalar(.82).getHex();
 const skull=new THREE.SphereGeometry(1,32,24),P=skull.attributes.position;
 for(let i=0;i<P.count;i++){let x=P.getX(i),y=P.getY(i),z=P.getZ(i);x*=.098*(1-.16*Math.max(0,-y));y*=.116;z*=.103;if(z<-.055)z=-.055+(z+.055)*.58;P.setXYZ(i,x,y,z);}skull.computeVertexNormals();g.add(new THREE.Mesh(skull,K.mat(skin)));
 for(const e of [-1,1]){K.ball(g,e*.095,-.006,.01,.02,skin,[.43,1.2,.73],true);K.ball(g,e*.1,-.006,-.002,.011,shade,[.24,1,.7],true);
  K.ball(g,e*.033,.014,-.084,.012,0xdbd6ca,[1,.57,.37],true);K.ball(g,e*.033,.014,-.088,.006,F.iris,[.76,.86,.35],true);K.ball(g,e*.033,.014,-.089,.003,0x141511,[.7,1,.4],true);
  K.rod(g,[e*.02,.033,-.085],[e*.048,.033+F.browTilt*.025,-.081],.0033,H.color,.0024,8);
  K.ball(g,e*.009,-.027,-.096,.006,skin,[1,.7,.55],true);}
 K.ball(g,0,-.009,-.091,.012,skin,[.67,1.72,.83],true);K.ball(g,0,-.027,-.101,.011,skin,[.91,.7,.7],true);
 K.rod(g,[-.019,-.054,-.082],[.02,-.053,-.082],.0026,F.lips,.0023,8);K.ball(g,0,-.063,-.077,.016,skin,[1.3,.46,.35],true);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(1,32,16,0,Math.PI*2,0,H.style==='cap'?1.18:1.32),K.mat(H.style==='cap'?H.cap:H.color));hair.position.set(0,.004,.011);hair.scale.set(.105,.12,.112);g.add(hair);
 if(H.style==='cap'){K.rbox(g,0,.059,-.113,.164,.009,.095,.006,H.cap).rotation.x=.1;K.ball(g,0,.127,.011,.009,H.cap,[1,.5,1],true);for(const e of [-1,1])K.ball(g,e*.087,.038,.029,.027,H.color,[.4,1,1],true);
  for(let k=0;k<4;k++){const a=k*1.57,pts=[];for(let j=0;j<=14;j++){const t=.1+j/14*1.04;pts.push([Math.sin(a)*.106*Math.sin(t),.005+.121*Math.cos(t),.011+Math.cos(a)*.113*Math.sin(t)]);}for(let j=1;j<pts.length;j++)K.rod(g,pts[j-1],pts[j],.0008,0x3d5780,.0008,4);}}
 else{const rnd=seeded(H.style==='shaggy'?91:52);for(let k=0;k<20;k++){const a=k*2.399,r=.034+rnd()*.05;const m=K.ball(g,Math.sin(a)*r,.082+rnd()*.021,Math.cos(a)*r,.03,new THREE.Color(H.color).multiplyScalar(.83+rnd()*.29).getHex(),[.58,.46,1.5],true);m.rotation.set(.35,a,.22);}if(H.style==='shaggy'){for(const e of [-1,1])K.ball(g,e*.087,-.012,.042,.04,H.color,[.5,1.15,1],true);K.ball(g,0,-.024,.075,.05,H.color,[1.7,1,.6],true);}}
 g.updateMatrixWorld(true);const parts=[];g.traverse(o=>{if(o.isMesh)parts.push({geo:o.geometry,color:o.material.color,matrix:o.matrixWorld});});const geo=mergeParts(parts);geo.scale(spec.build.head||1,spec.build.head||1,spec.build.head||1);return geo;
}
function shirtGeometry(spec){
 const K=createKit(),g=new THREE.Group(),c=spec.clothes,b=spec.build,pts=[],idx=[],levels=[[-.175,.115,.078],[-.145,.123,.082],[-.06,.116,.077],[.04,.125,.081],[.125,.142,.083],[.17,.137,.072],[.205,.062,.045],[.217,.052,.04]],N=40;
 for(let j=0;j<levels.length;j++){const [y,w,d]=levels[j];for(let i=0;i<N;i++){const a=i/N*Math.PI*2,fold=(j>0&&j<6?Math.sin(a*7+j*.7)*.002:0);pts.push(Math.sin(a)*(w+fold)*(b.shoulders||1),y,Math.cos(a)*(d+fold));}}
 for(let j=0;j<levels.length-1;j++)for(let i=0;i<N;i++){const a=j*N+i,b0=j*N+(i+1)%N;idx.push(a,b0,a+N,b0,b0+N,a+N);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));geo.setIndex(idx);geo.computeVertexNormals();g.add(new THREE.Mesh(geo,K.mat(c.shirt)));
 const edge=new THREE.Color(c.shirt).multiplyScalar(.84).getHex();
 for(const [y,w,d] of [levels[0],levels[levels.length-1]]){const curve=new THREE.CatmullRomCurve3(Array.from({length:40},(_,i)=>new THREE.Vector3(Math.sin(i/40*Math.PI*2)*w*(b.shoulders||1),y,Math.cos(i/40*Math.PI*2)*d)),true);g.add(new THREE.Mesh(new THREE.TubeGeometry(curve,40,.0025,5,true),K.mat(c.trim??edge)));}
 if(c.collar)for(const e of [-1,1])K.rbox(g,e*.038,.197,-.052,.055,.015,.055,.005,c.trim??c.shirt).rotation.z=e*.22;
 g.updateMatrixWorld(true);const parts=[];g.traverse(o=>{if(o.isMesh)parts.push({geo:o.geometry,color:o.material.color,matrix:o.matrixWorld});});return mergeParts(parts);
}
export function createChapterThreeArt({scene,world,chapter,chapter3,camera,nav,foot}){
 const K=createKit(),C=chapter3,room=world.interiors['alex-room'],contacts=[],swaps=[],details=[],contactTex=contactMap(),contactPos=new THREE.Vector3(),contactRot=new THREE.Quaternion();
 const addContact=(group,w,d)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:contactTex,transparent:true,opacity:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}));m.rotation.x=-Math.PI/2;m.visible=false;m.name='chapter3-contact';scene.add(m);contacts.push({m,group});};
 const companions=[chapter.kit.jamie,chapter.kit.sam];
 // Existing suburban identity and surface shaders, with a Chapter Three-only finish.
 const surfaceCopies=new Map(),finish={asphalt:'roadwear',concrete:'mineral',siding:'housepaint',roof:'roofgrain',earth:'lawn'};
 for(const o of world.merged){if(o.userData.zone)continue;const kind=finish[o.material.userData.surface];if(!kind)continue;
  if(!surfaceCopies.has(o.material)){const m=o.material.clone();m.onBeforeCompile=o.material.onBeforeCompile;m.customProgramCacheKey=o.material.customProgramCacheKey.bind(o.material);artSurface(m,kind);surfaceCopies.set(o.material,m);}
  swaps.push({o,prop:'material',old:o.material,next:surfaceCopies.get(o.material)});}
 for(const c of companions){const pr=c.person.parts,spec=CAST[c.key],head=childHead(spec);swaps.push({o:pr.head,prop:'geometry',old:pr.head.geometry,next:head},{o:pr.torso,prop:'geometry',old:pr.torso.geometry,next:shirtGeometry(spec)});
  for(const n of ['torso','lsleeve','rsleeve','pelvis','lthigh','rthigh']){const o=pr[n],m=artSurface(o.material.clone(),'textile');swaps.push({o,prop:'material',old:o.material,next:m});}
  const detail=new THREE.Group();detail.name='chapter3-shirt-detail';pr.torso.add(detail);details.push(detail);detail.visible=false;const seam=new THREE.Color(spec.clothes.shirt).multiplyScalar(.79).getHex();
  K.rbox(detail,0,.032,-.084,.055,.064,.005,.006,spec.clothes.shirt);K.rod(detail,[-.025,.062,-.088],[.025,.062,-.088],.0015,seam,.0015,7);
  for(const lid of c.person.lids){swaps.push({o:lid,prop:'position',old:lid.position.clone(),next:new THREE.Vector3(Math.sign(lid.position.x)*.033,.014,-.09),vector:true});}
  addContact(c.person.group,.75,.85);addContact(c.bike.group,.72,1.52);
 }
 swaps.push({o:C.figure.parts.head,prop:'geometry',old:C.figure.parts.head.geometry,next:childHead(CAST.alex)});
 swaps.push({o:C.figure.parts.torso,prop:'geometry',old:C.figure.parts.torso.geometry,next:shirtGeometry(CAST.alex)});
 for(const actor of [chapter.kit.mom,...Object.values(C.people)]){for(const name of ['torso','lsleeve','rsleeve','lthigh','rthigh','lshin','rshin']){const o=actor.person.parts[name],m=artSurface(o.material.clone(),'textile');swaps.push({o,prop:'material',old:o.material,next:m});}addContact(actor.person.group,.72,.76);}
 const propArt=refineChapterThreeProps({C,companions,K,swaps,details});
 addContact(C.old.group,.55,1.6);addContact(C.creature.group,1.25,1.8);addContact(C.figure.group,.62,.7);
 // Window light enters along the room's depth. Kept attached only while in the room.
 const key=new THREE.SpotLight(0xfff0dc,18,8,.86,1,2),fill=new THREE.PointLight(0xdceaff,2.2,7,2);
 key.name='alex-window-daylight';fill.name='alex-room-sky-bounce';key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.near=.08;key.shadow.bias=-.0002;key.shadow.normalBias=.009;key.shadow.camera.layers.enable(1);
 const w=C.RW(room.frontWindow.glass.x,room.frontWindow.glass.z-.08,1.95),target=C.RW((room.x0+room.x1)/2,(room.z0+room.z1)/2,.45),f=C.RW(room.sideWindow.glass.x-.12,room.sideWindow.glass.z,1.65);
 key.position.set(w.x,w.y,w.z);key.target.position.set(target.x,target.y,target.z);fill.position.set(f.x,f.y,f.z);
 let active=false,inRoom=false;
 return {update(dt){artTime.value=C.C.t||0;const on=/^(c3|d3|n3|c4|d4|e4|n4)-/.test(chapter.phase());// (the same look carries into Chapter Four)
  if(on!==active){active=on;for(const s of swaps){if(s.vector)s.o[s.prop].copy(on?s.next:s.old);else s.o[s.prop]=on?s.next:s.old;}for(const d of details)d.visible=on;}
  const roomOn=on&&C.C.inRoom;if(roomOn!==inRoom){inRoom=roomOn;if(roomOn)scene.add(key,key.target,fill);else{key.removeFromParent();key.target.removeFromParent();fill.removeFromParent();}}
  for(const {m,group} of contacts){let visible=on&&!!group.parent;for(let a=group;a;a=a.parent)visible=visible&&a.visible;group.getWorldPosition(contactPos);m.visible=visible&&camera.position.distanceTo(contactPos)<55;if(!m.visible)continue;const p=contactPos,q=world.drain.project(p.x,p.z),inside=world.drain.inside(p.x,p.z,.05);let y=nav.groundY(p.x,p.z)+.008;if(inside)y=Math.max(y,(world.drain.waterAt(q.s)??y)+.007);m.position.set(p.x,y,p.z);group.getWorldQuaternion(contactRot);m.rotation.z=new THREE.Euler().setFromQuaternion(contactRot,'YXZ').y;m.material.opacity=inside?.48:.38;}
  // Neutral bulb in the drain, warmer original torch in the suburb. Exposure remains distance-driven.
  foot.light.color.setHex(on&&world.drain.inside(camera.position.x,camera.position.z,.1)?0xf4efdf:0xffefcf);
  propArt.update(on);
  if(on){for(const c of companions){if(!c.active)continue;const t=C.C.t+(c.key==='sam'?2.17:0),fear=/^n3-(creature|run|out|flee|safe)$/.test(chapter.phase()),pr=c.person.parts;
   pr.head.rotateZ((fear?.014:.006)*Math.sin(t*(c.key==='sam'?1.7:1.3)));pr.torso.position.y+=(fear?.005:.0018)*Math.sin(t*(c.key==='sam'?5.5:4.9));}}
 }};
}
