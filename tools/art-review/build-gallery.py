"""Build a self-contained comparison from unretouched actual WebGL captures."""
import argparse,base64,html,json,pathlib,shutil
p=argparse.ArgumentParser();p.add_argument('--root',required=True);p.add_argument('--out',required=True);p.add_argument('--commit',required=True);p.add_argument('--linked',action='store_true');a=p.parse_args();root=pathlib.Path(a.root);out=pathlib.Path(a.out);out.parent.mkdir(parents=True,exist_ok=True)
shots=[
('skyline','Presence skyline','Colossal body, asymmetrical arches, hollow throat and the layered catastrophe sky.'),
('skyline-street','Presence above Oak Hollow','A street-level review angle shows the body against familiar houses and utility poles.'),
('surface-player','Surface arrival','The normal DEV arrival view. Looking toward the Presence remains the player’s choice.'),
('collapse','Buildings coming down','The existing across-street strike now also collapses two additional structures. The capture calls that same game effect.'),
('bunker','Construction gallery','Existing industrial dressing retained. This angle remains very dark; flashlight readability still needs human review.'),
('breach','Containment breach','Continuous tapered feelers and the immense organism beyond the chamber window.'),
('hunter-close','Hunter — close view','The actual Chapter Seven reveal, viewed closer to inspect its skull, mouth and skeletal anatomy.'),
('hunter','Retrieval predator','The integrated Astra hunter during the actual retrieval encounter. Its established mechanics remain.'),
('reunion','All four together','The preserved reunion room, boys and staging.'),
('jamie-death','Jamie — CPR','Existing CPR contacts, rebuilt adult surface detail and the devastated neighborhood around them.'),
('jamie-covered','Jamie — the coat','The coat is extended and draped over the body, keeping the sneakers visible.'),
('oak','The old oak','The same final location and story, with the landmark tree enlarged.'),
('oak-grief','Alex — the embrace','The existing death and embrace beat, preserving contact and grief acting.'),
('ride','The final bicycle ride','Chapter Eight’s ending remains. Natural sky returns, physical damage remains.'),
('ride-sam','Sam on the final ride','A close review view of the surviving boy during the ride.'),
('shelter-exterior','School evacuation exterior','More residents and family groups outside the existing emergency response.'),
('shelter-wide','Shelter — the gym','96 added background evacuees across the shelter spaces, supplementing the original actors.'),
('shelter-seated','Shelter — seated families','Occupied bleachers, family groups and economical background poses.'),
('shelter-grief','Jamie’s mother','Rebuilt adult face and hair, shaped mouth and the preserved grief scene.'),
('adult-face','Jamie’s porch','The adult face and exhausted posture at close range.'),
('september','September — damage persists','The same damaged lots survive into the escorted return.'),
('oak-barricade','The oak from the barricade','A broader, taller silhouette helps identify the distant landmark.'),
('vigil','Jamie’s vigil','The personal memorial, existing candle staging, improved adults and persistent surroundings.'),
('memorial','Alex’s memorial','The school memorial and photographed memories remain part of the integrated chapter.'),
('october','October — partial cleanup','Only two of the fifteen damaged shells are cleared; the others remain damaged.'),
('kitchen','The evening kitchen','Warmer localized evening light, a draped blanket and the existing moving conversation.'),
('packing','Packing the bedroom','The accepted room, keepsakes and packing choices remain.'),
('goodbye','The moving truck','An open cargo interior, furniture, boxes, rails, straps and a ramp.'),
('car','The road out','Cabin details include the radio, vents, gauges, headrests and handles.'),
('chapter7','Chapter Seven horror','The integrated hunter and established Chapter Seven scene remain in the full game.')]

def collect(stage):
 found={}
 for folder in sorted(root.glob('recovery-'+stage+'-*'),key=lambda p:p.stat().st_mtime):
  if folder.name=='recovery-after-final-hunter':continue
  m=folder/'manifest.json'
  if not m.exists():continue
  for row in json.loads(m.read_text()):
   f=folder/(row['name']+'.png')
   if f.exists():found[row['name']]=(f,row)
 return found
before,after=collect('before'),collect('after');cards=[];evidence=[]
for name,title,desc in shots:
 if name not in after:continue
 af,am=after[name];bf,bm=before.get(name,(None,None))
 if name=='hunter' and af.parent.name=='recovery-after-ch8':continue
 def source(f,stage):
  if a.linked:
   dest=out.parent/'review-images'/stage;dest.mkdir(parents=True,exist_ok=True);shutil.copy2(f,dest/f.name);return 'review-images/'+stage+'/'+f.name
  return 'data:image/png;base64,'+base64.b64encode(f.read_bytes()).decode()
 def fig(f,stage):
  if f is None:return '<div class="missing">No matching baseline capture.</div>'
  return '<figure><figcaption>'+stage.upper()+'</figcaption><img loading="lazy" alt="'+html.escape(title+' — '+stage)+'" src="'+source(f,stage)+'"></figure>'
 mode='Review camera' if am['reviewCamera'] else 'Player camera'
 cards.append('<article id="'+name+'"><div class="heading"><span>'+str(len(cards)+1).zfill(2)+'</span><h2>'+html.escape(title)+'</h2><small>'+mode+'</small></div><p>'+html.escape(desc)+'</p><div class="pair">'+fig(bf,'before')+fig(af,'after')+'</div><details><summary>Scene and rendering evidence</summary><p>DEV entry: <code>'+am['jump']+'</code>. Caption: '+html.escape(am.get('caption') or '(No caption at this moment.)')+'</p><p>Software WebGL, 1280 × 800; after: '+str(am['frames'][-1]['calls'])+' draw calls, '+format(am['frames'][-1]['triangles'],',')+' triangles, '+str(round(am['frames'][-1]['ms']))+' ms warm frame. This is CPU software rendering, not hardware FPS.</p></details></article>')
 evidence.append({'name':name,'before':bm,'after':am})
nav=''.join('<a href="#'+n+'">'+html.escape(t)+'</a>' for n,t,d in shots if n in after)
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Last Light — actual game before & after</title><style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#101111;color:#e9e6de;font:16px/1.55 system-ui,sans-serif}header,main,footer{max-width:1560px;margin:auto;padding:32px}header{padding-top:64px}h1{font-size:clamp(32px,5vw,68px);letter-spacing:-.05em;line-height:1.05;max-width:900px}h2{margin:0;font-size:23px;font-weight:550}p{max-width:1000px;color:#bdbdb6}.eyebrow{color:#eeb97e;font-size:12px;letter-spacing:.18em}.intro{font-size:20px;color:#d3cec1}.meta{padding:18px 22px;background:#191b1a;border-left:3px solid #bd7757;font-size:14px}nav{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0}nav a{color:#d1cbbd;text-decoration:none;border:1px solid #3a3e39;padding:5px 10px;border-radius:4px;font-size:12px}article{padding:30px 0 42px;border-top:1px solid #373a35;scroll-margin-top:10px}.heading{display:flex;align-items:baseline;gap:16px}.heading span{color:#c68b66;font-family:monospace}small{margin-left:auto;color:#8b9c95}.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0;background:#080909;border:1px solid #30352f}figcaption{padding:9px 14px;font-size:11px;letter-spacing:.16em;color:#c9c8bd}img{width:100%;height:auto;display:block}details{margin-top:14px;font-size:13px;color:#8f9b92}summary{cursor:pointer}code{overflow-wrap:anywhere}.missing{padding:40px;background:#191b19;color:#9c9d95}footer{font-size:13px;color:#979e96}@media(max-width:850px){header,main,footer{padding:22px}.pair{grid-template-columns:1fr}.heading{flex-wrap:wrap}small{margin-left:0;width:100%}}
</style><header><div class="eyebrow">LAST LIGHT · VISUAL RECOVERY</div><h1>The game, before & after.</h1><p class="intro">The catastrophe, its survivors, and the town they leave behind.</p><div class="meta">These are unretouched images from the actual shipped Three.js game renderer using software WebGL. They are not concept art or model turntables. Review cameras are labeled; browser HUD overlays are omitted.<br>Before: integrated Astra art + Claude Aftermath I, commit <code>567a562</code>. After: the visual recovery candidate; selected close-ups were recaptured after the final scalp/coat corrections. Final playable source: <code>'''+html.escape(a.commit)+'''</code>.<br>The preview browser could not initialize WebGL. Hardware performance, audio and a complete human playthrough remain unverified.</div><nav>'''+nav+'''</nav></header><main>'''+''.join(cards)+'''</main><footer>Full story preserved: Prologue through Chapter Eight and Aftermath I. The previous Astra character/hunter work is retained; not every pair represents a newly replaced asset. See VISUAL-RECOVERY-REPORT.md and QA-RESULTS.json for the scope and limits.</footer></html>'''
out.write_text(page);(out.parent/'capture-evidence.json').write_text(json.dumps(evidence,indent=2));print(json.dumps({'gallery':str(out),'scenes':len(cards),'paired':sum(n in before and n in after for n,_,_ in shots),'bytes':out.stat().st_size}))
