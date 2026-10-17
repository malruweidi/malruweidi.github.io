#!/usr/bin/env python3
"""Stage publisher-authored 2020 PLA SCAFFOLD paper figures from university PDF.

This is intentionally NOT the 2021 PLA film published by MDPI. Verify source
DOI, author/title, precise postprint figure page, captions and preservation
of all original pixels before a film editor uses these actual experiments.
"""
from pathlib import Path
import urllib.request,hashlib,json,re
import fitz

ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/"assets/films/source-figures/pla-scaffolds-2020"
URL="https://publikace.k.utb.cz/bitstream/handle/10563/1009831/Postprint_1009831.pdf?isAllowed=y&sequence=3"
DOI="10.1016/j.surfcoat.2020.126216"
REPOSITORY="https://m.publikace.k.utb.cz/handle/10563/1009831?locale-attribute=en"
# Page indexes established from a 34-page original university-hosted postprint.
# Export the WHOLE page at this stage, with original labels and caption.
PANELS=[
 {"page":5,"figure":"Figure 1","topic":"electrospinning / plasma / ascorbic or fumaric acid surface grafting"},
 {"page":16,"figure":"Figure 5","topic":"SEM of untreated, plasma-treated, ASA- and FA-modified PLA fibre mats"},
 {"page":18,"figure":"Figure 6","topic":"AFM texture after plasma and ASA/FA surface modification"},
 {"page":20,"figure":"Figure 7","topic":"actual FTIR-ATR spectra for scaffold fibre mats"},
 {"page":23,"figure":"Table 3","topic":"observed S. aureus / E. coli growth assessment, nonclinical"}
]

def main():
    req=urllib.request.Request(URL,headers={"User-Agent":"Ruwaidix original-science-documentary-editor/1.0","Accept":"application/pdf"})
    with urllib.request.urlopen(req,timeout=55) as reply:
        blob=reply.read(12_000_001)
        if len(blob)>12_000_000:raise ValueError("Unexpected PDF size")
    if not blob.startswith(b"%PDF"):raise ValueError("Institutional source is not a PDF")
    src=fitz.open(stream=blob,filetype="pdf")
    if len(src)!=34:raise ValueError("PDF page count differs from inspected 34-page postprint")
    cover=src[0].get_text().replace("\n"," ")
    title=src[1].get_text().replace("\n"," ")
    if DOI not in cover or "Antimicrobial modification of PLA scaffolds" not in title:
        raise ValueError("Wrong study; never substitute PLA 2021 film or unrelated page")
    DEST.mkdir(exist_ok=True,parents=True)
    scanned=[]
    for figure in PANELS:
        p=src[figure["page"]]
        text=p.get_text().replace("\n"," ")
        label=figure["figure"]
        number=label.split(" ")[-1]
        # Check the figure/table label exists on *this* exact page.
        if not re.search(r"\b(?:Fig\.?|Table)\s*\.?\s*"+number+r"\b",text,re.I):
            raise ValueError(f"Expected {label} on PDF page index {figure['page']}: source has changed")
        pix=p.get_pixmap(matrix=fitz.Matrix(1.65,1.65),alpha=False)
        path=DEST/(label.lower().replace(" ","-")+"-full-source-page.png")
        pix.save(str(path))
        scanned.append({"label":label,"postprint_page_zero_based":figure["page"],
                        "original_page_preserved":True,"original_full_paper_caption_in_page":True,
                        "topic":figure["topic"],"artifact":str(path.relative_to(ROOT)),
                        "sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
                        "image_width":pix.width,"image_height":pix.height,
                        "visual_use":"Staged for visual review; a later exact figure crop requires independent confirmation."})
    r={"paper_title":"Antimicrobial modification of PLA scaffolds with ascorbic and fumaric acids via plasma treatment",
       "publication":"Surface and Coatings Technology 400 (2020), article 126216",
       "doi":DOI,"repository":REPOSITORY,"pdf_source":URL,
       "sha256_pdf":hashlib.sha256(blob).hexdigest(),"study_specific_media":scanned,
       "reuse_terms":"University repository lists CC BY 4.0; credit Popelka et al. (2020) and link DOI.",
       "not_equivalent_study":"Do not substitute any 2021 Polymer journal PLA-film experiments (DOI 10.3390/polym13213717).",
       "status":"ORIGINAL PDF PAGES STAGED ONLY: human inspect all figure/panel identities before embedding."}
    (DEST/"source-identity.json").write_text(json.dumps(r,indent=2,ensure_ascii=False)+"\n")
    print("STAGED",len(scanned),"genuine 2020 PLA scaffold original source pages",flush=True)

if __name__=="__main__":main()
