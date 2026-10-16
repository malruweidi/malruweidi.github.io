#!/usr/bin/env python3
"""Safely snapshot legally reviewed contextual imagery before rendering.
Downloaded context remains visually and semantically separated from authentic experiments.
"""
import hashlib
import io
import json
import os
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps, UnidentifiedImageError

ROOT=Path(__file__).resolve().parents[1]
FILMS=ROOT/"assets"/"films"
DATA=FILMS/"evidence-in-motion.json"
OUTPUT=FILMS/"visual-sources"
HOST="https://cdn.creativeclaw.co/"
MAX_DOWNLOAD=18_000_000

def snapshot():
    doc=json.loads(DATA.read_text(encoding="utf-8"))
    sources=doc.get("visual_sources",[])
    if not sources: raise ValueError("No contextual visual sources in manifest")
    ids={s["id"] for s in sources}
    if len(ids)!=len(sources):raise ValueError("Non-unique visual source IDs")
    OUTPUT.mkdir(parents=True,exist_ok=True)
    catalog=[]
    for source in sources:
        name=source["asset"]
        if "/" in name or "\\" in name or not name.endswith(".webp"):
            raise ValueError("Unsafe image filename: "+name)
        url=source["download_url"]
        if not url.startswith(HOST):
            raise ValueError("Unapproved image download host: "+url)
        if not source.get("license") or not source.get("source_url") or len(source.get("credit",""))<40:
            raise ValueError("Missing rights and documentary provenance: "+name)
        dest=OUTPUT/name
        if dest.exists():
            data=dest.read_bytes()
        else:
            request=urllib.request.Request(url,headers={"User-Agent":"RuwaidixEvidenceFilm/1.0"})
            with urllib.request.urlopen(request,timeout=35) as response:
                if response.status!=200:raise RuntimeError("Photo unavailable "+url)
                data=response.read(MAX_DOWNLOAD+1)
            if len(data)>MAX_DOWNLOAD or len(data)<2500:
                raise RuntimeError("Invalid downloaded photo dimensions/bytes "+name)
        try:
            with Image.open(io.BytesIO(data)) as img:
                if img.format not in ("JPEG","PNG","WEBP"):
                    raise ValueError("Unexpected photo type "+name)
                img=ImageOps.exif_transpose(img).convert("RGB")
                if img.width<500 or img.height<350:
                    raise RuntimeError("Insufficient resolution for a film cutaway: "+name)
                img.thumbnail((2100,1650),Image.Resampling.LANCZOS)
                from tempfile import NamedTemporaryFile
                with NamedTemporaryFile(dir=OUTPUT,suffix=".webp",delete=False) as tmp:
                    temporary=Path(tmp.name)
                try:
                    img.save(temporary,format="WEBP",quality=87,method=5)
                    os.replace(temporary,dest)
                finally:
                    temporary.unlink(missing_ok=True)
        except UnidentifiedImageError as error:
            raise RuntimeError("Invalid image download "+name) from error
        fixed=dest.read_bytes()
        with Image.open(dest) as im:
            width,height=im.size
        record={k:v for k,v in source.items() if k!="download_url"}
        record.update({"local_path":"/assets/films/visual-sources/"+name,
                       "sha256":hashlib.sha256(fixed).hexdigest(),
                       "bytes":len(fixed),"dimensions":[width,height],
                       "display_note":"This image provides context, not experimental results or primary evidence of the described event."})
        catalog.append(record)
        print(name,len(fixed),"bytes",width,"x",height,flush=True)
    (OUTPUT/"visual-source-provenance.json").write_text(json.dumps({
         "method":"Each online image is snapshotted locally with original link and full license/credit. Context photos are visually labeled; original research records are retained.",
         "images":catalog},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")

if __name__=="__main__":
    snapshot()
