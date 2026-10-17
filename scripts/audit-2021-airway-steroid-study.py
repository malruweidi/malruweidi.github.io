#!/usr/bin/env python3
"""Source and figure-level audit of user's distinct 2021 steroid injury paper.

IMPORTANT: do not confuse 2021 DEX/DHEA study with 2020 chamber-method
figure set. Actual figure content and any licence uncertainty is documented
before its MP4 or source pixel is imported.
"""
from pathlib import Path
import hashlib,json,re,urllib.request,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/source-figures/v5/airway-reopening"
PMCID="PMC8384562"
DOI="10.1152/japplphysiol.00574.2020"
SOURCES=[
 f"https://www.ebi.ac.uk/europepmc/webservices/rest/{PMCID}/fullTextXML",
 f"https://www.ebi.ac.uk/europepmc/webservices/rest/{PMCID}/fullTextXML?format=xml"
]

def get(url):
    req=urllib.request.Request(url,headers={"Accept":"application/xml","User-Agent":"Ruwaidix-archive-study-matching/1.0"})
    with urllib.request.urlopen(req,timeout=35) as r:return r.read(9_000_000)

def main():
    OUT.mkdir(exist_ok=True,parents=True)
    errors=[];body=None;source=None
    for u in SOURCES:
        try:body=get(u);source=u;break
        except Exception as e:errors.append(str(e)[:180])
    report={"film":"airway-reopening","doi":DOI,"pmcid":PMCID,"article_title":"Dexamethasone and transdehydroandrosterone significantly reduce pulmonary epithelial cell injuries associated with mechanical ventilation",
            "article":"https://doi.org/"+DOI,"rights_state":"UNCHECKED","figures":[],"original_article_xml":source,
            "do_not_confuse_with":"2020 methods paper DOI 10.3390/mps3040065",
            "no_figures_imported":True}
    if body is None:
        report.update({"rights_state":"OFFICIAL JATS SOURCE UNAVAILABLE / NO NEW IMAGE RIGHTS CONFIRMED","retrieval_errors":errors})
    else:
        root=ET.fromstring(body)
        dois=[str(x.text).casefold() for x in root.findall(".//article-id") if x.attrib.get("pub-id-type")=="doi"]
        if DOI.casefold() not in dois:raise ValueError("WRONG STUDY DOI — cannot stage any figures")
        title=" ".join(root.findtext(".//article-title","").split())
        if "dexamethasone" not in title.lower() or "transdehydroandrosterone" not in title.lower():raise ValueError("Wrong study title")
        licenses=[]
        for el in root.findall(".//license"):
            licenses.append({"uri":el.attrib.get("{http://www.w3.org/1999/xlink}href",""),
                             "wording":" ".join("".join(el.itertext()).split())[:1200]})
        report["licenses"]=licenses
        cc=any("creativecommons.org/licenses/by/" in x["uri"].casefold() for x in licenses)
        report["rights_state"]="Article JATS has CC BY; still confirm original figure exceptions" if cc else "NO EXPLICIT CC BY SEEN — FIGURES HELD FOR RIGHTS REVIEW"
        for fig in root.findall(".//fig"):
            lab=" ".join("".join(fig.find("label").itertext()).split()) if fig.find("label") is not None else ""
            desc=" ".join("".join(fig.find("caption").itertext()).split()) if fig.find("caption") is not None else ""
            hrefs=[x.attrib.get("{http://www.w3.org/1999/xlink}href") for x in fig.findall(".//graphic")]
            report["figures"].append({"figure":lab,"caption":desc[:3300],"xlink":hrefs,
                                      "figure_reuse":"PENDING FIGURE RIGHTS AND CORRESPONDING AUTHOR CONFIRMATION"})
        if len(report["figures"])<4:raise ValueError("Actual study does not show expected original figure sequence")
        report["jats_sha256"]=hashlib.sha256(body).hexdigest()
    (OUT/"exact-paper-and-rights.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
    print(report["rights_state"],"figures",len(report["figures"]))
if __name__=="__main__":main()
