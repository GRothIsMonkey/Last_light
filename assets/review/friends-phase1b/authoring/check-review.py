"""Check the gallery links, decode its stills and inspect every MP4's real track tables."""
import sys,struct,json,hashlib
from pathlib import Path
from html.parser import HTMLParser
from PIL import Image,ImageStat
folder=Path(sys.argv[1]).resolve();out=Path(sys.argv[2])
class Links(HTMLParser):
    def handle_starttag(self,tag,attrs):
        for k,v in attrs:
            if k in ['src','href','poster'] and v and not v.startswith('#'):
                assert (folder/v).is_file(),v
def atoms(data,a,b):
    while a+8<=b:
        n,kind=struct.unpack_from('>I4s',data,a);d=a+8
        if n==1:n=struct.unpack_from('>Q',data,d)[0];d+=8
        if not n:n=b-a
        assert n>=d-a and a+n<=b,(a,n,b)
        yield kind,d,a+n
        a+=n
def sub(data,node,kind):
    return [(d,e) for k,d,e in atoms(data,*node) if k==kind]
checks={}
for p in sorted((folder/'footage').glob('*.mp4')):
    b=p.read_bytes();moov=sub(b,(0,len(b)),b'moov')[0];tracks=[]
    for track in sub(b,moov,b'trak'):
        mdia=sub(b,track,b'mdia')[0];handler=sub(b,mdia,b'hdlr')[0][0];kind=b[handler+8:handler+12].decode()
        info=sub(b,mdia,b'mdhd')[0][0];t=info+(20 if b[info] else 12)
        scale=struct.unpack_from('>I',b,t)[0];duration=struct.unpack_from('>Q' if b[info] else '>I',b,t+4)[0]/scale
        st=sub(b,sub(b,mdia,b'minf')[0],b'stbl')[0]
        fmt=sub(b,st,b'stsd')[0][0];codec=b[fmt+12:fmt+16].decode()
        sz=sub(b,st,b'stsz')[0][0];frames=struct.unpack_from('>I',b,sz+8)[0]
        tracks.append(dict(kind=kind,codec=codec,seconds=round(duration,3),samples=frames))
    v=next(t for t in tracks if t['kind']=='vide');assert v['codec']=='avc1' and v['samples']>100
    if p.stem=='full':assert v['samples']==4090
    if p.stem in ['full','group','alex-goodbye','jamie-goodbye','sam-goodbye']:assert any(t['kind']=='soun' and t['codec']=='mp4a' and abs(v['seconds']-t['seconds'])<.2 for t in tracks)
    checks[p.name]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'tracks':tracks}
assert len(checks)==9
images=[*folder.glob('*/renders/*.png'),folder/'four-friends.png',*folder.glob('evidence/lighting/*.jpg'),*folder.glob('evidence/stills/*.jpg')]
for p in images:
    with Image.open(p) as im:im.load();assert min(im.size)>=380 and sum(ImageStat.Stat(im.convert('RGB').resize((64,64))).var)>32,p
Links().feed((folder/'REVIEW.html').read_text('utf8'))
out.write_text(json.dumps({'decodedImages':len(images),'media':checks},indent=2),'utf8')
