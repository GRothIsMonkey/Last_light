#!/usr/bin/env python3
"""Write the boot screen's preview stills into dist/index.html (between the BOOT-ART markers).

    python3 tools/title-art/boot-preview.py <summer.png> <search.png> <after.png>

Each input is a frame of the title art (dist/title-art.js) captured without the interface; each is reduced to a small
WebP and inlined, so the boot screen can show the title's picture, darkened, while the game loads (before any module).
"""
import sys, io, base64, re
from PIL import Image
moods = ('summer', 'search', 'after')
rules = []
for mood, path in zip(moods, sys.argv[1:4]):
    im = Image.open(path).convert('RGB').resize((640, 360), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=58, method=6)
    rules.append(f"body.boot-{mood} .boot-art{{background-image:url(data:image/webp;base64,{base64.b64encode(buf.getvalue()).decode()})}}")
block = ('<!-- BOOT-ART (tools/title-art/boot-preview.py): the title art, small, while the game loads -->\n'
         '<style>' + '\n'.join(rules) + '</style>\n'
         "<script>try{var m=localStorage.getItem('lastlight.titleMood');document.body.classList.add('boot-'+(/^(summer|search|after)$/.test(m||'')?m:'summer'));}catch(e){document.body.classList.add('boot-summer');}</script>\n"
         '<!-- /BOOT-ART -->')
p = 'dist/index.html'; s = open(p).read()
if '<!-- BOOT-ART' in s:
    s = re.sub(r'<!-- BOOT-ART.*?<!-- /BOOT-ART -->', lambda m: block, s, flags=re.S)
else:
    anchor = '<div id="boot" aria-hidden="true">'
    i = s.index(anchor); j = s.index('</div></div>', i) + len('</div></div>')  # (the boot block's end)
    s = s[:j] + '\n ' + block + s[j:]
open(p, 'w').write(s); print('boot previews written', len(block))
