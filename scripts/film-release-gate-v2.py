#!/usr/bin/env python3
"""Ruwaidix film delivery gate. Never treat a rough cut as release-approved."""
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
catalog=ROOT/"assets/films/cinematic-library-v2.json"
out=ROOT/"assets/films/release-gate-v2.json"
folder=ROOT/"assets/films/library-v2"
studio=ROOT/"scripts/render-directors-cuts.py"
engine=ROOT/"scripts/render-documentary.py"
films=json.loads(catalog.read_text(encoding="utf-8"))["films"]

def input_digest(f):
    h=hashlib.sha256()
    h.update(json.dumps(f,ensure_ascii=False,sort_keys=True).encode("utf-8"))
    h.update(studio.read_bytes())
    h.update(engine.read_bytes())
    return h.hexdigest()

def check(f):
    slug=f["slug"]
    stem=folder/(slug+"-rough-cut")
    mp4=stem.with_suffix(".mp4")
    meta=stem.with_suffix(".json")
    vtt=stem.with_suffix(".vtt")
    result={"film":slug,"title":f.get("title"),"status":"missing","ready_for_publication":False}
    if not all(x.exists() for x in (mp4,meta,vtt)):
        result["reason"]="No complete MP4 + WebVTT + manifest trio"
        return result
    try:
        m=json.loads(meta.read_text(encoding="utf-8"))
        if m.get("sha256")!=hashlib.sha256(mp4.read_bytes()).hexdigest():
            result.update(status="integrity_failure",reason="Video checksum does not match its provenance record")
        elif m.get("input_sha256")!=input_digest(f):
            result.update(status="stale_or_renderer_changed",reason="Source script or render engine differs from export record")
        elif "UNAPPROVED" not in str(m.get("status","")):
            result.update(status="integrity_failure",reason="Unexpected status in technical preview")
        else:
            result.update(status="current_technical_preview",reason="Technical export built against current declared screenplay and render source")
        result["audio_approved"]=bool(m.get("voice_approved"))
        result["composition_approved"]=bool(m.get("continuous_playback_approved"))
        result["rights_approved"]=bool(m.get("source_rights_approved"))
        result["release_blockers"]=[
           field for field,key in (
             ("Human narration review","voice_approved"),
             ("Continuous image and sound screening","continuous_playback_approved"),
             ("Source and media licensing review","source_rights_approved"))
           if not m.get(key)
        ]
    except (ValueError,OSError) as e:
        result.update(status="manifest_error",reason=str(e)[:300])
    return result

states=[check(f) for f in films]
summary={}
for s in states:summary[s["status"]]=summary.get(s["status"],0)+1
payload={"status":"RELEASE BLOCKED UNTIL HUMAN AND SOURCE SIGN-OFF",
         "films_total":len(states),"counts":summary,"items":states,
         "preservation_rule":"Original website movies remain untouched. A passing technical preview alone is insufficient for publishing."}
out.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("FILM CURRENTNESS",summary)
