#!/usr/bin/env python3
"""Audit the exact 2018 zebrafish cranial-cilia primary paper for its figures.

The article is NOT assumed CC BY because it appears in PubMed Central.
A photographic asset is never imported until explicit figure-level rights
have been established. This script only stages metadata and exact legends.
"""
import hashlib,json,urllib.request,xml.etree.ElementTree as ET,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/"assets/films/source-figures/v5/cerebral-cilia"
PMCID="PMC6309420"
DOI="10.1161/ATVBAHA.118.311231"
SRC="https://www.ebi.ac.uk/europepmc/webservices/rest/"+PMCID+"/fullTextXML"
def main():
    req=urllib.request.Request(SRC,headers={"Accept":"application/xml","User-Agent":"Ruwaidix study-specific archival-licence-inspection/1.0"})
    with urllib.request.urlopen(req,timeout=45) as r:raw=r.read(6_000_000)
    root=ET.fromstring(raw)
    article_dois=[(x.text or "").lower() for x in root.findall(".//article-id") if x.attrib.get("pub-id-type")=="doi"]
    if DOI.lower() not in article_dois:raise ValueError("Unrelated cilia article, do not import figures")
    title=" ".join("".join(root.find(".//article-title").itertext()).split())
    if "endothelial cilia" not in title.lower() or "cerebral" not in title.lower():
        raise ValueError("Unexpected article title")
    licenses=[]
    for licence in root.findall(".//license"):
        ref=licence.attrib.get("{http://www.w3.org/1999/xlink}href","")
        text=" ".join("".join(licence.itertext()).split())
        licenses.append({"uri":ref,"text":text[:1200]})
    textlic=json.dumps(licenses).lower()
    cleared="creativecommons.org/licenses/by/4.0" in textlic or "creativecommons.org/licenses/by/3.0" in textlic
    figures=[]
    for element in root.findall(".//fig"):
        label=" ".join("".join(element.find("label").itertext()).split()) if element.find("label") is not None else ""
        caption=" ".join("".join(element.find("caption").itertext()).split()) if element.find("caption") is not None else ""
        refs=[a.attrib.get("{http://www.w3.org/1999/xlink}href") for a in element.findall(".//graphic")]
        figures.append({"label":label,"caption":caption[:2600],"original_xlink_graphics":refs,
                        "image_import":"NOT AUTHORISED UNTIL FIGURE-LEVEL RIGHTS CONFIRMED"})
    if len(figures)<2:raise ValueError("Original JATS did not provide enough source figures")
    record={"id":"cerebral-cilia","title":title,"doi":DOI,"pmcid":PMCID,"jats_source":SRC,
            "jats_sha256":hashlib.sha256(raw).hexdigest(),"license_text_as_jats":licenses,
            "cc_by_indicated_in_jats":cleared,
            "rights_status":"FIGURES ARE NOT CLEARED FOR PUBLIC FILM EMBED" if not cleared else "ARTICLE CC BY DETECTED; review third-party figure-specific exceptions",
            "film_condition":"Microscopy is genuine 2018 cranial vessel and ARL13B cilia research only; no unrelated zebrafish cardiac image.",
            "figures":figures}
    DEST.mkdir(exist_ok=True,parents=True)
    (DEST/"rights-and-figure-inventory.json").write_text(json.dumps(record,indent=2,ensure_ascii=False)+"\n")
    print("SOURCE-LOCKED PRIMARY CILIA STUDY:",title)
    print("Original figures:",len(figures),"licensing:",record["rights_status"])
if __name__=="__main__":main()
