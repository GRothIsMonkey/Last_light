// Chapter Five: Sam's garage, the next afternoon. A card table just inside the open garage door with the supplies laid out on
// it (three flashlights, two battery packs, three water bottles, Alex's camera, a folded county map, two granola bars) and
// Sam's backpack standing open in the middle. Sam packs, item by item, with his hands; you can pack too (F on a thing to
// pick it up, F on the bag to put it in), and whatever either of you has packed is in the bag and nowhere else. Then
// Sam holds out Alex's camera for you to take. Jamie rides up late with his backpack on, swings it off, digs in it and
// holds up the one sock he packed. Sam hands him two granola bars. Sam opens the map on the table and the three of them
// work out the way: Mill Street north past the sawhorse, the Old Reservoir Road over the ridge, Pine Ridge on the
// reservoir (the sign on the TV, where they searched for Danny Whitcomb in 1991). Then Sam shoulders his bag, and Jamie
// and Sam go out to their bikes and get on them on their own, and wait for you at the end of the driveway.
//
// Everything here is a prop with a home on the table (physical.js); the meshes are placeholders an art pass can replace by
// name without touching the scene: garage-table, supply-flashlight-1..3, supply-batteries-1..2, supply-water-1..3,
// supply-camera, county-map, granola-bar-1..2, sam-backpack, jamie-backpack, jamie-sock.
import * as THREE from './three.module.js';
import {makeCameraModel} from './alex-camera.js';
import {countyMapArt} from './pine-art.js';
import {headingTo,wrap} from './people.js';
import {P as PI,smooth,standPose,copyPose,applyPose} from './rig.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const mat=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.75,...o});

// ---- the props ----------------------------------------------------------------------------------------------------------------
function flashlightMesh(color){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.019,.017,.15,10),mat(color,{roughness:.45,metalness:.3}));body.rotation.z=Math.PI/2;g.add(body);
 const head=new THREE.Mesh(new THREE.CylinderGeometry(.026,.02,.04,12),mat(color,{roughness:.4,metalness:.35}));head.rotation.z=Math.PI/2;head.position.x=.09;g.add(head);
 const lens=new THREE.Mesh(new THREE.CircleGeometry(.022,12),mat(0xeee6c8,{roughness:.2}));lens.rotation.y=Math.PI/2;lens.position.x=.111;g.add(lens);
 const sw=new THREE.Mesh(new THREE.BoxGeometry(.016,.008,.012),mat(0x202020));sw.position.set(.02,.019,0);g.add(sw);for(const m of g.children)m.castShadow=true;return g;}
function batteryPack(){const g=new THREE.Group();const card=new THREE.Mesh(new THREE.BoxGeometry(.085,.004,.12),mat(0xd8a020,{roughness:.6}));g.add(card);
 const blister=new THREE.Mesh(new THREE.BoxGeometry(.066,.016,.06),mat(0xdfe8ee,{roughness:.15,transparent:true,opacity:.6}));blister.position.set(0,.01,.015);g.add(blister);
 for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.0072,.0072,.05,8),mat(i%2?0xb87830:0x2a2a2a,{metalness:.3}));b.rotation.x=Math.PI/2;b.position.set(-.024+i*.016,.01,.015);g.add(b);}
 const label=new THREE.Mesh(new THREE.BoxGeometry(.07,.0045,.03),mat(0x1a1a1a));label.position.set(0,.001,-.035);g.add(label);for(const m of g.children)m.castShadow=true;return g;}
function bottle(){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.CylinderGeometry(.033,.033,.17,12),mat(0x9cc4dc,{roughness:.12,transparent:true,opacity:.7}));b.position.y=.085;g.add(b);
 const water=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.14,12),mat(0x6fa0c0,{roughness:.1,transparent:true,opacity:.45}));water.position.y=.075;g.add(water);
 const lab=new THREE.Mesh(new THREE.CylinderGeometry(.0335,.0335,.05,12,1,true),mat(0x2a5aa0));lab.position.y=.09;g.add(lab);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.02,10),mat(0x2a6ad8));cap.position.y=.205;g.add(cap);
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.015,.033,.025,12),b.material);neck.position.y=.183;g.add(neck);for(const m of g.children)m.castShadow=true;return g;}
function granola(){const g=new THREE.Group();const m=new THREE.Mesh(new THREE.BoxGeometry(.11,.018,.035),mat(0x3a8a3a,{roughness:.5}));g.add(m);const s=new THREE.Mesh(new THREE.BoxGeometry(.04,.019,.036),mat(0xe8d040,{roughness:.5}));s.position.x=.02;g.add(s);m.castShadow=true;return g;}
// a backpack: body, front pocket, straps, and a top flap on a hinge (open: thrown back) — its opening is above the body
function backpack(color,{zip=0x222222}={}){const g=new THREE.Group(),c=mat(color,{roughness:.85}),d=mat(new THREE.Color(color).multiplyScalar(.7).getHex(),{roughness:.9});
 const body=new THREE.Mesh(new THREE.BoxGeometry(.3,.36,.17),c);body.position.y=.18;g.add(body);const pocket=new THREE.Mesh(new THREE.BoxGeometry(.24,.16,.05),d);pocket.position.set(0,.11,-.105);g.add(pocket);
 const inner=new THREE.Mesh(new THREE.BoxGeometry(.27,.006,.14),mat(0x141210,{roughness:1}));inner.position.y=.357;g.add(inner);
 for(const s of [-1,1]){const st=new THREE.Mesh(new THREE.BoxGeometry(.04,.32,.015),d);st.position.set(s*.09,.2,.095);g.add(st);}
 const hinge=new THREE.Group();hinge.position.set(0,.36,.085);g.add(hinge);const flap=new THREE.Mesh(new THREE.BoxGeometry(.31,.02,.19),d);flap.position.set(0,.01,-.095);hinge.add(flap);
 const z=new THREE.Mesh(new THREE.BoxGeometry(.3,.006,.01),mat(zip,{metalness:.4}));z.position.set(0,.356,-.085);g.add(z);for(const m of g.children)m.castShadow=true;flap.castShadow=true;
 return {g,hinge,flap};}
function sockMesh(){const g=new THREE.Group(),w=mat(0xf2efe6,{roughness:1}),r=mat(0xc0302a,{roughness:1});
 const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.026,.16,3,8),w);leg.position.y=-.09;g.add(leg);const foot=new THREE.Mesh(new THREE.CapsuleGeometry(.024,.08,3,8),w);foot.rotation.x=Math.PI/2;foot.position.set(0,-.19,-.045);g.add(foot);
 for(const y of [-.025,-.04]){const s=new THREE.Mesh(new THREE.TorusGeometry(.026,.004,4,12),r);s.rotation.x=Math.PI/2;s.position.y=y;g.add(s);}for(const m of g.children)m.castShadow=true;return g;}
function mapMesh(){const cv=(()=>{try{const c=document.createElement('canvas');const g=c.getContext?.('2d');if(!g)return null;c.width=1024;c.height=1024;countyMapArt(g,1024,1024);return c;}catch{return null;}})();
 const tex=cv?new THREE.CanvasTexture(cv):null;if(tex){tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;}
 const g=new THREE.Group();const open=new THREE.Mesh(new THREE.PlaneGeometry(.56,.56),new THREE.MeshStandardMaterial({map:tex,color:tex?0xffffff:0xe8e0c8,roughness:.95,side:THREE.DoubleSide}));open.rotation.x=-Math.PI/2;open.position.y=.002;g.add(open);
 const folded=new THREE.Mesh(new THREE.BoxGeometry(.19,.012,.1),new THREE.MeshStandardMaterial({color:0xe2d8b8,roughness:.9}));folded.position.y=.006;g.add(folded);
 const stripe=new THREE.Mesh(new THREE.BoxGeometry(.19,.0125,.02),mat(0xc8302a));stripe.position.set(0,.006,-.035);folded.add(stripe);open.visible=false;return {g,open,folded};}
function tableMesh(){const g=new THREE.Group(),top=new THREE.Mesh(new THREE.BoxGeometry(1.2,.03,.62),mat(0x4a4e4a,{roughness:.6}));top.position.y=.705;top.castShadow=true;top.receiveShadow=true;g.add(top);
 for(const [x,z] of [[-.56,-.27],[.56,-.27],[-.56,.27],[.56,.27]]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.7,6),mat(0x8a8c88,{metalness:.5,roughness:.4}));l.position.set(x,.35,z);g.add(l);}
 const edge=new THREE.Mesh(new THREE.BoxGeometry(1.2,.03,.62),mat(0x2a2c2a));edge.position.y=.68;edge.scale.set(1.01,.4,1.01);g.add(edge);g.name='garage-table';return g;}

export const TABLE_H=.72;
// Items on the table: table-local x (across; + on your left as you face Sam), z (+ toward Sam), turn; who packs it.
const LAYOUT=[
 ['supply-flashlight-1','flashlight',.40,-.14,.3,0xc0302a],['supply-flashlight-2','flashlight',.44,-.03,-.2,0x2a5aa0],['supply-flashlight-3','flashlight',.37,.07,.5,0x252525],
 ['supply-batteries-1','batteries',.17,-.17,.15],['supply-batteries-2','batteries',.21,-.02,-.25],
 ['supply-water-1','water',-.30,-.13,0],['supply-water-2','water',-.39,-.05,0],['supply-water-3','water',-.29,.03,0],
];
const NAMES={flashlight:'flashlight',batteries:'batteries',water:'water bottle'};

export function createGarage(X){
 const {scene,phys,comp,jamie,sam,drive,driveA,gy,camera}=X;
 const root=new THREE.Group();root.name='chapter5-garage';
 const S={built:false,items:[],bag:null,jbag:null,sock:null,bars:[],map:null,cam:null,table:null,tableAt:null,flags:{},samBusy:false,said:new Set(),packedBy:{you:0,sam:0}};
 // the table's own frame: local -z points out of the garage (toward you on the driveway)
 const T0=()=>drive(-.25,-1.55),TA=()=>driveA(0,0);
 // (local x: right of facing out, (cos a, sin a); local +z: into the garage, (-sin a, cos a))
 const TL=(x,z,y=TABLE_H)=>{const c=T0(),a=TA(),cs=Math.cos(a),sn=Math.sin(a);return new THREE.Vector3(c.x+x*cs-z*sn,c.y+y,c.z+x*sn+z*cs);};
 function build(){if(S.built)return;S.built=true;scene.add(root);
  S.table=tableMesh();root.add(S.table);
  for(const [name,kind,x,z,r,color] of LAYOUT){const m=kind==='flashlight'?flashlightMesh(color):kind==='batteries'?batteryPack():bottle();
   const grip=kind==='flashlight'?{p:[0,.04,.025],r:[0,0,Math.PI/2]}:kind==='batteries'?{p:[0,.05,.03],r:[1.2,0,0]}:{p:[0,.0,.035],r:[Math.PI/2,0,0]};
   const P=phys.prop(name,m,{grip});P.kind=kind;P.lx=x;P.lz=z;P.lr=r;S.items.push(P);}
  {const B=backpack(0x3e5a3a);B.g.name='sam-backpack';const P=phys.prop('sam-backpack',B.g,{grip:{p:[0,-.12,.04],r:[0,0,0]}});S.bag=phys.container('sam-bag',B.g,{opening:[0,.38,-.01]});S.bagP=P;S.bagParts=B;}
  {const B=backpack(0x8e3b2f,{zip:0xd8d8d0});B.g.name='jamie-backpack';const P=phys.prop('jamie-backpack',B.g,{grip:{p:[0,-.12,.04],r:[0,0,0]}});S.jbag=phys.container('jamie-bag',B.g,{opening:[0,.38,-.01]});S.jbagP=P;S.jbagParts=B;}
  S.sock=phys.prop('jamie-sock',sockMesh(),{grip:{p:[0,.04,.02],r:[0,0,0]}});
  for(let i=0;i<2;i++){const P=phys.prop('granola-bar-'+(i+1),granola(),{grip:{p:[0,.04,.02],r:[0,0,Math.PI/2]}});S.bars.push(P);}
  {const M=mapMesh();M.g.name='county-map';S.map=phys.prop('county-map',M.g,{grip:{p:[0,.03,.03],r:[0,0,0]}});S.mapParts=M;}
  {const M=makeCameraModel();M.group.name='supply-camera';M.group.scale.setScalar(1);S.cam=phys.prop('supply-camera',M.group,{grip:{p:[0,.04,.03],r:[-1.2,0,0]}});}
  hideAll();}
 function hideAll(){for(const P of [...S.items,...S.bars,S.sock,S.map,S.cam,S.bagP,S.jbagP])P?.hide();if(S.table)S.table.visible=false;}
 // ---- where things are --------------------------------------------------------------------------------------------------------
 function place(P,x,z,{y=TABLE_H+.002,turn=0,lie=false}={}){const p=TL(x,z,y),q=new THREE.Quaternion().setFromEuler(new THREE.Euler(lie?-Math.PI/2:0,-(TA()+turn),0,'YXZ'));P.place(p,q);P.setHome(p,q);P.container=null;}
 function layTable(){S.table.visible=true;const c=T0();S.table.position.set(c.x,c.y,c.z);S.table.rotation.set(0,-TA(),0);
  for(const P of S.items){const flat=P.kind!=='water';place(P,P.lx,P.lz,{turn:P.lr,y:TABLE_H+(P.kind==='flashlight'?.02:P.kind==='batteries'?.003:.002)});void flat;}
  place(S.bagP,0,.13,{y:TABLE_H+.001,turn:Math.PI});S.bag.contents.clear();openFlap(S.bagParts,1);
  place(S.cam,-.12,-.19,{y:TABLE_H+.03,turn:Math.PI});place(S.map,.05,-.2,{y:TABLE_H});S.mapParts.open.visible=false;S.mapParts.folded.visible=true;S.mapParts.g.scale.setScalar(1);
  place(S.bars[0],-.47,.18,{y:TABLE_H+.01,turn:.2});place(S.bars[1],-.5,.11,{y:TABLE_H+.01,turn:-.1});}
 function openFlap(B,v){B.hinge.rotation.x=-2.3*v;B.open=v;}
 // ---- the table is in the way ---------------------------------------------------------------------------------------------
 function blockers(out){if(!S.table?.visible)return;for(const x of [-.42,0,.42]){const p=TL(x,0,0);out.push({x:p.x,z:p.z,r:.36,speed:0});}}
 // ---- Sam packs ------------------------------------------------------------------------------------------------------------------
 const packed=()=>S.items.filter(P=>P.state==='stored').length;
 const free=P=>P.state==='placed'&&!P.claimed;
 const mouth=()=>S.bag.mouth(new THREE.Vector3());
 function samStand(x){return TL(clamp(x*.75,-.4,.4),.66,0);}
 // one item: shuffle along behind the table to it, reach, take it, reach to the bag, let go; a moment; the next
 function samNext(){if(S.samStop||sam.script||S.samBusy)return;const left=S.items.filter(free);if(!left.length){S.samBusy=false;return;}
  // (nearest to where he is; the kinds in order of his list when it is a tie)
  const P=left.sort((a,b)=>Math.abs(a.lx-S.samX)-Math.abs(b.lx-S.samX))[0];P.claimed='sam';S.samBusy=true;const st=samStand(P.lx);S.samX=P.lx;
  const face=()=>TA();
  const steps=[];if(Math.hypot(st.x-sam.px,st.z-sam.pz)>.22)steps.push(comp.steps.walkTo(sam,[[st.x,st.z]],{speed:.9}));if(Math.abs(wrap(face()-sam.pa))>.3)steps.push(comp.steps.turnTo(sam,face,.3));
  comp.run(sam,[...steps,
   phys.reach(sam,{at:()=>P.state==='placed'?P.obj.position.clone().add(new THREE.Vector3(0,.02,0)):null,dur:[.5,.12,.32],onContact:()=>{if(P.state!=='placed'){P.claimed=null;return;}P.holdBy(sam.person,'r');firstSay(P.kind);},carry:true}),
   phys.reach(sam,{at:()=>P.holder===sam.person?mouth():null,dur:[.45,.18,.4],onContact:()=>{if(P.holder===sam.person){P.storeIn(S.bag);S.packedBy.sam++;X.sound('cloth',mouth(),{gain:.25});}P.claimed=null;},carry:false}),
   comp.steps.idle(sam,.15+((S.items.length-packed())%3)*.1)],{then:()=>{S.samBusy=false;}});}
 function firstSay(kind){if(S.said.has(kind)||X.busy())return;S.said.add(kind);const L={flashlight:'“Flashlights. One each.”',batteries:'“Batteries.”',water:'“Water.”'}[kind];if(L)X.say([{who:'SAM',text:L,by:'sam',time:1.2}]);}
 // ---- you pack ---------------------------------------------------------------------------------------------------------------
 const me=()=>X.me(),self=X.self;
 function youTake(P){if(phys.playerBusy()||S.holding||P.state!=='placed'||P.claimed)return;P.claimed='you';X.lockWalk(true);
  phys.playerReach({at:()=>P.obj.position.clone().add(new THREE.Vector3(0,.015,0)),onContact:()=>{if(P.state==='placed'){P.holdBy(self,'r');S.holding=P;phys.playerHold('r',P);X.sound('click',P.obj.position,{gain:.15});}else P.claimed=null;},then:()=>X.lockWalk(false)});}
 function youPut(){const P=S.holding;if(!P||phys.playerBusy())return;X.lockWalk(true);
  phys.playerReach({at:()=>mouth(),dur:[.4,.16,.4],carry:false,onContact:()=>{P.storeIn(S.bag);P.claimed=null;S.holding=null;phys.playerHold('r',null);S.packedBy.you++;X.sound('cloth',mouth(),{gain:.25});
   if(S.packedBy.you===1&&!X.busy())X.say([{who:'SAM',text:S.packedBy.sam?'“Good.”':'“Good. Keep going.”',by:'sam',time:1}]);},then:()=>X.lockWalk(false)});}
 // ---- the camera: Sam holds it out, you take it --------------------------------------------------------------------------
 function offerCamera(){if(S.flags.offer)return;S.flags.offer=true;S.offerAt=X.t();const P=S.cam;
  // (picked up off the table, then round it to you: he stands in front of you, an arm's length off, and holds it out)
  const toYou=()=>{const p=me(),q={x:p.x+Math.sin(p.a)*.85,z:p.z-Math.cos(p.a)*.85},obs=[];blockers(obs);const pth=X.walkPath?X.walkPath(sam,q,obs):[[q.x,q.z]];return pth.length?pth:[[q.x,q.z]];};
  let way=null;const goRound=(dt,ctx)=>{const p=me();if(Math.hypot(sam.px-p.x,sam.pz-p.z)<1.25)return true;if(!way)way=comp.steps.walkTo(sam,toYou(),{speed:1.15});return way(dt,ctx);};
  comp.run(sam,[comp.steps.turnTo(sam,()=>TA(),.3),phys.reach(sam,{at:()=>P.obj.position.clone(),dur:[.5,.15,.35],onContact:()=>P.holdBy(sam.person,'r'),carry:true}),
   goRound,holdOut(sam,()=>X.eyePos(),{until:()=>S.flags.cameraTaken})],{then:()=>{X.stand(sam,samStand(0),{look:()=>camera.position});}});
  X.say([{wait:.6},{who:'SAM',text:'“And this.”',by:'sam',time:1.1,face:'neutral'},{who:'SAM',text:'“Alex’s camera. You hold it. You’re better with it.”',by:'sam',time:2.8,face:'concerned'}],{then:()=>{S.flags.cameraAsked=true;}});}
 // a hand held out toward someone (holding something), until told
 function holdOut(c,to,{until}){let e=0;return (dt,ctx)=>{e+=dt;const t=to();c.pa+=clamp(wrap(headingTo(c.px,c.pz,t.x,t.z)-c.pa),-2.5*dt,2.5*dt);standPose(c.tmp,ctx.clock+c.R.phase,{look:clamp(-wrap(headingTo(c.px,c.pz,t.x,t.z)-c.pa),-1,1),shift:.3});copyPose(c.pose,c.tmp);
   const u=smooth(e/.5);c.pose[PI.rh]+=(.08-c.pose[PI.rh])*u;c.pose[PI.rh+1]+=(1.06-c.pose[PI.rh+1])*u;c.pose[PI.rh+2]+=(-.42-c.pose[PI.rh+2])*u;c.pose[PI.re]=.6;c.pose[PI.re+1]=-.4;
   comp.feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;return until();};}
 function youTakeCamera(){if(phys.playerBusy()||S.flags.cameraTaken)return;const P=S.cam;X.lockWalk(true);
  phys.playerReach({at:()=>P.obj.position.clone(),dur:[.45,.2,.5],onContact:()=>{phys.handOff(P,self,'r',{p:[0,.04,.03],r:[-1.3,0,0]});S.flags.cameraTaken=true;phys.playerHold('r',P);X.sound('click',P.obj.position,{gain:.2});
   X.later(1.3,()=>{P.hide();phys.playerHold('r',null);X.gotCamera();});},then:()=>X.lockWalk(false)});
  X.say([{wait:.4},{who:'YOU',text:'“Where’s Jamie?”',time:1.4},{who:'SAM',text:'“Late. He’s always late.”',by:'sam',time:1.8,face:'unimpressed'}],{then:()=>X.jamieArrives()});}
 // ---- Jamie's sock ---------------------------------------------------------------------------------------------------------------
 // Off his back, round in front, the flap up, a hand in, and out with one sock.
 function sockScene(){if(S.flags.sock)return;S.flags.sock=true;const J=jamie,B=S.jbagP,front=new THREE.Vector3();
  const bagFront=()=>{J.person.group.updateMatrixWorld(true);return J.person.group.localToWorld(front.set(-.04,.82,-.32));};
  comp.run(J,[
   // swing it off: the bag leaves his back for his left hand, out in front of him
   phys.reach(J,{side:'l',at:()=>{const q=new THREE.Vector3();phys.torsoFrame(J.person,q,new THREE.Quaternion());return q.add(new THREE.Vector3(0,.15,0));},dur:[.4,.1,.01],carry:false,onContact:()=>{B.holdBy(J.person,'l',{p:[.06,-.42,-.06],r:[0,Math.PI,0],hang:true});X.sound('cloth',bagFront(),{gain:.3});}}),
   holdBag(J,{t:.9,open:true}),
   // in, and out with it
   phys.reach(J,{at:()=>S.jbag.mouth(new THREE.Vector3()),dur:[.45,.35,.01],carry:false,keep:false,onContact:()=>{S.sock.holdBy(J.person,'r');}}),
   showSock(J,{until:()=>S.flags.sockDone})],{then:()=>{}});}
 function holdBag(c,{t=1,open=false}={}){let e=0;return (dt,ctx)=>{e+=dt;standPose(c.tmp,ctx.clock+c.R.phase,{look:0,shift:0});copyPose(c.pose,c.tmp);c.pose[PI.lh]=-.05;c.pose[PI.lh+1]=.86;c.pose[PI.lh+2]=-.3;c.pose[PI.le]=-.8;c.pose[PI.le+2]=.3;c.pose[PI.hp]=-.35;
  if(open)openFlap(S.jbagParts,smooth(e/t));comp.feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;return e>=t;};}
 // the sock up at shoulder height for everyone to see, the bag still in the other hand
 function showSock(c,{until}){let e=0;return (dt,ctx)=>{e+=dt;standPose(c.tmp,ctx.clock+c.R.phase,{look:.3,shift:0});copyPose(c.pose,c.tmp);c.pose[PI.lh]=-.05;c.pose[PI.lh+1]=.86;c.pose[PI.lh+2]=-.3;c.pose[PI.le]=-.8;c.pose[PI.le+2]=.3;
  const u=smooth(e/.6);if(e>.6&&S.sockShownAt==null)S.sockShownAt=X.t();c.pose[PI.rh]+=(.24-c.pose[PI.rh])*u;c.pose[PI.rh+1]+=(1.24-c.pose[PI.rh+1])*u;c.pose[PI.rh+2]+=(-.38-c.pose[PI.rh+2])*u;c.pose[PI.re]=.8;c.pose[PI.re+1]=-.2;c.pose[PI.re+2]=.4;
  c.pose[PI.hy]=clamp(-wrap(headingTo(c.px,c.pz,camera.position.x,camera.position.z)-c.pa),-1,1)*.8;comp.feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;return until();};}
 // the sock back in, the bars taken from Sam's hand and in after it, the flap down, the bag back on
 function barsScene(){if(S.flags.bars)return;S.flags.bars=true;const J=jamie,s=sam;
  // Sam: the bars off the table, held out to Jamie
  comp.run(s,[phys.reach(s,{at:()=>S.bars[0].obj.position.clone(),dur:[.5,.12,.35],onContact:()=>{S.bars[0].holdBy(s.person,'r');S.bars[1].holdBy(s.person,'r',{p:[.0,.06,.025],r:[0,0,Math.PI/2+.15]});},carry:true}),
   holdOut(s,()=>J.person.group.position.clone().add(new THREE.Vector3(0,1.1,0)),{until:()=>S.flags.barsTaken})],{then:()=>X.stand(s,samStand(0),{look:()=>J.person.group.position})});
  X.later(1.4,()=>{S.flags.sockDone=true;
   comp.run(J,[phys.reach(J,{at:()=>S.jbag.mouth(new THREE.Vector3()),dur:[.4,.15,.25],carry:false,onContact:()=>S.sock.storeIn(S.jbag)}),holdBag(J,{t:.2}),
    phys.reach(J,{at:()=>{const q=new THREE.Vector3();phys.handFrame(s.person,'r',q,new THREE.Quaternion());return q;},dur:[.55,.18,.25],carry:false,onContact:()=>{for(const b of S.bars)phys.handOff(b,J.person,'r');S.flags.barsTaken=true;}}),
    phys.reach(J,{at:()=>S.jbag.mouth(new THREE.Vector3()),dur:[.4,.15,.25],carry:false,onContact:()=>{for(const b of S.bars)b.storeIn(S.jbag);}}),
    holdBag(J,{t:.5}),phys.reach(J,{side:'l',at:()=>{const q=new THREE.Vector3();phys.torsoFrame(J.person,q,new THREE.Quaternion());return q.add(new THREE.Vector3(0,.12,0));},dur:[.45,.05,.3],carry:false,onContact:()=>{openFlap(S.jbagParts,0);S.jbagP.wearOn(J.person);X.sound('cloth',J.person.group.position,{gain:.3});}})],
    {then:()=>{S.flags.jamieReady=true;X.stand(J,TL(.86,.22,0),{look:()=>camera.position});}});});}
 // ---- the map ------------------------------------------------------------------------------------------------------------------
 function openMap(){if(S.flags.mapOpen)return;S.flags.mapOpen=true;const P=S.map,M=S.mapParts;
  comp.run(sam,[comp.steps.walkTo(sam,[[samStand(.05).x,samStand(.05).z]],{speed:.9}),comp.steps.turnTo(sam,()=>TA(),.3),
   phys.reach(sam,{at:()=>P.obj.position.clone(),both:true,dur:[.5,.6,.4],onContact:()=>{M.folded.visible=false;M.open.visible=true;X.sound('paper',P.obj.position,{gain:.4});const p=TL(.0,-.02,TABLE_H+.001);P.place(p,new THREE.Quaternion().setFromEuler(new THREE.Euler(0,-TA()+Math.PI,0)));},carry:false})],
   {then:()=>X.stand(sam,samStand(0),{look:()=>TL(0,0)})});}
 const MAPPT={town:[-.1,.17],mill:[.0,.08],road:[.04,-.04],ridge:[.0,-.08],park:[.07,-.12],lake:[.14,-.17]};
 // (a finger on the map: Sam or Jamie reaching to a place on it)
 function pointAt(c,where,t=1.6){const q=MAPPT[where]||[0,0];const at=()=>TL(-q[0],q[1],TABLE_H+.02);return [phys.reach(c,{at,dur:[.45,t,.4],carry:false})];}
 // ---- a bag on someone's back, used later (Sam's flashlights and batteries, Alex's shirt) ---------------------------------------
 // Off the back into the left hand, out in front; the flap up; a hand in for something (take), or something put in (put);
 // the flap down; back on. Steps for comp.run; what was taken stays in the right hand after (carried).
 const BAGS={sam:()=>({P:S.bagP,box:S.bag,parts:S.bagParts}),jamie:()=>({P:S.jbagP,box:S.jbag,parts:S.jbagParts})};
 function holdOpen(c,B,{t=.6,open=0,close=0}={}){let e=0;return (dt,ctx)=>{e+=dt;standPose(c.tmp,ctx.clock+c.R.phase,{look:0,shift:0});copyPose(c.pose,c.tmp);c.pose[PI.lh]=-.05;c.pose[PI.lh+1]=.86;c.pose[PI.lh+2]=-.3;c.pose[PI.le]=-.8;c.pose[PI.le+2]=.3;c.pose[PI.hp]=-.35;
  if(open)openFlap(B.parts,smooth(e/t));if(close)openFlap(B.parts,1-smooth(e/t));if(B.carry)phys.carryOverlay('r')(c.pose,1);comp.feet(c,c.pose);applyPose(c.person,c.pose);c.posed=true;return e>=t;};}
 function bagSteps(c,{take=null,put=null,onTake=null,onPut=null}={}){build();const B={...BAGS[c.key](),carry:false},mouth=()=>B.box.mouth(new THREE.Vector3());
  const torso=()=>{const q=new THREE.Vector3();phys.torsoFrame(c.person,q,new THREE.Quaternion());return q.add(new THREE.Vector3(0,.14,0));};
  const steps=[phys.reach(c,{side:'l',at:torso,dur:[.4,.1,.01],carry:false,onContact:()=>{B.P.holdBy(c.person,'l',{p:[.06,-.42,-.06],r:[0,Math.PI,0],hang:true});X.sound('cloth',c.person.group.position,{gain:.3});}}),holdOpen(c,B,{t:.7,open:1})];
  if(put)steps.push(phys.reach(c,{at:mouth,dur:[.45,.25,.3],carry:false,onContact:()=>{const it=typeof put==='function'?put():put;it?.storeIn(B.box);onPut?.(it);X.sound('cloth',mouth(),{gain:.25});}}));
  if(take)steps.push(phys.reach(c,{at:mouth,dur:[.45,.3,.3],carry:true,onContact:()=>{const it=typeof take==='function'?take():take;if(it){it.holdBy(c.person,'r');B.carry=true;}onTake?.(it);}}));
  steps.push(holdOpen(c,B,{t:.45,close:1}),phys.reach(c,{side:'l',at:torso,dur:[.4,.05,.3],carry:false,onContact:()=>{openFlap(B.parts,0);B.P.wearOn(c.person);X.sound('cloth',c.person.group.position,{gain:.3});}}));
  return steps;}
 // (one of the things packed this morning, still in the bag: by kind)
 function given(kind,n=1){for(let i=0;i<n;i++){const P=packedOf(kind);if(P){P.given=true;P.hide();}}}
 const packedOf=kind=>S.items.find(q=>q.kind===kind&&q.state==='stored'&&!q.given)||null;
 // ---- the bags on their backs from here on ------------------------------------------------------------------------------------
 function wearBags({jamieBag=true,samBag=true,after=false}={}){build();if(after&&jamieBag){for(const P of [...S.bars,S.sock])if(P&&!P.given&&P.state!=='stored')P.storeIn(S.jbag);}if(samBag){openFlap(S.bagParts,0);S.bagP.wearOn(sam.person);for(const P of S.items)if(!P.given&&P.state!=='stored')P.storeIn(S.bag);}if(jamieBag){openFlap(S.jbagParts,0);S.jbagP.wearOn(jamie.person);}}
 // the flap pulled shut, then both hands on it and it goes up onto his back
 function closeAndShoulder(then=null){comp.run(sam,[phys.reach(sam,{at:()=>mouth(),dur:[.4,.2,.2],carry:false,onContact:()=>{openFlap(S.bagParts,0);X.sound('cloth',mouth(),{gain:.2});}}),phys.reach(sam,{at:()=>S.bagP.obj.position.clone().add(new THREE.Vector3(0,.2,0)),both:true,dur:[.45,.1,.35],carry:false,onContact:()=>{S.bagP.wearOn(sam.person);X.sound('cloth',S.bagP.obj.position,{gain:.3});}})],{then:()=>{S.flags.shouldered=true;then?.();}});}
 // folded up again and into his back pocket ("I'll bring the map")
 function foldMap(){const P=S.map,M=S.mapParts;comp.run(sam,[phys.reach(sam,{at:()=>P.obj.position.clone(),both:true,dur:[.45,.3,.01],onContact:()=>{M.open.visible=false;M.folded.visible=true;P.holdBy(sam.person,'r');X.sound('paper',P.obj.position,{gain:.3});},carry:true}),
  phys.reach(sam,{at:()=>{sam.person.group.updateMatrixWorld(true);return sam.person.group.localToWorld(new THREE.Vector3(.14,.82,.1));},dur:[.4,.12,.3],carry:false,face:false,onContact:()=>{P.hide();S.flags.mapPocket=true;}})],{then:()=>{S.flags.mapAway=true;}});}
 // ---- F: what you can do here ----------------------------------------------------------------------------------------------------
 function spots(add){if(!S.table?.visible)return;const p=me();
  if(S.flags.packing&&!S.flags.allPacked){if(S.holding){add('g5-put','Put the '+NAMES[S.holding.kind]+' in the bag',mouth(),null,1.3,{look:true,size:.2});}
   else for(const P of S.items)if(free(P))add('g5-take:'+P.name,'Pick up the '+NAMES[P.kind],P.obj.position,null,1.0,{look:true,size:P.kind==='water'?.09:.07});}
  if(S.flags.cameraAsked&&!S.flags.cameraTaken&&S.cam.holder===sam.person)add('g5-camera','Take Alex’s camera',S.cam.obj.position,null,1.15,{look:true,size:.14});
  if(S.flags.mapOpen&&!S.flags.mapSeen&&S.mapParts.open.visible)add('g5-map','Look at the map',S.map.obj.position,null,2.4,{look:true,size:.32});}
 function act(id){if(id.startsWith('g5-take:')){const P=S.items.find(q=>q.name===id.slice(8));if(P)youTake(P);return true;}
  if(id==='g5-put'){youPut();return true;}if(id==='g5-camera'){youTakeCamera();return true;}if(id==='g5-map'){S.flags.mapSeen=true;X.lookMap(S.map.obj.position);return true;}return false;}
 // ---- every frame -----------------------------------------------------------------------------------------------------------------
 function update(dt){if(!S.built)return;
  if(S.flags.packing&&!S.flags.allPacked){if(!S.samBusy&&!sam.script)samNext();if(packed()===S.items.length&&!S.holding&&!sam.script){S.flags.allPacked=true;S.samStop=true;closeAndShoulder(()=>X.later(.3,offerCamera));}}
  // (taking too long to take the camera: he brings it to you and puts it in your hand)
  if(S.flags.cameraAsked&&!S.flags.cameraTaken&&X.t()-S.offerAt>14&&!S.flags.cameraBrought){S.flags.cameraBrought=true;X.say([{who:'SAM',text:'“Here.”',by:'sam',time:.9}]);
   const p=me();comp.run(sam,[comp.steps.walkTo(sam,[[p.x+Math.sin(p.a)*.8,p.z-Math.cos(p.a)*.8]],{speed:1.1}),holdOut(sam,()=>X.eyePos(),{until:()=>S.flags.cameraTaken})]);}
 }
 function startPacking(){S.flags.packing=true;S.samX=0;}
 function reset(){if(!S.built)return;S.sockShownAt=null;for(const k of Object.keys(S.flags))delete S.flags[k];S.samBusy=false;S.samStop=false;S.holding=null;S.said.clear();S.packedBy={you:0,sam:0};for(const P of [...S.items,...S.bars,S.sock])if(P){P.claimed=null;P.given=false;}hideAll();root.removeFromParent();S.built&&scene.add(root);}
 return {S,build,layTable,startPacking,spots,act,update,blockers,wearBags,bagSteps,packedOf,given,holdOut,sockScene,barsScene,openMap,foldMap,closeAndShoulder,pointAt,reset,hideAll,TL,samStand,packed,get holding(){return S.holding;}};
}
