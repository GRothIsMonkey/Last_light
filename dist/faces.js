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
};
const KEYS=['browY','tilt','knit','smile','open','wide','teeth','lids'];
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
 const built=head.geometry,other=headGeometry(enabled?F:{...F,rig:true},cast.hair||{style:'cropped',color:0x4a3528},size),geo={on:enabled?built:other,off:enabled?other:built},lidY=person.lids.map(L=>L.position.y);
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
 const ex=Object.fromEntries(KEYS.map(k=>[k,0])),want=Object.fromEntries(KEYS.map(k=>[k,0]));
 const S={name:'neutral',hold:0,mood:'neutral',open:0,round:0,keys:null,speakT:0,speakDur:0,blinkT:0,dirty:true,last:'',talking:false,enabled:true};
 let qi=0;
 const quad=(pos,col,i,ax,ay,bx,by,cx,cy,dx,dy,z,c)=>{const v=[[ax,ay],[bx,by],[cx,cy],[ax,ay],[cx,cy],[dx,dy]];for(let k=0;k<6;k++){const o=(i*6+k)*3;pos[o]=v[k][0]*size;pos[o+1]=v[k][1]*size;pos[o+2]=z*size;if(col){col[o]=c.r;col[o+1]=c.g;col[o+2]=c.b;}}};
 // the face's surface bulges forward in the middle: a mouth corner sits a little further back than its centre
 const zAt=(x,y)=>-.0962+Math.abs(x)*.11+Math.max(0,-y-.05)*.05;
 function build(){const e=ex,W=(F.mouth==='grin'?.03:.025)*e.wide*(1-.22*S.round),open=clamp(e.open+S.open,0,1),gap=open*.017,cy=-.0505,sm=e.smile;
  qi=0;const top=cy+gap*.25,bot=cy-gap*.75;
  // inner (dark), then teeth along its top
  const N=4,xs=[...Array(N+1)].map((_,i)=>-W/2+W*i/N),curve=x=>sm*.0055*Math.pow(Math.abs(x)/(W/2),2);
  for(let i=0;i<N;i++){const x0=xs[i],x1=xs[i+1],c0=curve(x0),c1=curve(x1),sh=(x)=>1-Math.pow(Math.abs(x)/(W/2),2)*.65;// (the opening narrows at the corners)
   quad(mPos,mCol,qi++,x0,top+c0,x1,top+c1,x1,cy+c1-(cy-bot)*sh(x1),x0,cy+c0-(cy-bot)*sh(x0),zAt((x0+x1)/2,cy)-.0004,dark);
   const tth=Math.min(.0042,(gap*.5+e.teeth*.0025))*clamp(e.teeth+open,0,1);quad(mPos,mCol,qi++,x0*.86,top+c0*.9,x1*.86,top+c1*.9,x1*.86,top+c1*.9-tth,x0*.86,top+c0*.9-tth,zAt((x0+x1)/2,cy)-.0006,teethC);}
  // lips: upper (thinner) and lower, following the corners
  for(let i=0;i<N;i++){const x0=xs[i],x1=xs[i+1],c0=curve(x0),c1=curve(x1),t0=.0048*(1-Math.abs(x0)/W*.8),t1=.0048*(1-Math.abs(x1)/W*.8);
   quad(mPos,mCol,qi++,x0,top+c0+t0,x1,top+c1+t1,x1,top+c1,x0,top+c0,zAt((x0+x1)/2,cy)-.0008,lips);
   const sh=(x)=>1-Math.pow(Math.abs(x)/(W/2),2)*.65,b0=cy+c0-(cy-bot)*sh(x0),b1=cy+c1-(cy-bot)*sh(x1),l0=.0058*(1-Math.abs(x0)/W*.9),l1=.0058*(1-Math.abs(x1)/W*.9);
   quad(mPos,mCol,qi++,x0,b0,x1,b1,x1,b1-l1,x0,b0-l0,zAt((x0+x1)/2,cy-.005)-.0008,lips);}
  // (the rest of the quads, unused, collapsed)
  for(;qi<MQ;)quad(mPos,null,qi++,0,0,0,0,0,0,0,0,0,null);
  mGeo.attributes.position.needsUpdate=true;mGeo.attributes.color.needsUpdate=true;
  // brows: two short strips over the eyes, raised, tilted and knitted by the expression
  const gapE=(F.eyeGap??.036),ey=(F.eyeY??.012)+.026,tilt0=F.browTilt||0;let bi=0;
  for(const s of [-1,1]){const inner=s*(gapE-.016+e.knit*.004),outer=s*(gapE+.02),mid=(inner+outer)/2,yIn=ey+e.browY+e.tilt*.004-e.knit*.003+tilt0*-.006*0,yOut=ey+e.browY-e.tilt*.001+tilt0*.004,yMid=(yIn+yOut)/2+.0012,th=.0052;
   const zb=-.0935;quad(bPos,null,bi++,inner,yIn,mid,yMid,mid,yMid+th,inner,yIn+th*.9,zb,null);quad(bPos,null,bi++,mid,yMid,outer,yOut,outer,yOut+th*.75,mid,yMid+th,zb+.0015,null);
   quad(bPos,null,bi++,outer,yOut,outer,yOut,outer,yOut,outer,yOut,zb,null);}
  bGeo.attributes.position.needsUpdate=true;}
 // ---- the face's state ----
 function set(name,{hold=4,w=1}={}){const E=EXPRESSIONS[name];if(!E)return;S.name=name;S.hold=hold;S.w=w;S.setAt=0;}
 function mood(name){if(EXPRESSIONS[name])S.mood=name;}
 function speak(text,dur){S.keys=speechKeys(text,dur);S.speakT=0;S.speakDur=dur;S.talking=true;}
 // (a recorded line: an amplitude envelope 0..1 sampled at rate Hz drives the opening instead)
 function speakAudio(env,rate=60){S.env={env,rate,t:0};S.talking=true;}
 function silence(){S.keys=null;S.talking=false;S.env=null;}
 function enable(on){on=!!on;S.enabled=on;head.geometry=on?geo.on:geo.off;mouth.visible=brows.visible=on;if(!on){person.lids.forEach((L,i)=>{L.position.y=lidY[i];});silence();}S.last='';}
 function update(dt,{clock=0,talk=0,speech=null,visible=true,seed=0}={}){if(!S.enabled){blinkPerson(person,clock,seed);return;}
  if(speech&&speech!==S.lastSpeech){S.lastSpeech=speech;speak(speech.text,speech.dur);}
  if(talk<=0&&!S.env)S.talking=false;
  // the expression: what it was set to, for as long, then back to his own mood
  if(S.hold>0)S.hold-=dt;const cur=EXPRESSIONS[S.hold>0?S.name:S.mood]||{};
  for(const k of KEYS)want[k]=(rest[k]||0)*(1-(S.hold>0?(S.w??1):0)*.6)+(cur[k]||0)*(S.hold>0?(S.w??1):1);want.wide=want.wide||1;if(!cur.wide&&!rest.wide)want.wide=1;
  for(const k of KEYS)ex[k]=damp(ex[k],want[k],k==='open'?10:4.5,dt);
  // speaking
  let o=0,r=0;if(S.talking&&S.keys){S.speakT+=dt;const K=S.keys,t=S.speakT;let i=0;while(i<K.length-1&&K[i+1][0]<t)i++;const a=K[i],b=K[Math.min(K.length-1,i+1)],u=b[0]>a[0]?clamp((t-a[0])/(b[0]-a[0]),0,1):1;o=a[1]+(b[1]-a[1])*u;r=a[2]+(b[2]-a[2])*u;if(t>S.speakDur)S.talking=false;}
  else if(S.env){S.env.t+=dt;const i=Math.floor(S.env.t*S.env.rate);o=S.env.env[i]??0;if(i>=S.env.env.length){S.env=null;S.talking=false;}}
  S.open=damp(S.open,o*.85,22,dt);S.round=damp(S.round,r,14,dt);
  // blinking (and the lids an expression holds half shut)
  const ph=(clock+(cast.name?.length||3)*1.37)%(3.7+(cast.name?.length||3)*.43),close=ph<.14?Math.sin(ph/.14*Math.PI):0,lid=Math.max(close,ex.lids);
  for(const L of person.lids){L.visible=lid>.08;L.scale.y=.014*size*lid;L.position.y=((F.eyeY??.012)+.004*(1-lid))*size;}
  if(!visible)return;
  const key=KEYS.map(k=>ex[k].toFixed(3)).join(',')+S.open.toFixed(3)+S.round.toFixed(2);if(key!==S.last){S.last=key;build();}}
 build();
 if(!enabled)enable(false);
 return {set,mood,speak,speakAudio,silence,update,enable,get enabled(){return S.enabled;},mouth,brows,S,get expression(){return S.hold>0?S.name:S.mood;},get speaking(){return S.talking;},get openness(){return clamp(ex.open+S.open,0,1);}};
}
