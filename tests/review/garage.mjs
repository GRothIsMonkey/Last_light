// Review frames: Sam's garage played through (packing, the camera, Jamie's sock, the map, the bikes).
export default async function(L,{cap,step,press,release,tap,face}){globalThis.__onlySock=!!(window.__ONLY_SOCK);
 const C5=L.chapter5,G=C5.G5,GS=G.S,cam=L.camera;
 const lookAt=v=>{const w=L.state.walk,c=cam.position;face(Math.atan2(v.x-w.x,-(v.z-w.z)),Math.atan2(v.y-c.y,Math.hypot(v.x-c.x,v.z-c.z)));};
 const walkTo=(q,max=6)=>{for(let t=0;t<max;t+=1/30){const w=L.state.walk,dx=q.x-w.x,dz=q.z-w.z;if(Math.hypot(dx,dz)<.25)break;face(Math.atan2(dx,-dz),0);press('KeyW');step(1/30);}release('KeyW');};
 const J=L.chapter.companions.list.jamie,S=L.chapter.companions.list.sam,head=c=>{const g=c.person.group.position;return {x:g.x,y:g.y+1.3,z:g.z};};
 L.jump('chapter5-start');step(7.5);lookAt(G.TL(0,.2));await cap('g01-garage-sam-at-the-table');
 walkTo(G.TL(0,-.78,0));for(let i=0;i<60&&!GS.flags.packing;i++)step(.25);step(.3);
 const P=GS.items.find(q=>q.state==='placed'&&!q.claimed&&q.kind==='flashlight');lookAt(P.obj.position);step(.1);await cap('g02-look-at-a-flashlight');
 tap('KeyF');step(.25);await cap('g03-reaching-for-it');step(.3);await cap('g04-touch');step(.5);lookAt(GS.bag.mouth());step(.1);await cap('g05-holding-it-looking-at-the-bag');
 tap('KeyF');step(.3);await cap('g06-into-the-bag');step(.8);
 lookAt(G.TL(0,.25,1.0));step(.6);await cap('g07-sam-packing');step(.5);await cap('g08-sam-packing-b');
 for(let i=0;i<120&&!GS.flags.cameraAsked;i++){step(.25);if(GS.flags.allPacked&&!GS.flags.shouldered&&!globalThis.__sh){globalThis.__sh=1;step(.4);await cap('g08b-sam-shoulders-his-bag');}}step(.5);lookAt(GS.cam.obj.position);step(.1);await cap('g09-sam-holds-out-the-camera');
 tap('KeyF');step(.35);await cap('g10-taking-the-camera');step(.4);await cap('g11-camera-in-hand');
 for(let i=0;i<60&&!J.script?.length;i++)step(.5);for(let i=0;i<80&&!(J.mode==='foot');i++)step(.25);lookAt(head(J));step(.2);await cap('g12-jamie-arrives-with-his-backpack');
 for(let i=0;i<400&&GS.sockShownAt==null;i++){step(.1);lookAt(head(J));if(GS.jbagP.state==='held'&&!globalThis.__bg){globalThis.__bg=1;step(.3);await cap('g13-the-bag-off-his-back');}if(GS.sock.state==='held'&&!globalThis.__sk){globalThis.__sk=1;await cap('g13b-hand-out-with-it');}}
 lookAt(head(J));step(.5);await cap('g14-one-sock');step(1.4);lookAt(head(S));step(.2);await cap('g15-sam-unimpressed');
 for(let i=0;i<200&&!GS.flags.barsTaken;i++){step(.1);if(GS.bars[0].holder===S.person&&!globalThis.__bb){globalThis.__bb=1;step(.6);lookAt({x:(J.px+S.px)/2,y:J.person.group.position.y+1,z:(J.pz+S.pz)/2});await cap('g16-granola-bars');}}
 for(let i=0;i<120&&!GS.flags.mapOpen;i++)step(.25);step(1.5);lookAt(G.TL(0,0,.73));step(.1);await cap('g17-the-map-on-the-table');
 step(2.5);await cap('g18-sam-points');
 const mp=GS.map.obj.position;tap('KeyF');step(1.5);await cap('g19-looking-at-the-map');step(9);
 for(let i=0;i<200&&!C5.C.flags.leave;i++)step(.25);walkTo(G.TL(0,-5.2,0),6);for(let i=0;i<10&&J.script?.[J.step]&&J.mode==='foot';i++){step(.2);lookAt(head(J));}
 lookAt(head(J));await cap('g20-jamie-to-his-bike');for(let i=0;i<40&&J.mode==='foot';i++){step(.1);lookAt(head(J));}await cap('g21-jamie-kickstand-and-mount');step(.6);await cap('g22-jamie-mounting');step(.8);await cap('g23-jamie-on-his-bike');
 for(let i=0;i<80&&!(C5.C.flags['ready-sam']);i++)step(.25);lookAt({x:(J.bx+S.bx)/2,y:cam.position.y-.3,z:(J.bz+S.bz)/2});await cap('g24-both-waiting-at-the-end-of-the-driveway');
 return {packedBy:GS.packedBy,flags:Object.keys(GS.flags)};
}
