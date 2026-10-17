#!/usr/bin/env python3
"""Auditable 44-film completion report; distinguish stale MP4s from current exports."""
import importlib.util
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
MOD=ROOT/"scripts/render-cinematic-library.py"
spec=importlib.util.spec_from_file_location("cinema_build_state",MOD)
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
def main():
    films=m.load()
    results=[]
    for f in films:
        slug=f["slug"]
        mp4=m.OUT/(slug+"-rough-cut.mp4")
        manifest=m.OUT/(slug+"-rough-cut.json")
        block=m.OUT/(slug+"-blocked.json")
        valid=m.exists(f)
        expected=sum(s["sec"] for s in f["shots"])
        actual=None
        if manifest.is_file():
            try:actual=json.loads(manifest.read_text()).get("duration")
            except ValueError:pass
        results.append({"film":slug,"current":valid,"has_mp4":mp4.is_file(),
                        "duration_script":expected,"duration_export":actual,
                        "stale":mp4.is_file() and not valid,
                        "blocked_record_exists":block.is_file()})
    report={"total":len(results),"technically_current":sum(x["current"] for x in results),
            "stale_exports":sum(x["stale"] for x in results),
            "missing_exports":sum(not x["has_mp4"] for x in results),
            "human_approved":0,"films":results}
    assert report["total"]==44
    destination=ROOT/"assets/films/visual-audit-v2/completion-ledger.json"
    destination.parent.mkdir(parents=True,exist_ok=True)
    destination.write_text(json.dumps(report,indent=2)+"\n")
    print("44 FILM REBUILD / CURRENT:",report["technically_current"],
          "STALE:",report["stale_exports"],"MISSING:",report["missing_exports"])
    for item in results:
        if not item["current"]:print("REQUIRES RENDER",item["film"],item["duration_script"],item["duration_export"])
if __name__=="__main__":
    main()
