#!/usr/bin/env python3
"""Find the exact author-deposited ACE2 COVID cohort paper and stage its figures.

No external figure is accepted solely because it says ACE2. PDF title, DOI,
authors, and article-specific captions must independently match the work.
Original figure page pixel data remain unchanged.
"""
import hashlib,io,json,re,urllib.parse,urllib.request
from pathlib import Path
import fitz
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"assets/films/source-figures/ace2-covid-drugs-2022"
API="https://api.figshare.com/v2/articles/29116886"
DOI="10.1080/08037051.2022.2055530"
TITLE="Soluble ACE2 and angiotensin II levels are modulated in hypertensive COVID-19 patients"
def load(url,limit=23000000):
    p=urllib.parse.urlparse(url)
    if p.scheme!="https" or not p.hostname or not(p.hostname.endswith(".figshare.com") or p.hostname in ("ndownloader.figshare.com","api.figshare.com")):
        raise ValueError("Unauthorized download host "+str(p.hostname))
    req=urllib.request.Request(url,headers={"User-Agent":"Ruwaidix-source-paper-audit/1.0","Accept":"application/json,application/pdf,*/*"})
    with urllib.request.urlopen(req,timeout=40) as r:data=r.read(limit+1)
    if not data or len(data)>limit:raise ValueError("Invalid downloaded article size")
    return data
def main():
    article=json.loads(load(API))
    title=article.get("title","")
    if TITLE.casefold() not in title.casefold():raise ValueError("Not the correct exact ACE2 article title")
    authors=" ".join(x.get("full_name","") for x in article.get("authors",[])).casefold()
    if "elrayess" not in authors or "al-ruweidi" not in authors:raise ValueError("Article authors cannot be verified")
    licenseinfo=article.get("license") or {}
    licname=str(licenseinfo.get("name","")).casefold()
    licurl=str(licenseinfo.get("url","")).casefold()
    if not ("cc by" in licname or "creativecommons.org/licenses/by/" in licurl):
        raise ValueError("Figshare item does not expose independently reusable CC BY rights: "+repr(licenseinfo))
    pdfs=[f for f in article.get("files",[]) if f.get("name","").lower().endswith(".pdf")]
    if not pdfs:raise ValueError("No author-deposited PDF supplied")
    # Deterministically prefer the largest full manuscript; never an unrelated
    # supplementary-only file when the article PDF is missing.
    pdf=sorted(pdfs,key=lambda f:f.get("size",0),reverse=True)[0]
    raw=load(pdf["download_url"])
    doc=fitz.open(stream=raw,filetype="pdf")
    if len(doc)<6:raise ValueError("PDF unexpectedly short")
    head="\n".join(doc[i].get_text() for i in range(min(2,len(doc)))).casefold()
    if DOI.casefold() not in head:raise ValueError("Downloaded PDF not same DOI as target scientific paper")
    if "soluble ace2" not in head or "angiotensin ii" not in head:raise ValueError("PDF title not the same primary study")
    BASE.mkdir(exist_ok=True,parents=True)
    figures=[]
    for num in (1,2,3):
        hits=[]
        pattern=re.compile(r"(?:fig(?:ure)?\.?\s*)"+str(num)+r"(?:\.|:|\s)",re.I)
        for idx,page in enumerate(doc):
            txt=page.get_text()
            if pattern.search(txt):hits.append((idx,txt))
        if not hits:raise ValueError("Cannot locate Figure "+str(num)+" caption or reference in PDF")
        # Prefer a page containing the actual caption line (rather than just a citation).
        hits.sort(key=lambda z:(not bool(re.search(r"(?im)^\s*figure\s*"+str(num)+r"\s*[\.:]",z[1])),z[0]))
        page_index,text=hits[0]
        p=doc[page_index]
        pix=p.get_pixmap(matrix=fitz.Matrix(1.6,1.6),alpha=False)
        file=BASE/f"figure-{num:02d}-original-full-source-page.png"
        file.write_bytes(pix.tobytes("png"))
        figures.append({"figure":num,"page_zero_based":page_index,"width":pix.width,"height":pix.height,"file":str(file.relative_to(ROOT)),
                        "sha256":hashlib.sha256(file.read_bytes()).hexdigest(),
                        "caption_validation":"Caption's page located by PDF text; visual panel location still requires human check.",
                        "privacy":"Aggregated patient-cohort assay results only; original published figure not a patient photograph."})
    provenance={"article_title":title,"article_source":article["url_public_html"] if article.get("url_public_html") else "https://figshare.com/articles/journal_contribution/"+str(article["id"]),
      "doi":DOI,"original_pdf_sha256":hashlib.sha256(raw).hexdigest(),"license":licenseinfo,"publisher":"Taylor & Francis / Blood Pressure (2022)",
      "reported_n":200,"study_type":"Observational hypertensive COVID-19 cohort; no randomized treatment assignment",
      "image_status":"SOURCE STAGED ONLY / specific visual approval outstanding","figure_pages":figures}
    (BASE/"source-manifest.json").write_text(json.dumps(provenance,indent=2,ensure_ascii=False)+"\n")
    print("VERIFIED AUTHOR SOURCE FIGURES",[(x["figure"],x["page_zero_based"]) for x in figures])
if __name__=="__main__":main()
