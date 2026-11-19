"""Paths to the original Sketchfab files without bpy (rebuilt from the split parts on demand, manifest-verified)."""
import os
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
ORIGINALS = os.path.join(ROOT, 'assets', 'source', 'vegetation', 'third-party', 'sketchfab-originals')


def original(name):
    out = os.environ.get('LL_VEG_ORIGINALS') or os.path.join(ORIGINALS, 'reconstructed')
    p = os.path.join(out, name)
    if not os.path.exists(p):
        os.makedirs(out, exist_ok=True)
        for f in os.listdir(out):
            os.remove(os.path.join(out, f))
        subprocess.check_call([sys.executable, '-I', os.path.join(ORIGINALS, 'reconstruct.py'), '--output', out])
    return p
