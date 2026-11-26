// Controlled stationary-pose fixtures on the actual Oak Hollow ground-height field.
const{browserSession}=require('./review-browser.cjs'),fs=require('fs');
browserSession(async(p,url)=>{
 await p.goto(url+'/?qa&bikes&houses&vegetation&pavement&streetprops&details&player1b&friends1b');await p.waitForFunction(()=>window.friends1b&&window.__pavement&&window.__bikes&&window.__details,null,{timeout:150000});
 const results=await p.evaluate(async()=>{const T=await import('./three.module.js'),{groundPoint,heading,projectRoute}=await import('./route.js'),{newPose,ridePose}=await import('./rig.js'),g=lastLight;g.start();g.step(.2);
 const r=[];for(const {f,skin} of friends1b.cast){const mesh=skin.meshes[0],a=mesh.geometry.attributes,s=mesh.skeleton,v=new T.Vector3(),feet={l:[],r:[]};
 for(let i=0;i<a.position.count;i++){const n=s.bones[a.skinIndex.getX(i)].name;if(n==='foot_l'||n==='toe_l')feet.l.push(i);if(n==='foot_r'||n==='toe_r')feet.r.push(i);}
 for(const [location,d,lat,turn] of [['Road',45,0,0],['Road grade',645,1.2,0],['Driveway cut',755.23,7.81,.8],['Sidewalk edge',765.69,7.3,0]]){
 const at=groundPoint(d,lat),dx=Math.cos(turn)*.5,dz=Math.sin(turn)*.5,h1=g.world.groundY(d+dx,lat+dz),h2=g.world.groundY(d-dx,lat-dz);
 const b=f.bike.group;b.position.set(at.x,(h1+h2)*.5,at.z);b.rotation.set(Math.atan2(h1-h2,1),-(heading(d)+turn),0,'YXZ');
 const po=newPose();ridePose(po,f.crank,{geom:f.bike.geom,astride:1,stopSide:0,posture:f.cast.build.posture});
 skin.apply(po,{ride:1,crank:f.crank,geom:f.bike.geom,astride:1,stopSide:0});b.updateMatrixWorld(true);s.update();const vals={};
 for(const side of ['l','r']){let lo=Infinity;
 for(const i of feet[side]){const pt=mesh.localToWorld(mesh.getVertexPosition(i,v));const road=projectRoute(pt.x,pt.z,d);lo=Math.min(lo,pt.y-g.world.groundY(road.d,road.lat));}
 vals[side]=lo;}
 r.push({key:f.key,location,d,lat,pitch:Math.atan2(h1-h2,1),groundClearanceMeters:vals});}}
 return r;});fs.writeFileSync('assets/review/friends-phase1b/evidence/terrain.json',JSON.stringify(results,null,2));console.log(results);
}).catch(e=>{console.error(e);process.exitCode=1});
