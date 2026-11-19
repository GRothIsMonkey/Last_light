from pathlib import Path
import sys
import math
import bpy
from mathutils import Vector

import os
root=Path(__file__).resolve().parent
jamie_path,sam_path,alex_path=[root/'models'/n/('chr.'+n+'.a12.blend') for n in ('jamie','sam','alex')]
out=root/'comparison'

out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.name='Same-scale neutral studio'
scene.unit_settings.system='METRIC'
scene.unit_settings.scale_length=1.0

def load_character(path,name):
    with bpy.data.libraries.load(str(path),link=False) as (library,loaded):
        loaded.collections=[c for c in library.collections if c[:2] in {'01','02','03','04','05'}]
    anchor=bpy.data.objects.new(name+' • translation only',None)
    scene.collection.objects.link(anchor)
    for collection in loaded.collections:
        scene.collection.children.link(collection)
        for ob in collection.objects:
            if ob.parent is None:ob.parent=anchor
            for mod in ob.modifiers:
                if mod.name=='Evening portrait stance':mod.strength=0
            shapes=getattr(ob.data,'shape_keys',None)
            if shapes:
                for key in list(shapes.key_blocks)[1:]:key.value=0
    assert tuple(anchor.scale)==(1,1,1)
    return anchor

jamie=load_character(jamie_path,'Jamie')
sam=load_character(sam_path,'Sam')
alex=load_character(alex_path,'Alex')

def look_at(obj,point):
    obj.rotation_euler=(Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()

def sun(name,direction,color,energy,angle):
    data=bpy.data.lights.new(name,'SUN')
    data.color=color;data.energy=energy;data.angle=math.radians(angle)
    ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob)
    ob.location=direction;look_at(ob,(0,0,0))

# Directional sources give the same incident direction and intensity at all three X positions.
sun('Window key',(-2.2,-3.2,3.4),(1,.93,.86),1.62,34)
sun('Sky fill',(2.8,-1.5,1.6),(.78,.88,1),.49,45)
sun('Soft backlight',(1.2,1.8,2.5),(1,.92,.83),1.24,31)
sun('Small eye light',(-.3,-3,1.3),(1,.94,.88),.20,7)
world=bpy.data.worlds.new('Common studio sky');world.use_nodes=True;scene.world=world
background=world.node_tree.nodes['Background'];background.inputs[0].default_value=(.60,.65,.67,1);background.inputs[1].default_value=.46
# Keep the neutral backdrop separate from the shared illumination.
nodes=world.node_tree.nodes;links=world.node_tree.links
back=nodes.new('ShaderNodeBackground');back.inputs[0].default_value=(.185,.210,.194,1);back.inputs[1].default_value=.83
path=nodes.new('ShaderNodeLightPath');mix=nodes.new('ShaderNodeMixShader')
links.new(path.outputs['Is Camera Ray'],mix.inputs[0]);links.new(background.outputs[0],mix.inputs[1]);links.new(back.outputs[0],mix.inputs[2]);links.new(mix.outputs[0],nodes.get('World Output').inputs[0])
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.002))
floor=bpy.context.object;floor.name='Common ground'
mat=bpy.data.materials.new('Neutral grey studio floor');mat.diffuse_color=(.20,.23,.21,1);mat.use_nodes=True
p=mat.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=mat.diffuse_color;p.inputs['Roughness'].default_value=.96
floor.data.materials.append(mat)

camera_data=bpy.data.cameras.new('Matched orthographic lens')
camera_data.type='ORTHO';camera=bpy.data.objects.new('Matched orthographic camera',camera_data);scene.collection.objects.link(camera);scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=64;scene.cycles.use_denoising=True;scene.cycles.transparent_max_bounces=8
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
scene.view_settings.exposure=.63
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB';scene.render.resolution_percentage=100
prefs=bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type='OPTIX';prefs.refresh_devices()
    for d in prefs.devices:d.use=d.type=='OPTIX'
    if any(d.use for d in prefs.devices):scene.cycles.device='GPU'
except (ValueError,RuntimeError):pass


draft=os.environ.get('LL_REVIEW_DRAFT')=='1'
if draft:
    out=root/'previews'/'comparison'
out.mkdir(parents=True,exist_ok=True)
ids=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
shots=[
 ('01-front',0,.565,2.35,.777,1584,1160,.18,'all'),
 ('02-side',-90,.565,2.35,.777,1584,1160,.18,'all'),
 ('03-three-quarter',-32,.565,2.35,.777,1584,1160,.18,'all'),
 ('04-faces',-7,.25,.792,1.397,1700,780,.014,'all'),
 ('05-alex-waves',-30,0,.36,1.443,1120,998,1.05,'alex'),
 ('06-alex-polo-and-shorts',-23,0,.945,.924,1010,1200,.25,'alex'),
 ('07-sam-hair',-32,0,.350,1.410,1140,980,1.74,'sam'),
]
for stem,yaw,spacing,scale,z,w,h,rise,who in shots:
    if ids and stem[:2] not in ids:continue
    for character,anchor,pos in [('jamie',jamie,-1),('sam',sam,0),('alex',alex,1)]:
        anchor.location=(pos*spacing if who=='all' else (0 if character==who else (pos-2)*12),0,0)
        anchor.rotation_euler.z=math.radians(yaw)
    camera.location=(0,-4.5,z+rise);look_at(camera,(0,0,z));camera_data.ortho_scale=scale
    scene.render.resolution_x=w;scene.render.resolution_y=h
    scene.render.resolution_percentage=50 if draft else 100
    scene.cycles.samples=12 if draft else 60
    scene.render.filepath=str(out/(stem+'.png'))
    bpy.context.view_layer.update()
    print('SHOT',stem,flush=True);bpy.ops.render.render(write_still=True)
