#!/usr/bin/env python3
"""Study-level figure and license catalogue for *exact* Ruwaidix papers.

Metadata is reviewed independently of rendering. The script intentionally does
not download images: a CC-BY paper may contain third-party credited/reproduced
figures. A scientific video cannot assume those have the article's CC-BY grant.
"""
import json,re,urllib.request,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/source-figures/paper-audit"
PAPERS=[
 {"slug":"ace2-forms","pmcid":"PMC8269184","doi":"10.3390/ijms22136703","bibliographic_role":"2021 scientific review, NOT new in-vivo experiment"},
 {"slug":"cerebral-cilia","pmcid":"PMC6309420","doi":"10.1161/ATVBAHA.118.311231","bibliographic_role":"2018 primary vascular developmental biology study"}
]
XLINK="{http://www.w3.org/1999/xlink}href"
def grab(url):
 if not url.startswith("https://www.ebi.ac.uk/europepmc/webservices/rest/"):
  raise ValueError("Only Europe PMC JATS XML is authorized")
 req=urllib.request.Request(url,headers={"Accept":"application/xml","User-Agent":"Ruwaidix-research-matched-movie/3.0"})
 with urllib.request.urlopen(req,timeout=45) as f:return f.read(15_000_000)
def text(node):
 return " ".join("".join(node.itertext()).split()) if node is not None else ""
def inventory(p):
 url=f'https://www.ebi.ac.uk/europepmc/webservices/rest/{p["pmcid"]}/fullTextXML'
 root=ET.fromstring(grab(url))
 ids=[text(n) for n in root.findall(".//article-id") if n.attrib.get("pub-id-type")=="doi"]
 if p["doi"].casefold() not in [x.casefold() for x in ids]:raise ValueError("Wrong study: expected "+p["doi"]+" got "+str(ids))
 licenses=[]
 for l in root.findall(".//license"):
  licenses.append({"href":l.attrib.get(XLINK),"text":text(l)})
 all_ccby=any("creativecommons.org/licenses/by/" in (x["href"] or "") or "creativecommons.org/licenses/by/" in x["text"] for x in licenses)
 figures=[]
 for n in root.findall(".//fig"):
  label=text(n.find("label"))
  cap=text(n.find("caption"))
  title=text(n.find("caption/title"))
  images=[x.attrib.get(XLINK) for x in n.findall(".//graphic") if x.attrib.get(XLINK)]
  thirdparty=bool(re.search(r'\b(reprinted|adapted|reproduced|modified from|replicated from|with permission|copyright|courtesy of|based on)\b',cap,re.I))
  allowed=bool(all_ccby and not thirdparty)
  figures.append({"figure_id":n.attrib.get("id"),"label":label,"caption":cap,"caption_title":title,
                  "graphic_ids":images,"third_party_warning":thirdparty,"candidate_for_author_article_ccby_use":allowed,
                  "media_state":"NOT DOWNLOADED; image/panels, ethics and actual licence require source review",
                  "review_instruction":"Source identity and the original subpanels must be checked before embedding. Avoid close recreations of third-party figures."})
 return {"slug":p["slug"],"doi":p["doi"],"pmcid":p["pmcid"],"jats":url,
         "title":text(root.find(".//article-title")),"roles":p["bibliographic_role"],
         "license_items":licenses,"article_license_ccby":all_ccby,
         "figure_count":len(figures),"eligible_for_manual_reuse_review":sum(x["candidate_for_author_article_ccby_use"] for x in figures),
         "figures":figures}
def main():
 report={"purpose":"Find genuinely matching research figures without treating published-image presence as reuse clearance.",
         "warning":"EXACT PAPER: CC BY applies subject to separately credited third-party material. Warnings are conservative, not a legal determination.",
         "papers":[],"unresolved_sources":[]}
 for p in PAPERS:
  try:report["papers"].append(inventory(p))
  except Exception as ex:
   report["unresolved_sources"].append({"slug":p["slug"],"doi":p["doi"],"pmcid":p["pmcid"],
     "status":"SOURCE REQUEST FAILED / DO NOT GUESS IMAGE OR LICENCE","error":str(ex)[:400],
     "retry":"Use publisher JATS, author files or institutional repository metadata after verification."})
 OUT.mkdir(parents=True,exist_ok=True)
 target=OUT/"ace2-and-cerebral-cilia-figure-ledger.json"
 target.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
 for p in report["papers"]:
  print(p["slug"],p["doi"],"article CC BY?",p["article_license_ccby"],
        "total figs",p["figure_count"],"figs without 3rd-party warning",p["eligible_for_manual_reuse_review"])
  for f in p["figures"]:
   print(" ",f["label"],"THIRD-PARTY" if f["third_party_warning"] else "CHECK RIGHTS",
         f["caption"][:130])
 print("Unresolved independent paper records:",len(report["unresolved_sources"]))
if __name__=="__main__":main()
