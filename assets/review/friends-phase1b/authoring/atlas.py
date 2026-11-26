from PIL import Image
from pathlib import Path
import sys
folder=Path(sys.argv[1]);atlas=Image.new('RGB',(1024,1024),'white')
for suffix,rect in [('portrait-color',(0,0,640,640)),('ocular-color',(640,0,1024,192)),('summer-skin',(640,192,1024,576)),('cotton-weave',(0,640,384,1024))]:
    tex=next((folder/'textures').glob('*__'+suffix+'.png'))
    image=Image.open(tex).convert('RGB').resize((rect[2]-rect[0],rect[3]-rect[1]),Image.Resampling.LANCZOS)
    atlas.paste(image,rect)
atlas.save(folder/'textures'/'game-atlas.jpg',quality=93,subsampling=0)
