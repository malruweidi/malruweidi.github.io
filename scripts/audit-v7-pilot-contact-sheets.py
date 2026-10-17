#!/usr/bin/env python3
"""Extract six actual frames per V7 film to expose story repetition, cropping and typography."""
from pathlib import Path
import json,subprocess,tempfile,hashlib
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"assets/films/series-v7-pilots"
OUT=ROOT/"assets/films/quality-review-v7"
OUT.mkdir(parents=True,exist_ok=True)
FORMS=["niosomes","ace2-forms","essay-trna"]
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
for slug in FORMS:
    manifest=json.loads((SRC/(slug+".json")).read_text())
    beats=manifest["beats"]
    if len(beats)!=24:raise AssertionError(slug)
    cursor=0
    starts=[]
    for chapter in range(1,7):
        scene_beats=[b for b in beats if b["scene"]==f"{chapter:02d}"]
        if len(scene_beats)!=4:raise AssertionError("Incomplete scene "+slug)
        dur=sum(b["seconds"] for b in scene_beats)
        starts.append(cursor+dur*.55)
        cursor+=dur
    collage=Image.new("RGB",(1920,780),(11,35,42))
    d=ImageDraw.Draw(collage)
    with tempfile.TemporaryDirectory() as tmp:
        for i,t in enumerate(starts):
            output=Path(tmp)/(str(i)+".png")
            result=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y",
                                   "-ss",str(t),"-i",str(SRC/(slug+".mp4")),
                                   "-frames:v","1",str(output)],
                                  capture_output=True,text=True)
            if result.returncode:raise RuntimeError(result.stderr[-2500:])
            frame=Image.open(output).convert("RGB").resize((640,360),Image.Resampling.LANCZOS)
            px=(i%3)*640;py=(i//3)*390
            collage.paste(frame,(px,py))
            d.text((px+18,py+362),f"CHAPTER {i+1:02d}   /   {t:05.1f}s",fill=(236,222,195),
                   font=ImageFont.truetype(FONT,18))
    path=OUT/(slug+"-contact-sheet.webp")
    collage.save(path,quality=85)
    print("REAL-FILM CONTACT SHEET",slug,path.stat().st_size,hashlib.sha256(path.read_bytes()).hexdigest())
