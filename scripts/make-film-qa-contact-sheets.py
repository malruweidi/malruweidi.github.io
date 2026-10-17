#!/usr/bin/env python3
"""Create lossless-layout contact sheets of encoded Ruwaidix scientific cinema.

The timestamp and QA label are OUTSIDE the sampled picture rectangle. Movie
frames are not overwritten, trimmed, dimmed or otherwise misrepresented.
Each sheet is provenance-bound to the exact movie SHA-256 digest.
"""
import argparse
import hashlib
import io
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT=Path(__file__).resolve().parents[1]
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
TYPE=ImageFont.truetype(FONT,16)
VERSION="full-frame-qa-v2"
SAMPLES_SHORT=[4,14,24,34,44,55,66,77]
SAMPLES_LONG=[4,17,29,41,54,68,83,105]

def digest(path):
    sha=hashlib.sha256()
    with path.open("rb") as f:
        while part:=f.read(1024*1024):
            sha.update(part)
    return sha.hexdigest()

def decode_frame(film,seconds):
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-ss",str(seconds),"-i",str(film),
         "-map","0:v:0","-frames:v","1","-f","image2pipe","-vcodec","mjpeg","-q:v","5","pipe:1"]
    o=subprocess.run(cmd,capture_output=True)
    if o.returncode or len(o.stdout)<200:
        raise RuntimeError(f"Missing frame at {seconds}s in {film}: {o.stderr.decode()[-800:]}")
    return Image.open(io.BytesIO(o.stdout)).convert("RGB")

def contact(film, sha):
    is_feature="longform" in str(film)
    samples=SAMPLES_LONG if is_feature else SAMPLES_SHORT
    width,height,margin=480,270,37
    frameheight=height+margin
    out=Image.new("RGB",(width*4,frameheight*2),(16,33,37))
    d=ImageDraw.Draw(out)
    for k,t in enumerate(samples):
        # Distortion-free 16:9 geometry, image fills 480x270 with no crop.
        still=ImageOps.contain(decode_frame(film,t),(width,height),method=Image.Resampling.LANCZOS)
        x=(k%4)*width
        y=(k//4)*frameheight
        out.paste(still,(x,y))
        # Crucial: this provenance strip is *below* the video frame.
        # The movie's own bottom-thirds and image captions remain visible.
        d.rectangle((x,y+height,x+width,y+frameheight),fill=(15,35,41))
        d.text((x+13,y+height+7),f"{t:02d}s  /  SOURCE MP4 FRAME  /  QA ONLY",
               font=TYPE,fill=(235,233,218))
    qa=film.parent/"qa"
    qa.mkdir(parents=True,exist_ok=True)
    dest=qa/(film.stem+"-contact.jpg")
    out.save(dest,"JPEG",quality=87,subsampling=1,optimize=True)
    metadata={
        "layout_version":VERSION,
        "source_mp4":str(film.relative_to(ROOT)),
        "source_sha256":sha,
        "samples_seconds":samples,
        "full_picture_preserved":True,
        "label_placement":"Outside original frame bounds; never obscures title or scientific figure"
    }
    (qa/(film.stem+"-contact.json")).write_text(json.dumps(metadata,indent=2)+"\n",encoding="utf8")
    print(film.name,"→",dest,"with complete lower thirds",flush=True)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--collection",choices=["series-v2","longform-v2"],required=True)
    args=p.parse_args()
    folder=ROOT/"assets"/"films"/args.collection
    movies=list(sorted(folder.glob("*.mp4")))
    if not movies:raise ValueError("Cannot review film frames when no movie exists")
    for film in movies:
        dest=folder/"qa"/(film.stem+"-contact.jpg")
        meta=folder/"qa"/(film.stem+"-contact.json")
        moviehash=digest(film)
        try:old=json.loads(meta.read_text(encoding="utf8"))
        except (FileNotFoundError,json.JSONDecodeError):old={}
        if not dest.is_file() or old.get("layout_version")!=VERSION or old.get("source_sha256")!=moviehash:
            contact(film,moviehash)
        else:
            print("QA contact sheet current:",film.name)
if __name__=="__main__":
    main()
