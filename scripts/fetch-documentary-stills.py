#!/usr/bin/env python3
"""Download, verify and permanently archive rights-registered source film images.

All retrieved files are declared in evidence-in-motion.json.visual_sources.
No image is silently substituted for evidence from an experiment or the cited
Cairo Genizah manuscript. Required imagery missing => stop the build.
"""
import argparse
import hashlib
import io
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image,ImageOps

ROOT=Path(__file__).resolve().parents[1]
FILMS=ROOT/"assets"/"films"
FILM_DATA=FILMS/"evidence-in-motion.json"
OUTPUT=FILMS/"visual-sources"
MAX_BYTES=16_000_000
HOSTS={"cdn.creativeclaw.co"}
HEADERS={"User-Agent":"Ruwaidix Film Research/1.0 (educational, credited, https://malruweidi.github.io/)", "Accept":"image/*"}

def fetch(src,force=False):
    path=(OUTPUT/src["asset"]).resolve()
    if not path.is_relative_to(OUTPUT.resolve()) or path.suffix!=".webp":raise ValueError("Bad documentary image destination")
    if path.is_file() and not force:
        with Image.open(path) as im:im.verify()
        return {"name":src["id"],"cached":True,"sha256":hashlib.sha256(path.read_bytes()).hexdigest()}
    uri=urllib.parse.urlparse(src["download_url"])
    if uri.scheme!="https" or uri.hostname not in HOSTS:raise ValueError("Untrusted host for "+src["id"])
    error=None
    for attempt in range(3):
        try:
            req=urllib.request.Request(src["download_url"],headers=HEADERS)
            with urllib.request.urlopen(req,timeout=45) as response:
                redirected=urllib.parse.urlparse(response.url)
                if redirected.scheme!="https" or redirected.hostname not in HOSTS:raise ValueError("Untrusted redirected image")
                data=response.read(MAX_BYTES+1)
            if len(data)>MAX_BYTES:raise ValueError("Image too large")
            with Image.open(io.BytesIO(data)) as original:
                original.load()
                image=ImageOps.exif_transpose(original).convert("RGB")
            if min(image.size)<400:raise ValueError("Image resolution too low for film context")
            image.thumbnail((1750,1750),Image.Resampling.LANCZOS)
            path.parent.mkdir(parents=True,exist_ok=True)
            image.save(path,"WEBP",quality=88,method=5)
            return {"name":src["id"],"bytes":path.stat().st_size,"sha256":hashlib.sha256(path.read_bytes()).hexdigest(),"cached":False}
        except Exception as e:
            error=e
            if attempt<2:time.sleep(3+attempt*2)
    raise RuntimeError("Required licensed documentary image unavailable: "+src["id"]+" "+str(error))

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--verify-only",action="store_true")
    p.add_argument("--force",action="store_true")
    args=p.parse_args()
    data=json.loads(FILM_DATA.read_text(encoding="utf8"))
    refs=data.get("visual_sources",[])
    ids=[x["id"] for x in refs]
    if len(ids)!=len(set(ids)) or not refs:raise ValueError("Need unique, credited image references")
    used={s["context_visual"] for f in data["films"] for s in f["scenes"] if s.get("context_visual")}
    if used-set(ids):raise ValueError("Unlicensed imagery referenced from a film")
    for src in refs:
        if not all(src.get(k) for k in ("id","asset","download_url","source_url","credit","license","caption","category")):
            raise ValueError("Incomplete license record: "+str(src.get("id")))
        if args.verify_only:
            file=OUTPUT/src["asset"]
            if not file.is_file():raise FileNotFoundError(file)
            with Image.open(file) as im:im.verify()
        else:
            print(json.dumps(fetch(src,args.force)),flush=True)
    print("Documentary asset provenance verified:",len(refs),"assets, referenced scenes:",len(used),flush=True)

if __name__=="__main__":main()
