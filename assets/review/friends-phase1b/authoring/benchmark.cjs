process.env.LL_TEST_DIST='dist';
const {browserSession}=require('./review-browser.cjs'),fs=require('fs');
const env='bikes&houses&vegetation&pavement&streetprops&details',report=[];
browserSession(async(page,url)=>{
 for(const flag of ['',env,env+'&player1b',env+'&player1b&friends1b']){
   const t=Date.now();await page.goto(url+'/?qa&'+flag,{timeout:150000});
   await page.waitForFunction(flag=>window.lastLight&&(!flag||window.__bikes&&window.__houses&&window.__vegetation&&window.__pavement&&window.__streetprops&&window.__details)&&(!flag.includes('player1b')||window.player1b?.flags.ready)&&(!flag.includes('friends1b')||window.friends1b),flag,{timeout:150000});
   const loadMs=Date.now()-t;
   await page.evaluate(()=>{const g=lastLight;g.start();g.ui.closePanels();g.press('KeyW');g.look(0,-.10);g.step(.4);g.render();
     const gl=g.renderer.getContext(),gpu=gl.getExtension('WEBGL_debug_renderer_info'),pixel=new Uint8Array(4),rows=[];
     window.profileRoad=(start,count)=>{for(let i=start;i<start+count;i++){
       if(i===250)g.press('ShiftLeft');if(i===330)g.release('ShiftLeft');if(i===420)g.release('KeyW');if(i===448)g.press('KeyW');
       const t=performance.now();g.step(1/15);const u=performance.now();g.render();gl.finish();gl.readPixels(2,2,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);
       const cost=performance.now()-t;rows.push([cost,u-t,g.renderer.info.render.triangles,g.renderer.info.render.calls]);}
       return g.state.distance;};
     window.roadProfile=()=>{let q=(j,fraction)=>rows.slice(30).map(r=>r[j]).sort((a,b)=>a-b)[Math.floor((rows.length-30)*fraction)];
       return {frames:rows.length,warmup:30,simSeconds:rows.length/15,gpu:gl.getParameter(gpu.UNMASKED_RENDERER_WEBGL),size:[gl.drawingBufferWidth,gl.drawingBufferHeight],frameMedian:q(0,.5),frameP95:q(0,.95),updateMedian:q(1,.5),triMedian:q(2,.5),drawMedian:q(3,.5),startMemory:window.startMemory,endMemory:{...g.renderer.info.memory,heap:performance.memory?.usedJSHeapSize},friends:window.friends1b?.stats(),at:g.state.distance};};
     window.startMemory={...g.renderer.info.memory,heap:performance.memory?.usedJSHeapSize};
   });
   for(let i=0;i<1800;i+=30)await page.evaluate(i=>profileRoad(i,30),i);
   const row=await page.evaluate(()=>roadProfile());report.push({flag,loadMs,...row});console.log(report.at(-1));
   fs.writeFileSync('assets/review/friends-phase1b/evidence/performance.json',JSON.stringify(report,null,2));
 }
}).catch(e=>{console.error(e);process.exitCode=1});
