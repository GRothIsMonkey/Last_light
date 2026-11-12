// The Presence: a colossal, arched nightmare organism. No eyes, human face or boss silhouette.
// Local origin is at ground level; the chapter owns placement, reveal, impact and sealing.
import * as THREE from './three.module.js';
import {mergeArt} from './astra-anatomy.js';
const V=p=>new THREE.Vector3(...p),UP=new THREE.Vector3(0,1,0);
function sweep(points,radii,sides=14,samples=48){const curve=new THREE.CatmullRomCurve3(points.map(V)),frames=curve.computeFrenetFrames(samples,false),p=[],co=[],ix=[];
 for(let i=0;i<=samples;i++){const u=i/samples,at=curve.getPoint(u),k=Math.min(radii.length-2,Math.floor(u*(radii.length-1))),t=u*(radii.length-1)-k,r=radii[k]+(radii[k+1]-radii[k])*t;for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,w=1+.045*Math.sin(a*5+u*73)+.027*Math.sin(u*149),q=at.clone().addScaledVector(frames.normals[i],Math.cos(a)*r*w).addScaledVector(frames.binormals[i],Math.sin(a)*r*w);p.push(...q);const shade=.66+.27*Math.max(0,Math.cos(a))+.055*Math.sin(u*37+a*4);co.push(shade,shade*.96,shade*.90);if(i<samples&&j<sides){const n=i*(sides+1)+j;ix.push(n,n+sides+1,n+1,n+1,n+sides+1,n+sides+2);}}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(co,3));g.setIndex(ix);g.computeVertexNormals();return g;}
export function presenceOrganism({sky=false}={}){
 const group=new THREE.Group();group.name='c8-presence-mass';group.userData.art='astra-colossal-organism';const pieces=[];
 const skin=new THREE.MeshStandardMaterial({color:sky?0x70675d:0x8b8172,vertexColors:true,roughness:.68,metalness:.035});skin.name='astra-presence-dermis';
 skin.onBeforeCompile=s=>{s.vertexShader='varying vec3 organismP;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\norganismP=position;');s.fragmentShader='varying vec3 organismP;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float stria=sin(organismP.z*125.+sin(organismP.x*42.)*3.)*sin(organismP.y*108.);
 diffuseColor.rgb*=.9+.12*stria;`);};skin.customProgramCacheKey=()=>'astra-presence-striae-v1';
 const put=(geo)=>pieces.push({geo,color:0xffffff});
 // Long back, narrow abdomen, neck drawn forward over the roofs.
 put(sweep([[0,.66,1.03],[0,.94,.56],[.02,1.03,.12],[.01,.84,-.34],[0,.65,-.76],[0,.55,-1.18]],[.07,.21,.235,.15,.085,.052],24,84));
 // Eight angular load-bearing limbs: close enough to anatomy to recognize, too long to accept.
 for(const s of [-1,1])for(let k=0;k<4;k++){
  const z=.68-k*.38,y=.86+Math.sin(k*.82)*.15,spread=.53+k*.07;
  put(sweep([[s*.13,y,z],[s*.34,y+.24-k*.035,z+.16],[s*spread,.64,z+.05],[s*(spread+.08),.29,z-.12],[s*(spread+.11),-.015,z-.27]],[.055,.048,.028,.019,.004],12,42));
  // Secondary tendon crossing the knee, making the joint feel loaded.
  put(sweep([[s*.22,y+.08,z],[s*(spread-.035),.63,z+.025],[s*(spread+.04),.35,z-.10]],[.015,.014,.004],8,24));
 }
 // Shell folds and vertebral ridges read as geological scale from the street.
 for(let k=0;k<13;k++){const z=.78-k*.115,y=.82+.19*Math.sin((k/12)*Math.PI);for(const s of [-1,1])put(sweep([[0,y+.12,z],[s*.10,y+.05,z-.032],[s*.19,y-.07,z-.045],[s*.17,y-.17,z-.06]],[.022,.018,.011,.003],8,22));
  put(sweep([[0,y+.03,z],[.012,y+.21,z+.04],[.008,y+.23,z+.085]],[.035,.016,.0015],8,16));}
 // Tapered vertical aperture: a folded, open end to the organism, not a skull.
 const outline=[[0,.71,-1.16],[-.065,.67,-1.24],[-.094,.50,-1.28],[-.073,.29,-1.30],[0,.03,-1.29],[.073,.29,-1.30],[.094,.50,-1.28],[.065,.67,-1.24],[0,.71,-1.16]];
 put(sweep(outline,[.028,.035,.028,.021,.013,.021,.028,.035,.028],14,80));
 for(const s of [-1,1]){put(sweep([[s*.10,.77,-.63],[s*.12,.70,-.88],[s*.074,.68,-1.17],[s*.036,.43,-1.28],[0,.03,-1.29]],[.043,.03,.022,.011,.003],12,52));}
 const body=new THREE.Mesh(mergeArt(pieces),skin);body.name='presence-arched-carapace';body.castShadow=body.receiveShadow=true;group.add(body);
 // Inset funnel gives parallax at the opening, and never emits light.
 const cp=[],idx=[],closed=outline.slice(0,-1);for(let ring=0;ring<4;ring++){const u=ring/3;for(const q of closed)cp.push(q[0]*(1-u*.84),.39+(q[1]-.39)*(1-u*.83),q[2]+u*.26);}
 for(let r=0;r<3;r++)for(let i=0;i<8;i++){const a=r*8+i,b=r*8+(i+1)%8;idx.push(a,b,a+8,b,b+8,a+8);}const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(cp,3));cg.setIndex(idx);cg.computeVertexNormals();
 const cavity=new THREE.Mesh(cg,new THREE.MeshStandardMaterial({color:0x070605,roughness:1,side:THREE.DoubleSide}));cavity.name='presence-aperture-depth';group.add(cavity);
 const throat=new THREE.Mesh(new THREE.CircleGeometry(.07,24),new THREE.MeshBasicMaterial({color:0x030302}));throat.position.set(0,.39,-.995);throat.scale.set(.6,1.7,1);throat.rotation.y=Math.PI;group.add(throat);
 return group;
}
