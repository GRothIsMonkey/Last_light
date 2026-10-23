// Original Chapter Five surface library. Metre-scaled, derivative-filtered patterns survive merged meshes;
// no downloaded textures, per-object shader variants, or changes to earlier chapters' shared materials.
import * as THREE from './three.module.js';
const TYPES={wood:0,paint:1,roof:2,stone:3,concrete:4,asphalt:5,gravel:6,fabric:7,metal:8};
const GLSL=`
varying vec3 vC5P; varying vec3 vC5N;
float c5h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float c5n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(c5h(i),c5h(i+vec2(1,0)),f.x),mix(c5h(i+vec2(0,1)),c5h(i+1.),f.x),f.y);}
vec2 c5uv(){vec3 n=abs(vC5N);return n.y>.65?vC5P.xz:(n.x>n.z?vC5P.zy:vC5P.xy);}
vec3 c5surface(vec2 q){float broad=c5n(q*.63),fine=c5n(q*31.0),aa=1.-smoothstep(.018,.09,length(fwidth(q)));float v=1.;float relief=0.;float age=c5n(q*2.1);
#if C5_KIND == 0 || C5_KIND == 1
 bool floorFace=abs(vC5N.y)>.65;vec2 p=floorFace?q.yx:q;float board=floor(p.x/.18);float seam=1.-smoothstep(.0015+fwidth(p.x),.005+fwidth(p.x),min(mod(p.x,.18),.18-mod(p.x,.18)));
 float bend=c5n(vec2(p.x*4.,p.y*.7));float grain=sin(p.x*540.+bend*17.+sin(p.y*2.4+board)*3.);
 float knots=exp(-length(vec2((mod(p.x+.09,.18)-.09)*13.,(mod(p.y+c5h(vec2(board,2.))*2.,2.)-1.)*4.)));
 v=(.88+.22*c5h(vec2(board,floor(p.y/2.8))))*(.93+.09*broad+.055*grain*aa)-knots*.12;
 relief=grain*.0007*aa-seam*.0015;v*=1.-seam*.18;
#if C5_KIND == 1
 float peel=smoothstep(.6,.76,c5n(q*19.)*.35+age*.65);v=mix(v*.91,1.15,peel*.7);relief+=peel*.0007;
#endif
#elif C5_KIND == 2
 float row=floor(q.y/.19);vec2 p=vec2(q.x+mod(row,2.)*.15,q.y);vec2 cell=vec2(.3,.19),f=mod(p,cell);float line=1.-smoothstep(.001,.005+length(fwidth(q)),min(f.x,f.y));
 v=.85+.22*c5h(floor(p/cell));v*=1.-line*.5;v*=.9+.15*broad+.13*(fine-.5)*aa;relief=-line*.002;
#elif C5_KIND == 3
 float row=floor(q.y/.25);vec2 p=vec2(q.x+mod(row,2.)*.24,q.y);vec2 f=mod(p,vec2(.48,.25));float mortar=1.-smoothstep(.009,.018,min(min(f.x,.48-f.x),min(f.y,.25-f.y)));
 v=.7+.45*c5h(floor(p/vec2(.48,.25)));v=mix(v,.54,mortar);v+=.17*(fine-.5)*aa;relief=(fine-.5)*.005*aa-mortar*.006;
#elif C5_KIND == 4
 v=.88+.16*broad+.13*(fine-.5)*aa;float pore=smoothstep(.74,.85,c5n(q*170.))*aa;v-=pore*.2;relief=-pore*.0015;
#elif C5_KIND == 5
 v=.86+.16*broad+.23*(fine-.5)*aa;float aggregate=smoothstep(.69,.85,c5n(q*95.))*aa;v+=aggregate*.15;relief=aggregate*.001;
#elif C5_KIND == 6
 float speck=c5n(q*23.);v=.91+.12*broad+.18*(speck-.5)*aa;relief=speck*.0012*aa;
#elif C5_KIND == 7
 float weave=sin(q.x*1500.)*sin(q.y*1500.);v=.94+.045*weave*aa+.06*age;relief=weave*.00015*aa;
#else
 v=.9+.1*broad+.05*fine;relief=(fine-.5)*.0004*aa;
#endif
 return vec3(v,relief,age);
}
`;
export function pineMaterial(color,kind='wood',extra={}){
 const material=new THREE.MeshStandardMaterial({color,roughness:kind==='metal'?.62:kind==='fabric'?1:.91,metalness:kind==='metal'?.45:0,...extra});
 material.userData.keep=true;material.userData.c5Surface=kind;
 material.onBeforeCompile=shader=>{
  shader.defines.C5_KIND=TYPES[kind]??0;
  shader.vertexShader='varying vec3 vC5P; varying vec3 vC5N;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  vec4 c5pos=vec4(position,1.);vec3 c5norm=normal;
  #ifdef USE_INSTANCING
  c5pos=instanceMatrix*c5pos;c5norm=mat3(instanceMatrix)*c5norm;
  #endif
  vC5P=(modelMatrix*c5pos).xyz;vC5N=normalize(mat3(modelMatrix)*c5norm);`);
  shader.fragmentShader=GLSL+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  vec3 c5s=c5surface(c5uv());diffuseColor.rgb*=c5s.x;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
  vec3 c5dp1=dFdx(-vViewPosition),c5dp2=dFdy(-vViewPosition);vec3 c5r1=cross(c5dp2,normal),c5r2=cross(normal,c5dp1);
  float c5det=dot(c5dp1,c5r1);vec3 c5grad=sign(c5det)*(dFdx(c5s.y)*c5r1+dFdy(c5s.y)*c5r2);
  normal=normalize(abs(c5det)*normal-c5grad);`);
 };
 material.customProgramCacheKey=()=>`c5-surface-v1-${kind}`;
 return material;
}
