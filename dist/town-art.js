// Astra's Chapter Four environment pass. All static detail joins the existing cell batches.
// Props stay on existing furniture/solid footprints or against walls; no navigation or story data is edited.
import * as THREE from './three.module.js';
import {seeded,hashSeed} from './kit.js';
import {BUILDINGS,BLD,footprint,INTERIORS,SOLIDS,TY,TL,CROSS,CONN_HOUSES,CONN_X,connAt,connY,mainBase} from './town-plan.js';

export function polishTown(A){
 const {W,K,out,inn,world,D,at,B,sign,filmUV,quadInto,quads,stone,concrete,timber,metal,paint,dull,plaster,glassDark,LV,NEON}=A;
 const rng=seeded(20110823),iron=metal(0x343c3b),brass=metal(0x9a8051),cream=paint(0xd9cfb8),paper=dull(0xe5dcc5),rubber=dull(0x252b2a);
 const stats={facades:0,shopDisplays:0,libraryDetails:0,videoDetails:0,serviceDetails:0};D.artStats=stats;
 const box=(g,x,y,z,w,h,d,m)=>B(g,x,y,z,w,h,d,m);
 const rod=(g,a,b,r,m)=>K.rod(g,a,b,r,m,r,7);
 function paperStack(g,x,y,z,w=.28,d=.21,n=3){for(let i=0;i<n;i++){const m=box(g,x+i*.003,y+i*.006,z,w,.005,d,paper);m.rotation.y=i*.07;}for(let k=0;k<4;k++)box(g,x,y+n*.006+.001,z-d*.3+k*d*.15,w*.67,.002,.002,dull(0x8d8b82));}
 function book(g,x,y,z,w=.2,h=.04,d=.28,c=0x68747d){box(g,x,y,z,w,h,d,paint(c));box(g,x+.006,y,z+.002,w-.012,h*.65,d-.012,paper);box(g,x-w/2+.008,y,z,.016,h+.003,d,paint(c));}
 function wallFrame(g,x,y,z,w,h,text,sub='',ry=0){const f=at(g,x,y,z,ry);box(f,0,0,-.018,w+.08,h+.08,.045,timber(0x594734));sign(f,{text,sub,bg:'#ded7c4',fg:'#37433b',font:'serif'},w,h,{z:.01});return f;}
 function pipe(g,x,y0,y1,z){rod(g,[x,y0,z],[x,y1,z],.048,metal(0x6c7169));for(let y=y0+.4;y<y1;y+=1.7)box(g,x,y,z-.025,.15,.05,.1,iron);rod(g,[x,y0,z],[x,y0-.15,z+.16],.048,metal(0x6c7169));}
 function lampShade(g,x,y,z,lv){const m=at(g,x,y,z);rod(m,[0,0,-.25],[0,0,.06],.025,iron);rod(m,[0,0,.06],[0,-.13,.23],.025,iron);K.lathe(m,[[.045,.04],[.07,0],[.18,-.09],[.2,-.12]],0,-.1,.24,iron,10);D.fixtures.push({group:m,x:0,y:-.23,z:.24,w:.26,d:.26,lv});m.updateWorldMatrix(true,false);const p=m.localToWorld(new THREE.Vector3(0,-.32,.35)),q=TL(p.x,p.z);D.candidates.push({u:q.u,v:q.v,y:p.y,idx:lv,k:4.2,r:6.2,c:new THREE.Color(1,.79,.52)});}

 // ---- Distinct, layered facades: sills, shadow ledges, pilasters, awning seams, lived-in upper windows.
 for(const b of BUILDINGS){const g=b.group;if(!g)continue;stats.facades++;
  const w=b.u1-b.u0,h=b.h,tr=paint(b.trim||0xd3c6ab),sf=b.floors>1?4.3:Math.min(4.2,h-.6),F=footprint(b);
  if(!['church','library','gas','carwash'].includes(b.kind)){
   // Recessed panels and a darker shadow course under the cornice.
   box(g,0,h+.2,.11,w+.12,.065,.3,dull(0x544b40));box(g,0,h+.33,.09,w+.26,.12,.42,tr);
   for(const x of [-w/2+.24,w/2-.24]){box(g,x,2.1,.035,.24,4.15,.14,tr);box(g,x,.18,.075,.38,.28,.21,stone(0x9e9581));box(g,x,3.98,.075,.4,.16,.22,tr);}
   if(b.floors>1){const fh=(h-sf-.9)/(b.floors-1),n=Math.max(1,Math.floor((w-1)/2.5));
    box(g,0,sf+.33,.05,w,.09,.28,tr);
    for(let f=1;f<b.floors;f++)for(let j=0;j<n;j++){const x=-w/2+w*(j+.5)/n,y=sf+.65+fh*(f-.5),rnd=seeded(hashSeed(b.u0,f,j));
     for(const s of [-1,1])box(g,x+s*.558,y,-.015,.085,1.88,.09,tr);
     box(g,x,y-.96,.07,1.36,.1,.38,stone(0xb4a990));box(g,x,y-.99,.18,1.34,.018,.025,dull(0x62594c));
     // Slatted blinds or narrow curtains, tucked behind the sash but in front of the glazing.
     if(rnd()<.52){const drop=.3+rnd()*.65;for(let k=0;k<Math.floor(drop/.085);k++)box(g,x,y+.82-k*.085,-.167,.95,.048,.017,paint(rnd()<.5?0xc5c0aa:0xb7b7ac));}
     else for(const s of [-1,1])box(g,x+s*.41,y,-.17,.14,1.65,.035,paint(0xa5a399));
     if(j===0&&f===1&&b.id!=='lyric'&&b.kind!=='bank'){box(g,x,y-.67,.23,.73,.36,.44,metal(0xa4a59b));for(let k=0;k<6;k++)box(g,x-.3+k*.12,y-.67,.458,.045,.23,.007,dull(0x59605b));}
    }
   }
   if(b.awning){const aw=w-.84;for(let x=-aw/2+.45;x<aw/2;x+=.9){rod(g,[x,3.30,-.11],[x,2.65,1.32],.011,dull(0x53604f));box(g,x,2.55,1.351,.025,.1,.012,cream);}box(g,0,2.53,1.35,aw,.035,.03,paint(b.awning));}
   // Small street numbers stay clear of the door and the story posters.
   sign(g,{text:String(100+Math.round(b.u0)*2),bg:'#252c2d',fg:'#daceb2',font:'serif',border:false},.33,.16,{x:-w/2+.65,y:2.26,z:.11});
   if(b.lit>=0&&['acetv','video','laundry','hardware','barber','tap'].includes(b.id))for(const x of [-w*.31,w*.31])lampShade(g,x,b.awning?4.65:3.72,.13,LV.shop+b.lit);
  }
  // Back-of-building service detail, attached high or flush so all five escape routes stay clear.
  if(b.kind!=='church'&&b.kind!=='library'){
   const back=b.ext?Math.max(b.d,Math.abs(b.ext.v-F.front)):b.d;
   pipe(g,-w/2+.25,.45,Math.min(h,7.2),-back-.08);
   for(const x of [w*.18,w*.28]){box(g,x,1.7,-back-.06,.38,.5,.11,metal(0x84867b));rod(g,[x,1.94,-back-.12],[x,h-.25,-back-.12],.016,iron);}
   for(let j=0;j<2;j++){const vent=at(g,-w*.25+j*.8,2.7,-back-.18,Math.PI);box(vent,0,0,-.04,.63,.46,.09,metal(0x7a7f78));for(let k=0;k<5;k++)box(vent,0,-.17+k*.085,.011,.53,.025,.04,iron);}
   stats.serviceDetails+=5;
  }
  // The shadow boxes get actual foreground goods; the printed back wall provides deeper stock.
  if(b.lit>=0&&!INTERIORS[b.id]&&!['church','theater','bank','gas','carwash'].includes(b.kind)){
   const x=-w*.3,sg=at(g,x,.61,-1.05);stats.shopDisplays++;
   if(['hardware','variety','drug'].includes(b.id)){box(sg,0,.16,0,w*.23,.32,.55,timber(0x71604c));for(let j=0;j<7;j++){const xx=(j-3)*.31;box(sg,xx,.44,0,.23,.24+(j%3)*.08,.24,paint([0x98644d,0x4e6965,0xc2b184,0x707d90][j%4]));box(sg,xx,.44,.126,.14,.09,.008,paper);}}
   else if(b.id==='florist'){for(let j=0;j<4;j++){const xx=(j-1.5)*.45;K.cyl(sg,xx,.18,0,.13,.36,paint(0xb39371),10);for(let k=0;k<4;k++){rod(sg,[xx,.24,0],[xx+(k-1.5)*.045,.65+k*.03,0],.008,dull(0x4d6b41));K.ball(sg,xx+(k-1.5)*.045,.68+k*.03,0,.065,paint([0xb98692,0xdbbb74,0xd6cdc4][j%3]));}}}
   else if(b.id==='barber'){K.cyl(sg,0,.15,0,.32,.3,metal(0xa8aaa4),12);box(sg,0,.54,0,.72,.15,.65,paint(0x823e37));box(sg,0,.9,-.28,.72,.6,.13,paint(0x823e37));}
   else if(b.id==='acetv'){for(let j=0;j<3;j++){box(sg,j*.48,.065,.15,.43,.12,.27,iron);box(sg,j*.48,.08,.295,.3,.024,.008,dull(0x131818));}sign(g,{text:'SERVICE • PARTS • REPAIRS',sub:'VCR / DVD / TV',bg:'#d1c5a1',fg:'#29312e',font:'sans'},2,.36,{x:w*.26,y:.89,z:-.27});}
   else{box(sg,0,.05,0,1.6,.1,.65,timber(0x82664c));for(let j=0;j<3;j++)box(sg,(j-1)*.5,.27,0,.32,.36,.28,paint([0xb79e76,0x7a8c85,0x8c6864][j]));}
  }
 }

 // ---- Lyric: terracotta relief, bronze rails, a tiled threshold and a believable box office.
 {const g=BLD.lyric.group,w=BLD.lyric.u1-BLD.lyric.u0;
  for(const x of [-w/2+.8,w/2-.8,-3.1,3.1]){box(g,x,8.4,.08,.2,5.3,.24,stone(0xbba583));for(let j=0;j<4;j++)box(g,x,11.5+j*.22,.12,.44-j*.07,.09,.26,cream);}
  for(const x of [-5.7,0,5.7])for(let j=0;j<7;j++){const theta=Math.PI*j/6;const m=box(g,x+1.47*Math.cos(theta),10.35+1.08*Math.sin(theta),.05,.26,.16,.18,stone(0xc3ae87));m.rotation.z=theta-Math.PI/2;}
  for(const x of [-.7,.7])box(g,x,2.1,.865,.035,1.55,.035,brass);
  for(const y of [1.38,2.77])box(g,0,y,.865,1.44,.036,.035,brass);
  K.cyl(g,0,1.82,.87,.16,.018,brass,20,[Math.PI/2,0,0]);K.cyl(g,0,1.82,.883,.105,.02,rubber,20,[Math.PI/2,0,0]);
  sign(g,{text:'BOX OFFICE',sub:'TICKETS $5.00',bg:'#292c27',fg:'#dbc394',font:'serif'},1.2,.36,{y:1.02,z:.893});
  for(const x of [-2.7,-.9,.9,2.7])for(const dx of [-.45,.45])rod(g,[x+dx,.9,-1.51],[x+dx,1.35,-1.51],.023,brass);
  for(let x=-3.65;x<3.7;x+=.46)for(let z=-1.5;z<.15;z+=.46)box(g,x,.053,z,.44,.015,.44,paint((Math.round(x/.46)+Math.round(z/.46))%2?0x8d7760:0xcbb995));
  // Dim gold reflected under the marquee follows the exact accepted blackout level.
  for(const x of [-5.2,5.2])lampShade(g,x,2.95,.1,LV.neon+NEON.marquee);
 }

 // ---- Library: ceiling grid, paneled circulation counter, shelving and research tools.
 {const y=TY+INTERIORS.library.h,wood=timber(0x70543b);
  for(let u=119;u<151.5;u+=1.2)box(inn,u,y+4.555,53,.021,.045,17,paint(0xc1bcad));for(let v=45;v<61.5;v+=1.2)box(inn,135,y+4.555,v,33,.045,.021,paint(0xc1bcad));
  for(const s of SOLIDS.filter(s=>s.inside==='library')){const cu=(s.u0+s.u1)/2,cv=(s.v0+s.v1)/2,w=s.u1-s.u0,d=s.v1-s.v0;
   if(s.kind==='desk-circ'){
    for(let u=s.u0+.55;u<s.u1-.3;u+=1.05){box(inn,u,y+.53,s.v0-.012,.9,.73,.04,wood);box(inn,u,y+.53,s.v0-.037,.72,.55,.012,timber(0x614c37));}
    box(inn,cu,y+.14,s.v0-.04,w,.075,.06,cream);box(inn,cu,y+.91,s.v0-.04,w,.055,.06,cream);
    const g=at(inn,cu+2.1,y+1.06,cv);box(g,0,.28,0,.43,.34,.12,iron);box(g,0,.28,-.069,.36,.26,.012,paint(0x768d8b));box(g,0,.06,0,.08,.2,.08,iron);box(g,0,0,0,.29,.025,.22,iron);box(g,0,.016,-.28,.44,.026,.14,cream);
    for(let j=0;j<4;j++)book(inn,cu-1.8,y+1.08+j*.048,cv,.24,.045,.33,[0x704e3f,0x6a817e,0x969075][j]);paperStack(inn,cu-2.4,y+1.06,cv);K.cyl(inn,cu+1.4,y+1.12,cv,.065,.15,paint(0x5f6a5c),10);
    if(Math.abs(cu-135)<2)wallFrame(inn,135,y+2.68,61.43,3.3,.58,'OAK HOLLOW PUBLIC LIBRARY','A GOOD BOOK IS ONLY THE BEGINNING',Math.PI);
   }
   if(s.kind==='stack'){
    const hh=s.wall?2.4:2.1;for(const side of s.wall?[1]:[-1,1])for(let k=0;k<5;k++){box(inn,cu,y+.14+k*.42,cv+side*d/2,w,.04,.32,wood);for(let j=0;j<Math.ceil(w/.32);j++)box(inn,s.u0+.1+j*.32,y+.26+k*.42,cv+side*(d/2+.141),.03,.085,.006,paper);}
    box(inn,cu,y+hh+.018,cv,w+.07,.05,d+.08,wood);stats.libraryDetails++;
   }
   if(s.kind==='table'){paperStack(inn,cu-.3,y+.78,cv,.4,.3,2);book(inn,cu+.4,y+.79,cv,.23,.03,.32,0x7b8271);}
   if(s.kind==='microfilm'){
    const mg=D.reader.group;for(const x of [-.38,.38]){K.cyl(mg,x,.34,.365,.09,.02,iron,16,[Math.PI/2,0,0]);for(let k=0;k<6;k++)K.ball(mg,x+.052*Math.cos(k*Math.PI/3),.34+.052*Math.sin(k*Math.PI/3),.381,.011,cream);}
    box(mg,0,.07,-.45,.74,.06,.3,iron);for(let k=0;k<9;k++)box(mg,-.31+k*.075,.35,.364,.025,.11,.006,dull(0x696b61));
    paperStack(inn,147.65,y+.783,60.75,.4,.29,5);book(inn,150.1,y+.8,60.95,.32,.06,.42,0x716149);
    for(let j=0;j<3;j++){box(inn,149.65+j*.23,y+.86,61.1,.2,.2,.2,paint(0xc5b991));sign(inn,{text:String(1986+j),bg:'#e4d8b3',fg:'#443f35',font:'mono',border:false},.16,.065,{x:149.65+j*.23,y:y+.87,z:60.994,ry:Math.PI});}
    wallFrame(inn,148.8,y+2.5,61.43,1.5,.36,'MICROFILM READER','PLEASE RETURN REELS TO THE DESK',Math.PI);
    sign(inn,{text:'REEL INDEX',sub:'THE COURIER · 1879–2009',bg:'#eee6cf',fg:'#343e38',font:'mono'},.6,.35,{x:150.65,y:y+1.6,z:61.42,ry:Math.PI});
   }
   if(s.kind==='cabinets')for(let v=s.v0+.22;v<s.v1;v+=.45)for(let k=0;k<4;k++){box(inn,s.u0-.022,y+.21+k*.3,v,.023,.027,.14,brass);box(inn,s.u0-.024,y+.29+k*.3,v,.025,.055,.12,paper);}
  }
  // Wainscot hugs solid wall panels, avoiding every window opening and door.
  for(const [a,b,v] of [[119,132.5,44.54],[137.5,151,44.54],[119,142.4,61.46]]){box(inn,(a+b)/2,y+.25,v,b-a,.45,.04,wood);box(inn,(a+b)/2,y+.48,v,b-a,.04,.07,cream);}
  for(const [u,text] of [[121.4,'FICTION'],[128.7,'REFERENCE'],[139.4,'CHILDREN']])sign(inn,{text,bg:'#3e574f',fg:'#e5d8b6',font:'serif'},1.8,.36,{x:u,y:y+2.6,z:59,ry:Math.PI});
  stats.libraryDetails+=20;
 }

 // ---- Lantern Video: real cases, shelf lips, category headers, returns and a small-town rental counter.
 {const y=TY+INTERIORS.video.h;
  for(let u=99.5;u<115.5;u+=1.2)box(inn,u,y+3.355,-23,.023,.045,23,paint(0xa9aaa2));for(let v=-34;v<-11.5;v+=1.2)box(inn,107.25,y+3.355,v,16.5,.045,.023,paint(0xa9aaa2));
  // A restrained burgundy frieze ties together the once-blank walls.
  box(inn,99.028,y+2.65,-20,.035,.44,17.6,paint(0x7b403e));box(inn,115.47,y+2.65,-20,.035,.44,17.6,paint(0x7b403e));
  box(inn,99.05,y+.35,-20,.025,.035,17.6,cream);box(inn,115.45,y+.35,-20,.025,.035,17.6,cream);
  for(const s of SOLIDS.filter(s=>s.inside==='video')){const cu=(s.u0+s.u1)/2,cv=(s.v0+s.v1)/2,w=s.u1-s.u0,d=s.v1-s.v0;
   if(s.kind==='rack'){
    box(inn,cu,y+2.14,cv,w+.06,.09,d+.06,paint(0x793e3d));
    if(s.island||s.wall==='w')for(const side of s.island?[-1,1]:[-1]){
     for(let k=0;k<5;k++){box(inn,cu+side*(w/2+.08),y+.33+k*.38,cv,.12,.045,d,cream);for(let j=0;j<Math.floor(d/.34);j++)box(inn,cu+side*(w/2+.015),y+.49+k*.38,s.v0+.14+j*.34,.012,.22,.018,iron);}
     sign(inn,{text:s.island?'3 NIGHTS · $2.99':'STAFF PICKS',bg:'#813c36',fg:'#f1dfb8',font:'sans'},Math.min(d-.15,2.2),.17,{x:cu+side*(w/2+.039),y:y+2.14,z:cv,ry:side*Math.PI/2});
    }
    stats.videoDetails++;
   }
   if(s.kind==='counter'){
    box(inn,s.u1+.015,y+.14,cv,.045,.16,d,iron);box(inn,s.u1+.02,y+.86,cv,.04,.045,d,cream);
    for(let v=s.v0+.4;v<s.v1;v+=.75)box(inn,s.u1+.013,y+.49,v,.025,.59,.017,paint(0x473749));
    // Bagged returns, scanner, membership forms; nothing projects into the aisle.
    for(let j=0;j<4;j++)book(inn,cu,y+1.12+j*.045,s.v0+.6,.15,.038,.22,[0x795244,0x586677,0x85825a,0x393c41][j]);
    paperStack(inn,cu,y+1.1,s.v1-.5,.26,.18,3);
   }
  }
  for(const [v,i] of [[-15.8,6],[-20.6,2],[-25.7,17]]){const g=at(inn,99.064,y+2.02,v,Math.PI/2);box(g,0,0,-.025,.73,1.02,.04,iron);quadInto(quads.cover,g,filmUV(i,150,222),.65,.94,{z:.003});}
  sign(inn,{text:'THE LANTERN',sub:'YOUR FRIDAY NIGHT STARTS HERE',bg:'#393646',fg:'#e1c88c',font:'serif'},2.7,.55,{x:99.06,y:y+2.32,z:-23,ry:Math.PI/2});
  sign(inn,{text:'RENTAL MEMBERSHIP',sub:'BRING YOUR CARD · THANK YOU!',bg:'#e3d9b8',fg:'#3c3d39',font:'sans'},1.05,.25,{x:99.06,y:y+1.4,z:-13.5,ry:Math.PI/2});
  sign(inn,{text:'NEW RELEASES',sub:'DVD $3.99 · 2 NIGHTS',bg:'#ad994d',fg:'#222d2c',font:'block'},2.5,.46,{x:107.8,y:y+2.8,z:-27.72});
  // The TV now has speaker slots, a label and a visible bracket; its live screen is unchanged.
  const tv=D.tvs.video.group;for(let i=0;i<5;i++)box(tv,.395,-.14+i*.055,.021,.025,.025,.009,rubber);box(tv,.23,-.31,.021,.045,.021,.012,cream);
  for(const t of D.tvs.acetv){for(let i=0;i<4;i++)box(t.group,.48*t.s,-.12*t.s+i*.06*t.s,.018,.025*t.s,.025*t.s,.012,rubber);}
  stats.videoDetails+=18;
 }

 // ---- Street and service pavement: drainage, repairs, thresholds, flush wall notices.
 {const seam=dull(0x5e5e54),patch=concrete(0x8f9187);
  for(let u=12;u<263;u+=19)for(const v of [-6.75,6.75]){if(CROSS.some(c=>Math.abs(c.u-u)<10))continue;box(out,u,mainBase(u)+.015,v,.66,.014,.39,iron);for(let j=0;j<7;j++)box(out,u-.27+j*.09,mainBase(u)+.025,v,.035,.011,.34,dull(0x85877d));}
  for(const [u,v,w,d] of [[108,-39.4,2.8,1.3],[149,-39.2,1.2,2.2],[175,-25,1.4,3.2],[92,-18,1.7,2.9],[60,5.4,1.5,3.1]]){box(out,u,TY+.055,v,w,.018,d,patch);for(const e of [-1,1])box(out,u+e*w/2,TY+.065,v,.023,.008,d,seam);}
  // Wall-mounted directions and utility details distinguish routes without new objective arrows.
  for(const [u,v,rot,txt,sub] of [[115.7,-31,Math.PI/2,'LANTERN VIDEO','DELIVERIES'],[156.2,-33.8,-Math.PI/2,'SUDS CITY','OPEN UNTIL 10 PM'],[188.45,-32,-Math.PI/2,'THE LYRIC','STAGE ENTRANCE']])wallFrame(out,u,TY+2.25,v,1.2,.42,txt,sub,rot);
  // Wet runoff stays near the wall line; route centers remain clean.
  const wet=new THREE.MeshStandardMaterial({color:0x484d4b,roughness:.3,metalness:.13});wet.userData.noShadow=true;
  for(const [u,v,s] of [[114,-35.5,1.1],[137,-33.4,1.6],[160,-37.7,.8],[191,-44.9,1.7]]){const m=new THREE.Mesh(new THREE.CircleGeometry(1,14),wet);m.rotation.x=-Math.PI/2;m.position.set(u,TY+.052,v);m.scale.set(s,.26+s*.12,1);out.add(m);}
 }

 // ---- Old Mill Road: porch fascia, mailboxes, curb seams and utility fittings.
 for(const H of CONN_HOUSES){const q=connAt(H.s,H.side*(H.set+H.d/2)),y=connY(H.s,H.side*H.set)+.1,g=new THREE.Group();g.position.set(q.x,y,q.z);g.rotation.y=-q.a+(H.side>0?Math.PI:0);world.add(g);
  const hh=H.kind==='foursquare'?5.8:H.kind==='cape'?3:3.1;
  for(const side of [-1,1])box(g,side*(H.w/2+.025),hh/2,H.d/2,.12,hh,.1,cream);
  box(g,0,hh+.01,H.d/2+.18,H.w+.6,.16,.12,cream);pipe(g,H.w/2-.1,.25,hh,H.d/2+.13);
  if(H.porch)for(const side of [-1,1]){box(g,side*H.w*.29,.59,H.d/2+.9,.8,.09,.42,timber(0x735e44));for(const dx of [-.31,.31])box(g,side*H.w*.29+dx,.29,H.d/2+.9,.05,.58,.32,iron);}
  const p=connAt(H.s+H.w*.45,H.side*(CONN_X.walk+.38)),mg=new THREE.Group();mg.position.set(p.x,connY(H.s,H.side*(CONN_X.walk+.38)),p.z);mg.rotation.y=-p.a+(H.side>0?Math.PI:0);world.add(mg);
  box(mg,0,.52,0,.095,1.04,.095,timber(0x82745e));K.rbox(mg,0,1.1,0,.26,.28,.43,.07,metal(0x626c66));box(mg,.143,1.13,.02,.013,.06,.14,paint(0x963d32));
 }
 // One modest community notice on the arrival side of town.
 wallFrame(BLD.vfw.group,5,1.9,.05,1.35,.85,'FRIDAY FISH FRY','EVERYONE WELCOME · 5–8 PM');
 // Intentional deterministic detail density, with no new runtime update loop.
 D.artStats={...stats,procedural:true,extraPointLights:0};
}
