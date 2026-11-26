"""Encode the ordered captured JPEGs at the original game/review sampling rate."""
from pathlib import Path
import sys,bpy
root,out,*names=sys.argv[sys.argv.index('--')+1:]
out=Path(out).resolve();out.mkdir(exist_ok=True,parents=True)
for name in names:
    files=sorted((Path(root).resolve()/name).glob('*.jpg'))
    assert len(files)>14,name
    bpy.ops.wm.read_factory_settings(use_empty=True);sc=bpy.context.scene
    ed=sc.sequence_editor_create();s=ed.strips.new_image(name,str(files[0]),1,1)
    for f in files[1:]:s.elements.append(f.name)
    audio=files[0].parent/'game.wav'
    if audio.exists():
        ed.strips.new_sound('Game audio',str(audio),2,1)
        sc.render.ffmpeg.audio_codec='AAC';sc.render.ffmpeg.audio_bitrate=144
    s.frame_final_duration=len(files);sc.frame_start=1;sc.frame_end=len(files);sc.render.fps=15
    sc.render.resolution_x=800;sc.render.resolution_y=560;sc.render.resolution_percentage=100
    sc.view_settings.view_transform='Standard';sc.view_settings.look='None'
    sc.render.image_settings.media_type='VIDEO';sc.render.image_settings.file_format='FFMPEG'
    sc.render.ffmpeg.format='MPEG4';sc.render.ffmpeg.codec='H264';sc.render.ffmpeg.constant_rate_factor='LOW' if name=='full' else 'MEDIUM';sc.render.ffmpeg.ffmpeg_preset='GOOD'
    sc.render.filepath=str(out/(name+'.mp4'));bpy.ops.render.render(animation=True)
    print('ENCODED',name,len(files),flush=True)
