#!/usr/bin/env python3
"""Stage only two *originally unflagged* exact-paper RAAS figures (3 & 7).

Figure 1,2,4,5,6 of this same CC BY review credit adaptation/reproduction
from other authors; do not reuse these automatically. This importer verifies
the matching source DOI, exact JATS figure caption and checksum.
"""
import hashlib,io,json,urllib.request,urllib.parse
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
LEDGER=ROOT/"assets/films/source-figures/paper-audit/ace2-and-cerebral-cilia-figure-ledger.json"
OUT=ROOT/"assets/films/source-figures/ace2-original"
DOI="10.3390/ijms22136703"
FIGS=(3,7)
def get(url):
 p=urllib.parse.urlparse(url)
 if p.scheme!="https" or p.hostname not in ("www.mdpi.com","mdpi.com"):raise ValueError("Untrusted figure server")
 req=urllib.request.Request(url,headers={"Accept":"image/png,image/jpeg,*/*","User-Agent":"Ruwaidix-research-film-figure-audit/3.0"})
 with urllib.request.urlopen(req,timeout=35) as r:return r.read(12_000_000)
def main():
 data=json.loads(LEDGER.read_text())
 paper=next((x for x in data["papers"] if x["slug"]=="ace2-forms" and x["doi"]==DOI),None)
 if paper is None or not paper["article_license_ccby"]:raise ValueError("Source not verified CC BY")
 out={"paper":paper["title"],"doi":DOI,"source":"https://doi.org/"+DOI,
      "article_licence":"CC BY 4.0; figures 3 and 7 not marked reproduced in the paper's own captions",
      "warning":"This is source-based rights triage; scientific and legal human review still required",
      "figures":[]}
 for n in FIGS:
  figure=next((f for f in paper["figures"] if f["label"]==f"Figure {n}"),None)
  if not figure or figure["third_party_warning"]:raise ValueError(f"Figure {n} not safely flagged")
  root="https://www.mdpi.com/ijms/ijms-22-06703/article_deploy/html/images/"
  tries=[root+f"ijms-22-06703-g{n:03d}.{ext}" for ext in ("png","jpg","jpeg")]
  image=None;used=None
  for url in tries:
   try:
    original=Image.open(io.BytesIO(get(url)));original.load()
    if min(original.size)<350:raise ValueError("Too small")
    image=original.convert("RGB");used=url;break
   except Exception:pass
  if image is None:raise RuntimeError(f"Exact Figure {n} not retrievable from MDPI; no fallback to a different image.")
  OUT.mkdir(parents=True,exist_ok=True)
  path=OUT/f"ace2-forms-figure-{n:02d}.jpg"
  image.save(path,quality=92,subsampling=0,optimize=True)
  out["figures"].append({"figure_number":n,"caption":figure["caption"],"publisher_image_url":used,
    "archive_image":str(path.relative_to(ROOT)),"image_sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
    "presentation":"Original full figure; no replotting data axes or clipping source citations.",
    "disclosure":"Review article, not new experimental measurements."})
 (OUT/"source-provenance.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n")
 print("STAGED AUTHENTIC ORIGINAL ACE2 FIGURES 3 AND 7",flush=True)
if __name__=="__main__":main()
