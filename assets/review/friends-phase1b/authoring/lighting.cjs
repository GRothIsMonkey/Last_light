process.env.LL_TEST_DIST='dist';const {browserSession}=require('./review-browser.cjs'),fs=require('fs');
browserSession(async(page,url)=>{await page.goto(url+'/?qa&bikes&houses&vegetation&pavement&streetprops&details&player1b&friends1b');await page.waitForFunction(()=>window.friends1b&&window.__details&&window.__streetprops&&window.__pavement&&window.__houses&&window.__vegetation&&window.__bikes,null,{timeout:150000});
 const results=await page.evaluate(async()=>{const g=lastLight,T=await import('./three.module.js');g.start();g.press('KeyW');g.step(2);g.render();
 const rt=new T.WebGLRenderTarget(440,400,{colorSpace:T.SRGBColorSpace}),cam=g.camera.clone(),cv=document.createElement('canvas');cv.width=440;cv.height=400;const ctx=cv.getContext('2d'),dst=ctx.createImageData(440,400),pixels=new Uint8Array(440*400*4),data={};
 for(const {f,skin} of friends1b.cast){skin.level(0);const t=skin.instance.bones.head.getWorldPosition(new T.Vector3());t.y-=.045;const loc=f.person.group.localToWorld(new T.Vector3(.56,1.50,-1.0));cam.position.copy(loc);cam.lookAt(t);cam.fov=32;cam.aspect=1.1;cam.updateProjectionMatrix();
 for(const kind of ['Golden hour','Open shade','Residential shadow','Sunset','Twilight','Streetlight']){
 const shade=kind==='Open shade',block=new T.Mesh(new T.PlaneGeometry(8,8),new T.MeshBasicMaterial({side:T.DoubleSide,colorWrite:false,depthWrite:false}));if(shade){block.position.copy(t).add(new T.Vector3(.4,1.9,-.4));block.rotation.x=-Math.PI/2;block.castShadow=true;g.scene.add(block);}
 const dusk={'Golden hour':.04,'Open shade':.18,'Residential shadow':.55,'Sunset':.90,'Twilight':1,'Streetlight':1}[kind],night=kind==='Twilight'?.85:kind==='Streetlight'?1:0;
 g.shoot({cam,target:rt,preset:{dusk,night,day:0},sun:shade?[10,60,-10]:[44,30-21*dusk,-85],at:t,room:kind==='Residential shadow',lamp:kind==='Streetlight'?{x:t.x+.8,y:t.y+2.1,z:t.z-.6,color:0xffd09a,intensity:8,distance:7}:null});g.renderer.readRenderTargetPixels(rt,0,0,440,400,pixels);
 for(let y=0;y<400;y++)dst.data.set(pixels.subarray((399-y)*1760,(400-y)*1760),y*1760);ctx.putImageData(dst,0,0);data[f.key+'-'+kind]=cv.toDataURL('image/jpeg',.93).split(',')[1];block.removeFromParent();block.geometry.dispose();block.material.dispose();
 }}rt.dispose();return data;});
 const dir='assets/review/friends-phase1b/evidence/lighting';fs.mkdirSync(dir,{recursive:true});for(const [k,v] of Object.entries(results))fs.writeFileSync(dir+'/'+k+'.jpg',Buffer.from(v,'base64'));
}).catch(e=>{console.error(e);process.exitCode=1});
