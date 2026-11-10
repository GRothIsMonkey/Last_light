// Aftermath I: how people hold themselves after it. Two things the earlier chapters did not need.
//
//  adultFace(actor)  The grown-ups (people.js actors, adult-art.js heads) have a mouth that opens when they talk and two brows:
//                    nothing that shows what they feel. This lays an expression over that head for as long as the chapter runs:
//                    the brows' inner ends up, pulled together; the mouth's corners down, the mouth open or shut; lids half
//                    lowered; red rims; tears on the cheeks; a sob's pulse. It has the same handle as the boys' faces (faces.js:
//                    set, mood, grief, update, pulse), so a line can say face:'crying' for a mother as it does for Sam. detach()
//                    puts the head back exactly as adult-art.js left it (the earlier chapters never see it).
//  ACT9              Gestures (pose, ctx) => void in the manner of chapter8-acting.js, for the things people do here: a cup held
//                    in both hands, something held against the chest, a blanket pulled round, a clipboard, sitting on a cot,
//                    lying on one, a leg in a cast out in front, arms round a child, a hand on a shoulder.
//  asC(actor)        An actor seen as chapter8-acting's gestures see a companion (px, pz, pa, person), so embrace/shoulder/reach
//                    work between grown-ups and children.
//  G(gesture)        A chapter8-acting gesture as an actor's own gesture function (people.js layer: (pose, weight, time)), eased
//                    in and out by the actor's gesture weight instead of snapping.
import * as THREE from './three.module.js';
import {P,BODY,newPose} from './rig.js';
import {ACT} from './chapter8-acting.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
const set3=(p,o,x,y,z)=>{p[o]=x;p[o+1]=y;p[o+2]=z;};
const mix3=(p,o,x,y,z,w)=>{p[o]+=(x-p[o])*w;p[o+1]+=(y-p[o+1])*w;p[o+2]+=(z-p[o+2])*w;};

// tilt: the brows' inner ends up; knit: pulled together and down; browY: raised (m); down: the mouth's corners (+ down, - up);
// open: the mouth; lids: lowered; cry: tears; red: rims; tremble; sob: the breath catching in pulses
export const AEXPR={
 neutral:{},tired:{lids:.38,down:.18},worried:{tilt:.5,knit:.3,down:.3},concerned:{tilt:.45,knit:.2,down:.2},afraid:{tilt:.7,browY:.003,open:.3,down:.35},terrified:{tilt:.9,browY:.004,open:.55,down:.4},
 shocked:{browY:.005,open:.6,tilt:.25},surprised:{browY:.004,open:.4},hopeful:{tilt:.32,browY:.0025,open:.12,down:-.15},relieved:{tilt:.35,lids:.25,down:-.35,red:.4},
 sad:{tilt:.7,down:.6,lids:.3},numb:{lids:.42,down:.25,red:.6},tearful:{tilt:.6,down:.42,lids:.25,cry:.45,red:.65,tremble:.3},
 grief:{tilt:.8,down:.7,lids:.45,cry:.6,red:.9,tremble:.3},crying:{tilt:.9,knit:.3,down:.8,open:.16,lids:.4,cry:1,red:.9,tremble:.6},
 sobbing:{tilt:1,knit:.5,down:.9,open:.34,lids:.6,cry:1,red:1,tremble:.85,sob:1},anguish:{tilt:.9,browY:.004,knit:.6,open:.8,down:.7,cry:.7,red:.6,tremble:.4},
 determined:{knit:.5,browY:-.001,down:.15},frustrated:{knit:.7,down:.4},pain:{knit:.8,lids:.5,down:.6,open:.2},weak:{lids:.6,down:.2,open:.08},
 amused:{down:-.5,lids:.15},happy:{down:-.75,lids:.1,open:.1},smile:{down:-.6,lids:.08},
};
const AKEYS=['tilt','knit','browY','down','open','lids','cry','red','tremble','sob'];

export function adultFace(A){const person=A.person,head=person.parts.head,art=A.art,F=A.spec.face||{};
 const g=new THREE.Group();g.name='a1-adult-face';
 const rimM=new THREE.MeshBasicMaterial({color:0xb24a4e,transparent:true,opacity:0,depthWrite:false}),tearM=new THREE.MeshStandardMaterial({color:0xe4f2ff,roughness:.05,metalness:.35,transparent:true,opacity:0,depthWrite:false});
 const lipM=new THREE.MeshStandardMaterial({color:new THREE.Color(F.lips??0xa86a58).multiplyScalar(.78),roughness:.7});
 for(const m of [rimM,tearM,lipM])m.name='a1-adult-face';
 const ring=new THREE.RingGeometry(.8,1,20),strip=new THREE.PlaneGeometry(.0034,.036),cornerG=new THREE.BoxGeometry(.0072,.0021,.002);
 const eyes=[-1,1].map(s=>{const rim=new THREE.Mesh(ring,rimM);rim.position.set(s*.033,.0115,-.0896);rim.scale.set(.0162,.0104,1);rim.rotation.y=Math.PI;g.add(rim);
  const tr=new THREE.Mesh(strip,tearM);tr.position.set(s*.0365,-.0145,-.0868);tr.rotation.set(.1,Math.PI,s*.07);g.add(tr);
  const drop=new THREE.Mesh(new THREE.SphereGeometry(.0026,8,6),tearM);g.add(drop);return {s,rim,tr,drop,ph:Math.random()};});
 const corners=[-1,1].map(s=>{const c=new THREE.Mesh(cornerG,lipM);c.position.set(s*.0212,-.0597,-.0868);g.add(c);return c;});
 const base={mx:art.mouth.scale.x,my:art.mouth.scale.y,mpy:art.mouth.position.y,brz:art.brows.map(b=>b.rotation.z),brx:art.brows.map(b=>b.position.x),lid:person.lids.map(l=>({y:l.position.y,sy:l.scale.y}))};
 const ex=Object.fromEntries(AKEYS.map(k2=>[k2,0])),want={...ex},S={name:'neutral',hold:0,mood:'neutral',grief:0,sobPh:0,pulse:0,on:false,clock:0};
 function attach(){if(S.on)return;S.on=true;head.add(g);person.face=api;}
 function detach(){if(!S.on)return;S.on=false;g.removeFromParent();if(person.face===api)delete person.face;art.mouth.scale.x=base.mx;art.mouth.scale.y=base.my;art.mouth.position.y=base.mpy;
  art.brows.forEach((b,i)=>{b.rotation.z=base.brz[i];b.position.x=base.brx[i];b.position.y=.033;});person.lids.forEach((l,i)=>{l.position.y=base.lid[i].y;l.scale.y=base.lid[i].sy;l.visible=false;});
  for(const k2 of AKEYS)ex[k2]=0;S.hold=0;S.mood='neutral';S.grief=0;S.pulse=0;}
 function set(name,{hold=4}={}){if(!AEXPR[name])return;S.name=name;S.hold=hold;}
 function mood(name){if(AEXPR[name])S.mood=name;}
 function grief(v){S.grief=clamp(v,0,1);}
 // (after the actor's own update: adult-art.js has just written the mouth's opening and the brows' height for this frame)
 function update(dt,{clock=0}={}){if(!S.on)return;S.clock=clock;if(S.hold>0)S.hold-=dt;
  const base0=S.grief>.3&&S.hold<=0&&S.mood==='neutral'?AEXPR[S.grief>.7?'grief':'numb']:null,cur=base0||AEXPR[S.hold>0?S.name:S.mood]||{};
  for(const k2 of AKEYS)want[k2]=cur[k2]||0;
  if(S.grief>0){want.red=Math.max(want.red,S.grief*.8);want.cry=Math.max(want.cry,S.grief*.3);}
  if(ex.sob>.03){S.sobPh+=dt*(1+.3*Math.sin(clock*.57));const p=S.sobPh%1,pulse=p<.2?Math.sin(p/.2*Math.PI):p<.32?.25*Math.sin((p-.2)/.12*Math.PI):0;want.open+=pulse*.4*ex.sob;want.lids+=.15*ex.sob;S.pulse=pulse*ex.sob;}else S.pulse=0;
  for(const k2 of AKEYS)ex[k2]=damp(ex[k2],want[k2],k2==='open'?9:k2==='cry'||k2==='red'?.7:4,dt);
  const tq=ex.tremble>.02?ex.tremble*(Math.sin(clock*29)*.6+Math.sin(clock*47+1)*.4):0;
  art.brows.forEach((b,i)=>{const s=i?1:-1;b.rotation.z=base.brz[i]+s*(ex.tilt*.4-ex.knit*.16);b.position.x=base.brx[i]-s*ex.knit*.0032;b.position.y+=ex.browY+ex.tilt*.0018-ex.knit*.0022;});
  const m=art.mouth;m.scale.x=base.mx*(1-.14*Math.max(0,ex.down)+.1*ex.open);m.scale.y=Math.max(m.scale.y,base.my*(1+ex.open*5.5))+Math.abs(tq)*.0006;m.position.y=base.mpy-Math.max(0,ex.down)*.0012-ex.open*.0022+tq*.0004;
  corners.forEach((c,i)=>{const s=i?1:-1;c.visible=m.visible&&Math.abs(ex.down)>.08;c.rotation.z=-s*ex.down*.8;c.position.y=-.0597-ex.down*.0034-ex.open*.002;c.position.x=s*(.0212-.002*Math.max(0,ex.down)+.0016*ex.open);});
  person.lids.forEach((l,i)=>{if(ex.lids>.06){const k2=Math.max(ex.lids,l.visible?l.scale.y/.014:0);l.visible=true;l.position.y=base.lid[i].y+.0046*(1-k2);l.scale.y=.0042+.0058*k2;}else l.position.y=base.lid[i].y;});
  const near=m.visible;g.visible=near;if(!near)return;
  rimM.opacity=clamp(ex.red,0,1)*.4;tearM.opacity=clamp(ex.cry,0,1)*.6;
  for(const E of eyes){E.drop.visible=ex.cry>.45;if(E.drop.visible){E.ph=(E.ph+dt/(2.8+E.s*.4))%1;const t=E.ph;E.drop.position.set(E.s*(.0355+t*.003),-.002-t*.03,-.0876+t*.002);}}}
 const api={set,mood,grief,update,attach,detach,look(){},rich(){},enable(){},get pulse(){return S.pulse||0;},get sobbing(){return ex.sob;},get crying(){return ex.cry;},get enabled(){return S.on;},S,ex,get expression(){return S.hold>0?S.name:S.mood;}};
 return api;}

// an actor as the gestures of chapter8-acting.js see a companion
export function asC(A){return {get px(){return A.x;},get pz(){return A.z;},get pa(){return A.a;},person:A.person,get gait(){return A.gait;}};}
// a pose-space gesture for an actor (people.js layer(p,g,w,t,A)): eased by the actor's gesture weight
const _t=newPose();
export function G(fn){return (p,w,t,A)=>{if(w>=.999){fn(p,{clock:t,A});return;}_t.set(p);fn(_t,{clock:t,A});for(let i=0;i<p.length;i++)p[i]+=(_t[i]-p[i])*w;};}

export const ACT9={
 // a paper cup held in both hands, low, in front; looking down into it
 cup({base=null,look=-.25}={}){return (p,ctx)=>{base?.(p,ctx);const y=p[P.root+1]+.2,z=p[P.root+2]-.2-p[P.lean]*.2;mix3(p,P.lh,-.035,y,z,1);mix3(p,P.rh,.035,y+.004,z,1);set3(p,P.le,-1,-.5,.3);set3(p,P.re,1,-.5,.3);p[P.hp]+=look;};},
 // something held against the chest in both hands (a cap, a photograph), the head down over it
 clutch({base=null,k=1}={}){return (p,ctx)=>{base?.(p,ctx);const y=p[P.root+1]+.34,z=p[P.root+2]-.11-p[P.lean]*.25;mix3(p,P.lh,-.04,y,z,k);mix3(p,P.rh,.045,y-.01,z-.005,k);mix3(p,P.le,-1,-.6,.2,k);mix3(p,P.re,1,-.6,.2,k);p[P.hp]-=.38*k;p[P.lean]+=.08*k;};},
 // something held out in front in both hands, looked at (a cap somebody has just given her)
 holdOut({base=null,k=1}={}){return (p,ctx)=>{base?.(p,ctx);const y=p[P.root+1]+.24,z=p[P.root+2]-.3;mix3(p,P.lh,-.06,y,z,k);mix3(p,P.rh,.06,y,z,k);mix3(p,P.le,-1,-.5,.3,k);mix3(p,P.re,1,-.5,.3,k);p[P.hp]-=.3*k;};},
 // a clipboard on the left forearm, a pen in the right hand over it
 clipboard({base=null}={}){return (p,ctx)=>{base?.(p,ctx);const y=p[P.root+1]+.22;mix3(p,P.lh,-.1,y,-.26,1);mix3(p,P.rh,.04,y+.03,-.24,1);set3(p,P.le,-1,-.5,.2);set3(p,P.re,1,-.5,.3);p[P.hp]-=.22;};},
 // sitting on a cot or a folding chair (h), hands as said; drawn from the floor the actor stands on
 sit(h=.42,o={}){return ACT.seat(h,o);},
 // lying on a cot of height h, on the back (asleep), an arm over the stomach; a little breath
 lie(h=.42,{turn=.3}={}){return (p,ctx)=>{const t=ctx?.clock??0;ACT.still({look:turn})(p,ctx);p[P.root+1]=h+.1+Math.sin(t*1.1)*.004;for(const o of [P.lf,P.rf,P.lh,P.rh])p[o+1]+=h;set3(p,P.rh,.05,h+.24+Math.sin(t*1.1)*.005,.25);set3(p,P.re,1,-.3,.2);};},
 // a leg in a cast straight out in front, sitting (Brandt)
 castLeg(h=.5,{side=1}={}){return (p,ctx)=>{ACT.seat(h,{hands:'knees',lean:-.08})(p,ctx);const f=side>0?P.rf:P.lf,kk=side>0?P.rk:P.lk;set3(p,f,side*.16,h-.06,-.86);set3(p,kk,0,1,0);p[side>0?P.rfp:P.lfp]=.5;};},
 // down on both knees, arms out and round someone small (a mother and her son)
 gather(c,other,{k=1}={}){const kn=ACT.kneelOver(c,null,{k:1});return (p,ctx)=>{kn(p,ctx);p[P.lean]=.2;p[P.hp]=-.2;ACT.embrace(c,other,{k})(p,ctx);};},
 // standing, bent to him, arms round him (a father, a taller man)
 hold(c,other,{k=1,bend=.34}={}){return (p,ctx)=>{p[P.root+1]-=.07*k;p[P.lean]+=bend*k;ACT.embrace(c,other,{k})(p,ctx);p[P.hp]-=.25*k;};},
 // one hand flat over the eyes, the other arm across the body
 eyes({base=null,k=1}={}){return (p,ctx)=>{base?.(p,ctx);const hy=p[P.root+1]+.62,hz=p[P.root+2]-.115-p[P.lean]*.3;mix3(p,P.rh,.02,hy,hz,k);mix3(p,P.re,1,-.5,.35,k);mix3(p,P.lh,.09,p[P.root+1]+.2,-.14,k);mix3(p,P.le,-1,-.5,.2,k);p[P.hp]-=.22*k;};},
 // a hand out, palm up, to someone (here; take it; it's all right)
 offer({base=null,hand='r',k=1}={}){return (p,ctx)=>{base?.(p,ctx);const o=hand==='r'?P.rh:P.lh,sd=hand==='r'?1:-1;mix3(p,o,sd*.14,p[P.root+1]+.2,-.42,k);mix3(p,hand==='r'?P.re:P.le,sd,-.5,.3,k);};},
 // arms at the sides, weight gone out of him: standing because nobody has said to sit
 lost({base=null,k=1}={}){return (p,ctx)=>{base?.(p,ctx);p[P.root+1]-=.02*k;p[P.lean]+=.09*k;p[P.hp]-=.3*k;p[P.lh+2]+=.03*k;p[P.rh+2]+=.03*k;};},
 // hands round the grips of a bike he is standing beside, not letting go (person-local: the bars to his right)
 grips({k=1}={}){return (p,ctx)=>{mix3(p,P.rh,.34,BODY.stand+.1,-.3,k);mix3(p,P.lh,.02,BODY.stand+.1,-.36,k);mix3(p,P.re,1,-.3,.4,k);mix3(p,P.le,-1,-.3,.6,k);p[P.hp]-=.3*k;p[P.lean]+=.1*k;p[P.twist]=(p[P.twist]||0)+.25*k;};},
};
