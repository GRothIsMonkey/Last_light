import fs from 'node:fs';
import {createRequire} from 'node:module';
import {chapterEightTools} from '../../tests/chapter8-sim.mjs';
export default async function(T){
 const {h,advance,THREE,tap}=T,controls=chapterEightTools(T),require=createRequire(process.env.RENDER_MODULES+'/package.json'),{PNG}=require('pngjs'),gl=globalThis.renderContext,out=process.env.RENDER_OUTPUT||'artifacts/webgl';fs.mkdirSync(out,{recursive:true});
 const shots=[['skyline','c8-surface',10],['skyline-street','c8-surface',10],['surface-player','c8-surface',10],['collapse','c8-surface',10],['bunker','c8-gallery',5],['breach','c8-breach',10],['hunter','c8-retrieval',5],['reunion','c8-reunion',8],['jamie-death','c8-jamie-death',8],['jamie-covered','c8-jamie-death',8],['oak','c8-oak',8],['oak-grief','c8-oak',8],['ride','c8-ride',5],['ride-sam','c8-ride',5],['shelter-exterior','a1-arrive',4],['shelter-wide','a1-gym',4],['shelter-seated','a1-gym',4],['shelter-grief','a1-jamie-mom',4],['adult-face','a1-porch',4],['september','a1-return',4],['oak-barricade','a1-return',4],['vigil','a1-memorial-jamie',5],['memorial','a1-memorial-alex',4],['october','a1-weeks',4],['kitchen','a1-home',4],['packing','a1-packing',4],['goodbye','a1-goodbye',4],['car','a1-road-out',7],['chapter7','c7-reveal',5]];
 const results=[],V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),main=(d,lat,dy=0)=>{const q=h.chapter.kit.main(d,lat);return V(q.x,h.world.groundY(d,lat)+dy,q.z);};
 let review=false;const view=(a,b)=>{h.camera.position.copy(a);h.camera.lookAt(b);review=true;},head=A=>A.person.parts.head.getWorldPosition(V()),close=(A,d=1.5,side=.35)=>{h.scene.updateMatrixWorld(true);const q=head(A),a=A.pa??A.a??0;view(V(q.x+Math.sin(a)*d+Math.cos(a)*side,q.y+.04,q.z-Math.cos(a)*d+Math.sin(a)*side),q);};
 for(const [name,jump,seconds]of shots){if(process.env.RENDER_SHOTS&&!process.env.RENDER_SHOTS.split(',').includes(name))continue;
  console.log('Starting',name);h.jump(jump);advance(seconds);review=false;h.camera.aspect=innerWidth/innerHeight;h.camera.fov=60;const A=h.aftermath1,SC=A.SC,S=(x,z,y=1.55)=>{const q=SC.SCH.W(x,z);return V(q.x,y,q.z);};
  if(name==='skyline')view(main(1120,1.5,1.7),main(1540,100,97));
  if(name==='skyline-street')view(main(1080,0,1.7),main(1540,100,70));
  if(name==='collapse'){h.chapter8.SC.STREET.town.fire('across');advance(5);view(main(1085,0,1.7),main(1114,14,4));}
  if(name==='bunker'){const q=h.chapter8.X.at('galleryMid');if(q)controls.approach(q,.9,{max:25,pad:12});if(!h.foot.on)tap('KeyT');advance(2);}
  if(name==='breach'){const mass=h.chapter8.presence?.mass||h.scene.getObjectByName('c8-presence-mass');if(mass){const q=mass.getWorldPosition(V());view(h.camera.position.clone(),q.clone().add(V(0,8,0)));}}
  if(name==='hunter'){const m=h.chapter8.HM,hd=m.sockets?.head||m.root.getObjectByName('head');h.scene.updateMatrixWorld(true);const q=hd?hd.getWorldPosition(V()):m.root.position.clone().add(V(0,2,0)),a=m.heading||0;view(V(q.x+Math.sin(a)*3+Math.cos(a)*.8,q.y-.2,q.z-Math.cos(a)*3+Math.sin(a)*.8),q);}
  if(name==='reunion'){const boys=['jamie','sam','alex'].map(n=>h.chapter8.CTX[n]);const q=boys.reduce((v,c)=>v.add(c.person.group.position),V()).multiplyScalar(1/3);view(q.clone().add(V(1,1.6,-3.2)),q.clone().add(V(0,.95,0)));}
  if(name==='jamie-covered'){controls.take('cover-jamie',{max:200,r:4});advance(3);}
  if(name.startsWith('jamie-')){const j=h.chapter8.CTX.jamie.person.parts.torso.getWorldPosition(V());view(j.clone().add(V(1.7,1.0,-1.5)),j);}
  if(name==='oak-grief'){controls.take('alex-sit',{max:60,r:2.2});controls.take('alex-hand',{max:200,r:4,pad:6});controls.take('look-sam',{max:200,r:4,pad:6});controls.until(()=>h.chapter8.SC.FIN.F8.sam==='embrace',150);advance(2);}
  if(name==='oak'||name==='oak-grief'){const o=h.chapter8.SC.FIN.OAK,s=h.chapter8.CTX.sam.person.group.position,dx=s.x-o.x,dz=s.z-o.z;view(V(o.x+dz*4,o.y+1.15,o.z-dx*4),V(o.x+dx*.5,o.y+.46,o.z+dz*.5));}
  if(name==='ride-sam')close(h.chapter.kit.sam,1.6,.6);
  if(name==='shelter-exterior')view(S(-14,24),S(-4,9,2.2));
  if(name==='shelter-wide')view(S(4,5),S(-7,-3,1.2));
  if(name==='shelter-seated')view(S(6.5,-.5),S(10.5,-6,.9));
  if(name==='shelter-grief'){for(let i=0;i<900;i++){if(A.C.choice)tap('Digit2');advance(.25);if((h.chapter.state.line||'').includes('He’s twelve. He can’t'))break;}advance(3);close(A.cast.jamieMom,1.65,.5);}
  if(name==='adult-face')close(A.cast.jamieMom,1.1,.15);
  if(name==='september'||name==='october')view(main(930,6.2,1.6),main(940,-14,2));
  if(name==='oak-barricade')view(main(1038,4,1.6),main(1162,7.6,5));
  if(name==='vigil'){const H=h.world.homes.jamie,a=H.toWorld(H.doorX-3.4,13.2),b=H.toWorld(H.doorX+.4,7.2);view(V(a.x,a.ground+1.6,a.z),V(b.x,b.ground+.6,b.z));}
  if(name==='memorial')view(S(-.3,5.6),S(-1,-5.8,1.2));
  if(name==='kitchen')close(A.cast.mom,1.75,.5);
  if(name==='goodbye'){const truck=A.SC.TOWN.LEAVE.TRUCK;truck.updateMatrixWorld(true);view(V(4.2,2,7).applyMatrix4(truck.matrixWorld),V(0,1.5,2.4).applyMatrix4(truck.matrixWorld));}
  h.refreshReviewCamera?.();h.camera.updateProjectionMatrix();h.camera.updateMatrixWorld(true);h.scene.updateMatrixWorld(true);
  const frames=[];for(let i=0;i<2;i++)frames.push(h.renderer.capture(h.scene,h.camera));
  const pixels=new Uint8Array(innerWidth*innerHeight*4);gl.readPixels(0,0,innerWidth,innerHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  const png=new PNG({width:innerWidth,height:innerHeight});for(let y=0;y<innerHeight;y++)png.data.set(pixels.subarray(y*innerWidth*4,(y+1)*innerWidth*4),(innerHeight-y-1)*innerWidth*4);
  fs.writeFileSync(out+'/'+name+'.png',PNG.sync.write(png));results.push({name,jump,seconds,reviewCamera:review,camera:h.camera.position.toArray(),direction:h.camera.getWorldDirection(V()).toArray(),fov:h.camera.fov,far:h.camera.far,frames,phase:h.chapter.kit.S.phase,caption:h.chapter.state.line,actualRenderer:true,damage:h.chapter8.SC.STREET.town.district?.state,crowd:SC.SCH.crowd?.state});
  console.log('Captured',name,JSON.stringify(frames.at(-1)),'RSS MiB',Math.round(process.memoryUsage().rss/1048576));fs.writeFileSync(out+'/manifest.json',JSON.stringify(results,null,2));
  h.scene.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])m.dispose();});h.renderer.renderLists.dispose();globalThis.gc?.();
 }
}
