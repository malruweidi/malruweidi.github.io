#!/usr/bin/env python3
"""Visually inspect the complete newly encoded V4 Making Medicines Keep film.

Full pictures are not cropped or covered with QA text. Eight distinct chapter
screenshots plus mid-motion frames support design and historical-source audit.
"""
from PIL import Image,ImageFont,ImageDraw
from pathlib import Path
import subprocess,hashlib,json,io
ROOT=Path(__file__).resolve().parents[1]
FILM=ROOT/"assets/films/series-v4/making-medicines-keep.mp4"
OUT=ROOT/"assets/films/series-v4/qa"
F="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def shot(sec):
    p=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-ss",str(sec),"-i",str(FILM),"-frames:v","1","-f","image2pipe","-vcodec","mjpeg","-q:v","4","pipe:1"],capture_output=True)
    if p.returncode:raise RuntimeError(p.stderr.decode()[-500:])
    return Image.open(io.BytesIO(p.stdout)).convert("RGB")

def main():
    meta=json.loads(FILM.with_suffix(".json").read_text())
    h=hashlib.sha256(FILM.read_bytes()).hexdigest()
    if h!=meta["sha256"]:raise RuntimeError("V4 film hash does not match editor-approved source records")
    sample=[3,11,18,26,33,41,48,56,63,71,78,86,93,101,108,116]
    block_w,block_h,label=480,270,31
    sheet=Image.new("RGB",(block_w*4,(block_h+label)*4),(14,33,37))
    d=ImageDraw.Draw(sheet);ft=ImageFont.truetype(F,16)
    for i,t in enumerate(sample):
        im=shot(t).resize((block_w,block_h))
        x=i%4*block_w;y=i//4*(block_h+label)
        sheet.paste(im,(x,y))
        d.text((x+10,y+block_h+5),f"{t:03d}s  /  V4 H264 ORIGINAL FRAME",font=ft,fill=(244,226,201))
    OUT.mkdir(parents=True,exist_ok=True)
    p=OUT/"making-medicines-keep-contact.jpg";sheet.save(p,quality=90)
    (OUT/"making-medicines-keep-contact.json").write_text(json.dumps({"source":str(FILM.relative_to(ROOT)),"sha256":h,"sample_seconds":sample,"scenes":8,"preserves_full_frames":True,"status":"REVIEW REQUIRED: visual, acoustic, historical and rights verification pending"},indent=2)+"\n")
    print("Actual V4 film visual contact sheet",p,p.stat().st_size,"bytes")
if __name__=="__main__":main()
