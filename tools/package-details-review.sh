#!/bin/bash
# Build the offline review ZIP of the neighborhood-details benchmark:
# - the whole game with every benchmark's models embedded (tools/package-playtest.mjs, PLAYTEST_MODELS=1);
# - DETAILS-README.txt, the report, the review gallery, and the credits and licences.
# It records the ZIP's name, size and SHA-256 in docs/qa/details/package.json (the report's §18 reads it).
#
#   bash tools/package-details-review.sh            # -> release/Last-Light-Prologue-Neighborhood-Details-Benchmark.zip
set -euo pipefail
cd "$(dirname "$0")/.."
NAME=Last-Light-Prologue-Neighborhood-Details-Benchmark
PKG=release/details-pkg
OUT=release/$NAME
rm -rf "$PKG" "$OUT" "release/$NAME.zip"
PLAYTEST_MENU=1 PLAYTEST_MODELS=1 node tools/package-playtest.mjs "$PKG"
mkdir -p "$OUT"
cp "$PKG/Last-Light-Playtest.html" "$PKG/manifest.json" "$PKG/THIRD_PARTY_ASSETS.md" "$PKG/THREE-LICENSE.txt" "$PKG/START-HERE.txt" "$OUT/"
cp tools/details-playtest-readme.txt "$OUT/DETAILS-README.txt"
cp docs/DETAILS_RECONSTRUCTION_REPORT.md "$OUT/"
cp assets/source/details/fonts/OFL-LICENSE.txt "$OUT/OVERPASS-OFL-LICENSE.txt"
python3 tools/blender/details/build_review_gallery.py docs/qa/details/browser/report.json "$OUT/review-gallery" \
  --blender docs/qa/details/blender --standalone --commit "$(git rev-parse --short HEAD)"
(cd release && rm -f "$NAME.zip" && zip -qr -X "$NAME.zip" "$NAME")
python3 - "$NAME" <<'EOF'
import hashlib, json, os, subprocess, sys
name = sys.argv[1]
z = os.path.join('release', name + '.zip')
h = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()
rec = {'zip': {'name': name + '.zip', 'bytes': os.path.getsize(z), 'sha256': h(z),
               'entrySha256': h(os.path.join('release', name, 'Last-Light-Playtest.html')),
               'builtFrom': subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD']).decode().strip(),
               'dirty': bool(subprocess.check_output(['git', 'status', '--porcelain', 'dist']).strip())}}
json.dump(rec, open('docs/qa/details/package.json', 'w'), indent=1)
print(json.dumps(rec))
EOF
