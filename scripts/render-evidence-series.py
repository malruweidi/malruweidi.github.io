#!/usr/bin/env python3
"""Ruwaidix Evidence in Motion: four original, source-grounded 120-second films.
Uses the proven existing documentary's FFmpeg, Pillow, Kokoro and audio pipeline.
New diagrams and historical plates are explicitly editorial, not original evidence.
"""
import argparse
import hashlib
import importlib.util
import json
import math
import shutil
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
FILMS = ROOT / "assets" / "films"
PLATES = FILMS / "plates"
MANIFEST = FILMS / "evidence-in-motion.json"
W, H, FPS, SECONDS = 1280, 720, 24, 120
DARK = (15, 36, 40)
CREAM = (247, 242, 231)
TERRA = (203, 138, 100)
SAFFRON = (220, 166, 84)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
spec = importlib.util.spec_from_file_location("ruwaidix_original", ROOT / "scripts" / "render-documentary.py")
old = importlib.util.module_from_spec(spec)
spec.loader.exec_module(old)

def ft(size, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT, size)

def cmd(args):
    return old.command(args)

def write_label(d, position, text, size=20, fill=CREAM, bold=False):
    d.text(position,text,font=ft(size,bold),fill=fill)

def framed_paper(d, rect, color=(238,220,184)):
    x0,y0,x1,y1=rect
    d.rounded_rectangle((x0+10,y0+12,x1+12,y1+13),radius=8,fill=(20,27,27))
    d.rounded_rectangle(rect,radius=8,fill=color,outline=(166,123,76),width=3)
    for y in range(y0+50,y1-24,36):
        d.line((x0+52,y,x1-50,y),fill=(192,166,123),width=2)

def arrow(d, points, fill=TERRA, width=7):
    d.line(points,fill=fill,width=width,joint="curve")
    end=points[-1]
    d.polygon([(end[0],end[1]),(end[0]-18,end[1]-10),(end[0]-18,end[1]+10)],fill=fill)

def vessel(d, x, y, size=1, sugar=False):
    w=int(240*size); h=int(280*size)
    d.rounded_rectangle((x,y,x+w,y+h),radius=int(28*size),fill=(39,61,64),outline=(219,168,96),width=7)
    level=y+int(h*.43)
    d.rounded_rectangle((x+10,level,x+w-10,y+h-12),radius=17,fill=(153,83,39))
    d.ellipse((x+9,level-7,x+w-9,level+17),fill=(211,145,69),outline=(244,192,111),width=3)
    d.rectangle((x+60*size,y-22*size,x+w-60*size,y+10*size),fill=(239,188,120))
    d.arc((x+26,y+35,x+w-26,y+110),180,275,fill=(241,212,152),width=4)
    if sugar:
        for i in range(7):
            cx=x+28+i*26*size; cy=y+h-27-(i%3)*28*size
            d.polygon([(cx,cy-13),(cx+15,cy-5),(cx+11,cy+12),(cx-10,cy+8)],fill=(238,197,129))

def illustrate(film,scene):
    tone=film["tone"]
    historic=tone=="history"
    bg=Image.new("RGB",(W,H), (44,47,43) if historic else (13,32,39))
    d=ImageDraw.Draw(bg)
    if historic:
        # Woven paper/pigment palette. Original editorial art; no facsimile text.
        for y in range(0,H,12):
            d.line((0,y,W,y),fill=(46+(y//12)%4,48+(y//12)%4,43+(y//12)%4),width=1)
        d.rectangle((44,132,1236,506),outline=(140,109,77),width=2)
    else:
        for x in range(65,W,78):
            d.line((x,153,x,496),fill=(26,56,59),width=1)
        for y in range(154,490,60):
            d.line((60,y,1220,y),fill=(26,56,59),width=1)
    kind=scene["visual"]
    if kind in ("bubble","chamber","assay"):
        if kind=="assay":
            for i,(word,sub) in enumerate((("VIABILITY","Readout"),("CYTOSKELETON","Morphology"))):
                x=176+i*490
                d.rounded_rectangle((x,220,x+405,442),radius=18,fill=(24,54,56),outline=(98,151,144),width=4)
                write_label(d,(x+44,264),word,27,(240,223,188),True)
                write_label(d,(x+44,325),sub,22,(171,199,183))
                for j in range(8):
                    cx=x+62+(j%4)*79; cy=382+(j//4)*24
                    d.ellipse((cx-8,cy-8,cx+8,cy+8),outline=(138,175,158),width=2)
        else:
            d.rounded_rectangle((145,250,1135,457),radius=15,outline=(195,214,190),width=6)
            d.rectangle((155,377,1125,447),fill=(34,72,77))
            for i in range(16):
                cx=182+i*61
                d.ellipse((cx-23,382,cx+23,431),fill=(109,144,133),outline=(212,215,186),width=2)
                d.ellipse((cx-7,397,cx+7,413),fill=(54,94,102))
            d.ellipse((450,263,710,397),fill=(64,97,103),outline=(235,201,127),width=6)
            arrow(d,[(760,315),(1030,315)],SAFFRON,6)
            write_label(d,(150,178),"AIR–LIQUID INTERFACE • EXPLANATORY MODEL",22,SAFFRON,True)
            if kind=="chamber":
                write_label(d,(160,455),"L2 CELL MONOLAYER  /  CONTROLLED FLOW CHAMBER",17,(222,216,187))
    elif kind=="agarose":
        d.rectangle((382,210,886,315),fill=(115,158,146),outline=(214,228,210),width=5)
        d.rectangle((382,350,886,455),fill=(166,138,101),outline=(233,204,144),width=5)
        for i in range(4):
            x=465+i*90
            d.ellipse((x,264,x+38,295),outline=(46,91,91),width=3)
        d.line((380,333,888,333),fill=(240,115,89),width=6)
        write_label(d,(915,260),"AGAROSE",22,(216,233,217),True)
        write_label(d,(915,378),"PARAFFIN",22,(244,207,147),True)
        write_label(d,(412,172),"INTERFACE / HYPOTHESIS, NOT PROVEN CAUSE",19,SAFFRON)
    elif kind=="extract":
        for k in range(3):
            x=305+k*235
            d.polygon([(x+63,230),(x+130,230),(x+120,304),(x+178,422),(x+12,422),(x+74,304)],fill=(41,79,77),outline=(209,208,170))
            d.polygon([(x+30,380),(x+154,380),(x+175,418),(x+15,418)],fill=(120+15*k,133-6*k,65+10*k))
            d.line((x+63,228,x+130,228),fill=(229,202,142),width=7)
        write_label(d,(343,163),"EXTRACTION  ≠  IDENTIFICATION  ≠  EFFICACY",24,SAFFRON,True)
    elif kind in ("syrup","crystal"):
        vessel(d,788,195,1.04,sugar=kind=="crystal")
        for i in range(3):
            d.ellipse((430+i*61,261+i*15,492+i*61,322+i*15),fill=(99,78,52),outline=(228,179,99),width=3)
        if kind=="crystal":
            write_label(d,(112,238),"CRYSTALLIZATION",33,(241,210,158),True)
            write_label(d,(116,310),"A preparation can change",22,(220,194,153))
        else:
            write_label(d,(106,232),"JULĀB",39,(244,209,144),True)
            write_label(d,(108,296),"A syrup base, not merely sweetness",22,(225,211,185))
        write_label(d,(110,449),"EDITORIAL RECONSTRUCTION • NOT A HISTORICAL OBJECT",16,(229,188,139))
    elif kind=="prescription":
        framed_paper(d,(355,155,913,488))
        write_label(d,(399,184),"CAIRO GENIZAH · OR.1081 J39",22,(76,66,55),True)
        d.rectangle((398,250,871,316),fill=(226,206,173))
        write_label(d,(410,266),"POWDERED INGREDIENTS",19,(67,64,58),True)
        d.rectangle((398,333,871,384),fill=(219,194,158))
        write_label(d,(413,342),"+ ROSE SYRUP: ELECTUARY",19,(67,64,58),True)
        write_label(d,(391,452),"TYPESET EXPLANATION • NOT A SCANNED MANUSCRIPT",15,(83,67,53))
    elif kind=="substitution":
        d.rounded_rectangle((130,194,528,431),radius=16,fill=(72,70,56),outline=SAFFRON,width=3)
        d.rounded_rectangle((750,194,1145,431),radius=16,fill=(72,70,56),outline=SAFFRON,width=3)
        write_label(d,(164,254),"NAMED INGREDIENT",24,CREAM,True)
        write_label(d,(797,254),"POSSIBLE SUBSTITUTE",21,CREAM,True)
        arrow(d,[(547,294),(730,294)],SAFFRON,7)
        write_label(d,(512,374),"NECESSITY  ·  FUNCTION  ·  PROPORTION",17,(230,203,153))
        write_label(d,(221,465),"SUBSTITUTION IS NOT CONCEALED ADULTERATION",20,(229,187,140),True)
    elif kind=="scales":
        d.line((636,165,636,460),fill=(235,192,117),width=12)
        d.line((326,237,951,237),fill=(235,192,117),width=10)
        for x in (370,904):
            d.line((x,238,x-55,395),fill=(231,194,133),width=3)
            d.line((x,238,x+55,395),fill=(231,194,133),width=3)
            d.arc((x-75,368,x+75,431),0,180,fill=(246,194,112),width=7)
        d.polygon([(636,454),(541,479),(731,479)],fill=(226,184,114))
        write_label(d,(170,166),"WEIGHT, TRUST AND HIDDEN PROCESS",22,(235,201,151),True)
    elif kind=="publication":
        d.rounded_rectangle((168,165,1110,466),radius=8,fill=(225,211,183),outline=(240,200,132),width=4)
        write_label(d,(210,208),"MAKING MEDICINES KEEP",39,(49,60,53),True)
        write_label(d,(215,270),"Syrups, Substitution, and Pharmaceutical Reliability",20,(62,72,60))
        write_label(d,(215,306),"in Ayyubid-Mamluk Cairo",20,(62,72,60))
        d.line((210,347,1060,347),fill=(161,112,69),width=3)
        write_label(d,(215,366),"History of Pharmacy and Pharmaceuticals",20,(73,78,66),True)
        write_label(d,(215,403),"ACCEPTED · 15 OCTOBER 2026",18,(117,86,60))
    else:
        write_label(d,(125,232),scene["title"].upper(),37,SAFFRON,True)
    return bg

def photo_frame(image_path):
    with Image.open(image_path) as orig:
        im=ImageOps.exif_transpose(orig).convert("RGB")
    matte=ImageOps.fit(im,(W,H),method=Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(45))
    matte=Image.blend(matte,Image.new("RGB",(W,H),DARK),.61)
    im.thumbnail((1140,362),Image.Resampling.LANCZOS)
    matte.paste(im,((W-im.width)//2,155+(350-im.height)//2))
    return matte

def film_overlay(film,scene):
    ov=Image.new("RGBA",(W,H),(0,0,0,0))
    d=ImageDraw.Draw(ov)
    for y in range(425,H):
        alpha=int(216*((y-425)/(H-425))**.8)
        d.line((0,y,W,y),fill=(13,31,37,alpha))
    d.rectangle((62,51,120,55),fill=TERRA)
    write_label(d,(62,73),"RUWAIDIX / EVIDENCE IN MOTION",18,CREAM,True)
    write_label(d,(62,110),film["number"]+" / "+film["topic"].upper()[:59],17,(229,213,191))
    write_label(d,(62,493),scene["id"]+" / 08",19,(241,180,135),True)
    title=scene["title"]
    size=46 if len(title)<34 else 40
    write_label(d,(62,535),title,size,CREAM,True)
    kind=scene["kind"]
    write_label(d,(62,678),kind[:100].upper(),14,(219,211,194))
    return ov

def build_vtt(film,starts,spoken_seconds):
    cues=["WEBVTT","","NOTE Ruwaidix source-grounded narration; original owner archive and labeled explanations.",""]
    for s,start,length in zip(film["scenes"],starts,spoken_seconds):
        words=s["narration"].split()
        cut=len(words)//2
        for i,chunk in enumerate((" ".join(words[:cut])," ".join(words[cut:]))):
            first=start+.52+length*i/2
            last=start+.52+length*(i+1)/2
            cues.extend((old.vtt_time(first)+" --> "+old.vtt_time(last),chunk,""))
    (FILMS/(film["slug"]+".vtt")).write_text("\n".join(cues)+"\n",encoding="utf-8")

def voice_mix(film,speech,sr,frames,workspace):
    n=int(SECONDS*sr)
    samples=np.zeros(n,dtype=np.float32)
    envelope=np.zeros(n,dtype=np.float32)
    cursor=0
    for v,f in zip(speech,frames):
        begin=cursor+int(.52*sr)
        end=begin+len(v)
        if end>n: raise RuntimeError("Audio exceeds film duration")
        rms=float(np.sqrt(np.mean(v**2)+1e-8))
        vol=min(2.0,.085/max(rms,.0001))
        samples[begin:end]+=np.tanh(v*vol)
        envelope[max(0,begin-int(sr*.14)):min(n,end+int(sr*.28))]=1.
        cursor+=round(f/FPS*sr)
    t=np.arange(n,dtype=np.float32)/sr
    bed=old.film_score(t,envelope)*.64
    tone=film["tone"]
    if tone=="forensic":
        motif=np.sin(2*np.pi*58*t)*.0031*np.maximum(0,np.cos(2*np.pi*.42*t))
    elif tone=="tactile":
        motif=np.sin(2*np.pi*73.42*t)*.0016
    elif tone=="human":
        motif=np.sin(2*np.pi*196*t)*.0014*np.maximum(0,np.cos(2*np.pi*.32*t))
    else:
        motif=np.sin(2*np.pi*146.83*t)*.0020*np.maximum(0,np.cos(2*np.pi*.24*t))
    fade=np.minimum(1,t/2)*np.minimum(1,(SECONDS-t)/4)
    samples+=np.asarray((bed+motif*(1-.7*envelope))*fade,dtype=np.float32)
    peak=float(np.max(np.abs(samples)))
    if peak>.9: samples*=.9/peak
    output=workspace/"voice-and-score.wav"
    sf.write(output,samples,sr,subtype="PCM_16")
    return output

def validate():
    data=json.loads(MANIFEST.read_text(encoding="utf-8"))
    films=data["films"]
    if len(films)!=4 or len({f["slug"] for f in films})!=4 or data["running_seconds"]!=120:
        raise ValueError("Expected exactly four independent two-minute films")
    for film in films:
        if len(film["scenes"])!=8: raise ValueError("Every film needs eight traced scenes")
        for i,s in enumerate(film["scenes"],1):
            if s["id"]!=f"{i:02d}" or not s["narration"] or not s["credit"] or not s["link"]:
                raise ValueError("Unattributed or missing narration in "+film["slug"])
            if "image" in s:
                img=(ROOT/s["image"].lstrip("/")).resolve()
                if not img.is_relative_to(ROOT) or not img.is_file():
                    raise FileNotFoundError(str(img))
            if film["tone"]=="history" and s.get("image"):
                raise ValueError("Historical reconstruction must not claim unidentified scan as original")
    print("Source validation passed for all four films, eight scenes each")
    return films

def render_one(film,tts):
    FILMS.mkdir(parents=True,exist_ok=True)
    PLATES.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="ruwaidix-"+film["slug"]+"-") as temp:
        work=Path(temp)
        speech=[]; sr=None
        for s in film["scenes"]:
            pronunciation=s["narration"].replace("Minhāj al-dukkān","Minhaj al-dukkan").replace("julāb","julab").replace("qiwām","qiwam")
            voice,rate=tts.create(pronunciation,voice="bm_george",speed=1.06,lang="en-gb")
            voice=np.asarray(voice,dtype=np.float32).flatten()
            if not np.all(np.isfinite(voice)):raise ValueError("Audio invalid")
            if sr and sr!=rate:raise ValueError("Audio sample-rate mismatch")
            speech.append(voice);sr=rate
        frames=old.allocate(speech,sr)
        starts=[]; cursor=0
        for f in frames: starts.append(cursor/FPS); cursor+=f
        build_vtt(film,starts,[len(a)/sr for a in speech])
        clips=[]
        for s,count in zip(film["scenes"],frames):
            if s.get("image"):
                bg=photo_frame(ROOT/s["image"].lstrip("/"))
            else:
                bg=illustrate(film,s)
            frame=work/("source-"+s["id"]+".png")
            bg.save(frame)
            layer=film_overlay(film,s)
            mask=work/("overlay-"+s["id"]+".png")
            layer.save(mask)
            preview=Image.alpha_composite(bg.convert("RGBA"),layer).convert("RGB")
            preview.save(PLATES/(film["slug"]+"-"+s["id"]+".webp"),"WEBP",quality=82,method=5)
            if s["id"]=="01":
                preview.save(FILMS/(film["slug"]+"-poster.webp"),"WEBP",quality=88,method=5)
            clip=work/("scene-"+s["id"]+".mp4")
            old.make_clip({"contain":False},None,None,frame,mask,count/FPS,clip)
            clips.append(clip)
            print(film["slug"],s["id"],"seconds",round(count/FPS,2),flush=True)
        playlist=work/"concat.txt"
        playlist.write_text("".join("file '"+str(p)+"'\n" for p in clips),encoding="utf-8")
        joined=work/"joined.mp4"
        cmd(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(playlist),"-c","copy",str(joined)])
        soundtrack=voice_mix(film,speech,sr,frames,work)
        final=FILMS/(film["slug"]+".mp4")
        cmd(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(joined),"-i",str(soundtrack),
            "-map","0:v:0","-map","1:a:0","-c:v","copy","-af","loudnorm=I=-18:TP=-2:LRA=11",
            "-c:a","aac","-b:a","160k","-t","120","-movflags","+faststart",str(final)])
        details=json.loads(cmd(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(final)]))
        dur=float(details["format"]["duration"])
        if abs(dur-120)>.16: raise RuntimeError("Two-minute runtime validation failed: "+str(dur))
        if final.stat().st_size>90_000_000:raise RuntimeError("Output exceeds GitHub limit")
        record={"title":film["title"],"seconds":dur,"bytes":final.stat().st_size,
                "sha256":hashlib.sha256(final.read_bytes()).hexdigest(),
                "source":"assets/films/evidence-in-motion.json","chapters":8,
                "media":[{"chapter":s["id"],"type":s["kind"],"credit":s["credit"],"source":s.get("image",None)} for s in film["scenes"]],
                "editorial_method":"Real owner archive retained uncropped in frames; explicitly non-documentary original illustrations; audio Kokoro-ONNX + self-generated original score."}
        (FILMS/(film["slug"]+"-build.json")).write_text(json.dumps(record,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print("COMPLETE",film["slug"],round(dur,2),"s",final.stat().st_size,"bytes",flush=True)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--validate-only",action="store_true")
    p.add_argument("--workspace",default="film-models")
    p.add_argument("--only",choices=["what-a-bubble-can-do","two-materials-no-section","the-laboratory-we-carried-with-us","making-medicines-keep"])
    a=p.parse_args()
    films=validate()
    if a.validate_only:return
    from kokoro_onnx import Kokoro
    models=(ROOT/a.workspace).resolve()
    tts=Kokoro(str(models/"kokoro-v1.0.fp16.onnx"),str(models/"voices-v1.0.bin"))
    for film in films:
        if a.only and film["slug"]!=a.only:continue
        render_one(film,tts)

if __name__=="__main__":
    main()
