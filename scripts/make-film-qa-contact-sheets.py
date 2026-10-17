#!/usr/bin/env python3
"""Generate contact sheets of actually encoded scientific films, not design mockups.

Eight selected movie frames per cut, with time stamp and a small source banner.
Images are reviewer-only and provide perceptual inspection of camera choreography.
"""
import argparse
import io
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT=Path(__file__).resolve().parents[1]
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
TYPE=ImageFont.truetype(FONT,17)

def decode_frame(film,seconds):
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-ss",str(seconds),"-i",str(film),
         "-map","0:v:0","-frames:v","1","-f","image2pipe","-vcodec","mjpeg","-q:v","5","pipe:1"]
    o=subprocess.run(cmd,capture_output=True)
    if o.returncode or len(o.stdout)<200:
        raise RuntimeError(f"Missing frame at {seconds}s in {film}: {o.stderr.decode()[-800:]}")
    return Image.open(io.BytesIO(o.stdout)).convert("RGB")

def contact(film):
    is_feature="longform" in str(film)
    samples=[4,17,29,41,54,68,83,105] if is_feature else [4,14,24,34,44,55,66,77]
    width,height=480,270
    out=Image.new("RGB",(width*4,height*2),(16,33,37))
    for k,t in enumerate(samples):
        still=ImageOps.fit(decode_frame(film,t),(width,height),method=Image.Resampling.LANCZOS)
        d=ImageDraw.Draw(still)
        d.rectangle((0,height-38,width,height),fill=(15,35,41))
        d.text((14,height-30),f"{t:02d}s  /  GENERATED FRAME  /  EVIDENCE REVIEW",font=TYPE,fill=(238,232,215))
        out.paste(still,((k%4)*width,(k//4)*height))
    qa=film.parent/"qa"
    qa.mkdir(parents=True,exist_ok=True)
    dest=qa/(film.stem+"-contact.jpg")
    out.save(dest,"JPEG",quality=81,subsampling=1,optimize=True)
    print(film.name,"→",dest,"size",dest.stat().st_size)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--collection",choices=["series-v2","longform-v2"],required=True)
    opts=p.parse_args()
    folder=ROOT/"assets"/"films"/opts.collection
    movies=list(sorted(folder.glob("*.mp4")))
    if not movies: raise ValueError("Cannot review film frames when no movie exists")
    for film in movies:
        dest=folder/"qa"/(film.stem+"-contact.jpg")
        if not dest.is_file() or dest.stat().st_mtime<film.stat().st_mtime:
            contact(film)
if __name__=="__main__":
    main()
