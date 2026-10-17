#!/usr/bin/env python3
"""Stage ORIGINAL Figure 1 from the exact open-access 2021 virus microfluidics REVIEW.

The published Figure 1 is a conceptual overview, NOT a device photo or
experimental performance result. No derivative multi-paper images are used.
"""
import hashlib,io,json,urllib.request
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/source-figures/v4/microfluidic-virus"
DOI="10.1007/s42247-021-00169-7"
LINK="https://link.springer.com/article/"+DOI
URLS=[
"https://media.springernature.com/full/springer-static/image/art%3A10.1007%2Fs42247-021-00169-7/MediaObjects/42247_2021_169_Fig1_HTML.png",
"https://media.springernature.com/lw685/springer-static/image/art%3A10.1007%2Fs42247-021-00169-7/MediaObjects/42247_2021_169_Fig1_HTML.png"]
def get(url):
    if not url.startswith("https://media.springernature.com/"):
        raise ValueError("Refuse nonpublisher illustration")
    req=urllib.request.Request(url,headers={"User-Agent":"Ruwaidix source-specific film verification/1.0","Accept":"image/png"})
    with urllib.request.urlopen(req,timeout=35) as r:
        if "image" not in r.headers.get("Content-Type",""):raise ValueError("Not image data")
        b=r.read(12_000_000)
    im=Image.open(io.BytesIO(b));im.load()
    if im.width<650 or im.height<260:raise ValueError("Publisher figure resolution too small")
    return im.convert("RGB"),url
def main():
    problems=[]
    for u in URLS:
        try:pic,url=get(u);break
        except Exception as e:problems.append(str(e))
    else:raise RuntimeError("Source Figure 1 unavailable: "+"; ".join(problems))
    OUT.mkdir(exist_ok=True,parents=True)
    image=OUT/"microfluidic-virus-figure-01.jpg"
    pic.save(image,quality=96,subsampling=0,optimize=True)
    record={
    "film":"microfluidic-virus",
    "doi":DOI,
    "exact_title":"Microfluidic-based virus detection methods for respiratory diseases",
    "authors":"Tarim et al. (2021), including Mahmoud Khatib A. A. Al-Ruweidi",
    "article":LINK,
    "source_image_url":url,
    "figure":"Figure 1",
    "caption":"Overview of microfluidic methods for detection of respiratory viruses: sample, sensing elements and optical/electrical/electrochemical signal.",
    "interpretation":"ORIGINAL REVIEW CONCEPT SCHEMATIC, NOT ACTUAL DEVICE PHOTO, PATIENT SAMPLE OR TRIAL DATA.",
    "license":"Open-access CC BY 4.0 for the article; Figure 1 caption lacks an explicit third-party exception, but retain original authors and DOI in the film.",
    "image":str(image.relative_to(ROOT)),
    "sha256":hashlib.sha256(image.read_bytes()).hexdigest(),
    "size":pic.size,
    "third_party_limitation":"Do not reuse other composite image panels from this review where credited to separate papers."
    }
    (OUT/"source-provenance.json").write_text(json.dumps(record,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("VERIFIED DOI FIGURE 1",record["size"],record["sha256"][:14])
if __name__=="__main__":main()
