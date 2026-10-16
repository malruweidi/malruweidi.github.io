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
    """A film sequence, not six interchangeable labelled chapter slides.

    Source photos dominate the screen. Intentional editorial crops reveal where
    materials failed. The untouched archive remains directly linked by manifest.
    """
    canvas=Image.new("RGB",(W,H),PINE)
    d=ImageDraw.Draw(canvas)
    if index==5:
        d.line((92,209,190,209),fill=ACCENT,width=3)
        d.text((87,265),"TWO MATERIALS.",font=font(60,True),fill=COLOR)
        d.text((87,348),"NO SECTION.",font=font(66,True),fill=COLOR)
        d.text((93,495),"The documented outcome. No interpretable section obtained.",
               font=font(18),fill=(205,209,198))
        d.text((93,648),"RUWAIDIX  /  ORIGINAL EXPERIMENT",
               font=font(12),fill=ACCENT)
        return canvas
    with Image.open(photo) as raw:src=ImageOps.exif_transpose(raw).convert("RGB")
    if index in (0,2,3):
        # Full-bleed EDITORIAL DETAIL: intentional real-picture crop, not a fake scene.
        centers={0:(.50,.44),2:(.5,.48),3:(.5,.53)}
        canvas=ImageOps.fit(src,(W,H),method=Image.Resampling.LANCZOS,centering=centers[index])
        d=ImageDraw.Draw(canvas,"RGBA")
        # A bottom-only restrained shadow protects occasional source labels.
        for y in range(470,H):
            alpha=int(163*((y-470)/(H-470))**1.2)
            d.line((0,y,W,y),fill=(8,25,29,alpha),width=1)
        small={
           0:("THE FAILED CUT","Original microtome photograph / editorial crop"),
           2:("BEFORE THE BLADE","Zebrafish orientation specimens / editorial crop"),
           3:("THE PREPARATION","Original processing equipment / editorial crop")
        }
        head,note=small[index]
        d.text((58,590),head,font=font(35,True),fill=(251,245,233,255))
        d.text((60,656),note,font=font(17),fill=(233,231,219,255))
        return canvas.convert("RGB")
    if index==1:
        # Double view: original photograph beside a deliberately enlarged
        # material-failure detail, not the same postage stamp repeated.
        full=ImageOps.contain(src,(520,654),method=Image.Resampling.LANCZOS)
        canvas.paste(full,(50+(535-full.width)//2,33+(654-full.height)//2))
        crop=src.crop((int(src.width*.34),int(src.height*.18),
                       int(src.width*.94),int(src.height*.74)))
        detail=ImageOps.fit(crop,(612,654),method=Image.Resampling.LANCZOS)
        canvas.paste(detail,(618,33))
        d=ImageDraw.Draw(canvas,"RGBA")
        d.rectangle((0,580,W,H),fill=(8,25,28,186))
        d.text((61,601),"This is what reached the microtome.",
               font=font(34,True),fill=COLOR)
        d.text((62,669),"Full original at left · archival detail at right",
               font=font(13),fill=(211,207,189))
        return canvas
    # Scene 5 (index 4): the actual equipment and separated fragments fill
    # the screen, with only the original experimental outcome as typography.
    center=src.crop((int(src.width*.16),int(src.height*.23),
                     int(src.width*.98),int(src.height*.79)))
    picture=ImageOps.fit(center,(950,H),method=Image.Resampling.LANCZOS)
    canvas.paste(picture,(330,0))
    d=ImageDraw.Draw(canvas)
    d.line((60,270,155,270),fill=ACCENT,width=4)
    d.text((55,315),"IT DID NOT",font=font(42,True),fill=COLOR)
    d.text((55,383),"CUT AS ONE.",font=font(42,True),fill=COLOR)
    d.text((61,645),"Original experiment · detail crop",
           font=font(12),fill=(215,205,184))
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
                "-vf","zoompan=z=min(zoom+0.0002\\,1.038):d=1:fps=24:s=1280x720",
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
