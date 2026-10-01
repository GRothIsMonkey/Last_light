// Targeted animation, night-light and close-art inspection after the natural runs.
export async function runSceneChecks({page,snap,check,camAt}) {
 const ev=(fn,arg)=>page.evaluate(fn,arg);
 await ev(()=>{window.untilScene=(fn,max=80)=>{for(let t=0;t<max;t+=1/30){lastLight.step(1/30);if(fn())return true;}return false;};});
 await ev(()=>{lastLight.jump('jamie');lastLight.step(.3);lastLight.key('KeyF');});
 const windowDone=await ev(()=>untilScene(()=>lastLight.chapter.companions.list.jamie.climbTime>3.5));
 check('Jamie completes supported climb',windowDone);
 const walk=await ev(()=>{const L=lastLight,c=L.chapter.companions.list.jamie;let samples=0,blocked=0,examples=[];for(let t=0;t<60;t+=1/30){L.step(1/30);if(c.climbTime==null&&c.mode==='foot'&&c.script&&c.step===0){samples++;if(!L.nav.walkable(c.px,c.pz,{r:.22})){blocked++;if(examples.length<3)examples.push([c.px,c.pz]);}}if(c.script&&c.step===2&&c.climbTime==null)break;}return {samples,blocked,examples};});
 console.log('Jamie bike approach clearance',JSON.stringify(walk));check('Jamie path from the window to his bike clears house obstacles',walk.samples>0&&walk.blocked===0);
 for(let i=0;i<4;i++){await ev(()=>{const L=lastLight,c=L.chapter.companions.list.jamie;L.step(.42);const a=c.ba,p=c.bike.group.position;L.camera.position.set(p.x+Math.cos(a)*2.2,p.y+1.45,p.z+Math.sin(a)*2.2);L.camera.lookAt(p.x,p.y+.65,p.z);L.camera.updateMatrixWorld();});await snap('astra-jamie-bike-lift-'+(i+1));}
 await ev(()=>{lastLight.jump('alex-house');lastLight.step(1);});
 for(let i=0;i<4;i++){
  await ev(()=>{const L=lastLight;L.step(.12);const c=L.chapter.carA,a=c.a,p=c.pos;L.camera.position.set(p.x+Math.cos(a)*3.8+Math.sin(a)*3.2,p.y+1.65,p.z+Math.sin(a)*3.8-Math.cos(a)*3.2);L.camera.lookAt(p.x,p.y+.85,p.z);L.camera.updateMatrixWorld();});await snap('astra-cruiser-light-phase-'+(i+1));
 }
 for(const who of ['officer','dad','mom']){await ev(who=>{const L=lastLight,c=L.chapter[who],p=c.pos;L.camera.position.set(p.x+Math.sin(c.a)*.9,p.y+1.65,p.z-Math.cos(c.a)*.9);L.camera.lookAt(p.x,p.y+1.65,p.z);L.camera.updateMatrixWorld();},who);await snap('astra-face-'+who);}
 check('mother holds the handset upright beside her face',await ev(async()=>{const T=await import('./three.module.js'),c=lastLight.chapter.mom,p=c.art.phone;c.person.group.updateMatrixWorld(true);const q=p.getWorldQuaternion(new T.Quaternion());return p.visible&&new T.Vector3(0,1,0).applyQuaternion(q).y>.85;}));
 await ev(()=>{const L=lastLight;L.jump('sam');L.step(.4);const w=L.chapter.windows.sam;L.placePlayer({x:w.stand.x,z:w.stand.z,a:Math.atan2(w.glass.x-w.stand.x,-(w.glass.z-w.stand.z)),mode:'walk'});L.key('KeyF');});
 await ev(()=>untilScene(()=>lastLight.scene.children.some(o=>o.isMesh&&o.geometry?.parameters?.radius===.016&&o.visible)));
 await snap('astra-pebble-in-flight');
 await ev(()=>{const L=lastLight;L.jump('oak');L.step(4);});await snap('astra-oak-trio');
 await ev(()=>{const L=lastLight;L.jump('retrace');L.step(2);L.press('KeyW');L.step(6);L.release('KeyW');});await snap('astra-night-riding-formation');
 await ev(()=>{const L=lastLight;L.jump('alex-house');const c=L.chapter.officer2,p=c.pos;L.camera.position.set(p.x+4,p.y+1.4,p.z+3);L.camera.lookAt(p.x,p.y+1,p.z);L.camera.updateMatrixWorld();});await snap('astra-second-officer');
 const allocations=await ev(()=>{const L=lastLight,geos=new Set(),textures=new Set();let bytes=0,totalTriangles=0,meshInstances=0;L.scene.traverse(o=>{if(o.isMesh&&o.layers.mask!==2){meshInstances++;totalTriangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;}if(o.geometry&&!geos.has(o.geometry)){geos.add(o.geometry);for(const a of Object.values(o.geometry.attributes))bytes+=a.array.byteLength;if(o.geometry.index)bytes+=o.geometry.index.array.byteLength;}for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)for(const v of Object.values(m))if(v?.isTexture)textures.add(v);});return {sceneMeshInstancesIncludingInvisible:meshInstances,sceneTriangleInstancesIncludingInvisible:Math.round(totalTriangles),uniqueGeometryBuffersBytes:bytes,uniqueGeometries:geos.size,materialTextures:textures.size};});
 console.log('Scene allocation inventory',JSON.stringify(allocations));check('full scene allocation stays within the revised geometry ceiling',allocations.sceneTriangleInstancesIncludingInvisible<6000000);return allocations;
}
