// Faces that do something: brows and a mouth on Jamie, Sam and Alex that show what they feel and move when they talk.
// An expression is a handful of numbers (brows up, brows' inner ends up, brows pulled in, corners of the mouth, how open,
// teeth, eyelids); a person holds one for a while and drifts back to his own resting face. Speaking opens and closes the
// mouth on the line's own words: one opening per vowel group, shut on m, b and p, a pause at punctuation, spread over the
// time the caption is up. This is provisional, text-timed lip movement for captions without recorded voices; a recorded
// line can drive the same open/round channels later (speakAudio below takes an amplitude envelope).
//
// The mouth and the brows are each one small mesh whose vertices are rewritten when the face changes (two draw calls a
// face); the head mesh is built without its own mouth and brows (rig.js headGeometry, face.rig).
import * as THREE from './three.module.js';
import {faceDepth} from './astra-anatomy.js';
import {headGeometry,blinkPerson} from './rig.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
// browY (m up), tilt (inner ends up, +), knit (pulled together and down), smile (corners, -1..1), open (0..1), wide
// (mouth width ×), teeth (0..1), lids (0 open .. 1 shut)
export const EXPRESSIONS={
 neutral:{},
 happy:{smile:.8,teeth:.5,browY:.0015},amused:{smile:.6,teeth:.35,lids:.12,browY:.001},grin:{smile:1,teeth:.9,wide:1.12,lids:.1},
 curious:{browY:.004,tilt:.15,open:.08},concerned:{tilt:.55,browY:.0005,smile:-.3,knit:.2},worried:{tilt:.7,smile:-.35,knit:.25,open:.05},
 frustrated:{knit:.75,browY:-.002,smile:-.4,wide:.92},unimpressed:{lids:.42,smile:-.12,browY:-.0015,wide:.95},embarrassed:{smile:.45,tilt:.3,lids:.18},
 surprised:{browY:.007,open:.5,wide:.82,tilt:.1},shocked:{browY:.008,open:.65,wide:.78,tilt:.3},afraid:{tilt:.75,browY:.005,open:.32,smile:-.45,wide:1.08,knit:.15},
 terrified:{tilt:.9,browY:.007,open:.55,smile:-.55,wide:1.12,knit:.2},relieved:{smile:.5,lids:.28,tilt:.25},sad:{tilt:.65,smile:-.5,lids:.3},
 tired:{lids:.4,smile:-.1,browY:-.001},determined:{knit:.45,smile:-.1,browY:-.0012,wide:.95},hopeful:{tilt:.35,browY:.002,smile:.25,open:.06},
 // (Chapter Eight: crying is not one face. cry: tears on the cheeks; red: rims and wet lower lids; tremble: the lips and chin;
 // sob: the breath catching in pulses, the mouth pulled open with each one; they need the rich face: rich(true))
 tearful:{tilt:.55,smile:-.3,lids:.22,cry:.45,red:.6,tremble:.25},crying:{tilt:.85,browY:.0035,knit:.35,smile:-.62,open:.14,wide:1.05,lids:.38,cry:1,red:.85,tremble:.6},
 sobbing:{tilt:.95,browY:.003,knit:.5,smile:-.72,open:.28,wide:1.12,lids:.55,cry:1,red:1,tremble:.85,sob:1},anguish:{tilt:.9,browY:.0055,knit:.65,open:.72,wide:1.16,smile:-.62,cry:.7,red:.6,tremble:.4},
 grief:{tilt:.7,smile:-.48,lids:.42,cry:.65,red:.9,tremble:.3,browY:.001},numb:{lids:.32,smile:-.18,red:.75,cry:.3,browY:-.0008},horror:{browY:.009,open:.62,wide:.84,tilt:.35,knit:.1,lids:-.05},
 lifeless:{lids:1,smile:0,open:.035,wide:.88},
 pain:{knit:.8,tilt:.4,lids:.5,smile:-.5,open:.2,wide:1.1,teeth:.3,tremble:.3},weak:{lids:.62,smile:-.15,open:.08,tilt:.25,red:.3},
};
const KEYS=['browY','tilt','knit','smile','open','wide','teeth','lids','cry','red','tremble','sob'];
// one opening per vowel group; shut on m/b/p; rounded on o/u/w; a little on f/v; closed at spaces and punctuation
function speechKeys(text,dur){const t=String(text||'').replace(/[“”"‘’'()\[\]]/g,'').toLowerCase(),n=Math.max(1,t.length),step=Math.max(.045,dur*.92/n),out=[];let i=0,time=.05;
 while(i<t.length){const ch=t[i];
  if(/[aeiouy]/.test(ch)){let j=i;while(j<t.length&&/[aeiouy]/.test(t[j]))j++;const grp=t.slice(i,j),round=/[ou]/.test(grp)?.8:0,open=/[ao]/.test(grp)?.75:/[ei]/.test(grp)?.48:.4;
   out.push([time+(j-i)*step*.4,open,round]);time+=(j-i)*step;i=j;continue;}
  if(/[mbp]/.test(ch))out.push([time,0,0]);else if(/[fv]/.test(ch))out.push([time,.12,0]);else if(/[w]/.test(ch))out.push([time,.25,.9]);
  else if(/[.,!?;:—–-]/.test(ch)){out.push([time,0,0]);time+=step*3;}else if(ch===' ')out.push([time,.08,0]);
  time+=step;i++;}
 const k=dur/Math.max(time,.1);for(const q of out)q[0]*=Math.min(1,k);out.push([dur,0,0]);return out;}

// (switched off, enabled false, the head is the one Chapters Zero to Four drew: its own brows and mouth, the old blink.
// Chapter Five switches the faces on; a head built expressive starts on.)
export function createFace(person,cast={},{enabled=true}={}){const head=person.parts.head,F=cast.face||{},H=cast.hair||{},size=person.build?.head??1;
 const modern=!!person.artBoy;enabled=modern||enabled;
 const built=head.geometry,other=modern?built:headGeometry(enabled?F:{...F,rig:true},cast.hair||{style:'cropped',color:0x4a3528},size),geo={on:enabled?built:other,off:enabled?other:built},lidY=person.lids.map(L=>L.position.y);
 const lips=new THREE.Color(F.lips??0xb87a62),dark=new THREE.Color(0x3a1f1a),teethC=new THREE.Color(0xf0ece2),hairC=new THREE.Color(H.color??0x4a3528);
 const base={...{neutral:{},grin:EXPRESSIONS.grin}[F.mouth==='grin'?'grin':'neutral']};// (Jamie's resting face has his grin in it, a little)
 const rest=F.mouth==='grin'?{smile:.35,teeth:.25}:F.mouth==='smile'?{smile:.3}:{};void base;
 // ---- the mouth: inner, teeth, upper and lower lip, as quads in head space (facing -z) ----
 const MQ=4*6,mPos=new Float32Array(MQ*6*3),mCol=new Float32Array(MQ*6*3),mGeo=new THREE.BufferGeometry();mGeo.setAttribute('position',new THREE.BufferAttribute(mPos,3));mGeo.setAttribute('color',new THREE.BufferAttribute(mCol,3));
 mGeo.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(MQ*6*3).map((_,i)=>i%3===2?-1:0),3));
 const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const mouth=new THREE.Mesh(mGeo,mat);mouth.name='face-mouth';mouth.frustumCulled=false;mouth.castShadow=false;head.add(mouth);
 const bQ=2*3,bPos=new Float32Array(bQ*6*3),bGeo=new THREE.BufferGeometry();bGeo.setAttribute('position',new THREE.BufferAttribute(bPos,3));bGeo.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(bQ*6*3).map((_,i)=>i%3===2?-1:0),3));
 const brows=new THREE.Mesh(bGeo,new THREE.MeshStandardMaterial({color:hairC,roughness:.9,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));brows.name='face-brows';brows.frustumCulled=false;brows.castShadow=false;head.add(brows);
 const ex=Object.fromEntries(KEYS.map(k=>[k,k==='wide'?1:0])),want=Object.fromEntries(KEYS.map(k=>[k,0]));
 const S={name:'neutral',hold:0,mood:'neutral',open:0,round:0,keys:null,speakT:0,speakDur:0,blinkT:0,dirty:true,last:'',talking:false,enabled:true,clock:0,sobPh:0,grief:0,look:null,sacT:0,sac:[0,0]};
 let qi=0;
 const quad=(pos,col,i,ax,ay,bx,by,cx,cy,dx,dy,z,c)=>{const v=[[ax,ay],[bx,by],[cx,cy],[ax,ay],[cx,cy],[dx,dy]];for(let k=0;k<6;k++){const o=(i*6+k)*3;pos[o]=v[k][0]*size;pos[o+1]=v[k][1]*size;pos[o+2]=(modern&&z<-.02?faceDepth(v[k][0],v[k][1],F)-(pos===mPos?(i<8?(i%2?.0034:.0027):.004):.003):z)*size;if(col){col[o]=c.r;col[o+1]=c.g;col[o+2]=c.b;}}};
 // the face's surface bulges forward in the middle: a mouth corner sits a little further back than its centre
 const zAt=(x,y)=>modern?faceDepth(x,y,F)-.0025:-.0962+Math.abs(x)*.11+Math.max(0,-y-.05)*.05;
 function build(){const e=ex,tq=e.tremble>.02?e.tremble*.0011*(Math.sin(S.clock*29)*.6+Math.sin(S.clock*47+1)*.4):0,W=(modern?.039:F.mouth==='grin'?.03:.025)*e.wide*(1-.22*S.round),open=clamp(e.open+S.open,0,1),gap=(modern?.0014:0)+open*(modern?.024:.017)+Math.abs(tq)*.6,cy=(modern?-.056:-.0505)+tq*.4,sm=e.smile-Math.abs(tq)*20;
  qi=0;const top=cy+gap*.25,bot=cy-gap*.75;
  // inner (dark), then teeth along its top
  const N=4,xs=[...Array(N+1)].map((_,i)=>-W/2+W*i/N),curve=x=>sm*.0055*Math.pow(Math.abs(x)/(W/2),2);
  for(let i=0;i<N;i++){const x0=xs[i],x1=xs[i+1],c0=curve(x0),c1=curve(x1),sh=(x)=>1-Math.pow(Math.abs(x)/(W/2),2)*.65;// (the opening narrows at the corners)
   quad(mPos,mCol,qi++,x0,top+c0,x1,top+c1,x1,cy+c1-(cy-bot)*sh(x1),x0,cy+c0-(cy-bot)*sh(x0),zAt((x0+x1)/2,cy)-.0004,dark);
   const tth=Math.min(.0042,(gap*.5+e.teeth*.0025))*clamp(e.teeth+open,0,1);quad(mPos,mCol,qi++,x0*.86,top+c0*.9,x1*.86,top+c1*.9,x1*.86,top+c1*.9-tth,x0*.86,top+c0*.9-tth,zAt((x0+x1)/2,cy)-.0006,teethC);}
  // lips: upper (thinner) and lower, following the corners
  for(let i=0;i<N;i++){const x0=xs[i],x1=xs[i+1],c0=curve(x0),c1=curve(x1),t0=(modern?.0021:.0048)*(1-Math.abs(x0)/W*.8),t1=(modern?.0021:.0048)*(1-Math.abs(x1)/W*.8);
   quad(mPos,mCol,qi++,x0,top+c0+t0,x1,top+c1+t1,x1,top+c1,x0,top+c0,zAt((x0+x1)/2,cy)-.0008,lips);
   const sh=(x)=>1-Math.pow(Math.abs(x)/(W/2),2)*.65,b0=cy+c0-(cy-bot)*sh(x0),b1=cy+c1-(cy-bot)*sh(x1),l0=(modern?.0028:.0058)*(1-Math.abs(x0)/W*.9),l1=(modern?.0028:.0058)*(1-Math.abs(x1)/W*.9);
   quad(mPos,mCol,qi++,x0,b0,x1,b1,x1,b1-l1,x0,b0-l0,zAt((x0+x1)/2,cy-.005)-.0008,lips);}
  // (the rest of the quads, unused, collapsed)
  for(;qi<MQ;)quad(mPos,null,qi++,0,0,0,0,0,0,0,0,0,null);
  mGeo.attributes.position.needsUpdate=true;mGeo.attributes.color.needsUpdate=true;
  // brows: two short strips over the eyes, raised, tilted and knitted by the expression
  const gapE=(F.eyeGap??.036),ey=(F.eyeY??.012)+.026,tilt0=F.browTilt||0;let bi=0;
  for(const s of [-1,1]){const inner=s*(gapE-.016+e.knit*.004),outer=s*(gapE+.02),mid=(inner+outer)/2,yIn=ey+e.browY+e.tilt*.009-e.knit*.003+tilt0*-.006*0,yOut=ey+e.browY-e.tilt*.004+tilt0*.004,yMid=(yIn+yOut)/2+.0012,th=modern?.0038:.0052;
   const zb=modern?faceDepth(gapE,ey,F)-.0035:-.0935;quad(bPos,null,bi++,inner,yIn,mid,yMid,mid,yMid+th,inner,yIn+th*.9,zb,null);quad(bPos,null,bi++,mid,yMid,outer,yOut,outer,yOut+th*.75,mid,yMid+th,zb+.0015,null);
   quad(bPos,null,bi++,outer,yOut,outer,yOut,outer,yOut,outer,yOut,zb,null);}
  bGeo.attributes.position.needsUpdate=true;}
 // ---- the face's state ----
 function set(name,{hold=4,w=1}={}){const E=EXPRESSIONS[name];if(!E)return;S.name=name;S.hold=hold;S.w=w;S.setAt=0;}
 function mood(name){if(EXPRESSIONS[name])S.mood=name;}
 function speak(text,dur){S.keys=speechKeys(text,dur);S.speakT=0;S.speakDur=dur;S.talking=true;}
 // (a recorded line: an amplitude envelope 0..1 sampled at rate Hz drives the opening instead)
 function speakAudio(env,rate=60){S.env={env,rate,t:0};S.talking=true;}
 function silence(){S.keys=null;S.talking=false;S.env=null;}
 function enable(on){if(modern&&!on){S.hold=0;S.mood=S.name='neutral';S.grief=0;S.look=null;silence();head.geometry=geo.on;on=true;}on=!!on;if(on===S.enabled)return;S.enabled=on;/* (a reset switches off faces that are off already: leave their heads alone) */head.geometry=on?geo.on:geo.off;mouth.visible=brows.visible=on;if(!on){person.lids.forEach((L,i)=>{L.position.y=lidY[i];});silence();}S.last='';}
 function update(dt,{clock=0,talk=0,speech=null,visible=true,seed=0}={}){if(!S.enabled){blinkPerson(person,clock,seed);return;}
  if(speech&&speech!==S.lastSpeech){S.lastSpeech=speech;speak(speech.text,speech.dur);}
  if(talk<=0&&!S.env)S.talking=false;
  // the expression: what it was set to, for as long, then back to his own mood
  if(S.hold>0)S.hold-=dt;const cur=EXPRESSIONS[S.hold>0?S.name:S.mood]||{};
  S.clock=clock;const base0=S.grief>.3&&S.hold<=0&&S.mood==='neutral'?EXPRESSIONS[S.grief>.7?'grief':'numb']:null;
  for(const k of KEYS)want[k]=(rest[k]||0)*((base0||cur).smile<0||S.grief>.3?0:1-(S.hold>0?(S.w??1):0)*.6)+((base0||cur)[k]||0)*(S.hold>0?(S.w??1):1);want.wide=want.wide||1;if(!(base0||cur).wide&&!rest.wide)want.wide=1;
  // (what grief leaves on a face: wet, red eyes that do not go back to normal for the rest of the night)
  if(S.name==='lifeless'&&S.hold>0){want.cry=0;want.tremble=0;want.sob=0;S.open=0;S.talking=false;}
  if(S.grief>0&&S.name!=='lifeless'){want.red=Math.max(want.red,S.grief*.8);want.cry=Math.max(want.cry,S.grief*.32);}
  // a sob: the breath catches in pulses, each one pulling the mouth open and squeezing the eyes
  if(ex.sob>.03){S.sobPh+=dt*(1.05+.35*Math.sin(clock*.61));const p=S.sobPh%1,pulse=p<.2?Math.sin(p/.2*Math.PI):p<.32?.25*Math.sin((p-.2)/.12*Math.PI):0;want.open+=pulse*.42*ex.sob;want.lids+=.18*ex.sob;want.tilt+=.12*ex.sob*pulse;S.pulse=pulse*ex.sob;}else S.pulse=0;
  for(const k of KEYS)ex[k]=damp(ex[k],want[k],k==='open'?10:k==='cry'||k==='red'?.6:4.5,dt);
  // speaking
  let o=0,r=0;if(S.talking&&S.keys){S.speakT+=dt;const K=S.keys,t=S.speakT;let i=0;while(i<K.length-1&&K[i+1][0]<t)i++;const a=K[i],b=K[Math.min(K.length-1,i+1)],u=b[0]>a[0]?clamp((t-a[0])/(b[0]-a[0]),0,1):1;o=a[1]+(b[1]-a[1])*u;r=a[2]+(b[2]-a[2])*u;if(t>S.speakDur)S.talking=false;}
  else if(S.env){S.env.t+=dt;const i=Math.floor(S.env.t*S.env.rate);o=S.env.env[i]??0;if(i>=S.env.env.length){S.env=null;S.talking=false;}}
  S.open=damp(S.open,o*.85,22,dt);S.round=damp(S.round,r,14,dt);
  // blinking (and the lids an expression holds half shut)
  const ph=(clock+(cast.name?.length||3)*1.37)%(3.7+(cast.name?.length||3)*.43),close=ph<.14?Math.sin(ph/.14*Math.PI):0,lid=Math.max(close,ex.lids);
  for(const L of person.lids){L.visible=!modern&&lid>.08;L.scale.y=(modern?.011:.014)*size*lid;L.position.y=((F.eyeY??.012)+.004*(1-lid))*size;}
  if(modern)for(const L of person.lids)L.position.z=(faceDepth(L.position.x/size,F.eyeY??.012,F)-.006)*size;
  if(!visible)return;
  if(R)richUpdate(dt,clock,lid);
  const key=KEYS.map(k=>ex[k].toFixed(3)).join(',')+S.open.toFixed(3)+S.round.toFixed(2)+(ex.tremble>.02?S.clock.toFixed(2):'');if(key!==S.last){S.last=key;build();}}
 // ---- the rich face (Chapter Eight): eyes that look at something, tears, red rims, wet lower lids. Built on demand, so the
 // faces of earlier chapters are exactly what they were. Overlaid on the head's own eyes (a white that covers its iris, a
 // moving iris, pupil and glint), two tear tracks down the cheeks with a drop that runs, a red rim round each eye.
 let R=null;const _v=new THREE.Vector3(),_w=new THREE.Vector3();
 function buildRich(){if(R)return R;const g=new THREE.Group();g.name='face-rich';head.add(g);const gapE=F.eyeGap??.036,eyeY=F.eyeY??.012,sz=size;
  const mk=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.35,...o});
  const white=mk(modern?0xc9c5bb:0xf1ede4,{roughness:.25}),irisM=mk(F.iris??0x3a2a1c,{roughness:.3}),pupilM=new THREE.MeshBasicMaterial({color:0x070505}),glintM=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.95});
  const rimM=mk(0xb8484f,{roughness:.6,transparent:true,opacity:0,depthWrite:false}),tearM=mk(0xdcefff,{roughness:.03,metalness:.4,transparent:true,opacity:0,depthWrite:false}),wetM=new THREE.MeshBasicMaterial({color:0xeaf6ff,transparent:true,opacity:0,depthWrite:false});
  for(const m of [white,irisM,pupilM,glintM,rimM,tearM,wetM])m.name='face-rich';
  const circ=new THREE.CircleGeometry(1,20),ring=new THREE.RingGeometry(.82,1,24);
  const eyes=[-1,1].map(s=>{const e=new THREE.Group();e.position.set(s*gapE*sz,eyeY*sz,(modern?faceDepth(s*gapE,eyeY,F)-.0035:-.0973)*sz);g.add(e);if(modern)e.rotation.y=-s*.17;
   const w=new THREE.Mesh(circ,white);w.scale.set(.0158*sz,(modern?.0085:.0108)*sz,1);w.rotation.y=Math.PI;e.add(w);
   const iris=new THREE.Group();e.add(iris);const ir=new THREE.Mesh(circ,irisM);ir.scale.set((modern?.0065:.0084)*sz,(modern?.0074:.0086)*sz,1);ir.position.z=-.0004*sz;ir.rotation.y=Math.PI;iris.add(ir);
   const pu=new THREE.Mesh(circ,pupilM);pu.scale.set(.0032*sz,.0039*sz,1);pu.position.z=-.0007*sz;pu.rotation.y=Math.PI;iris.add(pu);
   const gl=new THREE.Mesh(circ,glintM);gl.scale.set(.0016*sz,.0016*sz,1);gl.position.set(.0026*sz,.003*sz,-.001*sz);gl.rotation.y=Math.PI;iris.add(gl);
   const rim=new THREE.Mesh(ring,rimM);rim.scale.set(.0174*sz,(modern?.0102:.014)*sz,1);rim.position.z=.0003*sz;rim.rotation.y=Math.PI;e.add(rim);
   const wet=new THREE.Mesh(circ,wetM);wet.scale.set(.012*sz,.0012*sz,1);wet.position.set(0,(modern?-.0079:-.0098)*sz,-.0009*sz);wet.rotation.y=Math.PI;e.add(wet);
   // the tear track: a thin strip from the lower lid down over the cheek, following the face's curve
   const n=7,pos=[],idx=[];for(let i=0;i<=n;i++){const t=i/n,x=s*(gapE-.003+t*.006),y=eyeY-.011-t*.036,z=zAt(x,y)+.0001-.0012,wd=.0010*(1-t*.35);pos.push((x-wd)*sz,y*sz,z*sz,(x+wd)*sz,y*sz,z*sz);}
   for(let i=0;i<n;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));tg.setIndex(idx);tg.computeVertexNormals();
   const track=new THREE.Mesh(tg,tearM);g.add(track);const drop=new THREE.Mesh(new THREE.SphereGeometry(.0015*sz,10,8),tearM);g.add(drop);
   return {s,e,iris,rim,wet,track,drop,ph:Math.random()};});
  R={g,eyes,rimM,tearM,wetM};return R;}
 function richUpdate(dt,clock,lid){const e=ex;
  // where the eyes go: a target if there is one (in head space), small saccades round it; down and in when crying
  S.sacT-=dt;if(S.sacT<=0){S.sacT=.35+Math.random()*1.6;S.sac=[(Math.random()-.5)*.0016,(Math.random()-.5)*.0011];}
  let ox=0,oy=0;if(S.look){const tp=typeof S.look==='function'?S.look():S.look;if(tp){head.updateWorldMatrix(true,false);_v.set(tp.x,tp.y,tp.z);head.worldToLocal(_v);const dz=Math.min(-.05,_v.z);ox=clamp(-_v.x/dz*.012,-.0042,.0042);oy=clamp(-(_v.y-(F.eyeY??.012))/dz*.012,-.0025,.0025);}}
  const dead=S.name==='lifeless'&&S.hold>0;
  const down=clamp(e.cry*.6+e.lids*.4,0,1)*.0018;ox+=S.sac[0];oy+=S.sac[1]-down;
  for(const E of R.eyes){E.iris.position.x=damp(E.iris.position.x,ox*size,16,dt);E.iris.position.y=damp(E.iris.position.y,oy*size,16,dt);E.e.visible=lid<.94;E.e.scale.y=Math.max(.02,1-lid);E.wet.visible=lid<.6;
   E.drop.visible=!dead&&e.cry>.45;if(E.drop.visible){E.ph=(E.ph+dt/(2.6+E.s*.4))%1;const t=E.ph,gapE=F.eyeGap??.036,x=E.s*(gapE-.003+t*.006),y=(F.eyeY??.012)-.011-t*.036;E.drop.position.set(x*size,y*size,(zAt(x,y)-.0016)*size);}}
  R.tearM.opacity=clamp(e.cry,0,1)*.36;R.rimM.opacity=clamp(e.red,0,1)*.55;R.wetM.opacity=clamp(Math.max(e.cry,e.red*.8),0,1)*.75;}
 function rich(on){on=modern||on;if(on){buildRich();R.g.visible=true;}else if(R)R.g.visible=false;}
 function look(target){S.look=target||null;}
 function grief(v){S.grief=clamp(v,0,1);}
 build();
 if(modern){rich(true);person.lids.forEach(L=>{L.position.z=(faceDepth(L.position.x/size,F.eyeY??.012,F)-.006)*size;});}
 if(!enabled)enable(false);
 return {set,mood,speak,speakAudio,silence,update,enable,rich,look,grief,get pulse(){return S.pulse||0;},get sobbing(){return ex.sob;},get crying(){return ex.cry;},get enabled(){return S.enabled;},mouth,brows,S,get expression(){return S.hold>0?S.name:S.mood;},get speaking(){return S.talking;},get openness(){return clamp(ex.open+S.open,0,1);}};
}
