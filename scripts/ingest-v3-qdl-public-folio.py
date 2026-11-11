#!/usr/bin/env python3
"""Stage the real QDL Or 5786 folio 31v only if publicly accessible.

Uses the publicly advertised IIIF image URL from QDL's own search result.
Never simulates a manuscript page or works around an HTTP 403 rejection.
"""
import hashlib,io,json,urllib.request
from pathlib import Path
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/"assets/films/v3/sources"
DIRECT="https://iiif.qdl.qa/iiif/images/81055/vdc_100023441781.0x000001/Or%205786_0071.jp2/full/%211200%2C1200/0/default.jpg"
CATALOG="https://www.qdl.qa/arabic/archive/81055/vdc_100024189448.0x000048"
CANONICAL="https://www.qdl.qa/en/archive/81055/vdc_100023441781.0x000001"
def main():
    with urllib.request.urlopen(DIRECT,timeout=45) as stream:
        data=stream.read(24_000_001)
        typ=stream.headers.get("Content-Type","")
    if len(data)>24_000_000 or len(data)<50000:raise ValueError("Not a plausible manuscript image")
    if "image/" not in typ:raise ValueError("Source response is not an image: "+typ)
    with Image.open(io.BytesIO(data)) as im:
        picture=ImageOps.exif_transpose(im).convert("RGB")
        if min(picture.size)<650:raise ValueError("Not a legible original folio")
        DEST.mkdir(parents=True,exist_ok=True)
        path=DEST/"Or5786-f31v-QDL-original.jpg"
        picture.save(path,"JPEG",quality=92,subsampling=0,optimize=True)
    metadata={"manuscript":"British Library Or 5786","folio":"31v","repository":"Qatar Digital Library / British Library",
      "exact_page_catalog":CATALOG,"collection":CANONICAL,"iiif_image_url":DIRECT,
      "license":"Public Domain according to QDL folio catalogue", "source_visual_status":"actual manuscript witness, NOT an identified syrup recipe passage",
      "sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
      "pixels":list(picture.size),"import_notice":"Authenticated against named shelfmark and folio path, not against manuscript textual content; show only as provenance context, not a highlighted julab quote."}
    (DEST/"Or5786-f31v-QDL-original.json").write_text(json.dumps(metadata,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("STAGED REAL FOLIO",picture.size,metadata["sha256"])
if __name__=="__main__":main()
