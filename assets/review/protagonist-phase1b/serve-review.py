"""Launch the local Last Light player benchmark. Pass --studio for the motion viewer."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--studio", action="store_true", help="Open the camera and action selector")
    mode.add_argument("--environment", action="store_true", help="Open the combined environment from the recovery archive")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[3]
    dist = (root / "combined-preview" if args.environment else root) / "dist"
    if not (dist / "assets" / "chr" / "chr.protagonist.a12.glb").is_file():
        parser.error("Keep the dist and assets folders together at the root of the extracted archive.")
    handler = partial(SimpleHTTPRequestHandler, directory=str(dist))
    with ThreadingHTTPServer(("127.0.0.1", 0), handler) as server:
        base = f"http://127.0.0.1:{server.server_port}"
        route = "/?player1b"
        if args.studio:
            route = "/player-1b-review.html"
        elif args.environment:
            route = "/?bikes&houses&vegetation&pavement&player1b"
        print(base + route, flush=True)
        webbrowser.open(base + route)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
