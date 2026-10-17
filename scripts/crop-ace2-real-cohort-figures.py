#!/usr/bin/env python3
"""Cut exact Figure 1, 2 and 3 panels from one verifiable 2022 published PDF.

Full original source pages and captions remain in the archive. Pixel crops
only enlarge existing published graphs; no replotting or statistical editing.
"""
import json,hashlib
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"assets/films/source-figures/ace2-covid-drugs-2022"
DEST=ROOT/"assets/films/source-figures/v3"
DOI="10.1080/08037051.2022.2055530"
# Verified by inspecting the complete 976x1270 source pages.
CROPS={
1:(187,70,796,452),  # Fig 1 dots with original caption in frame
2:(181,446,791,958), # Fig 2 class comparisons and original caption
3:(202,70,798,551)   # Fig 3 severity-by-therapy graph and caption
}
def main():
    meta=json.loads((SRC/"source-manifest.json").read_text(encoding="utf8"))
    if meta.get("doi")!=DOI:raise ValueError("Source DOI mismatch")
    if meta["license"].get("name")!="CC BY 4.0":raise ValueError("Licence changed")
    outputs=[]
    for number,coords in CROPS.items():
        rec=next((i for i in meta["figure_pages"] if i["figure"]==number),None)
        if not rec:raise ValueError("Required source caption/page not found")
        original=ROOT/rec["file"]
        if hashlib.sha256(original.read_bytes()).hexdigest()!=rec["sha256"]:
            raise ValueError("Original page bytes changed")
        with Image.open(original) as img:
            img=img.convert("RGB")
            if img.size!=(976,1270):raise ValueError("Source PDF page geometry changed; crop must be reviewed again")
            selected=img.crop(coords)
            if selected.width<500 or selected.height<350:raise ValueError("Cropped graph too small")
            DEST.mkdir(parents=True,exist_ok=True)
            target=DEST/f"ace2-covid-drugs-figure-{number:02d}.jpg"
            selected.save(target,"JPEG",quality=94,subsampling=0,optimize=True)
            outputs.append({
              "figure":number,"source_page":str(original.relative_to(ROOT)),"source_page_sha256":rec["sha256"],
              "pixel_crop":coords,"original_caption_and_axes_in_crop":True,
              "image_path":str(target.relative_to(ROOT)),
              "sha256":hashlib.sha256(target.read_bytes()).hexdigest(),
              "license":"CC BY 4.0; exact 2022 original paper",
              "source_doi":DOI,
              "scientific_boundary":"This is an observational clinical cohort, not a randomized intervention or causal medication recommendation."
            })
    (DEST/"ace2-covid-drugs-figure-crops.json").write_text(json.dumps({"doi":DOI,"figures":outputs},indent=2)+"\n")
    print("STAGED TRUE ACE2 CLINICAL PANELS",len(outputs))
if __name__=="__main__":main()
