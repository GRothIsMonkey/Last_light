// Two independently moving cloud decks with directional underlighting. Uses the sky's
// existing cloud() noise, so the offline build needs no remote textures or services.
export const catastropheSkyGLSL=`
 if(apoc>0.){
  float severity=smoothstep(.10,.96,apoc);
  vec3 heart=normalize(apocDir+vec3(0.,.34,0.));
  float toward=pow(max(dot(n,heart),0.),4.);
  float furnace=pow(max(dot(n,normalize(apocDir+vec3(0.,.12,0.))),0.),14.);
  vec2 farUV=n.xz/(max(n.y,.025)+.23)*vec2(2.2,3.4);
  vec2 nearUV=n.xz/(max(n.y,.025)+.14)*vec2(1.6,3.6);
  vec2 drift=vec2(apocT*.009,-apocT*.006);
  float warp=cloud(farUV*.63+drift);
  float farCloud=cloud(farUV+vec2(warp*1.7,-warp*.7)+drift);
  float nearCloud=cloud(nearUV+vec2(-drift.x*2.8,drift.y*1.4)+vec2(6.2,3.1));
  nearCloud=nearCloud*.78+cloud(nearUV*4.6-drift*3.1)*.22;
  float scallop=cloud(farUV*2.9+vec2(warp,apocT*.012));
  float distant=smoothstep(.28,.74,farCloud);
  float overhead=smoothstep(.40,.65,nearCloud)*smoothstep(.035,.30,h);
  float edge=exp(-abs(farCloud-.45)*22.)*(.45+.55*scallop);
  float horizon=1.-smoothstep(.015,.20,h);
  vec3 ember=mix(vec3(.19,.012,.018),vec3(.62,.062,.025),toward);
  vec3 abyss=vec3(.016,.012,.018);
  vec3 stormSky=mix(ember,abyss,distant*.85);
  stormSky+=vec3(.36,.10,.055)*edge*(.22+toward*.92);
  stormSky+=vec3(.74,.105,.024)*furnace*(.35+.65*(1.-distant));
  stormSky+=vec3(.18,.033,.016)*horizon;
  vec3 lowDeck=vec3(.018,.009,.014)+vec3(.11,.014,.015)*toward*scallop;
  stormSky=mix(stormSky,lowDeck,overhead*.94);
  float seam=pow(max(0.,1.-abs(farCloud-.48)*26.),3.)*toward*(1.-overhead);
  stormSky+=vec3(.56,.16,.10)*seam*.28;
  stormSky+=vec3(.44,.12,.10)*flash*(.15+.65*edge)*(1.-overhead*.7);
  col=mix(col,stormSky,severity);
 }
`;
