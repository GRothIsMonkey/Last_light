// Chapter Three surface library. Detail is measured in metres and filtered with
// screen derivatives; it works on the existing world batches without UV seams.
export const artTime={value:0};
const library=`
float artHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float artNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(artHash(i),artHash(i+vec2(1,0)),f.x),mix(artHash(i+vec2(0,1)),artHash(i+1.),f.x),f.y);}
float artTri(vec3 p){vec3 w=pow(abs(vArtN),vec3(6.));w/=max(.001,w.x+w.y+w.z);return dot(w,vec3(artNoise(p.yz),artNoise(p.xz),artNoise(p.xy)));}
float artFade(float freq){return 1.-smoothstep(.4,1.6,length(fwidth(vArtP))*freq);}
vec3 artBump(vec3 n,float h){vec3 dx=dFdx(-vViewPosition),dy=dFdy(-vViewPosition);vec3 r1=cross(dy,n),r2=cross(n,dx);float det=dot(dx,r1);vec3 grad=sign(det)*(dFdx(h)*r1+dFdy(h)*r2);return normalize(abs(det)*n-grad);}
`;
const recipes={
 housepaint:`float weather=artNoise(vec2(vArtP.x+vArtP.z,vArtP.y*.2)*2.3);float grain=artTri(vArtP*75.);diffuseColor.rgb*=.94+.1*weather;artHeight=(grain-.5)*.0003*artFade(75.);`,
 roofgrain:`float grit=artTri(vArtP*64.);diffuseColor.rgb*=.9+.15*artTri(vArtP*1.3)+(grit-.5)*.12*artFade(64.);artHeight=(grit-.5)*.0014*artFade(64.);`,
 lawn:`float patches=artNoise(vArtP.xz*.31),mow=sin((vArtP.x+vArtP.z*.23)*1.5);float blades=artNoise(vArtP.xz*190.);diffuseColor.rgb*=.86+.19*patches+.018*mow;diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.10,.97,.78),smoothstep(.66,.83,patches)*.45);artHeight=(blades-.5)*.003*artFade(140.);`,
 culvert:`
 float broad=artTri(vArtP*.63),grain=artTri(vArtP*48.),grit=artTri(vArtP*135.);
 float pores=smoothstep(.71,.86,grain)*artFade(48.);
 float runoff=artNoise(vec2((vArtP.x+vArtP.z)*5.1,vArtP.y*.23));
 float damp=smoothstep(.48,.79,runoff)*(.25+.75*artTri(vArtP*.18));
 float board=(1.-smoothstep(.004,.019,abs(fract(vArtP.y*2.4)-.5)))*(.25+.75*artNoise(vArtP.xz*.7));
 float timber=artNoise(vec2((vArtP.x+vArtP.z)*1.8,vArtP.y*95.))*artFade(95.);
 diffuseColor.rgb*=.69+.42*broad+.10*(grain-.5)*artFade(48.);
 diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.59,.63,.55),damp*.55);
 diffuseColor.rgb*=1.-pores*.30-board*.07;
 artHeight=(grain-.5)*.0025*artFade(48.)-pores*.0018+timber*.0005;
 artRough=clamp(roughnessFactor-damp*.28,.4,1.);
 `,
 mineral:`float coarse=artTri(vArtP*6.),grain=artTri(vArtP*84.);diffuseColor.rgb*=.76+.33*coarse+(grain-.5)*.17*artFade(84.);artHeight=(grain-.5)*.002*artFade(84.);`,
 litter:`float broad=artTri(vArtP*.48),grain=artNoise(vArtP.xz*35.);vec2 cell=floor(vArtP.xz*18.);float leaf=artHash(cell);diffuseColor.rgb*=.58+.52*broad+(grain-.5)*.26*artFade(35.);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.28,1.05,.67),smoothstep(.68,.89,leaf)*.55*artFade(18.));artHeight=(grain-.5)*.009*artFade(35.);`,
 roadwear:`float roadPatch=artNoise(vArtP.xz*.65),grain=artNoise(vArtP.xz*130.);float grit=artNoise(vArtP.xz*46.);diffuseColor.rgb*=.75+.32*roadPatch+(grain-.5)*.32*artFade(130.)+(grit-.5)*.12*artFade(46.);artHeight=(grit-.5)*.0028*artFade(46.);`,
 timber:`vec2 uv=vec2(vArtP.x+vArtP.z,vArtP.y);float fibre=artNoise(uv*vec2(2.4,110.));float curl=artNoise(uv*2.7);float rings=sin(uv.y*85.+curl*9.);diffuseColor.rgb*=.79+.24*fibre+.05*rings*artFade(90.);artHeight=(fibre-.5)*.0005*artFade(110.);`,
 bark3:`float furrow=artNoise(vec2((vArtP.x+vArtP.z)*25.,vArtP.y*1.2));float flakes=artTri(vArtP*38.);diffuseColor.rgb*=.54+.60*furrow+(flakes-.5)*.16*artFade(38.);artHeight=(furrow-.5)*.009*artFade(25.);`,
 textile:`float weave=sin(vArtP.x*1100.)*sin(vArtP.z*1100.+vArtP.y*1100.);float lint=artTri(vArtP*150.);diffuseColor.rgb*=.91+.13*artTri(vArtP*5.)+(lint-.5)*.07*artFade(150.);artHeight=weave*.00013*artFade(180.);`,
 carpet:`float pile=artNoise(vArtP.xz*210.);float brushed=artNoise(vArtP.xz*vec2(.8,4.));diffuseColor.rgb*=.76+.29*brushed+(pile-.5)*.30*artFade(170.);artHeight=(pile-.5)*.0018*artFade(160.);`,
 plaster:`float fine=artTri(vArtP*125.);diffuseColor.rgb*=.97+.035*artTri(vArtP*1.1);artHeight=(fine-.5)*.00035*artFade(125.);`,
 oxidized:`float rust=artTri(vArtP*24.),pit=artTri(vArtP*98.);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.18,.071,.028),smoothstep(.55,.78,rust)*.6);artHeight=(pit-.5)*.0006*artFade(98.);artRough=mix(roughnessFactor,.96,smoothstep(.45,.7,rust));`,
 drainwater:`vec2 uv=vArtP.xz;float swirl=artNoise(uv*2.7+vec2(uArtTime*.025,0.));float a=sin(uv.x*17.+uv.y*11.+swirl*9.-uArtTime*.85),b=sin(uv.x*9.-uv.y*23.+swirl*13.+uArtTime*.62);float mud=artNoise(uv*3.8);diffuseColor.rgb*=.82+.22*mud;artHeight=(a*.7+b*.3)*.00065*artFade(23.);artRough=.43+.12*artNoise(uv*8.);`
};
export function artSurface(m,kind){
 if(!recipes[kind])return m;
 m.userData.surface=kind;m.userData.artSurface=true;
 const previous=m.onBeforeCompile,previousKey=m.customProgramCacheKey();
 m.onBeforeCompile=sh=>{
  previous.call(m,sh);
  sh.uniforms.uArtTime=artTime;
  sh.vertexShader='varying vec3 vArtP,vArtN;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvArtP=(modelMatrix*vec4(position,1.)).xyz;vArtN=normalize(mat3(modelMatrix)*normal);');
  sh.fragmentShader='varying vec3 vArtP,vArtN;uniform float uArtTime;\n'+sh.fragmentShader.replace('void main() {',library+'\nvoid main() {');
  // roughnessFactor exists immediately before the normal chunks in MeshStandardMaterial.
  sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nfloat artHeight=0.;float artRough=roughnessFactor;\n{'+recipes[kind]+'}\nnormal=artBump(normal,artHeight);roughnessFactor=artRough;');
 };
 m.customProgramCacheKey=()=>`chapter3-art-${kind}-2-${previousKey}`;m.needsUpdate=true;return m;
}
