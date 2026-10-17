#!/usr/bin/env python3
"""Rebuild four two-minute Ruwaidix evidence documentaries as reversible V2 cuts.
Reuses original source-annotated 8-scene films, TTS and soundtrack. Inserts motion
only into predefined conceptual/illustrated shots, not research photographs.
"""
import argparse
import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"assets"/"films"
TARGET=SOURCE/"longform-v2"
REGISTRY=SOURCE/"longform-remake-direction.json"

def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def get_inputs():
    film=load("ruwaidix_evidence_original",ROOT/"scripts"/"render-evidence-series.py")
    motion=load("ruwaidix_motion_long",ROOT/"scripts"/"film-overhaul-motion.py")
    registry=json.loads(REGISTRY.read_text(encoding="utf8"))["films"]
    items=film.validate()
    for entry in items:
        slug=entry["slug"]
        if slug not in registry: raise ValueError("Unplanned documentary: "+slug)
        targets=set(registry[slug]["scenes_to_reanimate"])
        if len(targets)<1 or not targets <= {s["id"] for s in entry["scenes"]}:
            raise ValueError("Invalid animation targets: "+slug)
        for s in entry["scenes"]:
            if s["id"] in targets and s["kind"].lower().startswith(("original specimen photograph","published scientific figure")):
                raise ValueError("Cannot animate a published specimen photograph: "+slug+s["id"])
    return film,motion,registry,items

def is_release_ready(entry):
    base=entry.get("media_stem",entry["slug"])
    p=TARGET/(base+".mp4")
    meta=TARGET/(entry["slug"]+"-build.json")
    if not(p.is_file() and meta.is_file() and (TARGET/(base+".vtt")).is_file()): return False
    record=json.loads(meta.read_text(encoding="utf8"))
    if record.get("edition")!="longform-v2":return False
    if hashlib.sha256(p.read_bytes()).hexdigest()!=record.get("sha256"):
        raise RuntimeError("Altered rendered file "+base)
    return True

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    parser.add_argument("--remaining-count",action="store_true")
    parser.add_argument("--missing-only",action="store_true")
    parser.add_argument("--limit",type=int,default=1)
    parser.add_argument("--workspace",default="film-models")
    parser.add_argument("--only")
    args=parser.parse_args()
    film,motion,registry,entries=get_inputs()
    if args.only:
        if args.only not in {x["slug"] for x in entries}:raise ValueError("Unknown feature "+args.only)
        entries=[x for x in entries if x["slug"]==args.only]
    if args.validate_only:
        print("Validated four original eight-chapter scientific documentaries.")
        return
    if args.missing_only or args.remaining_count:
        entries=[x for x in entries if not is_release_ready(x)]
    if args.remaining_count:
        print(len(entries))
        return
    if args.limit<1: raise ValueError("Limit must be positive")
    entries=entries[:args.limit]
    if not entries: return
    TARGET.mkdir(parents=True,exist_ok=True)
    TARGET.joinpath("plates").mkdir(parents=True,exist_ok=True)
    # Third-party photographic sources retain their original paths and licensing
    # register, referenced via a build-only symlink, never duplicated or relabelled.
    link=TARGET/"visual-sources"
    if not link.exists():link.symlink_to(SOURCE/"visual-sources",target_is_directory=True)
    film.FILMS=TARGET
    film.PLATES=TARGET/"plates"
    active={}
    original_clip=film.old.make_clip
    def animated_clip(item,image,video,frame,over,duration,out):
        stem=Path(frame).stem
        chapter=stem[7:] if stem.startswith("source-") else None
        if chapter and chapter in active.get("ids",()):
            return motion.animate_scene({"_remake":active["plan"],"id":chapter},
                                        frame,over,duration,out)
        return original_clip(item,image,video,frame,over,duration,out)
    film.old.make_clip=animated_clip
    from kokoro_onnx import Kokoro
    models=(ROOT/args.workspace).resolve()
    tts=Kokoro(str(models/"kokoro-v1.0.fp16.onnx"),str(models/"voices-v1.0.bin"))
    for entry in entries:
        slug=entry["slug"]
        p=registry[slug]
        # This is an authored companion annotation, not an experimental curve.
        kind="interface" if slug=="what-a-bubble-can-do" else \
             "histology" if slug=="two-materials-no-section" else \
             "pharmacy" if slug=="making-medicines-keep" else "editorial"
        ann=p["beats"][:3]
        active={"plan":{"motif":kind,"annotations":ann},"ids":set(p["scenes_to_reanimate"])}
        film.render_one(entry,tts)
        path=TARGET/(slug+"-build.json")
        record=json.loads(path.read_text(encoding="utf8"))
        record["edition"]="longform-v2"
        record["human_screening"]="NOT YET COMPLETED"
        record["animated_scene_ids"]=p["scenes_to_reanimate"]
        record["evidence_boundary"]=p["strict"]
        record["method"]="Pillow + FFmpeg open-source explanatory moving plates, original Kokoro synthesis"
        path.write_text(json.dumps(record,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
        print("LONG FORM V2",slug,record["seconds"],"s",record["animated_scene_ids"])

if __name__=="__main__":
    main()
