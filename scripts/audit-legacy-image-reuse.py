#!/usr/bin/env python3
"""Flag mismatched and repetitively recycled research images by film and source.

Existing V1 and V2 files are *not* automatically certified by a passing SHA.
Flags require a person to compare each image against the actual publication.
"""
from collections import defaultdict
from pathlib import Path
import json,re

ROOT=Path(__file__).resolve().parents[1]
CAT=ROOT/"assets/films/publication-series.json"
DIRECT=ROOT/"assets/films/V3-EVIDENCE-FIRST-DIRECTORIAL-REGISTER.json"
DEST=ROOT/"assets/films/V3-VISUAL-REUSE-AUDIT.json"

def main():
    items=json.loads(CAT.read_text())["items"]
    direction=json.loads(DIRECT.read_text())["films"]
    plans={p["id"]:p for p in direction}
    appearances=defaultdict(list)
    output=[]
    for item in items:
        slug=item["id"]
        forbidden=plans[slug]["rejected_or_restricted"]
        flags=[]
        for scene in item["scenes"]:
            path=scene["image"];leaf=Path(path).name
            appearances[path].append({"film":slug,"chapter":scene["id"],"source":item.get("doi",item.get("source_url",slug))})
            exact_rejection=any(leaf==x.strip() or path==x.strip() for x in forbidden)
            if exact_rejection:
                flags.append({"chapter":scene["id"],"image":path,"status":"REJECTED_BY_EDITORIAL_SOURCE_TREATMENT",
                              "reason":"This actual asset is explicitly disallowed or cross-study in the film-specific source plan."})
            if "research-portrait" in leaf and item["category"] not in ("Personal essay","Public essay","Portrait"):
                flags.append({"chapter":scene["id"],"image":path,"status":"UNRELATED_PORTRAIT",
                              "reason":"An author portrait may belong to credits, not to the study's mechanism or claimed observations."})
            if "generic" in scene.get("kind","").lower() or "research-context" in scene.get("kind","").lower():
                flags.append({"chapter":scene["id"],"image":path,"status":"CONTEXT_NOT_EVIDENCE",
                              "reason":"A contextual asset does not prove the claim made in this study."})
        output.append({"id":slug,"primary_source":plans[slug]["primary_source"],
                      "flagged_scenes":flags,"unique_images":len(set(s["image"] for s in item["scenes"])),
                      "scene_count":len(item["scenes"]),"original_caption":item["film_title"]})
    cross=[]
    for asset,shots in appearances.items():
        distinct={shot["film"] for shot in shots}
        distinct_sources={shot["source"] for shot in shots}
        if len(distinct)<=1:continue
        high=("figure-" in asset or "study-figure" in asset) and len(distinct_sources)>1
        cross.append({"image":asset,"films":sorted(distinct),"distinct_source_count":len(distinct_sources),
                      "usage_count":len(shots),
                      "requires_inspection":True,
                      "risk":"CROSS_STUDY_FIGURE" if high else "MULTI_FILM_REUSE_NEEDS_PROVENANCE"})
    cross.sort(key=lambda r:(r["risk"]!="CROSS_STUDY_FIGURE",-r["usage_count"]))
    # No asset is silently approved because it is familiar-looking or recorded
    # as 'contextual'. The original study matching and reuse license must be
    # independently checked before that exact photo is placed into a new V3 cut.
    report={"edition":"2026-10-17-v3-sceptical-review",
            "warning":"This is a rejection/risk register, not a licence clearance or proof that every non-flagged asset is correct.",
            "summary":{"film_count":len(items),"total_legacy_scenes":sum(x["scene_count"] for x in output),
                       "reused_across_films":len(cross),"cross_study_figure_reuse":sum(c["risk"]=="CROSS_STUDY_FIGURE" for c in cross),
                       "explicitly_flagged_scenes":sum(len(x["flagged_scenes"]) for x in output),
                       "films_using_only_one_unique_image":sum(x["unique_images"]==1 for x in output)},
            "cross_film_reuses":cross,"film_findings":output}
    DEST.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print(json.dumps(report["summary"],indent=2))
if __name__=="__main__":
    main()
