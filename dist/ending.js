// The last minute of the evening, and what does not quite fit in it.
//  - The chalk initials "AR" beside the old "JSA": faint enough to miss after the call
//    home (you have to crouch to it), plain during the final fade. (Preserved from v0.1.)
//  - "AR" cut into the old oak's bark at a kid's height, always there if you go close.
//  - After the call, while you are not looking, an old bike is lying under the oak
//    that was not there before. No sound, no light, no explanation.
// Nothing here moves the camera or plays a sound. Everything resets on replay.
import * as THREE from './three.module.js';
import {groundPoint,heading} from './route.js';
import {LOOKOUT} from './layout.js';
import {smooth} from './kit.js';
import {createBike,poseBike} from './rig.js';

export function createEnding(scene,world){
 // Chalk "AR" next to the old initials.
 const pts=[];
 for(const stroke of [[[0,.1],[.36,.95],[.7,.1]],[[.16,.45],[.54,.45]],[[.85,.1],[.85,.94],[1.3,.94],[1.4,.71],[.88,.5],[1.42,.1]]]){
  for(let i=0;i<stroke.length-1;i++)for(const [x,z] of [stroke[i],stroke[i+1]]){const d=1149.5+z*.42,lat=1.6+x*.42,p=groundPoint(d,lat);pts.push(p.x,world.groundY(d,lat)+.009,p.z);}}
 const clue=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(pts,3)),new THREE.LineBasicMaterial({color:0xd5cbb3,transparent:true,opacity:0,depthWrite:false}));clue.name='last-chalk';clue.visible=false;scene.add(clue);
 const cluePos=groundPoint(1149.7,1.9);
 // Initials cut into the oak, on the side that faces the swing and the street.
 const o=LOOKOUT.oak,oakP=groundPoint(o.d,o.lat),oakY=world.groundY(o.d,o.lat),toward=Math.atan2(-(LOOKOUT.swing.lat-o.lat),LOOKOUT.swing.d-o.d);
 const carve=new THREE.Group();carve.position.set(oakP.x,oakY+1.32,oakP.z);carve.rotation.y=-heading(o.d)+toward;scene.add(carve);carve.name='oak-carving';
 {const R=.462,cut=[];const letters=[[[0,0],[.06,.16],[.12,0]],[[.03,.07],[.09,.07]],[[.17,0],[.17,.16],[.25,.16],[.26,.11],[.18,.08],[.27,0]]];
  for(const s of letters)for(let i=0;i<s.length-1;i++)for(const [x,y] of [s[i],s[i+1]]){const a=(x-.13)/R;cut.push(-Math.sin(a)*R,y,-Math.cos(a)*R);/* reads left to right from the swing side */}
  carve.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(cut,3)),new THREE.LineBasicMaterial({color:0x2e2620})));}
 // The bike that was not there.
 const old=createBike({style:'road-kid',frame:0x7a8a6e,bars:'swept',wheelR:.3,saddle:0x3a2e26,grips:0x8a8272,tire:0x3a3a38,extras:[]});
 const bd=o.d+.9,blat=o.lat-1.9,bp=groundPoint(bd,blat);old.group.position.set(bp.x,world.groundY(bd,blat)+.03,bp.z);old.group.rotation.set(0,-heading(bd)+2.2,1.42,'YXZ');old.wheel=1.3;old.steerAngle=.5;old.crankAngle=.8;
 old.group.traverse(m=>{if(m.isMesh)m.castShadow=true;});scene.add(old.group);old.group.visible=false;old.group.name='the-other-bike';
 const oldPos=new THREE.Vector3(bp.x,world.groundY(bd,blat),bp.z);
 // A child's group doodle: four remembered riders; a fifth joins only out of view.
 const drawing=new THREE.Group(),fifth=new THREE.Group();drawing.name='remembered-riders';fifth.name='forgotten-rider';
 const chalkMat=new THREE.MeshBasicMaterial({color:0xd2c5a5,transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide});
 function stroke(group,a,b){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A),m=new THREE.Mesh(new THREE.PlaneGeometry(.012,v.length()),chalkMat);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());m.position.copy(A).add(B).multiplyScalar(.5);group.add(m);}
 // Draw in a vertical local plane and lay the paper-like drawing onto the asphalt.
 for(let k=0;k<5;k++){const group=k===4?fifth:drawing,x=k*.23;
  const head=new THREE.Mesh(new THREE.RingGeometry(.039,.048,12),chalkMat);head.position.set(x,.29,0);group.add(head);
  for(const [a,b] of [[[x,.24,0],[x,.11,0]],[[x-.07,.20,0],[x+.07,.20,0]],[[x,.11,0],[x-.06,0,0]],[[x,.11,0],[x+.06,0,0]]])stroke(group,a,b);
 }
 drawing.add(fifth);const dp=groundPoint(1149.1,.65);drawing.position.set(dp.x,world.groundY(1149.1,.65)+.012,dp.z);drawing.rotation.set(-Math.PI/2,0,-heading(1149.1));scene.add(drawing);fifth.visible=false;
 // The same initials are scratched on the old bicycle's frame, tying the anomaly to AR.
 const tag=new THREE.Group();tag.name='other-bike-initials';tag.position.set(.029,.67,-.03);tag.rotation.y=Math.PI/2;
 const tagMat=new THREE.LineBasicMaterial({color:0xd9d3b9});const tp=[];
 for(const line of [[[0,0],[.022,.052],[.043,0]],[[.010,.023],[.033,.023]],[[.055,0],[.055,.052],[.086,.052],[.092,.033],[.055,.027],[.093,0]]])for(let i=0;i<line.length-1;i++)for(const [x,y] of [line[i],line[i+1]])tp.push(x,y,0);
 tag.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(tp,3)),tagMat));old.frame.add(tag);
 let bikeShown=false,fifthShown=false,faint=0;const _v=new THREE.Vector3(),_d=new THREE.Vector3();
 // Called every frame at the end of the street.
 function update(dt,{callDone,fade,ended,camera,near=false}){
  // The chalk: faint once the call has come and you are close and looking down at it; plain in the fade.
  if(callDone&&camera){camera.getWorldDirection(_d);_v.set(cluePos.x,world.groundY(1149.7,1.9),cluePos.z).sub(camera.position);const dist=_v.length(),facing=_v.normalize().dot(_d);faint=Math.max(faint,(dist<3.2&&facing>.8?1:0)*.2);}
  const on=!ended&&(fade>0||faint>0)&&callDone;clue.visible=on;clue.material.opacity=on?Math.max(faint*.9,smooth(fade/.18)*.58):0;
  // The extra figure cannot be added while the drawing is visible.
  if(callDone&&bikeShown&&!fifthShown&&camera){camera.getWorldDirection(_d);_v.copy(drawing.position).sub(camera.position);if(_v.length()>3&&_v.normalize().dot(_d)<-.1){fifthShown=true;fifth.visible=true;}}
  // The other bike: only after the call, only when you are not looking toward the oak.
  if(callDone&&!bikeShown&&camera){camera.getWorldDirection(_d);_v.copy(oldPos).sub(camera.position);const away=_v.normalize().dot(_d)<-.1,far=camera.position.distanceTo(oldPos)>6;if(away&&far){bikeShown=true;old.group.visible=true;}}
 }
 function reset(){clue.visible=false;clue.material.opacity=0;faint=0;bikeShown=false;fifthShown=false;fifth.visible=false;old.group.visible=false;}
 poseBike(old);
 return {update,reset,clue,drawing,fifth,carving:carve,otherBike:old.group,get state(){return {clue:clue.visible,faint,otherBike:bikeShown,fifthRider:fifthShown};}};
}
