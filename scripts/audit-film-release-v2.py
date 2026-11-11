#!/usr/bin/env python3
"""Evidence-aware release gate for Ruwaidix's 44-film cinematic editions.

Do not confuse a technically valid MP4 with a publishable film.
All computed statuses are technical; human sign-off is an independent condition.
"""
import argparse
import hashlib
import json
import re
import subprocess
from datetime import datetime,timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LIBRARY=ROOT/"assets/films/cinematic-library-v2.json"
EXPORTS=ROOT/"assets/films/library-v2"
DEST=ROOT/"assets/films/visual-audit-v2"
STUDIO=ROOT/"scripts/render-directors-cuts.py"
ENGINE=ROOT/"scripts/render-documentary.py"

def digest(filename):
    h=hashlib.sha256()
    with filename.open("rb") as file:
        while block:=file.read(2**20):
            h.update(block)
    return h.hexdigest()

def source_digest(f):
    h=hashlib.sha256()
    h.update(json.dumps(f,ensure_ascii=False,sort_keys=True).encode("utf-8"))
    h.update(STUDIO.read_bytes())
    h.update(ENGINE.read_bytes())
    return h.hexdigest()

def probe(mp4):
    p=subprocess.run(["ffprobe","-v","error","-show_entries",
                      "stream=index,codec_name,codec_type,width,height,r_frame_rate:format=duration",
                      "-of","json",str(mp4)],capture_output=True,text=True,timeout=25)
    if p.returncode:raise ValueError("Unreadable movie metadata: "+p.stderr[:160])
    return json.loads(p.stdout)

def parse_vtt(path,duration):
    text=path.read_text(encoding="utf8")
    if not text.startswith("WEBVTT\n"):return ["Invalid WebVTT header"]
    times=re.findall(r"(\d\d:\d\d:\d\d\.\d\d\d) --> (\d\d:\d\d:\d\d\.\d\d\d)",text)
    def s(t):
        h,m,rest=t.split(":")
        return int(h)*3600+int(m)*60+float(rest)
    issues=[]
    if len(times)<4:issues.append("Missing adequate captions")
    last=0.0
    for start,end in times:
        a,b=s(start),s(end)
        if b<=a:issues.append("Caption cue reversed or empty")
        if a<last-.03:issues.append("Caption cue order overlaps")
        if b>duration+1:issues.append("Caption after movie end")
        last=b
    return list(dict.fromkeys(issues))

def inspect(f):
    slug=f["slug"]
    root=EXPORTS/(slug+"-rough-cut")
    files={ext:Path(str(root)+ext) for ext in (".mp4",".json",".vtt")}
    out={"id":slug,"title":f["title"],
         "duration_expected":sum(s["sec"] for s in f["shots"]),
         "source_script":f.get("source_path"),"release_status":"NOT APPROVED",
         "approval":{"image_rights":False,"scientific_readthrough":False,
                     "voice_pronunciation":False,"picture_edit":False,
                     "caption_listening":False,"mobile_playback":False},
         "errors":[],"warnings":[]}
    missing=[ext for ext,p in files.items() if not p.is_file()]
    if missing:
        out["errors"].append("Missing "+", ".join(missing))
        out["technical_current"]=False
        return out
    try:
        meta=json.loads(files[".json"].read_text(encoding="utf-8"))
        movie=probe(files[".mp4"])
        streams=movie.get("streams",[])
        picture=next((x for x in streams if x.get("codec_type")=="video"),None)
        sound=next((x for x in streams if x.get("codec_type")=="audio"),None)
        seconds=float(movie["format"]["duration"])
        out["duration_actual"]=round(seconds,3)
        out["sha256"]=digest(files[".mp4"])
        out["voice_mode"]=meta.get("voice_mode","unknown")
        if meta.get("input_sha256")!=source_digest(f):
            out["errors"].append("Old source digest: render must be regenerated")
        if abs(seconds-out["duration_expected"])>.35:
            out["errors"].append("Export length contradicts approved scene plan")
        if meta.get("sha256")!=out["sha256"]:
            out["errors"].append("MP4 checksum does not match its recorded provenance")
        if not picture or picture.get("codec_name")!="h264":
            out["errors"].append("Missing H.264 video stream")
        if not sound or sound.get("codec_name")!="aac":
            out["errors"].append("Missing AAC audio stream")
        if picture and (picture.get("width")!=1280 or picture.get("height")!=720):
            out["errors"].append("Unexpected movie frame dimensions")
        out["errors"].extend(parse_vtt(files[".vtt"],seconds))
        if meta.get("voice_approved") or meta.get("continuous_playback_approved"):
            out["errors"].append("Unverified production metadata claims human approval")
        if "NEEDS" not in str(meta.get("status","")).upper() and "UNAPPROVED" not in str(meta.get("status","")).upper():
            out["warnings"].append("Status lacks explicit editorial disclaimer")
        if out["voice_mode"]=="kokoro-preview":
            out["warnings"].append("Audition-only synthetic voice; not the approved final narrator")
        source_images={s.get("image") or f'MET:{s.get("object_id")}' for s in f["shots"]}
        if len(source_images)<4:
            out["warnings"].append("Too few distinct source images for an independently directed movie")
        out["technical_current"]=not out["errors"]
    except Exception as exc:
        out["errors"].append(str(exc)[:260])
        out["technical_current"]=False
    return out

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--strict",action="store_true",help="Exit failure if a single film is not technically current")
    p.add_argument("--write",action="store_true",help="Write a versioned objective assessment ledger")
    args=p.parse_args()
    films=json.loads(LIBRARY.read_text(encoding="utf8"))["films"]
    if len(films)!=44:raise AssertionError("All 44 historical MP4 titles must be retained")
    results=[inspect(f) for f in films]
    current=sum(x["technical_current"] for x in results)
    problems=[{"id":x["id"],"errors":x["errors"]} for x in results if x["errors"]]
    record={"status":"TECHNICAL SCREENING; NOT FINAL ARTISTIC APPROVAL",
            "date_utc":datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "expected":len(films),"export_files":len(films)-sum("Missing" in ",".join(x["errors"]) for x in results),
            "current":current,"outdated_or_invalid":len(films)-current,
            "human_approved":0,"failed":[x["id"] for x in results if not x["technical_current"]],
            "films":results}
    print("Films",len(films),"current technical editions",current,
          "stale or invalid",len(films)-current,"human-approved",0)
    for failure in problems:
        print("REBUILD:",failure["id"],"|","; ".join(failure["errors"]))
    if args.write:
        DEST.mkdir(parents=True,exist_ok=True)
        (DEST/"release-gate-v2.json").write_text(
            json.dumps(record,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    if args.strict and current!=len(films):
        raise SystemExit(1)

if __name__=="__main__":
    main()
