// Main Street materials, isolated from the accepted surfaces in earlier chapters.
// Metre-scale detail is derivative filtered and survives the world's material batches.
const noise=`
float c4hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float c4noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(c4hash(i),c4hash(i+vec2(1,0)),f.x),mix(c4hash(i+vec2(0,1)),c4hash(i+1.),f.x),f.y);}
float c4fade(float f){return 1.-smoothstep(.35,1.4,length(fwidth(vC4P))*f);}
vec3 c4bump(vec3 n,float h){vec3 dx=dFdx(-vViewPosition),dy=dFdy(-vViewPosition),r1=cross(dy,n),r2=cross(n,dx);float d=dot(dx,r1);return normalize(abs(d)*n-sign(d)*(dFdx(h)*r1+dFdy(h)*r2));}
`;
const recipes={
 'c4-brick':`
 vec2 uv=vec2(abs(vC4N.z)>.5?vC4P.x:vC4P.z,vC4P.y);
 float row=floor(uv.y/.079);vec2 grid=vec2(uv.x/.245+mod(row,2.)*.5,uv.y/.079),f=fract(grid);
 float mortar=1.-smoothstep(.045,.11,min(f.x,1.-f.x));mortar=max(mortar,1.-smoothstep(.05,.14,min(f.y,1.-f.y)));mortar*=c4fade(12.);
 float tone=c4hash(floor(grid)),rough=c4noise(uv*73.),age=c4noise(uv*vec2(1.4,.23));
 diffuseColor.rgb*=.77+.35*tone+.11*c4noise(uv*2.1);
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.37,.345,.29),mortar*.6);
 diffuseColor.rgb*=1.-.16*smoothstep(.58,.86,age);
 h4=(1.-mortar)*.0019+(rough-.5)*.0008*c4fade(73.);`,
 'c4-stone':`
 vec2 uv=vec2(abs(vC4N.z)>.5?vC4P.x:vC4P.z,vC4P.y);float grain=c4noise(uv*62.);
 diffuseColor.rgb*=.9+.12*c4noise(uv*.8)+(grain-.5)*.1*c4fade(62.);h4=(grain-.5)*.001*c4fade(62.);`,
 'c4-road':`
 vec2 uv=vC4P.xz;float roadPatch=c4noise(uv*.23),grit=c4noise(uv*64.),grain=c4noise(uv*180.);
 diffuseColor.rgb*=.73+.30*roadPatch+(grit-.5)*.19*c4fade(64.)+(grain-.5)*.16*c4fade(160.);
 float seam=1.-smoothstep(.015,.045,abs(sin(uv.x*.19+uv.y*.43+c4noise(uv*1.1)*.2)));seam*=smoothstep(.6,.72,c4noise(uv*.11))*c4fade(12.);
 diffuseColor.rgb*=1.-seam*.4;h4=(grit-.5)*.0016*c4fade(64.)-seam*.001;`,
 'c4-walk':`
 vec2 uv=vC4P.xz;float grain=c4noise(uv*85.),dirt=c4noise(uv*.8),up=step(.7,abs(vC4N.y));
 vec2 f=fract(uv/1.45);float seam=1.-smoothstep(.002,.009,min(min(f.x,1.-f.x),min(f.y,1.-f.y)));seam*=c4fade(9.)*up;
 diffuseColor.rgb*=.87+.16*dirt+(grain-.5)*.12*c4fade(85.);diffuseColor.rgb*=1.-.3*seam;h4=(grain-.5)*.0006*c4fade(85.)-seam*.0016;`,
 'c4-carpet':`
 vec2 uv=vC4P.xz;float pile=c4noise(uv*180.),fiber=c4noise(uv*vec2(5.,.7));
 vec2 tile=fract(uv*.8);float motif=1.-smoothstep(.08,.14,abs(tile.x-.5)+abs(tile.y-.5));
 diffuseColor.rgb*=.86+.17*fiber+(pile-.5)*.27*c4fade(160.);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.3,1.19,.91),motif*.24*c4fade(5.));h4=(pile-.5)*.001*c4fade(160.);`,
 'c4-plaster':`
 vec2 uv=vec2(vC4P.x+vC4P.z,vC4P.y);float grain=c4noise(uv*92.);
 diffuseColor.rgb*=.94+.07*c4noise(uv*vec2(.9,.3));h4=(grain-.5)*.0006*c4fade(92.);`,
 'c4-tile':`
 vec2 uv=vC4P.xz;vec2 f=fract(uv*2.);float seam=1.-smoothstep(.008,.028,min(min(f.x,1.-f.x),min(f.y,1.-f.y)));seam*=c4fade(9.);
 float checker=mod(floor(uv.x*2.)+floor(uv.y*2.),2.);diffuseColor.rgb*=.84+.12*checker;diffuseColor.rgb*=1.-.22*seam;h4=-seam*.001;`
};
export function chapter4Surface(m,kind){
 const recipe=recipes[kind];if(!recipe)return m;m.userData.surface=kind;
 m.onBeforeCompile=sh=>{
  sh.vertexShader='varying vec3 vC4P,vC4N;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvC4P=(modelMatrix*vec4(position,1.)).xyz;vC4N=normalize(mat3(modelMatrix)*normal);');
  sh.fragmentShader='varying vec3 vC4P,vC4N;\n'+sh.fragmentShader.replace('void main() {',noise+'\nvoid main() {').replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nfloat h4=0.;{'+recipe+'}\nnormal=c4bump(normal,h4);');
 };
 m.customProgramCacheKey=()=>kind+'-astra-1';m.needsUpdate=true;return m;
}
