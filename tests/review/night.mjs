// Review frames: the camp at night. The first light in the trees (a beam, not a ball) turning onto the boys; the three
// lights at the gate, the length of the camp away; stopped at the map board; one copying your flashlight; sitting at the
// fire; turned on you. The double in Owl: seen, turning to Jamie, coming out the door. The run: the gate slammed shut,
// Sam shoving it open, every light out.
export default async function(L,{cap,step,press,release,tap,face}){
 const C5=L.chapter5,cam=L.camera,J=L.chapter.companions.list.jamie,Sm=L.chapter.companions.list.sam,camp=C5.camp,act=id=>(L.chapter.act?L.chapter.act(id):C5.act(id));
 // (the view turns on the next step: one step taken, then aimed again, so the frame shows where it was aimed)
 const aim=v=>{const w=L.state.walk,c=cam.position;face(Math.atan2(v.x-w.x,-(v.z-w.z)),Math.atan2(v.y-c.y,Math.hypot(v.x-c.x,v.z-c.z)));},lookAt=v=>{aim(v);step(1/30);aim(v);step(1/30);};
 const walkTo=(q,max=12,run=false)=>{for(let t=0;t<max;t+=1/30){const w=L.state.walk,dx=q.x-w.x,dz=q.z-w.z;if(Math.hypot(dx,dz)<.5)break;face(Math.atan2(dx,-dz),0);press('KeyW');if(run)press('ShiftLeft');step(1/30);}release('KeyW');release('ShiftLeft');};
 const until=(f,max=20,dt=.1)=>{for(let t=0;t<max&&!f();t+=dt)step(dt);},W=(e,n,y)=>C5.W5(e,n,y);
 const lightPos=i=>camp.carriedAt(i),out={};
 // (where the lights are: the middle of those lit, or a fallback point)
 const lights=(fb)=>{const ps=[0,1,2].map(i=>camp.CARRY[i].g.visible?camp.CARRY[i].g.position:null).filter(Boolean);if(!ps.length)return fb;const m={x:0,y:0,z:0};for(const q of ps){m.x+=q.x/ps.length;m.y+=q.y/ps.length;m.z+=q.z/ps.length;}m.y-=.35;return m;};
 // ---- the first light ----
 L.jump('c5-calling');step(.5);
 until(()=>camp.CARRY[0].g.visible,20);{const l=camp.CARRY[0].g.position,w=L.state.walk,dx=l.x-w.x,dz=l.z-w.z,d=Math.hypot(dx,dz);walkTo({x:w.x+dx/d*3.5,z:w.z+dz/d*3.5},4);}step(.6);const l0=lightPos(0);if(l0){lookAt(l0);await cap('n01-a-light-in-the-trees');}
 until(()=>camp.CARRY[0].aim,15);step(1.2);if(lightPos(0)){lookAt(lightPos(0));await cap('n02-its-beam-on-you');}until(()=>!camp.CARRY[0].g.visible,8);await cap('n03-gone');
 // ---- three lights ----
 // (first from the cabins, a hundred metres off, with a clear line past Bluejay to the gate; then round Robin to the south
 // side of the fire circle, seventeen metres out, where the office, the board and the fire are all in view and the lights
 // never come within the twelve metres that puts them out)
 L.jump('c5-three-lights');step(.5);walkTo(W(-261,549),10);until(()=>C5.C.lt?.started,20);walkTo(W(-266,549),5);step(2.5);lookAt(lights(W(-166,512,1.2)));await cap('n04-three-lights-at-the-gate-100m');
 for(const [e,n] of [[-258,546],[-246,536],[-238,516],[-226,503],[-218,500]])walkTo(W(e,n),14,true);
 until(()=>C5.C.lt.office,40);step(.5);lookAt(lights(W(-178,527,1.2)));await cap('n05-at-the-office');
 until(()=>C5.C.lt.board,40);step(1);lookAt(lights(W(-191,539,1.2)));await cap('n06-stopped-at-the-map-board');
 const GR=C5.GR;step(3.5);if(!GR.inHand||!GR.on){tap('KeyT');step(1.2);}lookAt(lights(W(-191,539,1.2)));tap('KeyT');step(.9);await cap('n07-you-switch-off-it-switches-off');step(1);tap('KeyT');step(.9);await cap('n08-and-on');step(.8);tap('KeyT');step(1);tap('KeyT');step(.5);
 until(()=>C5.C.lt.sat,80);step(1.5);lookAt(lights(W(-212,516,.7)));await cap('n09-sitting-where-you-sat');
 until(()=>C5.C.lt.turned,30);step(1.4);lookAt(lights(W(-212,516,1.1)));await cap('n10-turned-on-you');out.copies=C5.C.lt.copies;
 // ---- the double ----
 L.jump('c5-window');step(.6);const D=C5.DOUBLE();{const pr=await import('/dist/pine-plan.js'),ob=pr.BLD.owl,porch=W(...ob.F.to(0,ob.d/2+ob.porch+1.0));walkTo(porch,10);}until(()=>C5.C.win,10);lookAt({x:D.x,y:D.y+1.4,z:D.z});step(1);await cap('n11-owl-from-the-porch');
 until(()=>C5.C.win?.stage==='turn',45);step(1.5);lookAt({x:camp.D.x,y:camp.D.y+1.4,z:camp.D.z});await cap('n12-it-looks-at-jamie');
 const jh={x:J.px,y:J.person.group.position.y+1.3,z:J.pz};lookAt(jh);await cap('n13-jamie-beside-you');
 until(()=>C5.C.win?.stage==='come',20);for(let i=0;i<4;i++){step(1);lookAt({x:camp.D.x,y:camp.D.y+1.3,z:camp.D.z});await cap('n14-it-comes-out-'+i);if(C5.C.win?.stage==='run')break;}
 until(()=>C5.C.flags.wake,10);step(.6);await cap('n15-every-light-RUN');
 // ---- the gate ----
 L.jump('c5-run');step(.4);for(const [e,n] of [[-262,556],[-236,552],[-212,546],[-192,538],[-186.6,532.6],[-185.3,530],[-178.8,524.2],[-172,520]]){walkTo(W(e,n),16,true);if(C5.C.flags.gateShut)break;}
 until(()=>C5.C.flags.gateShut,10);walkTo(W(-169,516),4,true);step(.3);{const g=W(-166,512);lookAt({x:g.x,y:cam.position.y-.25,z:g.z});}await cap('n16-the-gate-slams-shut');
 for(let i=0;i<80&&!C5.C.flags.gateOpened;i++){step(.1);if(i%5===0)lookAt({x:Sm.px,y:Sm.person.group.position.y+1.1,z:Sm.pz});}step(.4);await cap('n17-sam-shoves-it-open');
 walkTo(W(-163,505),10,true);walkTo(W(-160,500),6,true);until(()=>C5.C.flags.boundary,8);step(2);face(Math.atan2(W(-190,545).x-L.state.walk.x,-(W(-190,545).z-L.state.walk.z)),0);await cap('n18-every-light-out-behind');
 out.gate=C5.C.flags.gateOpened;return out;
}
