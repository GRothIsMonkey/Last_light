"""Restore the original Sketchfab GLBs using Python 3 and the files beside this script."""

import argparse
import hashlib
import json
import os
import sys
import tempfile
from pathlib import Path


def filename(name):
    if not name or name in {".", ".."} or any(c in name for c in "/\\:"):
        raise ValueError(f"Invalid filename in manifest: {name!r}")
    return name


def restore(asset, source, destination):
    target = destination / filename(asset["name"])
    if target.exists():
        raise FileExistsError(f"{target} already exists. Choose an empty output folder.")
    digest = hashlib.sha256()
    with tempfile.NamedTemporaryFile(dir=destination, delete=False) as output:
        temporary = Path(output.name)
    try:
        with temporary.open("wb") as output:
            for part in asset["parts"]:
                path = source / filename(part["name"])
                part_hash = hashlib.sha256()
                with path.open("rb") as stream:
                    while True:
                        block = stream.read(1024 * 1024)
                        if not block:
                            break
                        output.write(block)
                        digest.update(block)
                        part_hash.update(block)
                    if stream.tell() != part["bytes"] or part_hash.hexdigest() != part["sha256"]:
                        raise ValueError(f"Damaged chunk: {path.name}")
            if output.tell() != asset["bytes"] or digest.hexdigest() != asset["sha256"]:
                raise ValueError(f"Reconstruction checksum mismatch: {target.name}")
        os.replace(temporary, target)
    finally:
        if temporary.exists():
            temporary.unlink()
    print(f"Verified {target.name}  {digest.hexdigest()}")


def main():
    source = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=source / "reconstructed")
    args = parser.parse_args()
    manifest = json.loads((source / "manifest.json").read_text(encoding="utf-8"))
    args.output.mkdir(parents=True, exist_ok=True)
    for asset in manifest["files"]:
        restore(asset, source, args.output)


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError) as error:
        sys.exit(str(error))
