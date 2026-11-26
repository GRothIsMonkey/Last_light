"""Inspect actual GLB containers and their embedded animation and image bytes."""
from pathlib import Path
import sys,json,struct,hashlib
from PIL import Image
import io
root=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]);rows={}
for k in ['jamie','sam','alex','protagonist']:
    f=root/'dist/assets/chr'/('chr.'+k+'.a12.glb');data=f.read_bytes()
    magic,version,length,n,kind=struct.unpack_from('<4s4I',data)
    assert magic==b'glTF' and version==2 and length==len(data)
    d=json.loads(data[20:20+n]);binary=data[28+n:]
    def view(b):return d['bufferViews'][b]
    def array(a):return d['accessors'][a]
    tris={m['name']:sum(array(p['indices'])['count']//3 for p in m['primitives']) for m in d['meshes']}
    animationViews={array(s[attr])['bufferView'] for a in d['animations'] for s in a['samplers'] for attr in ['input','output']}
    imgs=[]
    for im in d['images']:
        v=view(im['bufferView']);start=v.get('byteOffset',0);im2=Image.open(io.BytesIO(binary[start:start+v['byteLength']]));im2.load()
        imgs.append({'size':im2.size,'bytes':v['byteLength'],'format':im2.format,'rgba8MipmappedEstimate':int(im2.width*im2.height*4*4/3)})
    actions=[a['name'] for a in d['animations']]
    if k!='protagonist':assert len(tris)==3 and len(actions)==14 and len(d['skins'])==1 and len(d['skins'][0]['joints'])==68
    rows[k]={'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'tris':tris,'joints':len(d['skins'][0]['joints']),'actions':actions,'animationBufferBytes':sum(view(v)['byteLength'] for v in animationViews),'textures':imgs}
out.write_text(json.dumps(rows,indent=2),'utf8')
