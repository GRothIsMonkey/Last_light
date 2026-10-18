// Review frames: the yellow gate opened by Jamie's hand; Sam's flashlights out of his bag at the camp gate (yours taken);
// the flashlight dying in Bluejay and Sam's batteries (taken, changed); a picture taken with your hands (shutter, flash);
// Alex's shirt off its nail into Sam's bag; the inventory (I).
export default async function(L,{cap,step,press,release,tap,face}){
 const C5=L.chapter5,cam=L.camera,J=L.chapter.companions.list.jamie,Sm=L.chapter.companions.list.sam,GR=C5.GR,GT=C5.GT,act=id=>(L.chapter.act?L.chapter.act(id):C5.act(id));
 const lookAt=v=>{const w=L.state.walk,c=cam.position;face(Math.atan2(v.x-w.x,-(v.z-w.z)),Math.atan2(v.y-c.y,Math.hypot(v.x-c.x,v.z-c.z)));};
 const walkTo=(q,max=12)=>{for(let t=0;t<max;t+=1/30){const w=L.state.walk,dx=q.x-w.x,dz=q.z-w.z;if(Math.hypot(dx,dz)<.35)break;face(Math.atan2(dx,-dz),0);press('KeyW');step(1/30);}release('KeyW');};
 const head=c=>({x:c.px,y:c.person.group.position.y+1.15,z:c.pz}),until=(f,max=20,dt=.1)=>{for(let t=0;t<max&&!f();t+=dt)step(dt);};
 const out={};
 // ---- the yellow gate ----
 L.jump('c5-gate-decision');step(.6);const G=C5.W5(-118,371);walkTo({x:G.x+.8,z:G.z+4.2},10);lookAt({x:G.x,y:cam.position.y-.4,z:G.z});step(.2);await cap('e01-the-yellow-gate-shut');
 until(()=>GT.opening('swing')||J.script,15);for(let i=0;i<60&&!GT.opening('swing');i++){step(.1);lookAt(head(J));}await cap('e02-jamie-lifts-the-latch');
 step(1);lookAt(GT.barPoint('swing',.6));await cap('e03-jamie-walks-it-round');until(()=>GT.isOpen('swing'),8);step(.3);lookAt({x:G.x,y:cam.position.y-.3,z:G.z});await cap('e04-open');out.gate=GT.S.by.swing;
 // ---- the camp gate: the flashlights ----
 L.jump('c5-camp-gate');step(.6);const CG=C5.W5(-166,512);walkTo({x:CG.x+1.5,z:CG.z+4.5},14);until(()=>Sm.script||GR.S.torchOut,12);
 for(let i=0;i<90&&!GR.S.offerTorch;i++){step(.1);lookAt(head(Sm));if(!out.bag&&C5.G5.S.bagP.holder===Sm.person&&C5.G5.S.bagP.side!=='back'){out.bag=1;step(.4);lookAt(head(Sm));await cap('e05-sam-swings-his-bag-round');}}
 step(.4);if(GR.S.torch){lookAt(GR.S.torch.obj.position);await cap('e06-a-flashlight-held-out');act('c5-torch');step(.35);await cap('e07-you-take-it');step(.8);}lookAt({x:CG.x,y:cam.position.y-.2,z:CG.z+6});await cap('e08-in-your-hand');
 // (by day, at a shadowed post close up: off, then on)
 {const post=C5.W5(-163.3,513.4);walkTo({x:post.x+1.4,z:post.z+1.9},6);lookAt({x:post.x,y:cam.position.y-.5,z:post.z});if(L.foot?.on)tap('KeyT');step(.3);await cap('e09-by-day-off');tap('KeyT');step(.3);await cap('e09-by-day-on');tap('KeyT');step(.2);}
 // ---- Bluejay: it dies; Sam's batteries ----
 const pp=await import('/dist/pine-plan.js'),bjB=pp.BLD.bluejay;L.jump('c5-cabins');step(.6);act('c5-door-bluejay');step(.8);
 walkTo(C5.W5(...bjB.F.to(bjB.door[0],bjB.d/2-.9)),8);walkTo(C5.W5(...bjB.c),8);lookAt({x:C5.W5(...bjB.c).x,y:cam.position.y-.3,z:C5.W5(...bjB.c).z+1});
 if(!GR.inHand){tap('KeyT');step(.8);}else if(!L.foot?.on){tap('KeyT');step(.2);}await cap('e09b-bluejay-flashlight-on');until(()=>C5.C.flags.dying,6);step(1);await cap('e09c-flickering');until(()=>C5.C.flags.dead,6);step(.3);await cap('e09d-dead');
 for(let i=0;i<200&&!GR.S.offerBatt;i++){step(.1);lookAt(head(Sm));if(!out.bbag&&C5.G5.S.bagP.side!=='back'){out.bbag=1;step(.6);lookAt(head(Sm));await cap('e09e-sam-gets-his-bag-round');}}
 step(.3);if(GR.S.batt){lookAt(GR.S.batt.obj.position);await cap('e09f-batteries-held-out');act('c5-batt');step(.5);await cap('e09g-taken');step(.9);await cap('e09h-changing-them');step(.8);await cap('e09i-back-on');}out.batteries=C5.C.flags.batteries;
 // ---- a picture with your hands: the register ----
 L.jump('c5-register');step(.8);act('c5-register');step(1.2);await cap('e10-the-register');press('KeyV');release('KeyV');step(.2);await cap('e11-camera-coming-up');step(.2);await cap('e12-finger-on-the-shutter');step(.08);await cap('e13-flash');step(.35);await cap('e14-the-picture-on-its-screen');step(.8);await cap('e15-down-again');
 press('KeyS');release('KeyS');step(.8);
 // ---- the inventory ----
 tap('KeyI');step(.2);await cap('e16-the-inventory');tap('KeyI');step(.2);
 // ---- Owl: the shirt ----
 L.jump('c5-owl');step(.5);act('c5-door-owl');step(.8);{const ob=pp.BLD.owl;walkTo(C5.W5(...ob.F.to(ob.door[0],ob.d/2-.9)),8);walkTo(C5.W5(...ob.F.to(ob.w/2-1.25,-(ob.d/2-.75))),8);}act('c5-shirt');until(()=>C5.C.flags.shirtDone,40);act('c5-carving');until(()=>C5.C.flags.owlDone,40);
 for(let i=0;i<200&&!C5.C.inv.shirt;i++){step(.1);lookAt(head(Sm));const P=C5.phys.PROPS.get('alex-shirt');if(P?.holder===Sm.person&&!out.held){out.held=1;step(.2);await cap('e17-sam-has-the-shirt');step(.7);await cap('e18-gathered-up');}if(C5.G5.S.bagP.side!=='back'&&out.held&&!out.bag2){out.bag2=1;step(.6);await cap('e19-into-his-bag');}}
 step(1.2);lookAt(head(Sm));await cap('e20-bag-back-on');out.shirt=C5.C.inv.shirt;
 return out;
}
