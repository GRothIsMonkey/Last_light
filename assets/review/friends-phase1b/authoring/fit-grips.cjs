process.env.LL_TEST_DIST='dist';
const {browserSession}=require('./review-browser.cjs'),fs=require('fs');
browserSession(async(page,url)=>{
 await page.goto(url+'/?qa&friends1b');await page.waitForFunction(()=>window.friends1b,null,{timeout:150000});
 const result=await page.evaluate(async()=>{
   const T=await import('./three.module.js'),{newPose,ridePose,gripPos}=await import('./rig.js');const g=lastLight;g.start();g.step(.1);
   const out={};
   for(const {f,skin} of friends1b.cast){
     const G=f.bike.geom,m=skin.meshes[0],sk=m.skeleton,at=m.geometry.attributes,solver=skin.model,orig=Object.fromEntries(Object.entries(solver.grasp).map(([n,q])=>[n,q.clone()]));
     const vec=new T.Vector3(),bar=vec.clone(),p=newPose(),inv=f.bike.group.matrixWorld.clone().invert(),own=inv.clone();ridePose(p,0,{geom:G,posture:f.cast.build.posture});
     const pose=()=>{skin.apply(p,{geom:G,ride:1,crank:0,steer:0,clock:1});f.bike.group.updateMatrixWorld(true);sk.update();own.copy(inv).multiply(m.matrixWorld);};
     const groups={};const seen=new Set();
     for(let i=0;i<at.position.count;i++){const coords=[at.position.getX(i),at.position.getY(i),at.position.getZ(i)].map(q=>q.toFixed(5)).join();if(seen.has(coords))continue;seen.add(coords);
       let k=0;for(let j=1;j<4;j++)if(at.skinWeight.getComponent(i,j)>at.skinWeight.getComponent(i,k))k=j;
       const n=sk.bones[at.skinIndex.getComponent(i,k)].name,match=/^(thumb|index|middle|ring|pinky)\d_([lr])$/.exec(n);if(match)(groups[match[1]+match[2]]??=[]).push(i);}
     out[f.key]={};for(const [s,sign] of [['l',-1],['r',1]])for(const digit of ['thumb','index','middle','ring','pinky']){
       gripPos(0,sign,bar,G);const verts=groups[digit+s];let a=Array(9).fill(0);
       function apply(a){const rot=new T.Quaternion();for(let k=0;k<3;k++){const n=digit+(k+1)+'_'+s;rot.multiply(new T.Quaternion().setFromEuler(new T.Euler(a[3*k],a[3*k+1],a[3*k+2],'XYZ')));solver.grasp[n].copy(rot).multiply(orig[n]);}pose();}
       function loss(a){apply(a);let pen=0,peak=0,near=100,valid=0;
         for(const i of verts){const v=m.getVertexPosition(i,vec).applyMatrix4(own).sub(bar);if(sign*v.x<-.061||sign*v.x>.045)continue;const y=Math.hypot(v.y,v.z)-.020;
           const b=Math.max(0,-y);pen+=b*b;peak=Math.max(peak,b);near=Math.min(near,Math.abs(y));valid++;}
         return valid<.67*verts.length?1000:1000000*(3*peak*peak+12*pen/valid+4*near*near)+.27*a.reduce((n,x)=>n+x*x,0);
       }
       let score=loss(a),initial=score;
       for(const step of [.26,.15,.08,.04,.022])for(let iter=0;iter<4;iter++){let changed=false;for(let n=0;n<9;n++){
         let best=score,pick=a[n];for(const d of [-step,step]){const b=a.slice();b[n]+=d;if(Math.abs(b[n])>(digit==='thumb'?.98:.77))continue;const v=loss(b);if(v<best-1e-5){best=v;pick=b[n];}}if(best<score){a[n]=pick;score=best;changed=true;}
       }if(!changed)break;}
       apply(a);for(let j=1;j<=3;j++){const n=digit+j+'_'+s;out[f.key][n]=solver.grasp[n].toArray();}
       console.log(f.key,digit,s,initial,score);
     }
   }return out;
 });
 fs.writeFileSync('assets/review/friends-phase1b/authoring/grip-calibration.json',JSON.stringify(result,null,2));
}).catch(e=>{console.error(e);process.exitCode=1});
