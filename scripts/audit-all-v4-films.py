#!/usr/bin/env python3
"""Source-locked full-frame visual QA across every V4 film.

These contact sheets contain actual decoded MP4 pixels, never fake poster
mockups. Timings appear outside every frame; the film source hash is recorded.
"""
import argparse,hashlib,io,json,subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
FOLDER=ROOT/"assets/films/series-v4"
OUT=FOLDER/"qa"
TIMES=[4,11,19,26,34,41,49,56,64,71,79,86,94,101,109,116]
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def frame(movie,seconds):
    out=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-ss",str(seconds),
        "-i",str(movie),"-frames:v","1","-f","image2pipe","-vcodec","mjpeg",
        "-q:v","4","pipe:1"],capture_output=True)
    if out.returncode or len(out.stdout)<1000:
        raise RuntimeError("Failed source frame "+movie.name+" "+str(seconds)+" "+out.stderr[-500:].decode(errors="replace"))
    return Image.open(io.BytesIO(out.stdout)).convert("RGB")

def make(film):
    W,H,LABEL,COLS=480,270,32,4
    photo=Image.new("RGB",(W*COLS,(H+LABEL)*4),(14,34,39))
    draw=ImageDraw.Draw(photo)
    ft=ImageFont.truetype(FONT,16)
    for idx,sec in enumerate(TIMES):
        im=frame(film,sec)
        im.thumbnail((W,H),Image.Resampling.LANCZOS)
        x=(idx%COLS)*W
        y=(idx//COLS)*(H+LABEL)
        photo.paste(im,(x+(W-im.width)//2,y+(H-im.height)//2))
        draw.text((x+11,y+H+6),f"{sec:03d}s / DECODED ACTUAL MP4 FRAME",font=ft,fill=(231,223,206))
    OUT.mkdir(exist_ok=True,parents=True)
    jpg=OUT/(film.stem+"-contact.jpg")
    photo.save(jpg,quality=88,optimize=True,subsampling=1)
    sha=hashlib.sha256(film.read_bytes()).hexdigest()
    record=json.loads((FOLDER/(film.stem+".json")).read_text())
    if record["sha256"]!=sha:raise ValueError("MP4 changed since source manifest; do not certify")
    meta={
     "film":film.stem,"source_mp4":"assets/films/series-v4/"+film.name,
     "source_sha256":sha,"timestamps_seconds":TIMES,
     "frame_geometry":"No cropping or source overlay: 16 decoded full frames; label outside original image",
     "scientific_and_artistic_review":"NOT DONE - actual watching/listening and source figure screen inspection required"
    }
    (OUT/(film.stem+"-contact.json")).write_text(json.dumps(meta,indent=2)+"\n")
    print("CURRENT",film.stem,sha,"frames",len(TIMES),flush=True)
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--only")
    opts=p.parse_args()
    movies=sorted(FOLDER.glob("*.mp4"))
    if opts.only:movies=[m for m in movies if m.stem==opts.only]
    if not movies:raise ValueError("No matching V4 MP4 outputs")
    for m in movies:make(m)
if __name__=="__main__":main()
