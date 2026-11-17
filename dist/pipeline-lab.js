// Phase 0A DEV harness for the Blender asset pipeline. It puts the original test figure (tst.pipeline-probe) next to
// the game's own procedural geometry and exercises everything the pipeline has to carry: skinned mesh and skeleton,
// authored skeletal clips, a facial clip, shape keys set directly and from faces.js expressions, several PBR materials,
// sockets, the rig.js pose contract on a procedural bike, and shared GPU resources across copies.
// Used by pipeline-lab.html (an isolated scene with the game's renderer settings) and by game.js with ?pipeline
// (inside the running game). The story never imports it.
import * as THREE from './three.module.js';
import {loadAsset,instantiate,sharedStats,status} from './asset-library.js';
import {bindPose,drivePose,contactReport} from './asset-pose.js';
import {createBike,poseBike,ridePose,newPose,gripPos,pedalPos,createPerson,applyPose,standPose} from './rig.js';
import {CAST} from './cast.js';
import {EXPRESSIONS} from './faces.js';

const ID='tst.pipeline-probe';

// Build the lineup in `parent` at `origin` facing `heading` (radians; 0 = the game's -Z). Returns a handle with update(dt).
export async function buildLineup(parent,{origin=new THREE.Vector3(),heading=0,renderer=null,withKid=true}={}){
 const t0=performance.now();
 const A=await loadAsset(ID,{renderer});const tLoad=performance.now()-t0;
 const group=new THREE.Group();group.name='pipeline-lab';group.position.copy(origin);group.rotation.y=heading;parent.add(group);
 const make=async(x,z,yaw=0)=>{const i=await instantiate(ID,{renderer});i.root.position.set(x,0,z);i.root.rotation.y=yaw;group.add(i.root);return i;};
 const walker=await make(-1.6,0),talker=await make(-.55,0),waver=await make(.5,0),rider=await make(2.2,.1,-Math.PI/2);
 walker.play('walk_normal');talker.play('idle_breathe');talker.actions.talk.play();waver.play('wave_r',{loop:true});
 // the rider sits on one of the game's own procedural bikes (rig.js), posed by the existing pose contract
 const bike=createBike(CAST.player.bike);bike.group.name='pipeline-lab:procedural-bike';rider.root.add(bike.group);
 bindPose(rider);const pose=newPose();
 // a procedural neighborhood kid (rig.js createPerson) for scale; not one of the four boys
 let kid=null;if(withKid){kid=createPerson(CAST.kid);kid.group.name='pipeline-lab:procedural-kid';kid.group.position.set(-2.7,0,0);group.add(kid.group);standPose(kid.pose,0);applyPose(kid,kid.pose);}
 // things on sockets: a cap on the talker's head, a flashlight in the waver's left hand
 const cap=new THREE.Mesh(new THREE.SphereGeometry(.1,20,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x2d4a7a,roughness:.8}));cap.name='pipeline-lab:cap-on-socket';cap.scale.set(1,.55,1.05);talker.attach('cap',cap);
 const torch=new THREE.Mesh(new THREE.CylinderGeometry(.016,.02,.16,12),new THREE.MeshStandardMaterial({color:0x222326,roughness:.4,metalness:.6}));torch.name='pipeline-lab:torch-on-socket';torch.rotation.x=Math.PI/2;waver.attach('grip_l',torch);
 const all=[walker,talker,waver,rider];
 let t=0,crank=0,exprIndex=0;const exprs=['neutral','happy','surprised','worried','sad','determined'];
 const handle={group,walker,talker,waver,rider,bike,kid,all,asset:A,loadMs:+tLoad.toFixed(1),contacts:null,expression:'neutral',
  update(dt){t+=dt;crank+=dt*4.2;
   for(const i of [walker,talker,waver])i.update(dt);
   rider.update(dt);// (no clip on the rider: its pose comes from ridePose below)
   ridePose(pose,crank,{geom:bike.geom,steer:.08*Math.sin(t*.7),look:.2*Math.sin(t*.5)});bike.crankAngle=crank;bike.wheel+=dt*7;bike.steerAngle=.08*Math.sin(t*.7);poseBike(bike);
   const J=drivePose(rider,pose);
   const gl=gripPos(bike.steerAngle,-1,new THREE.Vector3(),bike.geom),gr=gripPos(bike.steerAngle,1,new THREE.Vector3(),bike.geom),pl=pedalPos(crank,-1,new THREE.Vector3(),bike.geom),pr=pedalPos(crank,1,new THREE.Vector3(),bike.geom);
   this.contacts=contactReport(rider,J,{grip_l:{socket:'grip_l',point:gl},grip_r:{socket:'grip_r',point:gr},ballToPedal_l:{socket:'ball_l',point:pl},ballToPedal_r:{socket:'ball_r',point:pr}});
   // the waver's face follows the story's expression table, cycling every two seconds
   const k=Math.floor(t/2)%exprs.length;if(k!==exprIndex||this.expression==='neutral'&&t<.05){exprIndex=k;this.expression=exprs[k];waver.setExpression(EXPRESSIONS[exprs[k]]||{});}
   if(kid){standPose(kid.pose,t);applyPose(kid,kid.pose);}
  },
  stats(){return {...sharedStats(group),asset:A.info,load:status()};},
  dispose(){for(const i of all)i.dispose();group.removeFromParent();}};
 handle.update(0);
 return handle;
}

// ?pipeline in the running game: the lineup appears beside the road a few metres ahead of the camera, in the game's own
// scene, lights, fog and shadows. P moves it in front of you again. A small label says what it is and reports failure.
export async function mountInGame({scene,camera,renderer,groundY}){
 const label=document.createElement('div');label.id='pipeline-probe-label';
 label.style.cssText='position:fixed;left:8px;top:8px;z-index:50;padding:4px 8px;background:rgba(0,0,0,.55);color:#e8e2d0;font:12px/1.35 monospace;pointer-events:none;white-space:pre';
 label.textContent='PIPELINE PROBE (DEV): loading '+ID+'…';document.body.appendChild(label);
 let lab;
 try{lab=await buildLineup(scene,{renderer});}catch(e){label.style.color='#ff8a7a';label.textContent='PIPELINE PROBE FAILED (nothing was substituted): '+(e?.message||e);throw e;}
 const place=()=>{const f=new THREE.Vector3();camera.getWorldDirection(f);f.y=0;f.normalize();const p=camera.getWorldPosition(new THREE.Vector3()).addScaledVector(f,6);
  p.y=groundY?.(p.x,p.z)??0;lab.group.position.copy(p);lab.group.rotation.y=Math.atan2(f.x,f.z);};
 place();addEventListener('keydown',e=>{if(e.code==='KeyP')place();});
 let last=performance.now();const tick=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;lab.update(dt);requestAnimationFrame(tick);};requestAnimationFrame(tick);
 const s=lab.stats();label.textContent=`PIPELINE PROBE (DEV) ${ID} v${s.asset.version} — Blender ${s.asset.generator}\n${s.asset.triangles} tris · ${s.asset.clips.length} clips · ${s.asset.morphTargets.length} shape keys · ${s.asset.materials} materials · ${s.asset.textures} textures · loaded from ${s.asset.from} in ${lab.loadMs} ms\nP: move it in front of you`;
 window.__pipelineProbe=lab;return lab;
}
