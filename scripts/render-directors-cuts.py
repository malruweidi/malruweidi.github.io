#!/usr/bin/env python3
"""Reversible Ruwaidix director's-cut preview renderer.

Important: renders into assets/films/preview-v2/. It never touches public film
URLs, the approved website, original source media, or film catalogue.
The Kokoro mode is an AUDITION COPY only; human approval is required to publish.
"""
import argparse
import hashlib
import importlib.util
import json
import re
import subprocess
import tempfile
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets/films/directors-cuts-v2.json"
OUTPUT = ROOT / "assets/films/preview-v2"
ENGINE = ROOT / "scripts/render-documentary.py"
W, H, FPS = 1280, 720, 24
ALLOWED_MUSEUM_OBJECTS = {451400, 446288}
spec = importlib.util.spec_from_file_location("film_engine", ENGINE)
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)
engine.TOTAL_SECONDS = 120
engine.FILM = OUTPUT

def run(args):
    p = subprocess.run(args, text=True, capture_output=True)
    if p.returncode:
        raise RuntimeError(" ".join(map(str, args)) + "\n" + p.stderr[-1800:])
    return p.stdout

def load_films():
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if data.get("status") != "EDITORIAL PROTOTYPE — not published":
        raise ValueError("Director's-cut catalogue must remain an unapproved prototype")
    films = data["films"]
    if len(films) != 3 or len(set(f["slug"] for f in films)) != len(films):
        raise ValueError("Expected exactly three unique pilot films")
    for f in films:
        shots = f["shots"]
        if len(shots) < 8 or sum(int(s["sec"]) for s in shots) != 120:
            raise ValueError("Shot count/duration invalid: " + f["slug"])
        distinct = set()
        for n, s in enumerate(shots, 1):
            for field in ("sec", "kind", "narration", "credit", "title"):
                if not s.get(field):
                    raise ValueError(f"{f['slug']}: shot {n} missing {field}")
            if int(s["sec"]) < 8 or len(s["narration"].split()) < 8:
                raise ValueError(f"{f['slug']}: shot {n} needs narrative development")
            # Reject dense, unplayable passages BEFORE generating audio.
            if len(s["narration"].split()) / int(s["sec"]) > 2.55:
                raise ValueError(f"{f['slug']}: shot {n} narration too dense")
            if s["kind"] == "museum_public_domain":
                if s.get("object_id") not in ALLOWED_MUSEUM_OBJECTS:
                    raise ValueError("Unapproved historical artifact")
                distinct.add("MET:" + str(s["object_id"]))
            else:
                path = s.get("image")
                if not path or not (ROOT / path).is_file():
                    raise FileNotFoundError(f"{f['slug']}: {path}")
                distinct.add(path)
            if s["kind"] in ("original_diagram", "original_illustration") and not re.search(
                r"editorial|illustrat|reconstruction|schematic|concept|interpret|hypothesis",
                s["credit"], re.I
            ):
                raise ValueError("Conceptual shot must say it is an interpretation")
        if len(distinct) < 5:
            raise ValueError(f"{f['slug']}: insufficient visual variety")
    return films

def met_public_domain_source(object_id, workspace):
    """Use verified Met collection API metadata, not scraped or fabricated provenance."""
    if object_id not in ALLOWED_MUSEUM_OBJECTS:
        raise ValueError("Unapproved museum object")
    api = f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}"
    req = urllib.request.Request(api, headers={"User-Agent":"Ruwaidix-Research-Film/2.0"})
    with urllib.request.urlopen(req, timeout=35) as response:
        record = json.load(response)
    if record.get("objectID") != object_id or not record.get("isPublicDomain"):
        raise PermissionError("Museum image not verified public domain")
    url = record.get("primaryImage")
    if not url or not url.startswith("https://"):
        raise ValueError("Missing verified museum image URL")
    destination = workspace / f"met-{object_id}.jpg"
    img_req = urllib.request.Request(url, headers={"User-Agent":"Ruwaidix-Research-Film/2.0"})
    with urllib.request.urlopen(img_req, timeout=60) as response, destination.open("wb") as dst:
        import shutil
        shutil.copyfileobj(response, dst, length=8 * 1024 * 1024)
    if destination.stat().st_size < 20000:
        raise ValueError("Historical scan suspiciously small")
    with Image.open(destination) as im:
        im.verify()
    return destination, {"objectID":object_id,"title":record.get("title"),
                          "artist":record.get("artistDisplayName"),"date":record.get("objectDate"),
                          "public_domain":True,"url":record.get("objectURL")}

def fit_image(path, contained):
    """Never crop manuscript, published figure, scale bar, or failed section evidence."""
    with Image.open(path) as src:
        img = ImageOps.exif_transpose(src).convert("RGB")
    bg = Image.new("RGB", (W,H), (12,24,27))
    if contained:
        blurred = ImageOps.fit(img,(W,H),method=Image.Resampling.LANCZOS)
        bg = Image.blend(blurred.filter(ImageFilter.GaussianBlur(56)), bg, .82)
        img.thumbnail((W-90,H-130), Image.Resampling.LANCZOS)
        bg.paste(img,((W-img.width)//2,(H-55-img.height)//2))
        return bg
    if img.height > img.width * 1.17:
        blurred = ImageOps.fit(img,(W,H),method=Image.Resampling.LANCZOS)
        bg = Image.blend(blurred.filter(ImageFilter.GaussianBlur(54)),bg,.66)
        img.thumbnail((W-155,H-80),Image.Resampling.LANCZOS)
        bg.paste(img,((W-img.width)//2,(H-img.height)//2))
        return bg
    return ImageOps.fit(img,(W,H),Image.Resampling.LANCZOS,centering=(.5,.5))

def overlay(shot):
    """Small, anchored typography; captions are separate WebVTT tracks."""
    frame=Image.new("RGBA",(W,H),(0,0,0,0))
    d=ImageDraw.Draw(frame)
    for y in range(502,H):
        a=int(189*((y-502)/(H-502))**1.25)
        d.line([(0,y),(W,y)],fill=(11,22,26,a))
    regular=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",15)
    titlefont=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",37)
    micro=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",11)
    d.text((57,42),"RUWAIDIX   /   A RESEARCH FILM",font=regular,fill=(244,230,209))
    d.line([(57,77),(113,77)],fill=(204,149,107),width=3)
    # Restrict title overlay to one coherent line, preserve the image itself.
    title=shot["title"]
    while titlefont.getlength(title)>W-124 and titlefont.size>23:
        titlefont=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",titlefont.size-1)
    d.text((57,572),title,font=titlefont,fill=(251,241,220))
    kind=shot["kind"].replace("_"," ").upper()
    d.text((57,675),kind+"  ·  SOURCE AND TRANSCRIPT IN FILM RECORD",font=micro,fill=(226,210,187))
    return frame

def split_caption_words(text, max_len=55):
    words=text.split()
    chunks=[]
    current=[]
    for word in words:
        if current and len(" ".join(current+[word])) > max_len:
            chunks.append(" ".join(current))
            current=[]
        current.append(word)
    if current: chunks.append(" ".join(current))
    return chunks

def captions(film, wav_lengths):
    out=["WEBVTT",""]
    cursor=0.0
    for shot, voice_sec in zip(film["shots"], wav_lengths):
        chunks=split_caption_words(shot["narration"])
        word_total=sum(len(x.split()) for x in chunks)
        pos=0
        for phrase in chunks:
            size=len(phrase.split())
            start=cursor+.45+voice_sec*pos/word_total
            end=cursor+.45+voice_sec*(pos+size)/word_total
            out.extend([f"{engine.vtt_time(start)} --> {engine.vtt_time(end)}",phrase,""])
            pos+=size
        cursor+=shot["sec"]
    return "\n".join(out)

def source_image(shot, workspace):
    if shot["kind"]=="museum_public_domain":
        return met_public_domain_source(shot["object_id"],workspace)
    return ROOT / shot["image"], None

def recorded_speech(film, voice_dir):
    if not voice_dir:
        raise ValueError("Human narration mode requires --voice-dir")
    sounds=[]
    sr=None
    for i,shot in enumerate(film["shots"],1):
        file=Path(voice_dir)/film["slug"]/f"{i:02d}.wav"
        if not file.is_file(): raise FileNotFoundError(str(file))
        wav,rate=sf.read(file,dtype="float32")
        wav=np.asarray(wav)
        if wav.ndim>1: wav=wav.mean(axis=1)
        if sr is None: sr=rate
        if rate!=sr: raise ValueError("Inconsistent narration sample rate")
        if not np.isfinite(wav).all():raise ValueError("Invalid human narration audio")
        sounds.append(wav)
    return sounds,sr

def render(film, args):
    OUTPUT.mkdir(parents=True,exist_ok=True)
    engine.FILM=OUTPUT
    engine.TOTAL_SECONDS=120
    # Overrides affect only this isolated process, never public film scripts.
    engine.fit_image=fit_image
    engine.overlay=overlay
    shots=[]
    for n, shot in enumerate(film["shots"],1):
        shots.append(dict(shot,id=f"{n:02d}",subtitle="",contain=shot["kind"] in (
            "study_figure","museum_public_domain","original_diagram","original_illustration")))
    with tempfile.TemporaryDirectory(prefix="ruwaidix-v2-") as tmp:
        work=Path(tmp)
        if args.voice_mode=="human":
            voice,sr=recorded_speech(film,args.voice_dir)
        else:
            models=Path(args.models).resolve()
            for model in ("kokoro-v1.0.fp16.onnx","voices-v1.0.bin"):
                file=models/model
                if not file.is_file():raise FileNotFoundError(str(file))
                (work/model).symlink_to(file)
            voice,sr=engine.synthesize(shots,work)
        if len(voice)!=len(shots): raise AssertionError("Voice/scene count mismatch")
        for n,(shot,wav) in enumerate(zip(shots,voice),1):
            if len(wav)/sr+.62>shot["sec"]:
                raise ValueError(f"{film['slug']} shot {n}: voice exceeds {shot['sec']}s. Rewrite or rerecord; never clip.")
        frames=[int(s["sec"])*FPS for s in shots]
        images=[];sources=[]
        for shot,count in zip(shots,frames):
            image,meta=source_image(shot,work)
            frame,ov=engine.make_frame(shot,image,work)
            target=work/f"clip-{shot['id']}.mp4"
            engine.make_clip(shot,image,None,frame,ov,count/FPS,target)
            images.append(target)
            sources.append({"title":shot["title"],"kind":shot["kind"],"image":shot.get("image"),
                            "museum":meta,"credit":shot["credit"]})
        playlist=work/"list.txt"
        playlist.write_text("".join("file '"+str(p)+"'\n" for p in images))
        picture=work/"silent.mp4"
        run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0",
             "-i",str(playlist),"-c","copy",str(picture)])
        audio=engine.soundtrack(voice,sr,frames,work)
        destination=OUTPUT/(film["slug"]+"-rough-cut.mp4")
        run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(picture),
             "-i",str(audio),"-map","0:v","-map","1:a","-c:v","copy",
             "-af","loudnorm=I=-18:TP=-2:LRA=9","-c:a","aac","-b:a","192k",
             "-t","120","-movflags","+faststart",str(destination)])
        seconds=float(json.loads(run(["ffprobe","-v","error","-show_entries",
           "format=duration","-of","json",str(destination)]))["format"]["duration"])
        if abs(seconds-120)>.3:raise AssertionError(f"Duration {seconds}")
        (OUTPUT/(film["slug"]+"-rough-cut.vtt")).write_text(
           captions(film,[len(v)/sr for v in voice]),encoding="utf-8")
        record={"slug":film["slug"],"status":"UNAPPROVED ROUGH CUT; NOT A PUBLIC FILM",
                "duration":seconds,"voice_mode":args.voice_mode,
                "voice_approved":False,"sound_mix_approved":False,
                "source_rights_approved":False,"continuous_playback_approved":False,
                "sha256":hashlib.sha256(destination.read_bytes()).hexdigest(),"shots":sources}
        (OUTPUT/(film["slug"]+"-rough-cut.json")).write_text(json.dumps(record,indent=2)+"\n")
        print("ROUGH CUT",destination,"duration",seconds,"seconds")

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--validate-only",action="store_true")
    p.add_argument("--film",action="append")
    p.add_argument("--voice-mode",choices=("human","kokoro-preview"),default="human")
    p.add_argument("--voice-dir")
    p.add_argument("--models",default="film-models")
    args=p.parse_args()
    films=load_films()
    if args.film:
        unknown=set(args.film)-{f["slug"] for f in films}
        if unknown:raise ValueError("Unknown films: "+str(sorted(unknown)))
        films=[f for f in films if f["slug"] in args.film]
    for f in films:
        print("SCRIPT READY",f["slug"],"shots",len(f["shots"]),
              "words",sum(len(s["narration"].split()) for s in f["shots"]))
    if args.validate_only:return
    for f in films:render(f,args)

if __name__=="__main__":main()
