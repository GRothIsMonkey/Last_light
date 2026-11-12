"""Independent Mesa geometry renderer. Does not verify Three.js custom shaders."""
import os,sys,json
import numpy as np
import moderngl
from PIL import Image
file=sys.argv[1]; m=json.load(open(file+'.json')); w,h=1440,900
c=moderngl.create_standalone_context(backend='egl')
f=c.simple_framebuffer((w,h),components=4); f.use(); c.enable(moderngl.DEPTH_TEST|moderngl.BLEND)
c.blend_func=moderngl.SRC_ALPHA,moderngl.ONE_MINUS_SRC_ALPHA
p=c.program(vertex_shader='''#version 330
in vec3 pos;in vec3 normal;in vec3 color;uniform mat4 vp;out vec3 N;out vec3 P;out vec3 C;
void main(){gl_Position=vp*vec4(pos,1);N=normal;P=pos;C=color;}''',fragment_shader='''#version 330
in vec3 N;in vec3 P;in vec3 C;out vec4 frag;uniform vec3 eye,sunDir,sunColor,hemi,ground,fogColor,em;uniform float density,alpha,unlit;
uniform vec3 lp[12],lc[12];uniform float lr[12];uniform int nl;
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){vec3 n=normalize(N);if(!gl_FrontFacing)n=-n;vec3 l=mix(ground,hemi,n.y*.5+.5)*.45+sunColor*max(0.,dot(n,sunDir));
for(int i=0;i<nl;i++){vec3 d=lp[i]-P;float r=length(d);l+=lc[i]*max(dot(n,d/max(r,.01)),0.)*pow(max(0.,1.-r/lr[i]),2.)/(1.+r*r*.22);}
vec3 col=mix(C*l,C,unlit)+em;float dist=length(P-eye);col=mix(col,fogColor,1.-exp(-density*density*dist*dist));frag=vec4(pow(aces(col*1.16),vec3(1./2.2)),alpha);}''')
p['vp'].write((np.array(m['projection']).reshape(4,4).T@np.array(m['view']).reshape(4,4).T).T.astype('f4').tobytes());p['eye'].value=tuple(m['camera'])
sun=next((l for l in m['lights'] if l['type']=='sun'),{'dir':[.4,.8,.3],'color':[1,.86,.7],'intensity':1.8})
hemi=next((l for l in m['lights'] if l['type']=='hemi'),{'color':[.5,.6,.7],'ground':[.15,.12,.1],'intensity':1.2})
p['sunDir'].value=tuple(sun['dir']);p['sunColor'].value=tuple(np.array(sun['color'])*sun['intensity']);p['hemi'].value=tuple(np.array(hemi['color'])*hemi['intensity']);p['ground'].value=tuple(np.array(hemi['ground'])*hemi['intensity'])
fog=m['fog'] or {'color':[.025,.035,.045],'density':0};p['density'].value=fog['density'];p['fogColor'].value=tuple(fog['color'])
pts=sorted([l for l in m['lights'] if l['type']=='point'],key=lambda l:np.linalg.norm(np.array(l['pos'])-m['camera']))[:12];p['nl'].value=len(pts)
a=np.zeros((12,3),dtype='f4');b=a.copy();r=np.ones(12,dtype='f4')
for i,l in enumerate(pts):a[i]=l['pos'];b[i]=np.array(l['color'])*l['intensity'];r[i]=l['distance']
p['lp'].write(a.tobytes());p['lc'].write(b.tobytes());p['lr'].write(r.tobytes())
vbo=c.buffer(open(file+'.bin','rb').read());vao=c.vertex_array(p,[(vbo,'3f 3f 3f','pos','normal','color')])
f.clear(*[min(1,v**.45) for v in fog['color']],1)
for d in sorted(m['draws'],key=lambda d:d['opacity']<.99):
 p['em'].value=tuple(d['em']);p['alpha'].value=d['opacity'];p['unlit'].value=float(d['unlit']);vao.render(moderngl.TRIANGLES,vertices=d['count'],first=d['start'])
Image.frombytes('RGBA',(w,h),f.read(components=4)).transpose(Image.Transpose.FLIP_TOP_BOTTOM).convert('RGB').save(file+'.jpg',quality=92)
print(file+'.jpg')
