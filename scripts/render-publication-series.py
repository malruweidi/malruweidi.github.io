#!/usr/bin/env python3
"""Render the Ruwaidix publication film series from evidence-linked manuscripts.
Uses the pre-existing open-source Kokoro/FFmpeg film functions, without avatars,
external proprietary generation, fake historical documents or fake scientific footage.
"""
import argparse
import hashlib
import importlib.util
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "assets" / "films" / "publication-series.json"
V6 = "--edition-v6" in __import__("sys").argv
OUTPUT = ROOT / "assets" / "films" / ("series-v6" if V6 else "series")
ENGINE = ROOT / "scripts" / "render-documentary.py"
OUTPUT.mkdir(parents=True, exist_ok=True)

spec = importlib.util.spec_from_file_location("ruwaidix_documentary_engine", ENGINE)
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)
engine.TOTAL_SECONDS = 84
engine.FILM = OUTPUT

def verify_catalog(items):
    if len(items) < 20 or len({x["id"] for x in items}) != len(items):
        raise AssertionError("The bibliography register must remain complete and unique.")
    requested = [x for x in items if x.get("production") == "render_requested"]
    if not requested:
        raise AssertionError("No source-grounded films selected for production.")
    for x in items:
        if not x.get("publication_title") or not x.get("film_title") or not x.get("page"):
            raise ValueError("Incomplete film register: " + x.get("id", "unknown"))
        if x.get("doi") and not x["doi"].startswith("10."):
            raise ValueError("Malformed DOI: " + x["id"])
        for field in ("poster",):
            p = (ROOT / x[field].lstrip("/")).resolve()
            if not p.is_relative_to(ROOT) or not p.exists():
                raise FileNotFoundError(str(p))
    for x in requested:
        if len(x["scenes"]) != 6 or x["duration_seconds"] != 84:
            raise AssertionError("A requested film must have six timed scenes and 84 seconds: " + x["id"])
        for i, scene in enumerate(x["scenes"], 1):
            if scene["id"] != f"{i:02d}":
                raise ValueError("Invalid scene order " + x["id"])
            for field in ("narration", "image", "credit", "link", "kind"):
                if not scene.get(field):
                    raise ValueError("Missing scene provenance " + x["id"] + ":" + field)
            p = (ROOT / scene["image"].lstrip("/")).resolve()
            if not p.is_relative_to(ROOT) or not p.exists():
                raise FileNotFoundError(str(p))
            if scene.get("video") and not scene["video"].startswith("https://"):
                p = (ROOT / scene["video"]).resolve()
                if not p.is_relative_to(ROOT) or not p.exists():
                    raise FileNotFoundError(str(p))
    return requested

def checked(*cmd):
    r = subprocess.run(cmd, text=True, capture_output=True)
    if r.returncode:
        raise RuntimeError(" ".join(cmd) + "\n" + r.stderr[-3000:])
    return r.stdout

def resolve_image(scene, work):
    p = Path(scene["image"])
    if not p.is_absolute(): p = ROOT / p
    if p.suffix.lower() != ".svg":
        return p
    import cairosvg
    path = work / ("drawing-" + scene["id"] + ".png")
    cairosvg.svg2png(url=str(p), write_to=str(path), output_width=1280)
    return path

def custom_overlay(scene, total, label):
    W, H = engine.W, engine.H
    panel = Image.new("RGBA", (W,H), (0,0,0,0))
    d = ImageDraw.Draw(panel)
    kind = label.lower()
    accent = (195,148,113) if "historic" in kind else (145,189,173) if "microscopy" in kind else (219,173,137)
    for y in range(420,H):
        shade = int(232 * ((y-420)/(H-420))**1.3)
        d.line([(0,y),(W,y)], fill=(10,32,36,shade))
    d.rectangle((58,50,112,54),fill=accent+(255,))
    d.text((58,70),"RUWAIDIX  /  SCIENTIFIC DOCUMENTARY",font=engine.font(17,True),fill=(246,242,234))
    d.text((58,105),label.upper()[:70],font=engine.font(15),fill=accent)
    d.text((58,486),scene["id"] + "  /  " + str(total).zfill(2),font=engine.font(18),fill=accent)
    title = scene["title"]
    lines = engine.lines_to_fit(title,d,engine.font(47,True),1120)
    for i,line in enumerate(lines[:2]):
        d.text((58,515+i*60),line,font=engine.font(47,True),fill=(249,245,236),stroke_width=1,stroke_fill=(4,25,32))
    evidence = "SOURCE / " + scene["kind"].upper()
    evidence = evidence[:115]
    d.text((58,677),evidence,font=engine.font(14),fill=(213,227,215))
    return panel

def write_vtt(items, starts, speech_lengths, path):
    cues = ["WEBVTT",""]
    for scene,start,length in zip(items,starts,speech_lengths):
        words = scene["narration"].split()
        mid = max(1,len(words)//2)
        for j,part in enumerate((words[:mid],words[mid:])):
            if not part: continue
            begin = start + .55 + j*length*.495
            end = min(start+.55+(j+1)*length*.495,start+length+.63)
            cues.extend([f"{engine.vtt_time(begin)} --> {engine.vtt_time(end)}"," ".join(part),""])
    path.write_text("\n".join(cues),encoding="utf-8")

def scene_provenance(entry, scenes=None):
    """Preserve visual evidence labels from the editorial source catalogue, not media encoding."""
    return [
        {"scene_id": scene["id"], "image": scene.get("provenance_image", scene["image"]), "kind": scene["kind"],
         "credit": scene["credit"], "source": scene["link"]}
        for scene in (scenes if scenes is not None else entry["scenes"])
    ]

def reconcile_manifests(items):
    """Repair metadata without modifying a published MP4 or its narration/subtitles."""
    updated = 0
    for entry in items:
        slug = entry["id"]
        manifest = OUTPUT / (slug + ".json")
        film = OUTPUT / (slug + ".mp4")
        if not manifest.exists() or not film.exists():
            continue
        old = json.loads(manifest.read_text(encoding="utf-8"))
        actual_digest = hashlib.sha256(film.read_bytes()).hexdigest()
        if old.get("sha256") != actual_digest:
            raise ValueError("Film digest differs from provenance manifest: " + slug)
        revised = dict(old)
        revised["image_classes"] = [scene["kind"] for scene in entry["scenes"]]
        revised["scene_provenance"] = scene_provenance(entry)
        if revised != old:
            manifest.write_text(json.dumps(revised, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            updated += 1
    print("Evidence manifests reconciled:", updated)

def render(entry, models):
    slug = entry["id"]
    engine.TOTAL_SECONDS = entry["duration_seconds"]
    engine.overlay = lambda scene: custom_overlay(scene, len(entry["scenes"]), entry["visual_language"])
    with tempfile.TemporaryDirectory(prefix="ruwaidix-"+slug+"-") as tmp:
        w = Path(tmp)
        for name in ("kokoro-v1.0.fp16.onnx", "voices-v1.0.bin"):
            src = models / name
            if not src.is_file(): raise FileNotFoundError(str(src))
            (w/name).symlink_to(src)
        scenes = [dict(x) for x in entry["scenes"]]
        if V6:
            modpath = ROOT / "scripts" / "film-art-direction-v6.py"
            artspec=importlib.util.spec_from_file_location("ruwaidix_art_direction_v6",modpath)
            art=importlib.util.module_from_spec(artspec)
            artspec.loader.exec_module(art)
            for scene in scenes:
                visual,label,source_record=art.select_visual(slug,scene,w,ROOT)
                scene["image"]=str(visual)
                scene["provenance_image"]=(str(visual.relative_to(ROOT)) if source_record else ("generated:film-art-direction-v6/"+slug+"/scene-"+scene["id"]))
                scene["kind"]=label
                scene["credit"]=label
                scene["link"]=entry.get("page") or "/publication-cinema.html"
                scene["contain"]=bool(source_record)
                scene.pop("video",None)
        speech,sr = engine.synthesize(scenes,w)
        counts = engine.allocate(speech,sr)
        starts = []
        frame_pointer = 0
        for c in counts:
            starts.append(frame_pointer/engine.FPS)
            frame_pointer += c
        write_vtt(scenes,starts,[len(s)/sr for s in speech],OUTPUT/(slug+".vtt"))
        videos=[]
        classes=[]
        for scene,count in zip(scenes,counts):
            duration = count/engine.FPS
            picture = resolve_image(scene,w)
            motion = engine.source_path(scene,"video",w) if scene.get("video") else None
            if scene.get("video") and not motion:
                raise RuntimeError("Primary footage unavailable; no silent substitution allowed")
            frame,over = engine.make_frame(scene,picture,w)
            out = w/("shot-"+scene["id"]+".mp4")
            engine.make_clip(scene,picture,motion,frame,over,duration,out)
            classes.append(scene["kind"])
            videos.append(out)
        playlist = w/"playlist.txt"
        playlist.write_text("".join("file '"+str(x)+"'\n" for x in videos),encoding="utf-8")
        combined = w/"picture.mp4"
        checked("ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(playlist),"-c","copy",str(combined))
        audio = engine.soundtrack(speech,sr,counts,w)
        out = OUTPUT/(slug+".mp4")
        checked("ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(combined),"-i",str(audio),
              "-map","0:v:0","-map","1:a:0","-c:v","copy","-af","loudnorm=I=-18:TP=-2:LRA=11",
              "-c:a","aac","-b:a","160k","-t",str(entry["duration_seconds"]),
              "-movflags","+faststart",str(out))
        duration=float(json.loads(checked("ffprobe","-v","error","-show_entries","format=duration","-of","json",str(out)))["format"]["duration"])
        if abs(duration-entry["duration_seconds"])>.3: raise AssertionError("Unexpected film length")
        if out.stat().st_size>90000000: raise ValueError("Video too large for normal GitHub content")
        record={"id":slug,"seconds":round(duration,2),"sha256":hashlib.sha256(out.read_bytes()).hexdigest(),
                "primary_source":("https://doi.org/"+entry["doi"]) if entry.get("doi") else entry.get("source_url", entry["page"]),
                "voice":"Open Kokoro ONNX, synthetic actor-free narrator","image_classes":classes,
                "scene_provenance":scene_provenance(entry,scenes),
                "disclosure":"Illustrations, archival context and scientific figures are identified; no AI images presented as source evidence."}
        (OUTPUT/(slug+".json")).write_text(json.dumps(record,indent=2)+"\n")
        print("RENDERED",slug,round(duration,2),"seconds",out.stat().st_size,"bytes")

def backfill_video_posters():
    """Use an actual frame from each published MP4, never an unrelated cover photograph."""
    created = 0
    for film in sorted(OUTPUT.glob("*.mp4")):
        poster = film.with_suffix(".webp")
        if poster.exists() and poster.stat().st_size > 1000:
            continue
        checked("ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-ss", "1.0", "-i", str(film), "-frames:v", "1",
                "-vf", "scale=960:-2", "-q:v", "75", str(poster))
        if not poster.exists() or poster.stat().st_size < 1000:
            raise RuntimeError("Failed to extract original first-frame poster: " + str(film))
        created += 1
    print("MP4-sourced posters generated:", created)
    # This is the only authority the public catalogue uses to switch editions.
    # A release is enumerated only after its movie, subtitles, provenance record,
    # and its own authentic thumbnail are all present and consistent.
    releases = []
    for film in sorted(OUTPUT.glob("*.mp4")):
        subs=film.with_suffix(".vtt")
        metadata=film.with_suffix(".json")
        poster=film.with_suffix(".webp")
        if not all(p.is_file() and p.stat().st_size > 500 for p in (film,subs,metadata,poster)):
            continue
        record=json.loads(metadata.read_text(encoding="utf-8"))
        if record.get("id")!=film.stem:
            raise ValueError("Release slug mismatch: " + film.name)
        if record.get("sha256")!=hashlib.sha256(film.read_bytes()).hexdigest():
            raise ValueError("Release checksum mismatch: " + film.name)
        if not subs.read_text(encoding="utf-8").startswith("WEBVTT"):
            raise ValueError("Missing valid captions: " + film.name)
        releases.append({"id":film.stem,"edition":"series-v6",
                         "poster":"/assets/films/series-v6/"+film.stem+".webp",
                         "duration_seconds":record["seconds"],
                         "sha256":record["sha256"]})
    if V6:
        index={"schema":"ruwaidix-film-releases-v1","count":len(releases),"films":releases}
        (OUTPUT/"releases.json").write_text(json.dumps(index,indent=2)+"\\n",encoding="utf-8")
        print("Ready-to-play V6 films indexed:", len(releases))

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--validate-only",action="store_true")
    p.add_argument("--posters-only",action="store_true",help="Extract original frames from all rendered MP4 files")
    p.add_argument("--edition-v6",action="store_true",help="Rebuild in a separate safe v6 directory")
    p.add_argument("--skip-v5",action="store_true",help="Preserve the five newer source-figure editions")
    p.add_argument("--models",default="film-models")
    p.add_argument("--film",action="append",help="Specific slug; otherwise renders all currently selected films")
    p.add_argument("--missing-only",action="store_true",help="Keep verified existing MP4/VTT/JSON releases; render only absent titles")
    p.add_argument("--limit",type=int,help="Maximum number of missing films to render per job, so completed films can be published in batches")
    p.add_argument("--remaining-count",action="store_true",help="Print how many releases lack a complete MP4, VTT and JSON manifest")
    p.add_argument("--reconcile-manifests",action="store_true",help="Correct existing release evidence labels without re-rendering films")
    opts=p.parse_args()
    data=json.loads(CATALOG.read_text(encoding="utf-8"))
    items=verify_catalog(data["items"])
    if opts.skip_v5:
        preserved={"pla-scaffolds","microfluidic-virus","making-medicines-keep","pla-grafting","flow-chamber-method"}
        items=[x for x in items if x["id"] not in preserved]
    if opts.film:
        wanted=set(opts.film)
        missing = wanted - {x["id"] for x in items}
        if missing: raise ValueError("Not selected for render: "+", ".join(sorted(missing)))
        items=[x for x in items if x["id"] in wanted]
    print("Films validated:", ", ".join(x["id"] for x in items))
    if opts.validate_only: return
    if opts.posters_only:
        backfill_video_posters()
        return
    if opts.reconcile_manifests:
        if V6: raise ValueError("V6 is source-exact; do not replace its original records with old metadata")
        reconcile_manifests(items)
        return
    if opts.missing_only or opts.remaining_count:
        absent = [e for e in items if not all((OUTPUT / (e["id"] + ext)).is_file() and
                  (OUTPUT / (e["id"] + ext)).stat().st_size > 100
                  for ext in (".mp4", ".vtt", ".json"))]
        print("Existing source-preserving releases:", len(items)-len(absent))
        items = absent
    if opts.remaining_count:
        print(len(items))
        return
    if opts.limit is not None:
        if opts.limit < 1:
            raise ValueError("--limit must be a positive integer")
        print("Releases in this checkpoint batch:", min(opts.limit, len(items)))
        items = items[:opts.limit]
    models=(ROOT/opts.models).resolve()
    for entry in items:
        render(entry,models)

if __name__=="__main__":
    main()
