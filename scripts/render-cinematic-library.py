#!/usr/bin/env python3
"""Authoritative 44-film Ruwaidix V2 batch renderer. No production publication.

This program reads source-preserving evidence manifests and writes exclusively to
assets/films/library-v2/. No existing film route, MP4, caption or photograph is modified.
Synthetic speech is only a listening audition; *never* auto-approve film quality.
"""
import argparse
import hashlib
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"assets/films/cinematic-library-v2.json"
OUT=ROOT/"assets/films/library-v2"
STUDIO=ROOT/"scripts/render-directors-cuts.py"

spec=importlib.util.spec_from_file_location("ruwaidix_directors_studio",STUDIO)
studio=importlib.util.module_from_spec(spec)
spec.loader.exec_module(studio)

def load():
    d=json.loads(SOURCE.read_text(encoding="utf-8"))
    if d.get("version")!="CINEMATIC_LIBRARY_V2" or "UNAPPROVED" not in d.get("status",""):
        raise ValueError("Only explicitly unapproved V2 source manifests can be rendered")
    films=d["films"]
    if len(films)!=44 or len({x["slug"] for x in films})!=44:
        raise ValueError("Film archive must contain 44 unique previously made titles")
    if sum(x["slug"].startswith("pub-") for x in films)!=35:
        raise ValueError("Publication catalogue must retain all 35 revised movie scripts")
    for f in films:
        if f["output_collection"] not in ("feature","publication"):
            raise ValueError("Unknown output collection")
        if not re.fullmatch(r"[a-z0-9-]+",f["slug"]):raise ValueError("Invalid film slug")
        shots=f["shots"]
        if len(shots)<8 or len(shots)>12:
            raise ValueError("Unexpected film scene count: "+f["slug"])
        total=sum(int(s.get("sec",0)) for s in shots)
        if total<120 or total>168:
            raise ValueError("Every film must be 120–168 seconds: "+f["slug"])
        for number,shot in enumerate(shots,1):
            if int(shot.get("sec",0))<7 or not shot.get("narration") or not shot.get("credit"):
                raise ValueError(f"{f['slug']} scene {number} lacks essential information")
            if len(shot["narration"].split())/int(shot["sec"])>2.80:
                raise ValueError(f"{f['slug']} scene {number} reads too fast")
            if shot.get("object_id"):
                if shot.get("kind")!="museum_public_domain" or shot["object_id"] not in {451400,446288}:
                    raise ValueError("Unverified historical image reference")
                continue
            p=shot.get("image","")
            local=(ROOT/p).resolve()
            if not local.is_relative_to(ROOT) or not local.is_file():
                raise FileNotFoundError(f"{f['slug']} scene {number}: {p}")
            if shot.get("video") and not (
                shot["video"].startswith("https://") or (ROOT/shot["video"]).is_file()
            ):
                raise FileNotFoundError(shot["video"])
    # Every movie has a separate, reversible director's ledger. This becomes
    # part of the authoritative preview SHA without editing original sources.
    direction=json.loads((ROOT/"assets/films/directors-ledger-v3.json").read_text(encoding="utf-8"))
    if direction.get("status")!="UNAPPROVED_DIRECTORIAL_WORKPRINTS":
        raise ValueError("Unapproved directorial ledger is required")
    notes={x["slug"]:x for x in direction["films"]}
    if len(notes)!=44 or set(notes)!={f["slug"] for f in films}:
        raise ValueError("Directorial ledger must cover all 44 films exactly")
    for f in films:
        d=notes[f["slug"]]
        moves=d["camera_moves"]
        if len(moves)!=len(f["shots"]) or d["voice_preview"] not in ("bm_george","bm_lewis","am_michael","bf_emma"):
            raise ValueError("Bad camera or narrator plan: "+f["slug"])
        f["editorial_argument"]=d["editorial_argument"]
        f["visual_motif"]=d["visual_motif"]
        f["review_question"]=d["review_question"]
        f["voice_preview"]=d["voice_preview"]
        for shot,move in zip(f["shots"],moves):
            if move not in ("lock","slow-push","slow-pull","pan-left","pan-right","rise","settle"):
                raise ValueError("Unknown motion plan "+f["slug"])
            if (shot.get("object_id") or re.search(r"figure|microscopy|published|chart|experimental|measurement|historical object",shot["kind"],re.I)) and move!="lock":
                raise ValueError("Actual evidence must not be cropped: "+f["slug"])
            shot["camera_move"]=move
    return films

def input_digest(f):
    """Invalidate any audition export if its script, source, style or renderer changes."""
    h=hashlib.sha256()
    h.update(json.dumps(f,ensure_ascii=False,sort_keys=True).encode("utf-8"))
    h.update(STUDIO.read_bytes())
    h.update((ROOT/"scripts/render-documentary.py").read_bytes())
    return h.hexdigest()

def exists(f):
    stem=f["slug"]+"-rough-cut"
    files=[OUT/(stem+ext) for ext in (".mp4",".json",".vtt")]
    if not all(file.is_file() and file.stat().st_size>120 for file in files):
        return False
    try:
        record=json.loads(files[1].read_text(encoding="utf-8"))
        return record.get("input_sha256")==input_digest(f)
    except (ValueError,OSError):return False

def attempted(f):
    """Blocked renders count as attempted for a batch, but NOT as completed movies."""
    if exists(f):return True
    block=OUT/(f["slug"]+"-blocked.json")
    if not block.is_file():return False
    try:
        return json.loads(block.read_text(encoding="utf-8")).get("input_sha256")==input_digest(f)
    except (ValueError,OSError):return False

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--validate-only",action="store_true")
    p.add_argument("--remaining-count",action="store_true")
    p.add_argument("--film",action="append")
    p.add_argument("--collection",choices=("feature","publication"))
    p.add_argument("--missing-only",action="store_true")
    p.add_argument("--keep-going",action="store_true",help="Record blocked titles and continue without false completion")
    p.add_argument("--limit",type=int,default=2)
    p.add_argument("--models",default="film-models")
    p.add_argument("--voice-mode",choices=("human","kokoro-preview"),default="kokoro-preview")
    p.add_argument("--voice-dir")
    args=p.parse_args()
    films=load()
    if args.film:
        unknown=set(args.film)-{f["slug"] for f in films}
        if unknown:raise ValueError("Unknown film(s): "+", ".join(sorted(unknown)))
        films=[f for f in films if f["slug"] in args.film]
    if args.collection:
        films=[f for f in films if f["output_collection"]==args.collection]
    if args.missing_only or args.remaining_count:
        remaining=[f for f in films if not attempted(f)]
        print(f"Existing unapproved rough cuts: {len(films)-len(remaining)}; remaining: {len(remaining)}")
        films=remaining
    if args.remaining_count:
        print(len(films))
        return
    print("Films selected:",len(films),"; new renders capped at",args.limit)
    if args.validate_only:return
    if args.limit<1 or args.limit>6:raise ValueError("Batch limit must be 1–6")
    # Create files in preview directory only. Public website pointers stay untouched.
    OUT.mkdir(parents=True,exist_ok=True)
    studio.OUTPUT=OUT
    studio.engine.FILM=OUT
    for film in films[:args.limit]:
      try:
        # A film-level primary source, precise genre and scene provenance
        # stay on the result JSON for human editorial checking.
        studio.render(film,args)
        result=OUT/(film["slug"]+"-rough-cut.json")
        manifest=json.loads(result.read_text(encoding="utf-8"))
        manifest.update({
            "film_title":film["title"],
            "source_manifest":"assets/films/cinematic-library-v2.json",
            "source_script":film.get("source_path"),
            "primary_reference":film.get("primary"),
            "source_collection":film["output_collection"],
            "needs_human_narration_review":True,
            "needs_visual_composition_review":True,
            "never_auto_publish":True,
            "motion_shots":[{"scene":n+1,"video":s["video"],"credit":s["credit"],"kind":s["kind"],
                "source_sha256":(hashlib.sha256((ROOT/s["video"]).read_bytes()).hexdigest()
                  if not s["video"].startswith("https://") else None)}
                for n,s in enumerate(film["shots"]) if s.get("video")],
            "input_sha256":input_digest(film)
        })
        result.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
        stale=OUT/(film["slug"]+"-blocked.json")
        if stale.exists():stale.unlink()  # A verified export supersedes its earlier blocked attempt
        # A corrected render supersedes the previous failure marker.
        (OUT/(film["slug"]+"-blocked.json")).unlink(missing_ok=True)
      except Exception as exc:
        if not args.keep_going:raise
        block=OUT/(film["slug"]+"-blocked.json")
        block.write_text(json.dumps({"film":film["slug"],"status":"RENDER BLOCKED; NOT A COMPLETED VIDEO","error":str(exc)[:2000],"source":"assets/films/cinematic-library-v2.json","input_sha256":input_digest(film)},indent=2)+"\n")
        print("BLOCKED FILM",film["slug"],str(exc)[:400],file=sys.stderr)

if __name__=="__main__":
    main()
