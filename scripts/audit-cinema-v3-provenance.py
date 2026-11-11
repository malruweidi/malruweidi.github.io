#!/usr/bin/env python3
"""Fail-closed picture-source approval for the Ruwaidix scientific film studio.

"Video encoded" never means "source rights, scientific meaning and design approved".
An actual externally sourced photograph must be connected to an exact paper, a
figure number, a verifiable licence/permission and a shot-specific claim.
Generic context pictures cannot masquerade as research results.
"""
import json
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
V3=ROOT/"assets"/"films"/"v3"
DEFAULT_BIBLE=ROOT/"assets"/"films"/"cinema-v3-shot-bible.json"

def audit():
    bible=json.loads(DEFAULT_BIBLE.read_text(encoding="utf8"))
    short=bible["films"]
    assert len(short)==35, "All 35 original publication films require independent review"
    assert sum(len(f["source_visual_script"]) for f in short)==210
    distinct={f["slug"] for f in short}
    assert len(distinct)==35
    allflags=0
    for film in short:
        assert len(film["source_visual_script"])==6
        assert film["status"]=="EDITORIAL_REDESIGN_REQUIRED"
        assert film["do_not_borrow_from_other_films"]
        for shot in film["source_visual_script"]:
            assert shot["original_image_status"].startswith("NO IMAGE CLEARED")
            assert shot["source_url"]
            assert shot["visual_argument"]
        allflags+=len(film["rejected_unrelated_assets"])
    features=json.loads((V3/"nine-feature-shot-bible.json").read_text(encoding="utf8"))
    assert len(features["films"])==9
    assert all(len(x["beats"])==8 for x in features["films"])
    library=json.loads((V3/"primary-figure-source-register.json").read_text(encoding="utf8"))
    for entry in library["assets"]:
        assert entry.get("url") and entry.get("status") and entry.get("rights"),entry.get("slug")
        assert entry.get("caution"),entry.get("slug")
        if "IMAGE BYTES NOT YET INGESTED" in entry["status"]:
            assert entry["slug"] not in ("making-medicines-keep",),entry["slug"]
    history=json.loads((V3/"making-medicines-keep.storyboard.json").read_text(encoding="utf8"))
    assert len(history["scenes"])==8
    assert len({x["visual"] for x in history["scenes"]})==8
    assert not any("research-portrait" in json.dumps(x) for x in history["scenes"])
    assert history["status"]!="PUBLISHED"
    existing=list((V3/"rendered").glob("*.mp4")) if (V3/"rendered").exists() else []
    current=[x.name for x in existing]
    print(json.dumps({
        "paper_shorts_storyboarded":len(short),
        "planned_short_chapters":210,
        "feature_films_storyboarded":len(features["films"]),
        "planned_feature_chapters":72,
        "old_source_assignments_flagged_for_manual_audit":allflags,
        "v3_mp4_in_branch":current,
        "approved_for_live_replacement":0,
        "reason":"The source-license, primary-paper figure panel, actual image, narrated claims and human-audition check remain outstanding"
    },indent=2))

if __name__=="__main__": audit()
