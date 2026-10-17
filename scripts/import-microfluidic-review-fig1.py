#!/usr/bin/env python3
"""Recover ONLY Figure 1 from Tarim et al. Emergent Materials (2021), DOI-matched.

Preferred: original JATS xlink PDF-figure. Reliable fallback: exact article PDF
held by Deutsche Nationalbibliothek, whose identity and Figure 1 caption must
be verified from native PDF text. No search-engine images, no unrelated figure.
"""
import hashlib,io,json,re,urllib.parse,urllib.request,xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image
import fitz

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/source-figures/v4/microfluidic-virus"
DOI="10.1007/s42247-021-00169-7"
PMC="PMC7992628"
TITLE="Microfluidic-based virus detection methods for respiratory diseases"
XML="https://www.ebi.ac.uk/europepmc/webservices/rest/"+PMC+"/fullTextXML"
PDF="https://d-nb.info/1234783940/34"
HOSTS={"www.ebi.ac.uk","europepmc.org","www.europepmc.org","pmc.ncbi.nlm.nih.gov","www.ncbi.nlm.nih.gov","d-nb.info","link.springer.com"}
XLINK="{http://www.w3.org/1999/xlink}href"

def fetch(url,maximum=30_000_000):
    host=urllib.parse.urlparse(url)
    if host.scheme!="https" or host.hostname not in HOSTS:
        raise ValueError("Only identity-verified publication repositories allowed: "+url)
    request=urllib.request.Request(url,headers={"User-Agent":"Ruwaidix-primary-figure-film/3.0","Accept":"application/pdf,application/xml,image/jpeg,image/png,*/*"})
    with urllib.request.urlopen(request,timeout=45) as r:
        data=r.read(maximum+1)
    if not data or len(data)>maximum:raise ValueError("Missing/oversized media")
    return data

def jats_record():
    content=fetch(XML)
    root=ET.fromstring(content)
    doi=[str(x.text).lower() for x in root.findall(".//article-id") if x.attrib.get("pub-id-type")=="doi"]
    if DOI.lower() not in doi:raise ValueError("Wrong paper XML DOI")
    article=" ".join(root.findtext(".//article-title","").split())
    if TITLE.casefold() not in article.casefold():raise ValueError("Wrong manuscript title")
    if "creativecommons.org/licenses/by/" not in content.decode("utf8").casefold():
        raise ValueError("Unable to verify article figure reuse permission")
    hit=[]
    for el in root.findall(".//fig"):
        text=" ".join("".join(el.find("label").itertext()).split()) if el.find("label") is not None else ""
        if text.lower().replace(".","") in ("fig 1","figure 1"):
            hit.append(el)
    if len(hit)!=1:raise ValueError("Figure 1 must be uniquely identified in article XML")
    caption=" ".join("".join(hit[0].find("caption").itertext()).split())
    if "Overview of microfluidic methods" not in caption:raise ValueError("Unexpected Figure 1 caption")
    hrefs=[a.attrib[XLINK] for a in hit[0].findall(".//graphic") if XLINK in a.attrib]
    if not hrefs:raise ValueError("No linked graphics for Fig 1")
    return {"jats_title":article,"caption":caption,"xlinks":hrefs}

def first_try_figure(jats):
    for href in jats["xlinks"]:
        root=href.rsplit("/",1)[-1]
        variants=[root,root+".png",root+".jpg",root+".jpeg"]
        for name in variants:
            u=f"https://europepmc.org/articles/{PMC}/bin/{name}"
            try:
                with Image.open(io.BytesIO(fetch(u,15_000_000))) as im:
                    im.load()
                    if min(im.size)<450:continue
                    return im.convert("RGB"),u,"JATS-linked original Figure 1"
            except Exception:pass
    return None

def pdf_fallback(jats):
    content=fetch(PDF)
    if not content.startswith(b"%PDF"):raise ValueError("National-library archive did not return a PDF")
    doc=fitz.open(stream=content,filetype="pdf")
    all_first="\n".join(doc[k].get_text() for k in range(min(2,len(doc))))
    if TITLE.casefold() not in " ".join(all_first.split()).casefold():raise ValueError("PDF title not the DOI manuscript")
    if DOI not in all_first and DOI.upper() not in all_first.upper():
        raise ValueError("PDF does not substantiate requested DOI")
    candidates=[]
    for idx,page in enumerate(doc):
        text=page.get_text().replace("\n"," ")
        pattern=r"Fig\.\s*1\b.{0,180}Overview of microfluidic methods"
        match=re.search(pattern,text,flags=re.IGNORECASE)
        if match:candidates.append(idx)
    if len(candidates)!=1:raise ValueError("Cannot uniquely locate Figure 1 in exact archived PDF")
    idx=candidates[0]
    page=doc[idx]
    # Entire source page only: none of the experimental labels are cropped,
    # and the article source/title remains recoverable. Film editorial team
    # may later select a verified Fig.1 boundary manually from this PDF page.
    pic=Image.frombytes("RGB",[page.get_pixmap(matrix=fitz.Matrix(2.2,2.2),alpha=False).width,
                                page.get_pixmap(matrix=fitz.Matrix(2.2,2.2),alpha=False).height],
                        page.get_pixmap(matrix=fitz.Matrix(2.2,2.2),alpha=False).samples)
    return pic,PDF+"#page="+str(idx+1),"Exact DOI archived article page containing Figure 1; full page, not cropped figure"

def main():
    report=jats_record()
    result=first_try_figure(report)
    if result is None:result=pdf_fallback(report)
    image,url,classification=result
    OUT.mkdir(parents=True,exist_ok=True)
    path=OUT/"microfluidic-virus-figure-01-source-page.jpg"
    image.save(path,"JPEG",quality=90,optimize=True,subsampling=0)
    record={
        "film":"microfluidic-virus","doi":DOI,"pmcid":PMC,
        "paper_title":TITLE,"original_figure":"Figure 1",
        "caption":report["caption"],
        "source_url":url,"original_jats":XML,
        "asset":str(path.relative_to(ROOT)),"sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
        "source_representation":classification,
        "licence":"CC BY 4.0 from matching open-access article; retain Tarim et al. 2021 and DOI",
        "editorial_note":"Figure 1 is the authors' review schematic; not a photograph of a fabricated device, new experimental dataset or original patient specimen.",
        "status":"SOURCE VERIFICATION PASSED, HUMAN VISUAL REVIEW STILL REQUIRED"
    }
    (OUT/"source-provenance.json").write_text(json.dumps(record,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("DOI-CONSTRAINED FIGURE 1 STAGED",image.size,classification,url)
if __name__=="__main__":main()
