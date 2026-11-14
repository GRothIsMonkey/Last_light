#!/bin/sh
# Run a native offscreen WebGL context, not a browser. Dependencies stay outside the repo.
set -eu
: "${RENDER_MODULES:?Set RENDER_MODULES to the optional gl/canvas dependency directory}"
export LD_LIBRARY_PATH="$RENDER_MODULES/sysroot/usr/lib/x86_64-linux-gnu${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
render_display=$(node -e "process.stdout.write(String(require('node:crypto').randomInt(100,6000)))")
"$RENDER_MODULES/sysroot/usr/bin/Xvfb" ":$render_display" -screen 0 1280x800x24 -nolisten unix -nolisten local -listen tcp -ac > "$RENDER_MODULES/xvfb-capture.log" 2>&1 &
render_xpid=$!
trap 'kill "$render_xpid" 2>/dev/null || true' EXIT
sleep 1
export DISPLAY="127.0.0.1:$render_display" LIBGL_ALWAYS_SOFTWARE=1
node --expose-gc tools/art-review/webgl-harness.mjs
