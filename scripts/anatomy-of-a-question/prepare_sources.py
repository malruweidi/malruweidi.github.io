#!/usr/bin/env python3
"""Stage verified documentary source media from the website's archive.

The action can use its own checked-out GitHub repository for archival images;
it fetches only the original clips that the website currently hosts externally.
Each file is verified against the exact local review master by SHA-256.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import time
import urllib.request
from pathlib import Path

HERE=Path(__file__).resolve().parent
MANIFEST=HERE/"source_assets.json"


def digest(path:Path)->str:
    h=hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda:f.read(1024*1024),b""):
            h.update(block)
    return h.hexdigest()


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--repo-root",type=Path,default=HERE.parent)
    parser.add_argument("--assets",type=Path,default=HERE/"assets")
    parser.add_argument("--record-local-hashes",action="store_true")
    args=parser.parse_args()
    data=json.loads(MANIFEST.read_text())
    args.assets.mkdir(parents=True,exist_ok=True)
    if args.record_local_hashes:
        for item in data["assets"]:
            f=args.assets/item["name"]
            if not f.is_file():raise FileNotFoundError(f)
            item["sha256"]=digest(f)
        MANIFEST.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
        print("Recorded",len(data["assets"]),"verified source hashes")
        return

    for item in data["assets"]:
        dest=args.assets/item["name"]
        expected=item.get("sha256")
        if not expected:raise RuntimeError("Missing pinned source checksum "+item["name"])
        if dest.exists() and digest(dest)==expected:
            print("Source cached",item["name"],flush=True)
            continue
        if "repo_path" in item:
            src=args.repo_root/item["repo_path"]
            if not src.is_file():raise FileNotFoundError(src)
            shutil.copy2(src,dest)
        elif "url" in item:
            err=None
            for retry in range(4):
                try:
                    req=urllib.request.Request(item["url"],headers={"User-Agent":"Ruwaidix-documentary/1.0"})
                    with urllib.request.urlopen(req,timeout=45) as resp,dest.open("wb") as f:
                        shutil.copyfileobj(resp,f)
                    err=None
                    break
                except Exception as exc:
                    err=exc
                    time.sleep(2**retry)
            if err:raise RuntimeError(f"Unable to fetch {item['name']}: {err}")
        actual=digest(dest)
        if actual!=expected:
            raise RuntimeError(f"Provenance mismatch for {item['name']}: {actual} != {expected}")
        print("Source verified",item["name"],flush=True)


if __name__=="__main__":main()
