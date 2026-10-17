#!/usr/bin/env python3
"""Import verified FIGURES from the actual 2020 antimicrobial PLA-scaffold paper.

Source is a university's open-access CC BY publisher PDF; never take pixels
from the distinct 2021 PLA film/aluminium peel paper. Hand-reviewed geometric
clips correspond to the original PDF's own indexed printed figures/tables.
Clip coordinates are normalized PDF-page coordinates; no plot reconstruction.
"""
import hashlib,json,re,urllib.request
from pathlib import Path
import fitz
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/source-figures/v4/pla-scaffolds"
DOI="10.1016/j.surfcoat.2020.126216"
URLS=[
 "https://m.publikace.k.utb.cz/bitstream/handle/10563/1009831/Fulltext_1009831.pdf?isAllowed=y&sequence=1",
 "https://publikace.k.utb.cz/bitstream/handle/10563/1009831/Fulltext_1009831.pdf?sequence=1",
]
# page index; cropped figure contains only pixels from the correct printed page.
CLIPS=[
 ("figure-01-electrospinning-plasma",1,(.098,.068,.931,.413),"Figure 1","Fabrication schematic; electrospinning, plasma and ascorbic/fumaric grafting"),
 ("figure-05-sem",4,(.143,.454,.870,.973),"Figure 5","SEM: untreated/plasma/ASA/FA grafting; retain all four original 3 μm scale bars"),
 ("figure-06-afm",6,(.110,.059,.926,.564),"Figure 6","AFM micrographs, measured roughness; original scale bars intact"),
 ("figure-07-ftir",7,(.521,.065,.967,.387),"Figure 7","Original FTIR-ATR spectrum: six explicitly labelled sample traces"),
 ("table-03-antibacterial",9,(.057,.765,.521,.973),"Table 3","Actual ordinal bacterial-colony ratings from three replicates per group")
]

def pdf():
    errors=[]
    for url in URLS:
        try:
            req=urllib.request.Request(url,headers={"User-Agent":"Ruwaidix-authentic-article-source-check/1.0","Accept":"application/pdf"})
            with urllib.request.urlopen(req,timeout=48) as r:
                data=r.read(14_000_000)
            if not data.startswith(b"%PDF") or len(data)<400_000:raise ValueError("Not a sufficiently complete PDF")
            return data,url
        except Exception as e:errors.append(str(e))
    raise RuntimeError("Original university PDF inaccessible. No cross-paper substitution: "+" | ".join(errors))

def check_text(doc):
    if len(doc)!=12:raise ValueError("Expected 12-page published research paper, got "+str(len(doc)))
    text="\n".join(p.get_text() for p in doc)
    normal=re.sub(r"\s+","",text).lower()
    if DOI.lower() not in text.lower() or "antimicrobial modification" not in text.lower():
        raise ValueError("Publisher PDF DOI and title mismatch")
    if "creativecommons.org/licenses/by/4.0" not in normal and "ccbylicense" not in normal:
        raise ValueError("Expected expressly CC BY licensed original, not unclear reproduction permission")
    for name,i,box,label,detail in CLIPS:
        # Require the named image to appear in THIS article, not another PLA study.
        group=text.lower().replace("ﬁ","fi")
        if not (label.lower() in group or (label.startswith("Figure") and label.replace("Figure","Fig.") .lower() in group)):
            raise ValueError("Figure or table reference absent "+label)

def main():
    data,url=pdf()
    doc=fitz.open(stream=data,filetype="pdf")
    check_text(doc)
    OUT.mkdir(parents=True,exist_ok=True)
    result={"id":"pla-scaffolds","title":"Antimicrobial modification of PLA scaffolds with ascorbic and fumaric acids via plasma treatment",
      "doi":DOI,"journal":"Surface & Coatings Technology 400 (2020) 126216",
      "paper":"https://doi.org/"+DOI,"repository_item":"https://m.publikace.k.utb.cz/handle/10563/1009831?locale-attribute=en",
      "downloaded_pdf_url":url,"pdf_sha256":hashlib.sha256(data).hexdigest(),
      "document_pages":len(doc),
      "license":"Original publisher PDF states Creative Commons Attribution 4.0, 2020 The Authors.",
      "rights":"Use with attribution of Anton Popelka et al., source DOI, and identify any crop. Do not edit scientific scales/labels.",
      "not_this_study":"2021 PLA cast-film–aluminium peel adhesion paper DOI 10.3390/polym13213717",
      "figures":[]}
    for slug,index,box,label,desc in CLIPS:
        page=doc[index]
        wr,hr=page.rect.width,page.rect.height
        rect=fitz.Rect(box[0]*wr,box[1]*hr,box[2]*wr,box[3]*hr)
        scale=3.35 if label.startswith("Table") else 2.2
        pix=page.get_pixmap(matrix=fitz.Matrix(scale,scale),clip=rect,alpha=False)
        fname=slug+".png"
        path=OUT/fname
        pix.save(path)
        with Image.open(path) as im:
            if min(im.size)<380:raise ValueError("Clip resolution too small: "+slug)
        # Editorial film uses copy of the *same clipped PDF pixels*, with
        # numeric slot 03 reserved for the genuine Table 3 (not Figure 3).
        number=3 if slug.startswith("table-03") else int(slug.split("-")[1])
        shot=OUT/f"pla-scaffolds-figure-{number:02d}.jpg"
        with Image.open(path) as measured:
            measured.convert("RGB").save(shot,quality=94,subsampling=0,optimize=True)
        result["figures"].append({"slug":slug,"label":label,"caption_or_role":desc,
              "page_index_zero_based":index,"normalized_crop":[round(float(v),4) for v in box],
              "source_url":url+f"#page={index+1}",
              "file":"assets/films/source-figures/v4/pla-scaffolds/"+fname,
              "film_jpeg":"assets/films/source-figures/v4/pla-scaffolds/"+shot.name,
              "film_jpeg_sha256":hashlib.sha256(shot.read_bytes()).hexdigest(),
              "sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
              "data_integrity":"Direct unaltered pixel selection from original PDF page; scale bars / axes must be verified visually before embedding."})
        print("STAGED",label,slug,flush=True)
    (OUT/"source-provenance.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    print("DONE",len(result["figures"]),"actual study-matched figures/table, source PDF",result["pdf_sha256"][:18])
if __name__=="__main__":main()
