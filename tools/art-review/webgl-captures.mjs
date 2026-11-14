import fs from 'node:fs';
import {createRequire} from 'node:module';
export default async function({h,advance,THREE,element}){
 const require=createRequire(process.env.RENDER_MODULES+'/package.json'),{PNG}=require('pngjs'),gl=globalThis.renderContext,out=process.env.RENDER_OUTPUT||'artifacts/webgl';fs.mkdirSync(out,{recursive:true});
 const shots=[['skyline','c8-surface',10],['shelter','a1-gym',4],['september','a1-return',4],['october','a1-weeks',4]];
 const results=[];
 for(const [name,jump,seconds]of shots){if(process.env.RENDER_SHOTS&&!process.env.RENDER_SHOTS.split(',').includes(name))continue;
  h.jump(jump);advance(seconds);h.camera.aspect=innerWidth/innerHeight;
  let reviewCamera=false;
  if(name==='skyline'){const p=h.chapter.kit.main(1120,1.5),q=h.chapter.kit.main(1262,46);h.camera.position.set(p.x,p.y+1.7,p.z);h.camera.lookAt(q.x,q.y+57,q.z);reviewCamera=true;}
  h.camera.updateProjectionMatrix();h.camera.updateMatrixWorld(true);h.scene.updateMatrixWorld(true);
  const frames=[];for(let i=0;i<2;i++)frames.push(h.renderer.capture(h.scene,h.camera));
  const pixels=new Uint8Array(innerWidth*innerHeight*4);gl.readPixels(0,0,innerWidth,innerHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  const png=new PNG({width:innerWidth,height:innerHeight});for(let y=0;y<innerHeight;y++)png.data.set(pixels.subarray(y*innerWidth*4,(y+1)*innerWidth*4),(innerHeight-y-1)*innerWidth*4);
  fs.writeFileSync(out+'/'+name+'.png',PNG.sync.write(png));results.push({name,jump,seconds,reviewCamera,camera:h.camera.position.toArray(),direction:h.camera.getWorldDirection(new THREE.Vector3()).toArray(),frames,phase:h.chapter.kit.S.phase,caption:element('subtitle').textContent,actualRenderer:true});
  console.log('Captured',name,JSON.stringify(frames.at(-1)));fs.writeFileSync(out+'/manifest.json',JSON.stringify(results,null,2));
 }
}
