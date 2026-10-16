#!/usr/bin/env python3
"""Fetch and normalize traceable, rights-checked Ruwaidix documentary stills.

The source manifest records the distinction between historical comparison and
modern editorial reconstruction. An unavailable asset is an error, not a
reason to silently substitute a fabricated photograph or unrelated manuscript.
"""
import argparse
import hashlib
import io
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/"assets"/"films"/"visual-source-register.json"
MAX_DOWNLOAD=14_000_000
HOSTS={"cdn.creativeclaw.co","commons.wikimedia.org","upload.wikimedia.org","iiif.wellcomecollection.org"}
HEADERS={"User-Agent":"RuwaidixResearchCinema/1.0 (editorial, educational, attribution on site; contact via https://malruweidi.github.io/)", "Accept":"image/jpeg,image/png,image/webp,image/*;q=0.7"}

def fetch(item, force=False):
    destination=(ROOT/item["path"]).resolve()
    if not destination.is_relative_to(ROOT):raise ValueError("Path outside repository")
    if destination.suffix.lower()!=".jpg":raise ValueError("Editorial stills are JPEG")
    if destination.is_file() and not force:
        with Image.open(destination) as im: im.verify()
        return {"path":item["path"],"bytes":destination.stat().st_size,"sha256":hashlib.sha256(destination.read_bytes()).hexdigest(),"cached":True}
    url=item["url"]
    parsed=urllib.parse.urlparse(url)
    if parsed.scheme!="https" or parsed.hostname not in HOSTS:
        raise ValueError("Unapproved direct source "+url)
    err=None
    for i in range(3):
        try:
            req=urllib.request.Request(url,headers=HEADERS)
            with urllib.request.urlopen(req,timeout=55) as r:
                final=urllib.parse.urlparse(r.url)
                if final.scheme!="https" or final.hostname not in HOSTS:
                    raise ValueError("Disallowed redirected image host "+r.url)
                data=r.read(MAX_DOWNLOAD+1)
                if len(data)>MAX_DOWNLOAD:raise ValueError("Image exceeds size bound")
            with Image.open(io.BytesIO(data)) as raw:
                raw.load()
                im=ImageOps.exif_transpose(raw).convert("RGB")
            if min(im.size)<480:raise ValueError("Insufficient image resolution")
            im.thumbnail((1920,1920),Image.Resampling.LANCZOS)
            destination.parent.mkdir(parents=True,exist_ok=True)
            im.save(destination,"JPEG",quality=86,optimize=True,subsampling=0)
            return {"path":item["path"],"bytes":destination.stat().st_size,"sha256":hashlib.sha256(destination.read_bytes()).hexdigest(),"source":r.url,"cached":False}
        except Exception as e:
            err=e
            if i<2: time.sleep(2+i*2)
    raise RuntimeError("Required, licensed historical/documentary still could not be fetched: "+item["id"]+" : "+str(err))

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--verify-only",action="store_true")
    ap.add_argument("--force",action="store_true")
    args=ap.parse_args()
    data=json.loads(MANIFEST.read_text())
    if len({i["id"] for i in data["assets"]})!=len(data["assets"]):
        raise ValueError("Duplicate visual identity")
    for item in data["assets"]:
        if not all(item.get(k) for k in ("id","path","url","type","license","credit","visual_description")):
            raise ValueError("Unattributed source image "+repr(item.get("id")))
        if args.verify_only:
            path=ROOT/item["path"]
            if not path.is_file():raise FileNotFoundError(path)
            with Image.open(path) as im: im.verify()
        else:
            print(json.dumps(fetch(item,args.force)),flush=True)
    if args.verify_only:print("All traced documentary images present and valid")

if __name__=="__main__":
    main()
