#!/usr/bin/env python3
"""Contact-sheet and evidence audit for the COMPLETE Ruwaidix film inventory.

No original film/video/photograph is modified. Every one of the 44 published MP4s
receives six actual decoded video frames, with timecodes, and a machine-readable
provenance/visual-variety record. Similarity flags are editorial prompts, not
claims that two clips depict the exact same physical source.
"""
import argparse
import json
import re
import subprocess
import tempfile
from collections import Counter
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageStat

ROOT=Path(__file__).resolve().parents[1]
FILMS=ROOT/"assets"/"films"
OUT=FILMS/"audit"
SHEETS=OUT/"contact-sheets"
CATALOG=FILMS/"publication-series.json"
MAIN=FILMS/"evidence-in-motion.json"
FONTS=[
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]

def command(args):
    p=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    if p.returncode:raise RuntimeError("Failed "+" ".join(map(str,args))+" "+p.stderr[-900:])
    return p.stdout

def font(size,bold=False):
    return ImageFont.truetype(FONTS[1 if bold else 0],size)

def frame_at(video,second,out):
    command(["ffmpeg","-hide_banner","-loglevel","error","-y",
             "-ss",f"{second:.3f}","-i",str(video),"-frames:v","1",
             "-vf","scale=480:270:force_original_aspect_ratio=decrease,"
                  "pad=480:270:(ow-iw)/2:(oh-ih)/2:color=0x10191b",
             "-threads","1",str(out)])
    if not out.is_file():raise RuntimeError("No frame produced "+str(video))

def image_hash(image):
    # Top-level letterboxing and headings have little influence: focus on specimen/art.
    crop=image.crop((80,50,400,230))
    sample=ImageOps.grayscale(crop).resize((9,8),Image.Resampling.LANCZOS)
    b=list(sample.getdata())
    return tuple(b[y*9+x] < b[y*9+x+1] for y in range(8) for x in range(8))

def hamming(a,b):
    return sum(v!=w for v,w in zip(a,b))

def source_catalog():
    items=json.loads(CATALOG.read_text(encoding="utf-8"))["items"]
    standalone={}
    for file in ["what-survives-scenes.json","airway-reopening-evidence-scenes.json",
                 "cairo-microscope-scenes.json","ring-that-never-closed-scenes.json",
                 "two-materials-scenes.json"]:
        p=FILMS/file
        if p.is_file():standalone[file]=json.loads(p.read_text(encoding="utf-8"))["scenes"]
    evidence=json.loads(MAIN.read_text(encoding="utf-8"))["films"]
    slugs={x["slug"]:x for x in evidence}
    return items,standalone,slugs

def media_info(video):
    return json.loads(command(["ffprobe","-v","error","-show_entries",
                                "format=duration,size:stream=codec_type,codec_name,width,height",
                                "-of","json",str(video)]))

def run(limit=0):
    videos=sorted((FILMS).glob("*.mp4"))+sorted((FILMS/"series").glob("*.mp4"))
    if len(videos)<44:raise AssertionError("Less than 44 known original releases; audit must not silently exclude videos")
    items,standalone,evidence=source_catalog()
    byid={x["id"]:x for x in items}
    records=[]
    SHEETS.mkdir(parents=True,exist_ok=True)
    for index,video in enumerate(videos):
        stem=video.stem
        is_series=video.parent.name=="series"
        entry=byid.get(stem) if is_series else None
        data=evidence.get(stem) if not is_series else None
        if not data and stem=="two-materials-no-section-evidence-cut":
            data=evidence.get("two-materials-no-section")
        special={
            "what-survives-the-experiment":"what-survives-scenes.json",
            "airway-reopening-evidence-cut":"airway-reopening-evidence-scenes.json",
            "cairo-microscope":"cairo-microscope-scenes.json",
            "ring-that-never-closed":"ring-that-never-closed-scenes.json",
            "two-materials-no-section":"two-materials-scenes.json",
        }.get(stem)
        scenes=entry.get("scenes",[]) if entry else (standalone[special] if special else (data or {}).get("scenes",[]))
        images=[str(s.get("image") or s.get("visual") or s.get("diagram") or "").strip() for s in scenes]
        source_images=[x for x in images if x]
        count=Counter(source_images)
        distinct=len(count)
        external_motion=sum(bool(s.get("video") or s.get("videos")) for s in scenes)
        kind="publication_short" if is_series else "standalone"
        info=media_info(video)
        seconds=float(info["format"]["duration"])
        number=6
        stamps=[seconds*(j+.5)/number for j in range(number)]
        out_dir="series" if is_series else "standalone"
        destination=SHEETS/out_dir
        destination.mkdir(parents=True,exist_ok=True)
        sheet=Image.new("RGB",(1440,648),(18,32,36))
        draw=ImageDraw.Draw(sheet)
        hashes=[]
        with tempfile.TemporaryDirectory() as tmp:
            for j,t in enumerate(stamps):
                png=Path(tmp)/f"{j:02d}.png"
                frame_at(video,t,png)
                with Image.open(png) as img:
                    im=img.convert("RGB").copy()
                hashes.append(image_hash(im))
                x=(j%3)*480; y=(j//3)*324
                sheet.paste(im,(x,y))
                draw.rectangle((x,y+270,x+480,y+324),fill=(24,43,49))
                draw.text((x+13,y+278),f"{j+1}/6 · {int(t//60):02d}:{int(t%60):02d}",font=font(19,True),fill=(228,211,178))
                draw.text((x+160,y+278),stem[:27],font=font(14),fill=(190,204,193))
        path=destination/(stem+".webp")
        sheet.save(path,"WEBP",quality=75,method=5)
        close_pairs=sum(hamming(hashes[i],hashes[j])<=9 for i in range(6) for j in range(i+1,6))
        record={
            "id":stem,"collection":kind,"duration_seconds":round(seconds,2),
            "source_scene_count":len(scenes),
            "referenced_distinct_illustration_or_image_count":distinct,
            "scene_image_reuse_count":len(source_images)-distinct,
            "max_single_image_scene_uses":max(count.values()) if count else 0,
            "source_video_references":external_motion,
            "near_duplicate_pair_candidates_in_six_sampled_frames":close_pairs,
            "contact_sheet":str(path.relative_to(ROOT)),
            "film":str(video.relative_to(ROOT)),
            "source_record":("assets/films/publication-series.json" if entry else
                ("assets/films/"+special if special else
                  ("assets/films/evidence-in-motion.json" if data else "none/needs-verification"))),
            "caution":"Similarity is pixel-based and does not reliably establish editorial or scientific originality."
        }
        records.append(record)
        print(f"{index+1:02d}/{len(videos)} {video.name}: {seconds:.1f}s "
              f"source variation {distinct}/{len(scenes)}; flagged frame pairs {close_pairs}",flush=True)
        if limit and index+1>=limit:break
    report={
        "scope":"All locally published 44 documentary films; separate from original raw experimental recordings",
        "method":"FFmpeg decodes six evenly spaced frames from EACH MP4. Pillow creates thumbnails, metadata from stored provenance, and a coarse near-duplicate indicator for further editorial inspection.",
        "no_assumption":"Technical source variety and perceptual similarity are triage signals. They cannot alone measure visual beauty, narration quality, consent, factual accuracy, or the artistic strength of each film.",
        "completed_films":len(records),
        "short_publication_count":sum(x["collection"]=="publication_short" for x in records),
        "source_count_le_three":sum(x["collection"]=="publication_short" and x["referenced_distinct_illustration_or_image_count"]<=3 for x in records),
        "records":records,
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"full-film-inventory.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("AUDIT",report["completed_films"],"films;",report["source_count_le_three"],
          "publication films with three or fewer distinct source pictures",flush=True)

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--limit",type=int,default=0)
    args=parser.parse_args()
    run(args.limit)
