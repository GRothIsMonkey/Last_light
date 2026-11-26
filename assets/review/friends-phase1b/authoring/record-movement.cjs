process.env.LL_TEST_DIST='dist';
const {browserSession}=require('./review-browser.cjs'),fs=require('fs'),path=require('path');
browserSession(async(p,url)=>{
 p.on('console',m=>{if(m.type()==='error')console.error(m.text());});await p.goto(url+'/friends-1b-review.html');await p.waitForFunction(()=>window.friendStudio,null,{timeout:120000});
 for(const key of ['jamie','sam','alex']){
   const dir='review-capture/footage/'+key+'-motion';fs.mkdirSync(dir,{recursive:true});let i=0;
   for(let s=0;s<14;s++){
     const frames=await p.evaluate(([key,s])=>{const a=friendStudio;a.pause();a.choose(key,s);const d=a.duration(),frames=[],canvas=document.createElement('canvas');canvas.width=800;canvas.height=560;const c=canvas.getContext('2d');
       for(let j=0;j<Math.ceil(d*15);j++){a.frame(j/15);c.drawImage(a.canvas,0,0);c.fillStyle='rgba(27,32,30,.76)';c.fillRect(22,490,370,50);c.fillStyle='#ede9dd';c.font='21px Georgia';c.fillText(key[0].toUpperCase()+key.slice(1)+'  ·  '+a.shots[s][1],38,521);frames.push(canvas.toDataURL('image/jpeg',.9).split(',')[1]);}return frames;},[key,s]);
     for(const b of frames)fs.writeFileSync(path.join(dir,String(i++).padStart(5,'0')+'.jpg'),Buffer.from(b,'base64'));
   }console.log(key,i);
 }
}).catch(e=>{console.error(e);process.exitCode=1});
