"""Reopen every native master, inspect packed sources and evaluate all actions without saving."""
import bpy,json,sys,math,hashlib
from pathlib import Path
folder,path=sys.argv[sys.argv.index('--')+1:];folder=Path(folder).resolve();data={}
for key in ['jamie','sam','alex']:
    file=folder/key/(key+'-rig.blend');bpy.ops.wm.open_mainfile(filepath=str(file))
    rig=bpy.data.objects['FriendRig'];sc=bpy.context.scene;profile=json.loads(rig['friend_profile'])
    actions={};names=['Idle','Walk','Run','Cycle','Steer','StandPedal','Brake','Dismount','Wave','RideWave','Look','Smile','Talk','HandleBike']
    for n in names:
        ac=bpy.data.actions[n];rig.animation_data.action=ac;sc.frame_set(round(sum(ac.frame_range)/2))
        v=rig.pose.bones['hand_l'].matrix.translation
        assert all(math.isfinite(x) for p in rig.pose.bones for row in p.matrix for x in row)
        actions[n]=[int(i) for i in ac.frame_range]
    external=[im.name for im in bpy.data.images if im.source=='FILE' and im.users and not im.packed_file and im.filepath]
    assert not external,external
    files=sorted((folder/key/'renders').glob('*.png'));assert len(files)==10
    assert len(rig.pose.bones)==68 and len(profile['joints'])==68
    assert 'Bicycle • '+key in bpy.data.collections
    data[key]={'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'source':profile['source_sha256'],'bones':len(rig.pose.bones),'actionFrames':actions,'packedImages':[im.name for im in bpy.data.images if im.packed_file],'missing':external,'renders':[p.name for p in files]}
Path(path).write_text(json.dumps(data,indent=2),'utf8')
