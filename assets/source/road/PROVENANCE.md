# Pavement reconstruction — texture sources

Both sources are **CC0 1.0** (public domain dedication) photogrammetry from Poly Haven (https://polyhaven.com/license).
They are kept here exactly as downloaded (2K JPEG set: diffuse, OpenGL normal, roughness, displacement, AO), with the
Poly Haven API's `info.json` for each. The game never loads these files: `tools/materials/roads/build_pavement_textures.py`
turns them into the runtime textures in `dist/assets/pavement/` (see that tool's header for every operation).

| Id | Name | Author (Poly Haven credit) | Physical size | Page |
|---|---|---|---|---|
| `asphalt_07` | Asphalt 07 | Charlotte Baglioni | 2.5 m × 2.5 m | https://polyhaven.com/a/asphalt_07 |
| `gravel_concrete_04` | Gravel Concrete 04 | Dimitrios Savva | 2.0 m × 2.0 m | https://polyhaven.com/a/gravel_concrete_04 |

Download URLs: `https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/<id>/<id>_<map>_2k.jpg` with `<map>` one of
`diff`, `nor_gl`, `rough`, `disp`, `ao`. SHA-256 of every file: `SHA256SUMS` in this folder.

CC0 requires no attribution; the authors are credited anyway (docs/THIRD_PARTY_ASSETS.md).
