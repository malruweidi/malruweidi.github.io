#!/usr/bin/env python3
"""Produce a complete, reversible V2 cut for all 35 Ruwaidix short films.

Imports the original verified Kokoro + FFmpeg pipeline rather than discarding
authentic imagery or modifying existing released video files.
"""
import argparse
import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OLD=ROOT/"scripts"/"render-publication-series.py"
MOTION=ROOT/"scripts"/"film-overhaul-motion.py"
DIR=ROOT/"assets"/"films"/"series-v2"
DIRECTION=ROOT/"assets"/"films"/"remake-direction.json"
CATALOG=ROOT/"assets"/"films"/"publication-series.json"

def module(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    obj=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(obj)
    return obj

def cues(text, limit=57):
    words=text.split()
    chunks=[]
    line=""
    for word in words:
        trial=(line+" "+word).strip()
        if line and len(trial)>limit:
            chunks.append(line)
            line=word
        else:
            line=trial
    if line: chunks.append(line)
    return chunks

def vtt_writer(pub):
    """Captions preserve exact text, avoiding long two-half paragraph subtitles."""
    def writer(scenes,starts,speech_seconds,path):
        out=["WEBVTT",""]
        for s,base,seconds in zip(scenes,starts,speech_seconds):
            text=cues(s["narration"])
            lengths=[len(v) for v in text]
            total=sum(lengths)
            duration=max(.1,seconds)
            elapsed=0.0
            for i,part in enumerate(text):
                start=base+.55+elapsed
                elapsed+=duration*lengths[i]/total
                end=min(base+.55+duration,base+.55+elapsed)
                if end<=start: end=start+.03
                out.extend([f"{pub.engine.vtt_time(start)} --> {pub.engine.vtt_time(end)}",part,""])
        path.write_text("\n".join(out),encoding="utf8")
    return writer

def valid_release(entry):
    slug=entry["id"]
    v=DIR/(slug+".mp4")
    t=DIR/(slug+".vtt")
    m=DIR/(slug+".json")
    if not (v.exists() and t.exists() and m.exists()): return False
    if min(v.stat().st_size,t.stat().st_size,m.stat().st_size)<20: return False
    manifest=json.loads(m.read_text(encoding="utf8"))
    if manifest.get("edition")!="cinematic-v2" or manifest.get("remaster_signature")!="story-motion-v2.2":
        return False
    if entry.get("source_visual_revision") and manifest.get("source_visual_revision") != entry.get("source_visual_revision"):
        return False
    if hashlib.sha256(v.read_bytes()).hexdigest()!=manifest.get("sha256"):
        raise ValueError("Existing v2 release has a hash mismatch: "+slug)
    return True

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    parser.add_argument("--remaining-count",action="store_true")
    parser.add_argument("--missing-only",action="store_true")
    parser.add_argument("--limit",type=int,default=2)
    parser.add_argument("--film",action="append")
    parser.add_argument("--models",default="film-models")
    args=parser.parse_args()

    pub=module("ruwaidix_publication_v1",OLD)
    motion=module("ruwaidix_motion",MOTION)
    catalogue=json.loads(CATALOG.read_text(encoding="utf8"))
    directions=json.loads(DIRECTION.read_text(encoding="utf8"))
    items=pub.verify_catalog(catalogue["items"])
    if set(directions["films"])!={x["id"] for x in items}:
        raise ValueError("Every film must have a manually written motion direction")
    if args.film:
        unknown=set(args.film)-{x["id"] for x in items}
        if unknown: raise ValueError("Unknown film(s): "+repr(unknown))
        items=[x for x in items if x["id"] in set(args.film)]
    for entry in items:
        plan=directions["films"][entry["id"]]
        if len(plan["annotations"])!=3 or not plan.get("evidence_boundary"):
            raise ValueError("Incomplete authorial / scientific boundary: "+entry["id"])
    if args.validate_only:
        print("Validated",len(items),"original publication narratives and 35 full film motion directions.")
        return
    DIR.mkdir(parents=True,exist_ok=True)
    if args.missing_only or args.remaining_count:
        items=[x for x in items if not valid_release(x)]
    if args.remaining_count:
        print(len(items))
        return
    if args.limit<1: raise ValueError("--limit must be positive")
    items=items[:args.limit]
    print("Selected cinematic remakes:",", ".join(x["id"] for x in items))
    if not items: return

    pub.OUTPUT=DIR
    pub.engine.FILM=DIR
    original_make_clip=pub.engine.make_clip
    def cinematic_clip(scene,image,video,frame,over,duration,out):
        if scene.get("_remake") and not video:
            return motion.animate_scene(scene,image,over,duration,out)
        return original_make_clip(scene,image,video,frame,over,duration,out)
    pub.engine.make_clip=cinematic_clip
    pub.write_vtt=vtt_writer(pub)
    models=(ROOT/args.models).resolve()
    for entry in items:
        plan=directions["films"][entry["id"]]
        # Four dramaturgically different, expressly conceptual chapters, while
        # chapters 01/06 retain full-width source/figure presentation.
        # A published figure in an intermediate chapter is shown completely
        # (uncropped) in the left original-source inset; NO data are altered.
        picks=[scene for scene in entry["scenes"]
               if scene["id"] in {"02","03","04","05"} and not scene.get("video")]
        if len(picks)<2:
            raise ValueError("Insufficient distinctly authored animated chapters: "+entry["id"])
        for scene in picks:
            scene["_remake"]={
                **plan,
                "motif":plan["scene_motifs"][scene["id"]],
            }
        pub.render(entry,models)
        p=DIR/(entry["id"]+".json")
        record=json.loads(p.read_text(encoding="utf8"))
        record["edition"]="cinematic-v2"
        record["remaster_signature"]="story-motion-v2.2"
        record["source_visual_revision"]=entry.get("source_visual_revision")
        record["human_screening"]="NOT YET COMPLETED; narration, science and device playback require sign-off"
        record["animated_scene_ids"]=[s["id"] for s in picks]
        record["motion_motif"]=plan["motif"]
        record["motion_storyboard"]=plan["scene_motifs"]
        record["motion_annotations"]=plan["annotations"]
        record["evidence_boundary"]=plan["evidence_boundary"]
        record["method"]="Open-source Pillow vector/keyframe render, FFmpeg H.264/AAC, Kokoro-ONNX narrator; no proprietary video generators"
        record["subtitle_timing"]="Narration-length estimate, not forced alignment"
        p.write_text(json.dumps(record,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
        v=DIR/(entry["id"]+".mp4")
        parsed=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(v)]))
        if abs(float(parsed["format"]["duration"])-84)>.3:
            raise ValueError("Unexpected release duration "+entry["id"])
        print("CINEMATIC V2.2",entry["id"],",",v.stat().st_size,"bytes",
              "animated",record["animated_scene_ids"],flush=True)

if __name__=="__main__":
    main()
