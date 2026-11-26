process.env.LL_TEST_DIST='dist';
const {browserSession}=require('./review-browser.cjs'),fs=require('fs');
browserSession(async(p,url)=>{
 await p.goto(url+'/?qa&bikes&houses&vegetation&pavement&streetprops&details&player1b&friends1b');
 await p.waitForFunction(()=>window.friends1b&&window.player1b?.flags.ready&&window.__details&&window.__streetprops&&window.__pavement&&window.__houses&&window.__bikes&&window.__vegetation,null,{timeout:150000});
 await p.evaluate(()=>{const g=lastLight;g.start();g.ui.closePanels();g.press('KeyW');const cam=g.camera.clone(),v=cam.position.clone(),target=v.clone();
   const mesh=player1b.instance.model.getObjectByName('PlayerHead');
   window.takeGroup=i=>{g.step(1/15);g.render();const at=g.playerBike.group;
     const heads=[player1b.instance,...friends1b.cast.map(c=>c.skin.instance)].map(x=>x.bones.head.getWorldPosition(v.clone()));
     const local=heads.map(q=>at.worldToLocal(q.clone()));
     const low=Math.min(...local.map(q=>q.z)),high=Math.max(...local.map(q=>q.z)),mid=(low+high)/2,span=high-low;
     target.copy(at.localToWorld(v.set(0,.78,mid)));const wave=(1-Math.cos(i/165*Math.PI))*.5;
     cam.position.copy(at.localToWorld(v.set(4.1+wave,4.9+span*.095,low-3.1)));cam.lookAt(target);cam.fov=60;cam.updateProjectionMatrix();cam.updateMatrixWorld();
     const extent=Math.max(...heads.flatMap(h=>[h.clone().project(cam),h.clone().add(v.set(0,-1.45,0)).project(cam)]).map(q=>Math.max(Math.abs(q.x),Math.abs(q.y))));
     cam.fov=2*Math.atan(Math.tan(Math.PI/6)*extent/.89)*180/Math.PI;cam.updateProjectionMatrix();
     const old=mesh.onAfterShadow;mesh.onAfterShadow=()=>mesh.geometry.setDrawRange(0,mesh.geometry.index.count);mesh.geometry.setDrawRange(0,mesh.geometry.index.count);
     g.renderer.render(g.scene,cam);mesh.onAfterShadow=old;mesh.geometry.setDrawRange(0,0);return g.renderer.domElement.toDataURL('image/jpeg',.88).split(',')[1];};});
 fs.mkdirSync('review-capture/footage/all-four',{recursive:true});
 for(let i=0;i<165;i++){const b=await p.evaluate(i=>takeGroup(i),i);fs.writeFileSync('review-capture/footage/all-four/'+String(i).padStart(5,'0')+'.jpg',Buffer.from(b,'base64'));}
}).catch(e=>{console.error(e);process.exitCode=1});
