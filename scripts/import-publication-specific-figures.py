#!/usr/bin/env python3
"""Stage figures from the EXACT cited open-access studies via article JATS XML.

Checks PMC identifiers, XML DOI, corresponding figure label, figure caption,
actual image format, provenance and licensing. Never uses a filename guessed
from another study and never mutates released V1/V2 images.
"""
import hashlib,io,json,re,urllib.parse,urllib.request,xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/source-figures/v3"
PAPERS=[
  {"id":"flow-chamber-method","pmc":"PMC7712398","doi":"10.3390/mps3040065","figures":[1,5,6]},
  {"id":"pla-grafting","pmc":"PMC8588400","doi":"10.3390/polym13213717","figures":[1,4,8]}
]
XLINK="{http://www.w3.org/1999/xlink}href"

def download(url,limit=26000000):
    parsed=urllib.parse.urlparse(url)
    if parsed.scheme!="https" or parsed.hostname not in ("www.ebi.ac.uk","europepmc.org","www.europepmc.org","www.mdpi.com","pmc.ncbi.nlm.nih.gov","mdpi-res.com","www.mdpi-res.com"):
        raise ValueError("Only official open publication media hosts allowed: "+str(parsed.hostname))
    req=urllib.request.Request(url,headers={"User-Agent":"Ruwaidix-scientific-cinema-figure-check/1.0","Accept":"application/xml,image/jpeg,image/png,*/*"})
    with urllib.request.urlopen(req,timeout=45) as response:
        data=response.read(limit+1)
    if len(data)>limit or len(data)==0:raise ValueError("Invalid media payload")
    return data

def extract(paper):
    url=f'https://www.ebi.ac.uk/europepmc/webservices/rest/{paper["pmc"]}/fullTextXML'
    xml=download(url)
    root=ET.fromstring(xml)
    xml_doi=[x.text for x in root.findall(".//article-id") if x.attrib.get("pub-id-type")=="doi"]
    if paper["doi"].casefold() not in [str(x).casefold() for x in xml_doi]:
        raise ValueError(f"JATS DOI mismatch for {paper['id']}: {xml_doi}")
    copyrights=" ".join((el.text or "") for el in root.findall(".//license-p"))
    if "creativecommons.org/licenses/by/" not in xml.decode("utf-8").lower():
        raise ValueError("JATS does not verify Creative Commons attribution permission")
    article_title=" ".join(root.findtext(".//article-title","").split())
    results=[]
    for number in paper["figures"]:
        figures=[]
        for fig in root.findall(".//fig"):
            label=" ".join("".join(fig.find("label").itertext()).split()) if fig.find("label") is not None else ""
            if label.lower().replace(".","").strip()==f"figure {number}".lower() or label.lower().strip()==f"fig. {number}":
                figures.append(fig)
        if len(figures)!=1:
            raise ValueError(f"Exact figure {number} not uniquely identified by JATS label: {len(figures)}")
        fig=figures[0]
        caption=" ".join("".join(fig.find("caption").itertext()).split()) if fig.find("caption") is not None else ""
        graphics=[c.attrib.get(XLINK) for c in fig.findall(".//graphic")]
        graphics=[g for g in graphics if g]
        if not graphics:raise ValueError(f"No graphics for verified {paper['id']} figure {number}")
        found=None
        errors=[]
        for ref in graphics:
            # Both routes are published by the same DOI-bearing original paper.
            # Never use a figure image from a different paper or an image search.
            normalized=ref.rsplit("/",1)[-1]
            mdpi_journal="mps" if paper["id"]=="flow-chamber-method" else "polymers"
            mdpi_article="mps-03-00065" if paper["id"]=="flow-chamber-method" else "polymers-13-03717"
            candidates=[f'https://europepmc.org/articles/{paper["pmc"]}/bin/{ref}{ext}'
                        for ext in ("",".jpg",".png",".jpeg")]
            candidates += [
                f'https://mdpi-res.com/d_attachment/{mdpi_journal}/{mdpi_article}/article_deploy/{normalized}{ext}'
                for ext in (".png",".jpg",".jpeg")
            ]
            for path in candidates:
                try:
                    raw=download(path,16000000)
                    im=Image.open(io.BytesIO(raw))
                    im.load()
                    if min(im.size)<300:raise ValueError("Unusable thumbnail")
                    found=(path,im.convert("RGB"))
                    break
                except Exception as error:errors.append(path+" -> "+str(error)[:120])
            if found:break
        if not found:
            # No replacement figure from another article; report checked source URLs.
            raise RuntimeError(f"Unable to fetch verified graphic {paper['id']} Figure {number}. Official attempts: "+ " | ".join(errors[-7:]))
        remote,picture=found
        OUT.mkdir(parents=True,exist_ok=True)
        path=OUT/f'{paper["id"]}-figure-{number:02d}.jpg'
        picture.save(path,quality=92,optimize=True,subsampling=0)
        results.append({"film":paper["id"],"figure_number":number,"caption":caption,
                        "article_title":article_title,"doi":paper["doi"],"pmc":paper["pmc"],"label":f"Figure {number}",
                        "image_url":remote,"article_jats":url,"local_path":str(path.relative_to(ROOT)),
                        "sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
                        "license":"Creative Commons Attribution 4.0 (source JATS verified); retain citation and original panel identity",
                        "display_policy":"Experimental figures are immutable; preserve control labels, scales, and original axis values."})
    return results

def main():
    catalog=[]
    for paper in PAPERS:catalog.extend(extract(paper))
    manifest={"edition":"source-verified-2026-10-17","status":"STAGED FIGURES FOR EDITORIAL RESEARCH REVIEW; NOT YET EDITED INTO FILMS",
              "figures":catalog}
    (OUT/"source-figure-provenance.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
    print("EXACT-JATS/DOI FIGURES STAGED",len(catalog),[f["local_path"] for f in catalog])
if __name__=="__main__":main()
