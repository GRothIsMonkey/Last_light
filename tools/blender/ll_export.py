"""Last Light: the one glTF export used for every Blender asset that goes into the game.

Run it on any .blend (Blender 4.2 LTS or newer; checked here with Blender 5.0.1):

    blender path/to/asset.blend --background --python tools/blender/ll_export.py -- --out dist/assets/chr/chr.sam.a12.glb

or import it from another Blender script (build_pipeline_probe.py does) and call export_glb(path).

What it guarantees (docs/art/BLENDER-PIPELINE.md, "Export settings"):
  * glTF 2.0 binary (.glb), everything embedded; +Y up (Blender's Z-up converted by the exporter).
  * Metres. Object transforms must already be applied (scale 1, rotation 0); the checks below refuse otherwise.
  * Skins with at most 4 influences per vertex, every bone exported (non-deforming socket bones too), no leaf bones.
  * Shape keys as morph targets (with normals), shape-key animation exported and merged with the armature clip of the
    same name, every Action as its own clip (mode ACTIONS), sampled at the scene frame rate.
  * Images kept in their source format (PNG stays PNG, JPEG stays JPEG): colour maps may be JPEG, normal maps PNG.
  * Custom properties exported as glTF extras (asset id, version, licence).
  * Only the active scene; no cameras, no lights, no Draco (the game does not ship a Draco decoder).
"""
import sys, os

import bpy

EXPORT_SETTINGS = dict(
    export_format='GLB',
    export_yup=True,
    export_apply=False,             # modifiers other than Armature must be applied in the .blend; applying here drops shape keys
    export_texcoords=True,
    export_normals=True,
    export_tangents=True,           # normal-mapped materials get MikkTSpace tangents from Blender, not the shader's guess
    export_materials='EXPORT',
    export_image_format='AUTO',
    export_vertex_color='NONE' if 'export_vertex_color' in bpy.ops.export_scene.gltf.get_rna_type().properties else None,
    export_cameras=False,
    export_lights=False,
    export_extras=True,
    export_skins=True,
    export_influence_nb=4,
    export_all_influences=False,
    export_def_bones=False,         # keep socket_* bones (non-deforming) in the file
    export_leaf_bone=False,
    export_morph=True,
    export_morph_normal=True,
    export_morph_tangent=False,
    export_morph_animation=True,
    export_animations=True,
    export_animation_mode='ACTIONS',
    export_merge_animation='ACTION',  # an armature Action and a shape-key Action with the same name become one clip
    export_force_sampling=True,
    export_frame_step=1,
    export_anim_slide_to_zero=True,
    export_reset_pose_bones=True,
    export_optimize_animation_size=True,
    export_draco_mesh_compression_enable=False,
    use_selection=False,
    use_visible=False,
    use_renderable=False,
    use_active_scene=True,          # only the active scene ships: keep references and turnarounds in another scene
)


def _supported(settings):
    props = bpy.ops.export_scene.gltf.get_rna_type().properties
    out, dropped = {}, []
    for k, v in settings.items():
        if v is None:
            continue
        if k in props:
            out[k] = v
        else:
            dropped.append(k)
    return out, dropped


def preflight():
    """Refuse an export that would put the wrong scale or orientation into the game."""
    problems = []
    if abs(bpy.context.scene.unit_settings.scale_length - 1.0) > 1e-6:
        problems.append('scene unit scale must be 1.0 (metres)')
    for ob in bpy.context.scene.objects:   # what ships: the active scene only (REF scenes may hold untouched references)
        if ob.type not in {'MESH', 'ARMATURE', 'EMPTY'}:
            continue
        if ob.parent and ob.parent_type == 'BONE':
            continue  # sockets parented to bones keep their offset
        s, r = ob.scale, ob.rotation_euler
        if any(abs(x - 1) > 1e-4 for x in s):
            problems.append(f'{ob.name}: scale {tuple(round(x, 4) for x in s)} not applied (Ctrl+A > Scale)')
        if ob.rotation_mode in {'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX'} and any(abs(x) > 1e-4 for x in r):
            problems.append(f'{ob.name}: rotation not applied (Ctrl+A > Rotation)')
        if ob.type == 'MESH':
            for m in ob.modifiers:
                if m.type != 'ARMATURE':
                    problems.append(f'{ob.name}: modifier {m.name} ({m.type}) must be applied before export')
    return problems


def export_glb(path, strict=True, **overrides):
    problems = preflight()
    if problems and strict:
        raise SystemExit('ll_export: refusing to export:\n  ' + '\n  '.join(problems))
    settings, dropped = _supported({**EXPORT_SETTINGS, **overrides})
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=os.path.abspath(path), **settings)
    print(f'll_export: wrote {path} ({os.path.getsize(path)} bytes) with Blender {bpy.app.version_string}'
          + (f'; settings not in this Blender: {dropped}' if dropped else ''))
    return path


def _args():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    out = None
    for i, a in enumerate(argv):
        if a == '--out' and i + 1 < len(argv):
            out = argv[i + 1]
    return out


if __name__ == '__main__':
    out = _args()
    if not out:
        raise SystemExit('usage: blender file.blend --background --python tools/blender/ll_export.py -- --out <file.glb>')
    export_glb(out)
