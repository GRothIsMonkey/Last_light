// Reference-led retrieval predator. Model-only adapter: navigation, damage and story remain in chapter7-hunter.js.
import * as THREE from './three.module.js';
import {artLoft,mergeArt} from './astra-anatomy.js';
const V=a=>new THREE.Vector3(...a),up=new THREE.Vector3(0,1,0);
export function buildHunter(){
 const g=new THREE.Group();g.name='astra-retrieval-predator';
 const skin=new THREE.MeshStandardMaterial({color:0x9c9274,roughness:.7,metalness:.015});skin.name='hunter-skin';
 skin.onBeforeCompile=s=>{s.vertexShader='varying vec3 fleshP;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfleshP=position;');s.fragmentShader='varying vec3 fleshP;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float fold=sin(fleshP.y*87.+sin(fleshP.x*37.)*2.)*sin(fleshP.z*49.+fleshP.x*53.);
 float vein=pow(max(0.,sin(fleshP.y*43.+fleshP.x*115.+sin(fleshP.z*72.))),16.);
 diffuseColor.rgb*=.91+.10*fold;diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.19,.14,.12),vein*.14);`);};skin.customProgramCacheKey=()=>'astra-hunter-dermis-v1';
 const dark=new THREE.MeshStandardMaterial({color:0x100c0a,roughness:1,side:THREE.DoubleSide});dark.name='hunter-socket';
 const gum=new THREE.MeshStandardMaterial({color:0x49362d,roughness:.6}),bone=new THREE.MeshStandardMaterial({color:0xc7b99a,roughness:.65}),nail=new THREE.MeshStandardMaterial({color:0x4c4231,roughness:.43});
 const ball=new THREE.SphereGeometry(1,24,18);
 const add=(parent,geo,m,name,p=[0,0,0],scale=[1,1,1],rot=[0,0,0])=>{const o=new THREE.Mesh(geo,m);o.name=name;o.position.set(...p);o.scale.set(...scale);o.rotation.set(...rot);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 const tube=(pts,r,m,parent=g,name='tendon')=>add(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V)),18,r,8),m,name);
 const seg=(r0,r1)=>artLoft([[0,r0*.78,r0*.70,0],[.09,r0,r0*.85,0],[.28,r0*.86,r0*.65,.009],[.60,(r0+r1)*.4,(r0+r1)*.32,.003],[.91,r1*.9,r1*.75,0],[1,r1,r1*.9,0]],20,3,2.2);
 const mesh=(geo,name)=>add(g,geo,skin,name);
 const S={thighL:mesh(seg(.093,.059),'thigh-l'),thighR:mesh(seg(.093,.059),'thigh-r'),shinL:mesh(seg(.059,.026),'shin-l'),shinR:mesh(seg(.059,.026),'shin-r'),footL:mesh(seg(.042,.025),'foot-l'),footR:mesh(seg(.042,.025),'foot-r'),upperL:mesh(seg(.074,.044),'upper-l'),upperR:mesh(seg(.074,.044),'upper-r'),foreL:mesh(seg(.047,.024),'fore-l'),foreR:mesh(seg(.047,.024),'fore-r'),spine:mesh(seg(.085,.16),'spine'),neck:mesh(seg(.090,.063),'neck'),pelvis:mesh(ball,'pelvis'),collarL:mesh(seg(.04,.06),'collar-l'),collarR:mesh(seg(.04,.06),'collar-r'),trapL:mesh(seg(.055,.04),'trap-l'),trapR:mesh(seg(.055,.04),'trap-r')};S.pelvis.scale.set(.17,.12,.14);
 const cage=artLoft([[-.40,.072,.063,.025],[-.30,.09,.07,.025],[-.22,.11,.08,.025],[-.16,.145,.11,.018],[-.07,.19,.13,0],[.06,.21,.15,0],[.16,.17,.13,0],[.23,.11,.09,0]],36,4,2.35),ribs=mesh(cage,'hollow-ribcage');
 // Raised, descending ribs continue around the flank; the sternum is a narrow keel.
 for(let k=0;k<7;k++)for(const s of [-1,1]){const y=.15-k*.049,w=.18-Math.max(0,k-3)*.017; tube([[s*.015,y-.025,-.13],[s*w*.68,y-.014,-.145],[s*w,y+.005,-.06],[s*w*.94,y+.024,.055],[s*.062,y+.033,.116]],.0085-k*.0004,skin,ribs,'subdermal-rib');}
 tube([[0,.17,-.139],[0,-.03,-.14],[0,-.19,-.085]],.013,skin,ribs,'sternum');
 for(let k=0;k<10;k++){const v=add(S.spine,ball,skin,'vertebra',[0,.06+k*.091,.075],[.044,.023,.045]);v.rotation.x=.18;}
 const blades=[-1,1].map(s=>{const b=mesh(ball,'shoulder-blade');b.scale.set(.07,.19,.038);b.userData.s=s;return b;});
 const joints=['elbowL','elbowR','kneeL','kneeR','shoulderL','shoulderR'].map(n=>{const j=mesh(ball,n);j.scale.setScalar(n.startsWith('sh')?.075:.047);j.scale.z*=.8;j.userData.n=n;return j;});
 const hand=s=>{const h=new THREE.Group();h.name='hand-'+s;g.add(h);add(h,artLoft([[0,.024,.014,0],[.04,.045,.021,0],[.095,.038,.018,0],[.12,.030,.012,0]],20,3,2.5),skin,'palm');const fingers=[];
  for(let k=0;k<5;k++){const thumb=k===4,x=thumb?s*.045:(k-1.5)*.024,l=thumb?.084:.125+(k===1?.025:0),f=new THREE.Group();f.position.set(x,thumb?.042:.105,0);f.rotation.z=thumb?s*.7:(k-1.5)*-.09;h.add(f);add(f,seg(.013,.009),skin,'finger-a',[0,0,0],[1,l,1]);const j=new THREE.Group();j.position.y=l;f.add(j);add(j,seg(.010,.006),skin,'finger-b',[0,0,0],[1,l*.72,1]);tube([[0,l*.67,0],[0,l*.85,.004],[0,l*.99,-.028]],.005,nail,j,'talon');add(f,ball,skin,'knuckle',[0,l,0],[.014,.013,.011]);fingers.push({f,j});}return{g:h,fingers};};
 const hands={l:hand(-1),r:hand(1)},head=new THREE.Group();head.name='head';g.add(head);
 // Broad cranium over a narrowing muzzle; real orbital hollows and a split nasal opening.
 const skull=add(head,artLoft([[-.064,.070,.070,-.106],[-.028,.112,.121,-.058],[.045,.148,.170,-.05],[.12,.145,.155,-.02],[.20,.092,.094,.005],[.225,.05,.051,.008],[.234,.001,.001,.01]],40,5,2.25),skin,'skull');
 const skullP=skull.geometry.attributes.position;for(let i=0;i<skullP.count;i++){const x=skullP.getX(i),y=skullP.getY(i),z=skullP.getZ(i);if(z<-.10)skullP.setZ(i,z+.044*Math.exp(-(((Math.abs(x)-.071)/.047)**2+((y-.067)/.043)**2)));}skull.geometry.computeVertexNormals();
 for(const s of [-1,1]){const cup=new THREE.CircleGeometry(1,32),cp=cup.attributes.position;for(let i=0;i<cp.count;i++){const x=cp.getX(i),y=cp.getY(i);cp.setXYZ(i,s*.071+x*.046,.067+y*.041,-.209+.035*(1-x*x-y*y));}cup.computeVertexNormals();add(head,cup,dark,'orbital-void');
  tube([[s*.024,.105,-.202],[s*.051,.127,-.212],[s*.095,.115,-.207],[s*.124,.072,-.17]],.012,skin,head,'orbital-arch');
  tube([[s*.125,.046,-.154],[s*.128,-.008,-.182],[s*.091,-.055,-.217]],.017,skin,head,'zygomatic-arch');
  add(head,ball,skin,'nasal-ridge',[s*.018,.002,-.218],[.018,.040,.027],[0,0,s*.12]);add(head,ball,dark,'nasal-slit',[s*.012,-.016,-.242],[.009,.019,.009],[0,0,s*.18]);}
 const palate=add(head,ball,dark,'open-palate',[0,-.044,-.159],[.088,.051,.040]);
 const jaw=new THREE.Group();jaw.position.set(0,-.019,-.065);head.add(jaw);
 tube([[-.11,.012,-.052],[-.103,-.076,-.11],[-.056,-.134,-.176],[0,-.15,-.186],[.056,-.134,-.176],[.103,-.076,-.11],[.11,.012,-.052]],.015,skin,jaw,'mandible');
 add(jaw,ball,dark,'throat',[0,-.09,-.080],[.071,.061,.036]);
 // Two irregular rows, leaning inward into a deep mouth instead of a decorative grin.
 for(let k=0;k<15;k++){const a=-1.25+k/14*2.5,x=Math.sin(a)*.084,z=-.14-Math.cos(a)*.086,l=.025+(k%4)*.006;const t=add(head,new THREE.ConeGeometry(.0065,l,7),bone,'upper-tooth',[x,-.049-l*.36,z]);t.rotation.x=Math.PI-.18;const lo=add(jaw,new THREE.ConeGeometry(.0058,l*.92,7),bone,'lower-tooth',[x*.95,-.123+l*.32,z+.055]);lo.rotation.x=.22;}
 for(const s of [-1,1])tube([[s*.11,.01,-.08],[s*.10,-.056,-.10],[s*.087,-.09,-.14]],.005,skin,jaw,'jaw-tendon');
 // Keep each articulated pivot, but combine its fixed surface details into one draw per material.
 // The populated streets use several hunters; teeth and ribs should not each cost a draw call.
 const batch=parent=>{const byMaterial=new Map();for(const m of [...parent.children])if(m.isMesh&&!m.children.length){if(!byMaterial.has(m.material))byMaterial.set(m.material,[]);byMaterial.get(m.material).push(m);}
  for(const [mat,meshes] of byMaterial)if(meshes.length>1){const geo=mergeArt(meshes.map(m=>{m.updateMatrix();return {geo:m.geometry,matrix:m.matrix};}));for(const m of meshes)parent.remove(m);add(parent,geo,mat,'hunter-fixed-details');}};
 const skinDetails=owner=>{const children=owner.children.filter(m=>m.isMesh&&m.material===owner.material&&!m.children.length);if(!children.length)return;const parts=[{geo:owner.geometry},...children.map(m=>{m.updateMatrix();return {geo:m.geometry,matrix:m.matrix};})];owner.geometry=mergeArt(parts);for(const m of children)owner.remove(m);};
 skinDetails(ribs);skinDetails(S.spine);batch(head);batch(jaw);for(const h of Object.values(hands))for(const f of h.fingers){batch(f.f);batch(f.j);}
 return {g,S,ribs,blades,joints,hands,head,jaw,skin};
}
