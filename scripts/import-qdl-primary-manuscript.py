#!/usr/bin/env python3
"""Import one SOURCE-VERIFIED public-domain Or 5786 folio via QDL IIIF v2.

Only stage the authentic folio as a standalone archival asset. Do NOT
automatically insert it into a film or assert copy-location, authorship or
pharmaceutical efficacy. Inspect source/rights before any visual reuse.
"""
import hashlib
import io
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
URL="https://www.qdl.qa/en/iiif/81055/vdc_100023441781.0x000001/manifest"
RECORD="https://www.qdl.qa/en/archive/81055/vdc_100023441781.0x000001"
DEST=ROOT/"assets/films/source-manuscripts"
IMAGE=DEST/"or-5786-1v-entire-folio.jpg"
PROVENANCE=DEST/"or-5786-1v.json"

def download(url,maxsize=27_000_000):
    host=urllib.parse.urlparse(url).hostname
    if not host or not (host=="qdl.qa" or host.endswith(".qdl.qa")):
        raise ValueError("Refusing unrelated IIIF image host: "+str(host))
    req=urllib.request.Request(url,headers={"User-Agent":"Ruwaidix academic-source-review/1.0","Accept":"application/json,image/jpeg,*/*"})
    with urllib.request.urlopen(req,timeout=40) as r:
        content=r.read(maxsize+1)
    if not content or len(content)>maxsize:raise ValueError("Malformed or excessive manuscript source download")
    return content

def get_manifest():
    for retry in range(3):
        try:
            d=json.loads(download(URL))
            if d.get("@type")!="sc:Manifest":raise ValueError("Unexpected IIIF presentation type")
            return d
        except Exception:
            if retry==2:raise
            time.sleep((retry+1)*2)

def main():
    manifest=get_manifest()
    canvases=manifest.get("sequences",[{}])[0].get("canvases",[])
    # Label must identify folio *1v* (not 11v, 21v, etc.) and the
    # canvas must follow QDL's own complete manuscript ordering.
    matches=[]
    for canvas in canvases:
        label=canvas.get("label","")
        if isinstance(label,dict):label=str(label.get("@value",""))
        if re.search(r"(?<!\d)1v(?!\d)",str(label),re.IGNORECASE):
            matches.append(canvas)
    if len(matches)!=1:
        raise ValueError("Cannot uniquely identify British Library Or 5786 folio 1v in QDL manifest, matches: "+str(len(matches)))
    canvas=matches[0]
    images=canvas.get("images",[])
    if len(images)!=1:raise ValueError("Unexpected manuscript folio image annotations")
    resource=images[0].get("resource",{})
    source=resource.get("@id")
    service=resource.get("service",{})
    if isinstance(service,list):service=service[0] if service else {}
    if not source and not service:raise ValueError("No source IIIF image")
    urls=[]
    if service.get("@id"):
        urls.append(service["@id"].rstrip("/")+"/full/!1600,1600/0/default.jpg")
    if source:urls.append(source)
    picture=None
    used=None
    failures=[]
    for candidate in urls:
        try:
            data=download(candidate)
            test=Image.open(io.BytesIO(data))
            test.load()
            test=ImageOps.exif_transpose(test).convert("RGB")
            if min(test.size)<800:raise ValueError("Insufficient resolution: "+str(test.size))
            picture=test
            used=candidate
            break
        except Exception as e:
            failures.append(str(e))
    if picture is None:raise RuntimeError("Could not retrieve a legible source folio: "+"; ".join(failures))
    # Contain without cropping, colorizing, rotating or synthesizing pixels.
    picture.thumbnail((1600,1600),Image.Resampling.LANCZOS)
    DEST.mkdir(parents=True,exist_ok=True)
    picture.save(IMAGE,format="JPEG",quality=90,subsampling=0,optimize=True)
    digest=hashlib.sha256(IMAGE.read_bytes()).hexdigest()
    record={
      "title":"Minhāj al-dukkān manuscript witness (entire folio 1v)",
      "manuscript":"British Library Or 5786",
      "folio":"1v",
      "repository":"British Library, digitized Qatar Digital Library",
      "iiif_manifest":URL,
      "canvas":canvas.get("@id"),
      "image_resource":used,
      "parent_collection":RECORD,
      "rights":"QDL item indicates Public Domain; retain attribution and observe ethical terms of reuse.",
      "purpose":"Uncropped archival witness for research/source review. Not necessarily the exact passage quoted in an article, nor an autograph or evidence of modern drug efficacy.",
      "dating":"Codex dated 715 AH / AD 1315–16 by colophon of third item, folio 139v; first treatise does not carry that independent date.",
      "width":picture.width,"height":picture.height,"sha256":digest,
      "publish_state":"STAGED - NOT EMBEDDED IN ANY VIDEO"
    }
    PROVENANCE.write_text(json.dumps(record,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("SOURCE-VERIFIED HISTORICAL FOLIO",IMAGE.name,record["width"],record["height"],digest)
if __name__=="__main__":
    main()
