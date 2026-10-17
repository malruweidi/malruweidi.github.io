#!/usr/bin/env python3
"""Create an explicit film production register, distinct from artistic approval.

Do not equate 'an MP4 exists' with current scientific artwork or reviewed
narration. This tool never edits existing MP4s, captions or original research.
"""
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
FILMS=ROOT/"assets"/"films"
SHORTS=FILMS/"series-v2"
SOURCE=FILMS/"publication-series.json"
QA=SHORTS/"technical-qa.json"
DEST=FILMS/"remake-readiness.json"
REQUIRED_SIGNATURE="story-motion-v2.2"

def metadata(path):
    try:return json.loads(path.read_text(encoding="utf8"))
    except (FileNotFoundError,json.JSONDecodeError):return None

def main():
    catalogue=metadata(SOURCE)
    if not catalogue or len(catalogue["items"])!=35:
        raise ValueError("Source bibliography must contain exactly 35 documented entries")
    qa=metadata(QA) or {"films":[]}
    reviews={x["name"]:x for x in qa["films"]}
    results=[]
    for f in catalogue["items"]:
        slug=f["id"]
        mp4=SHORTS/(slug+".mp4")
        captions=SHORTS/(slug+".vtt")
        manifest=metadata(SHORTS/(slug+".json"))
        root_original=FILMS/"series"/(slug+".mp4")
        reasons=[]
        exists=mp4.is_file() and mp4.stat().st_size>100000 and captions.is_file() and manifest is not None
        if not exists:reasons.append("A complete MP4, timed VTT and source manifest do not yet coexist")
        revision=f.get("source_visual_revision")
        stamped=manifest.get("source_visual_revision") if manifest else None
        if revision and revision!=stamped:reasons.append("Source or motion edition superseded: needs re-render")
        if manifest and manifest.get("remaster_signature")!=REQUIRED_SIGNATURE:
            reasons.append("Incorrect motion-engine edition")
        source_correct=exists and not reasons
        qa_record=reviews.get(slug)
        has_qa=bool(qa_record) and exists and manifest and qa_record.get("sha256")==manifest.get("sha256")
        if exists and not has_qa:reasons.append("Encoded-video technical QA not current")
        if not root_original.exists():reasons.append("First-edition archive missing; publishing blocked")
        human_ok=bool(manifest and manifest.get("human_screening")=="APPROVED_BY_HUMAN_REVIEWER")
        if not human_ok:reasons.append("Science, audio, rights and editorial human sign-off outstanding")
        results.append({
            "id":slug,
            "title":f["film_title"],
            "mp4_rendered":bool(exists),
            "source_revision_required":revision,
            "source_revision_in_mp4":stamped,
            "source_visual_and_motion_current":bool(source_correct),
            "encoded_technical_qa":bool(has_qa),
            "original_archive_preserved":root_original.exists(),
            "human_screened":bool(human_ok),
            "ready_for_public_replacement":bool(source_correct and has_qa and human_ok and root_original.exists()),
            "pending_reasons":reasons
        })
    summary={
        "expected":35,
        "mp4_rendered":sum(x["mp4_rendered"] for x in results),
        "latest_source_and_motion":sum(x["source_visual_and_motion_current"] for x in results),
        "encoded_technical_qa":sum(x["encoded_technical_qa"] for x in results),
        "human_screened":sum(x["human_screened"] for x in results),
        "approved_for_replacement":sum(x["ready_for_public_replacement"] for x in results),
        "originals_preserved":sum(x["original_archive_preserved"] for x in results),
    }
    document={
        "edition":"Ruwaidix V2 source and editorial release gate",
        "interpretation":"The table separates existence, source recency, technical verification, and human scientific/rights approval. Automated tools cannot confer peer review or media rights.",
        "short_films":summary,
        "records":results
    }
    DEST.write_text(json.dumps(document,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("READINESS:",json.dumps(summary))
    if summary["originals_preserved"]!=35:
        raise RuntimeError("Original source videos must not be deleted or moved")
if __name__=="__main__":
    main()
