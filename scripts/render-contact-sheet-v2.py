#!/usr/bin/env python3
"""Visual and technical review of actual Ruwaidix V2 movie exports.

Creates contact sheets from real MP4 frames, not storyboards or synthetic previews.
An output marked QA-pass means only technical integrity, never artistic approval.
"""
import argparse
import hashlib
import io
import json
import re
import subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"assets/films/cinematic-library-v2.json"
FILMS=ROOT/"assets/films/library-v2"
OUT=ROOT/"assets/films/visual-audit-v2"

def shell(cmd):
    p=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode:raise RuntimeError(p.stderr.decode("utf8",errors="replace")[-800:])
    return p.stdout

def probe(p):
    return json.loads(shell(["ffprobe","-v","error","-show_streams","-show_format","-of","json",str(p)]))

def frame(p,time):
    # Force the scaled height below the padded 208 px canvas. FFmpeg rounds
    # fractional scaled dimensions (16:9 -> 207/208 px) and otherwise can
    # report "Padded dimensions cannot be smaller than input dimensions".
    data=shell(["ffmpeg","-hide_banner","-loglevel","error","-ss",str(time),"-i",str(p),
                "-frames:v","1","-vf","scale=368:206:force_original_aspect_ratio=decrease,"
                "pad=368:208:(ow-iw)/2:(oh-ih)/2:color=0x0b252b",
                "-f","image2pipe","-vcodec","mjpeg","-"])
    return Image.open(io.BytesIO(data)).convert("RGB")

def audit(film):
    name=film["slug"]
    mp4=FILMS/(name+"-rough-cut.mp4")
    captions=FILMS/(name+"-rough-cut.vtt")
    record=FILMS/(name+"-rough-cut.json")
    issues=[]
    if not all(p.is_file() for p in (mp4,captions,record)):
        return None
    meta=json.loads(record.read_text(encoding="utf8"))
    info=probe(mp4)
    duration=float(info["format"]["duration"])
    stream=next((s for s in info["streams"] if s["codec_type"]=="video"),None)
    sound=next((s for s in info["streams"] if s["codec_type"]=="audio"),None)
    if not stream or stream["codec_name"]!="h264":issues.append("No supported H.264 video")
    if not sound or sound["codec_name"]!="aac":issues.append("No supported AAC audio")
    if stream and (stream.get("width",0)<1280 or stream.get("height",0)<720):
        issues.append("Below 1280 by 720")
    expected=sum(int(s["sec"]) for s in film["shots"])
    if abs(duration-expected)>.35:issues.append("Timeline duration differs from source storyboard")
    vtt=captions.read_text(encoding="utf8")
    if not vtt.startswith("WEBVTT"):issues.append("Missing WebVTT header")
    cues=[x for x in vtt.split("\n") if "-->" in x]
    if not cues:issues.append("No caption cues")
    if meta.get("voice_approved",False) or meta.get("continuous_playback_approved",False):
        issues.append("Unexpected artificial approval flag")
    if meta.get("sha256")!=hashlib.sha256(mp4.read_bytes()).hexdigest():
        issues.append("MP4 hash/provenance mismatch")
    h=hashlib.sha256()
    h.update(json.dumps(film,ensure_ascii=False,sort_keys=True).encode("utf-8"))
    h.update((ROOT/"scripts/render-directors-cuts.py").read_bytes())
    h.update((ROOT/"scripts/render-documentary.py").read_bytes())
    if meta.get("input_sha256")!=h.hexdigest():
        issues.append("Export is stale relative to revised storyboard; rerender required")
    frames=[]
    for point in (.12,.52,.87):
        try: frames.append(frame(mp4,duration*point))
        except (ValueError,RuntimeError,OSError) as ex:
            issues.append("Cannot decode frame "+str(point)+": "+str(ex)[:90])
            frames.append(Image.new("RGB",(368,207),(54,41,44)))
    return {"slug":name,"seconds":duration,"expected":expected,
            "source":str(mp4.relative_to(ROOT)),"issues":issues,
            "technical_check":"pass" if not issues else "needs attention",
            "aesthetic_check":"NOT HUMAN-REVIEWED",
            "voice_check":"NOT HUMAN-REVIEWED",
            "frames":frames}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--page-size",type=int,default=8)
    args=parser.parse_args()
    if args.page_size<1 or args.page_size>12:raise ValueError("page size must be 1 to 12")
    library=json.loads(SOURCE.read_text(encoding="utf8"))["films"]
    available=[]
    for f in library:
        report=audit(f)
        if report:available.append(report)
    OUT.mkdir(parents=True,exist_ok=True)
    fonts="/usr/share/fonts/truetype/dejavu"
    bold=ImageFont.truetype(fonts+"/DejaVuSans-Bold.ttf",17)
    small=ImageFont.truetype(fonts+"/DejaVuSans.ttf",13)
    for n in range(0,len(available),args.page_size):
        page=available[n:n+args.page_size]
        canvas=Image.new("RGB",(1200,80+len(page)*276),(13,31,36))
        draw=ImageDraw.Draw(canvas)
        draw.text((32,24),"RUWAIDIX / TECHNICAL SCREENING — UNAPPROVED FILM FRAMES",font=bold,fill=(240,221,194))
        for index,p in enumerate(page):
            y=80+index*276
            color=(212,155,118) if p["issues"] else (137,192,176)
            draw.text((32,y),p["slug"]+"  /  "+f'{p["seconds"]:.1f}s',font=bold,fill=color)
            for k,im in enumerate(p["frames"]):
                canvas.paste(im,(32+k*389,y+33))
            draw.text((34,y+248),p["technical_check"]+" · "+(" | ".join(p["issues"])[:100] if p["issues"] else "actual exported MP4 frames"),
                      font=small,fill=(205,221,214))
        number=n//args.page_size+1
        canvas.save(OUT/f"page-{number:02}.webp","WEBP",quality=86)
    payload={"status":"TECHNICAL AUDIT ONLY, NOT ARTISTIC APPROVAL",
             "films_expected":44,"exports_examined":len(available),
             "exports_remaining":44-len(available),
             "films":[{k:v for k,v in entry.items() if k!="frames"} for entry in available]}
    (OUT/"screening-results.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n")
    print("Decoded actual films:",len(available),"; failures:",sum(bool(x["issues"]) for x in available))
if __name__=="__main__":main()
