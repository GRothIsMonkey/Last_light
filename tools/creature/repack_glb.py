# Repack the creature GLB for runtime: same JSON (geometry, skin, animation, material, asset metadata), the three PNG
# textures re-encoded as JPEG (base colour at 2048, occlusion/roughness/metalness and normal at 1024). Nothing else changes.
import sys,json,struct,io
from PIL import Image
src,dst=sys.argv[1],sys.argv[2]
f=open(src,'rb').read();o=12;chunks=[]
while o<len(f):
  cl,ct=struct.unpack('<I4s',f[o:o+8]);chunks.append((ct,f[o+8:o+8+cl]));o+=8+cl
j=json.loads(chunks[0][1]);B=chunks[1][1]
plan={0:(2048,88),1:(1024,90),2:(1024,94)}   # image index -> (size, jpeg quality)
newimg={}
for i,im in enumerate(j['images']):
  bv=j['bufferViews'][im['bufferView']];png=B[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']]
  size,q=plan[i];img=Image.open(io.BytesIO(png)).convert('RGB')
  if img.size!=(size,size):img=img.resize((size,size),Image.LANCZOS)
  out=io.BytesIO();img.save(out,'JPEG',quality=q,optimize=True,subsampling=0 if i else 2);newimg[im['bufferView']]=out.getvalue()
# rebuild BIN: keep every bufferView, replacing the image ones, 4-byte aligned
nb=bytearray()
for k,bv in enumerate(j['bufferViews']):
  data=newimg.get(k) or B[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']]
  while len(nb)%4:nb.append(0)
  bv['byteOffset']=len(nb);bv['byteLength']=len(data);nb+=data
while len(nb)%4:nb.append(0)
j['buffers'][0]['byteLength']=len(nb)
for im in j['images']:im['mimeType']='image/jpeg'
j['asset'].setdefault('extras',{})['lastLightRuntime']='Repacked for Last Light: textures re-encoded as JPEG (base colour 2048, ORM and normal 1024); geometry, skin, animation and material unchanged. Source: assets/source/creature/smily_horror_monster.glb'
js=json.dumps(j,separators=(',',':')).encode()
while len(js)%4:js+=b' '
total=12+8+len(js)+8+len(nb)
out=struct.pack('<4sII',b'glTF',2,total)+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(nb),b'BIN\x00')+bytes(nb)
open(dst,'wb').write(out);print('runtime glb',len(out),'bytes; images',[len(v) for v in newimg.values()])
