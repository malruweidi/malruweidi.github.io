#!/usr/bin/env python3
"""Forty-second visual test of the histology failure, using ONLY real owner photos.

No simulated section, invented laboratory footage, actor voice or fictitious
instrument sound. Original full photographs remain unmodified in their archive.
"""
import hashlib
import json
import math
import subprocess
import tempfile
from pathlib import Path
import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets"/"films"/"prototypes"
W,H,FPS=1280,720,24
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
COLOR=(235,228,213)
PINE=(16,34,38)
ACCENT=(205,146,113)
PHOTOS={
    "failed":ROOT/"assets/2026-10-13-new-photos/zebrafish-paraffin-microtomy-failure.webp",
    "specimens":ROOT/"assets/2026-10-13-new-photos/zebrafish-orientation-specimens.webp",
    "processing":ROOT/"assets/2026-10-13-new-photos/zebrafish-histology-processing.webp",
}
SHOTS=[
    ("failed",6,"AT THE BLADE","The block came apart.","archive"),
    ("failed",7,"LOOK CLOSELY","Not a usable histological section.","archival detail"),
    ("specimens",6,"BEFORE THE CUT","The difficulty began with orientation.","archive"),
    ("processing",6,"THE INTENDED WORKFLOW","A specimen supported for processing.","archive"),
    ("failed",8,"THE MATERIAL BOUNDARY","It did not cut as one.","archival detail"),
    (None,7,"NO USABLE SECTION","An experiment that stopped before the measurement.","end")
]
def ff(args):
    p=subprocess.run(args,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode:raise RuntimeError("Command failed: "+" ".join(args)+"\n"+p.stderr[-2000:])
    return p.stdout

def font(s,serif=False):
    return ImageFont.truetype(SERIF if serif else FONT,s)

def wrap(text,draw,ft,maxw):
    cur="";out=[]
    for word in text.split():
        tmp=(cur+" "+word).strip()
        if cur and draw.textbbox((0,0),tmp,font=ft)[2]>maxw:
            out.append(cur);cur=word
        else:cur=tmp
    if cur:out.append(cur)
    return out

def draw_card(photo,t1,t2,kind,index):
    canvas=Image.new("RGB",(W,H),PINE);d=ImageDraw.Draw(canvas)
    d.line((64,72,122,72),fill=ACCENT,width=3)
    d.text((64,91),"RUWAIDIX   /   ORIGINAL EXPERIMENT",font=font(17),fill=(216,209,192))
    if photo is None:
        d.text((85,257),t1,font=font(65,True),fill=COLOR)
        for j,line in enumerate(wrap(t2,d,font(31,True),1080)):
            d.text((88,372+j*46),line,font=font(31,True),fill=(208,196,177))
        d.text((84,627),"THE DOCUMENTED OUTCOME • NOT A HYPOTHETICAL SUCCESS",font=font(13),fill=ACCENT)
        return canvas
    with Image.open(photo) as raw:src=ImageOps.exif_transpose(raw).convert("RGB")
    # The source remains available at full size; cuts here are labeled 'archival detail'.
    if kind=="archival detail":
        if index==1:
            crop=(int(src.width*.30),int(src.height*.19),int(src.width*.91),int(src.height*.74))
        else:
            crop=(int(src.width*.11),int(src.height*.22),int(src.width*.97),int(src.height*.89))
        src=src.crop(crop)
    photo_box=(485,118,1216,590) if index!=3 else (404,143,1216,600)
    bw=photo_box[2]-photo_box[0];bh=photo_box[3]-photo_box[1]
    contained=ImageOps.contain(src,(bw,bh),method=Image.Resampling.LANCZOS)
    px=photo_box[0]+(bw-contained.width)//2
    py=photo_box[1]+(bh-contained.height)//2
    # Soft photo matte prevents tiny portrait pictures sitting inside empty blur.
    matte=ImageOps.fit(src,(bw,bh),method=Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(24))
    matte=Image.blend(matte,Image.new("RGB",matte.size,PINE),.72)
    canvas.paste(matte,(photo_box[0],photo_box[1]))
    canvas.paste(contained,(px,py))
    d.rectangle(photo_box,outline=(109,128,123),width=1)
    d.text((63,263),t1,font=font(21),fill=ACCENT)
    title_font=font(34,True)
    for j,line in enumerate(wrap(t2,d,title_font,370)):
        d.text((63,309+j*55),line,font=title_font,fill=COLOR)
    d.text((64,609),"OWNER PHOTOGRAPH · "+kind.upper(),font=font(12),fill=(209,213,205))
    d.text((64,641),f"{index+1:02d} / {len(SHOTS):02d}",font=font(15),fill=ACCENT)
    return canvas

def score():
    sr=24000
    n=int(40*sr);t=np.arange(n,dtype=np.float64)/sr
    y=np.zeros(n,dtype=np.float64)
    # Deliberately quiet original ambient composition, not simulated microtome audio.
    for index,(hz,st,en) in enumerate([(82.41,0,11),(98.,9,20),(73.42,18,29),(110.,27,40)]):
        gain=np.maximum(0,np.minimum(1,(t-st)/2.4))*np.maximum(0,np.minimum(1,(en-t)/3))
        y+=np.sin(2*np.pi*hz*t)*gain*.031
        y+=np.sin(2*np.pi*hz*1.5*t)*gain*.006
    for pulse in (5,13,21,32):
        dt=t-pulse
        gate=(dt>=0)*np.exp(-np.maximum(0,dt)/3)
        y+=np.sin(2*np.pi*164.81*dt)*gate*.008
    fade=np.minimum(1,t/2)*np.minimum(1,(40-t)/3)
    y=np.tanh(y*fade).astype(np.float32)
    OUT.mkdir(parents=True,exist_ok=True)
    path=OUT/"histology-score.wav"
    sf.write(path,y,sr,subtype="PCM_16")
    return path

def main():
    for p in PHOTOS.values():
        if not p.is_file():raise FileNotFoundError(str(p))
    if sum(s[1] for s in SHOTS)!=40:raise ValueError("Wrong picture duration")
    OUT.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory() as temp:
        w=Path(temp);videos=[];docs=[]
        for i,(key,sec,title,body,kind) in enumerate(SHOTS):
            pic=draw_card(PHOTOS[key] if key else None,title,body,kind,i)
            name=w/f"source-{i:02d}.png"
            pic.save(name)
            poster=OUT/f"histology-test-frame-{i+1:02d}.webp"
            pic.save(poster,"WEBP",quality=84)
            movie=w/f"scene-{i:02d}.mp4"
            # No zoom on text; the authored shot is a still with editorial jump cuts.
            ff(["ffmpeg","-hide_banner","-loglevel","error","-y","-loop","1",
                "-framerate",str(FPS),"-i",str(name),"-t",str(sec),"-r",str(FPS),
                "-c:v","libx264","-crf","20","-preset","fast","-pix_fmt","yuv420p","-an",str(movie)])
            videos.append(movie)
            docs.append({"index":i+1,"start":sum(s[1] for s in SHOTS[:i]),
                         "seconds":sec,"archival_source":str(PHOTOS[key].relative_to(ROOT)) if key else None,
                         "label":title+" — "+body,"editorial_crop":kind=="archival detail"})
        playlist=w/"input.txt"
        playlist.write_text("".join("file '"+str(m)+"'\n" for m in videos),encoding="utf-8")
        picture=w/"picture.mp4"
        ff(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0",
             "-i",str(playlist),"-c","copy",str(picture)])
        song=score()
        film=OUT/"histology-directors-test-40s.mp4"
        ff(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(picture),"-i",str(song),
             "-map","0:v:0","-map","1:a:0","-c:v","copy","-af","loudnorm=I=-20:TP=-2:LRA=11",
             "-c:a","aac","-b:a","128k","-t","40","-movflags","+faststart",str(film)])
        info=json.loads(ff(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(film)]))
        seconds=float(info["format"]["duration"])
        if abs(seconds-40)>.12:raise RuntimeError("Duration "+str(seconds))
        obj={"label":"NOT A REPLACEMENT / VISUAL DIRECTING TEST","runtime":seconds,"sha256":hashlib.sha256(film.read_bytes()).hexdigest(),"shots":docs,"rights":"Personal archived photographs by site owner; no simulated successful histology, no falsely authentic machine sound. Each still in the film is editorially derived from an unaltered existing owner image.","limitation":"Musical and photographic pacing needs human review before full director's cut."}
        (OUT/"histology-directors-test-40s.json").write_text(json.dumps(obj,indent=2)+"\n",encoding="utf-8")
        print("AUDIT PROOF",film,seconds,"seconds",film.stat().st_size,"bytes")
if __name__=="__main__":main()
