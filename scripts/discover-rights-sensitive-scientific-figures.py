#!/usr/bin/env python3
"""Inventory original, third-party and rights-uncertain figures in two DOI papers.

A CC BY article can contain a figure reproduced with permission under a
different copyright. This script deliberately refuses to treat such figures as
freely reusable. It is a discovery aid, NOT a figure copyright clearance.
"""
import json,urllib.request,xml.etree.ElementTree as ET,re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/source-figures/doi-discovery"
PAPERS=[
 {"film":"ace2-forms","doi":"10.3390/ijms22136703","pmc":"PMC8269184"},
 {"film":"microfluidic-virus","doi":"10.1007/s42247-021-00169-7","pmc":"PMC7992628"}
]
LINK="{http://www.w3.org/1999/xlink}href"
PATTERN=re.compile(r"\b(adapted|replicated|reproduced|reprinted|with permission|modified from|permission from|copyright)\b",re.I)

def fulltext(pmc):
 url=f"https://www.ebi.ac.uk/europepmc/webservices/rest/{pmc}/fullTextXML"
 request=urllib.request.Request(url,headers={"User-Agent":"Ruwaidix DOI/copyright verification, research-only"})
 with urllib.request.urlopen(request,timeout=45) as response:data=response.read(11000000)
 if not data.startswith(b"<?xml") and b"<article" not in data[:2000]:
  raise RuntimeError("Source is not JATS XML")
 return data,url

def grab(p):
 data,url=fulltext(p["pmc"])
 tree=ET.fromstring(data)
 ids=[e.text for e in tree.findall(".//article-id") if e.attrib.get("pub-id-type")=="doi"]
 if p["doi"].casefold() not in [str(x).casefold() for x in ids]:
  raise ValueError(f"Wrong article: {p['film']} expected {p['doi']} got {ids}")
 licences=[{"href":e.attrib.get(LINK),"text":" ".join("".join(e.itertext()).split())[:500]} for e in tree.findall(".//license")]
 title=" ".join("".join(tree.find(".//article-title").itertext()).split())
 figures=[]
 for fig in tree.findall(".//fig"):
  label=" ".join("".join(fig.find("label").itertext()).split()) if fig.find("label") is not None else fig.get("id","")
  caption=" ".join("".join(fig.find("caption").itertext()).split()) if fig.find("caption") is not None else ""
  attribution=" ".join("".join(e.itertext()).strip() for e in fig.findall(".//attrib"))
  footnote=" ".join("".join(e.itertext()) for e in fig.findall(".//fn"))
  source_image=[e.attrib.get(LINK) for e in fig.findall(".//graphic") if e.attrib.get(LINK)]
  text=(caption+" "+attribution+" "+footnote)
  warnings=PATTERN.findall(text)
  triage=("THIRD_PARTY_LICENSE_POSSIBLE_REUSE_NOT_CLEARED" if warnings else
          "SOURCE_OWNERSHIP_NOT_YET_VERIFIED")
  figures.append({"label":label,"caption":caption,"image_jats_href":source_image,
     "captured_copyright_clues":sorted(set(w.casefold() for w in warnings)),
     "source_credit":attribution,"status":triage,
     "reuse_decision":"NEEDS MANUAL LICENCE AND FIGURE OWNERSHIP REVIEW"})
 return {"film":p["film"],"pmc":p["pmc"],"doi":p["doi"],"source_fulltext":url,
         "article_title":title,"article_licence":licences,
         "figures":figures}

def main():
 results=[grab(p) for p in PAPERS]
 OUT.mkdir(parents=True,exist_ok=True)
 summary={r["film"]:{"all_figures":len(r["figures"]),
    "possible_third_party":sum(x["status"].startswith("THIRD") for x in r["figures"])} for r in results}
 (OUT/"source-figure-candidates.json").write_text(json.dumps({
    "edition":"2026-10-17-source-identity-only",
    "scope":"Each figure from the correct article DOI; no thumbnail or image was imported or released.",
    "critical":"Article-level CC BY cannot automatically license a reproduced third-party figure.",
    "summary":summary,"papers":results},indent=2,ensure_ascii=False)+"\n")
 print(json.dumps(summary,indent=2))
if __name__=="__main__":main()
