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
    """Documentary frame: source material never clipped or used as decorative wallpaper."""
    with Image.open(path) as src:
        img=ImageOps.exif_transpose(src).convert("RGB")
    matte=Image.new("RGB",(W,H),(13,26,29))
    soft=ImageOps.fit(img,(W,H),method=Image.Resampling.LANCZOS)
    if contained:
        matte=Image.blend(soft.filter(ImageFilter.GaussianBlur(56)),matte,.87)
        img.thumbnail((W-116,H-245),Image.Resampling.LANCZOS)
        # Protected scientific area 92px-555px; full axes and historical pages.
        matte.paste(img,((W-img.width)//2,95+(H-255-img.height)//2))
        return matte
    if img.height>img.width*1.17:
        matte=Image.blend(soft.filter(ImageFilter.GaussianBlur(50)),matte,.68)
        img.thumbnail((W-135,H-120),Image.Resampling.LANCZOS)
        matte.paste(img,((W-img.width)//2,(H-img.height)//2))
        return matte
    return ImageOps.fit(img,(W,H),Image.Resampling.LANCZOS,centering=(.50,.48))

def overlay(shot):
    """Purpose-driven layouts with separate treatment for records, mechanisms and testimony.

    Titles occupy a dedicated footer. Film subtitles live in the .vtt track rather
    than obscuring the primary photograph, manuscript or experimental plot.
    """
    frame=Image.new("RGBA",(W,H),(0,0,0,0))
    d=ImageDraw.Draw(frame)
    mode=shot.get("film_mode","mechanism").lower()
    role=shot.get("narrative_role","")
    mode_colors={
        "witness":((208,154,113),(13,30,34)),
        "material":((205,176,122),(19,30,29)),
        "document":((221,184,133),(38,29,28)),
        "argument":((185,197,205),(21,29,35)),
        "mechanism":((142,190,177),(10,32,35))
    }
    if "historic" in mode or "pharma" in mode:mode="document"
    if "clinical" in mode or "instrument" in mode or "microscop" in mode:mode="mechanism"
    if "chem" in mode or "materials" in mode or "formulation" in mode:mode="material"
    if "ess" in mode:mode="argument"
    if mode not in mode_colors:mode="mechanism"
    accent,ink=mode_colors[mode]
    regular=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",14)
    small=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",12)
    titlefont=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",35)
    contained=shot.get("contain",False)
    footer_start=556 if contained else 545
    for y in range(footer_start,H):
        t=(y-footer_start)/(H-footer_start)
        alpha=int(246*t**.48)
        d.line([(0,y),(W,y)],fill=(*ink,alpha))
    # Only a thin archival tracking label above the picture.
    d.text((58,40),"RUWAIDIX    /    "+mode.upper(),font=regular,fill=(247,237,222))
    d.line([(58,70),(120,70)],fill=accent,width=3)
    if role in ("cold_open","ending","closing"):
        d.rectangle((58,586,64,634),fill=accent)
        left=86
    else:
        left=58
    heading=shot.get("title","").strip()
    while titlefont.getlength(heading)>W-left-55 and titlefont.size>20:
        titlefont=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",titlefont.size-1)
    d.text((left,584),heading,font=titlefont,fill=(248,242,229))
    kind=shot.get("kind","").lower()
    if "figure" in kind or "published" in kind:label="PUBLISHED FIGURE · OPEN ORIGINAL FOR DETAIL"
    elif "museum" in kind:label="COMPARATIVE HISTORICAL OBJECT · MUSEUM SOURCE"
    elif "concept" in kind or "diagram" in kind or "schematic" in kind or "illustrat" in kind:label="EDITORIAL EXPLANATION · NOT EXPERIMENTAL FOOTAGE"
    elif "owner" in kind or "photo" in kind or "archiv" in kind:label="SOURCE ARCHIVE · PROVENANCE IN FILM RECORD"
    else:label="RESEARCH CONTEXT · PROVENANCE IN FILM RECORD"
    d.text((58,682),label,font=small,fill=accent)
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
    original = ROOT / shot["image"]
    if original.suffix.lower() == ".svg":
        import cairosvg
        target = workspace / ("editorial-" + shot.get("id","cut") + ".png")
        cairosvg.svg2png(url=str(original),write_to=str(target),output_width=1280,output_height=720)
        return target, None
    return original, None

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

# The public/documentary renderer is not modified. All editorial techniques
# here are confined to the reversible V2 film workroom.
_original_make_clip=engine.make_clip

def cinematic_photo_clip(item, image, video, frame, over, duration, out):
    """Source-protective camera movement on genuine photographs only.

    Figures, scientific plots, museum comparisons and microscope images never
    receive a crop. Camera movement is explicitly directed for each film shot.
    """
    move=item.get("camera_move","lock")
    if video or item.get("contain") or move=="lock":
        return _original_make_clip(item,image,video,frame,over,duration,out)
    if move not in {"slow-push","slow-pull","pan-left","pan-right","rise","settle"}:
        raise ValueError("Unsupported editorial movement: "+str(move))
    frames=int(round(duration*FPS))
    if move=="slow-push":
        zz="min(1.066,1.0+on*0.00017)"
        xx="(iw-iw/zoom)*0.5"
        yy="(ih-ih/zoom)*0.5"
    elif move=="slow-pull":
        zz="max(1.0,1.066-on*0.00017)"
        xx="(iw-iw/zoom)*0.5"
        yy="(ih-ih/zoom)*0.5"
    else:
        zz="1.052"
        amount=f"on/{max(1,frames)}"
        if move=="pan-left":
            xx=f"(iw-iw/zoom)*(0.70-0.40*{amount})"
            yy="(ih-ih/zoom)*0.5"
        elif move=="pan-right":
            xx=f"(iw-iw/zoom)*(0.30+0.40*{amount})"
            yy="(ih-ih/zoom)*0.5"
        elif move=="rise":
            xx="(iw-iw/zoom)*0.5"
            yy=f"(ih-ih/zoom)*(0.67-0.32*{amount})"
        else:
            xx="(iw-iw/zoom)*0.5"
            yy=f"(ih-ih/zoom)*(0.34+0.32*{amount})"
    motion=(f"[0:v]zoompan=z='{zz}':x='{xx}':y='{yy}':"
            f"d=1:s={W}x{H}:fps={FPS},format=yuv420p[bg];"
            "[bg][1:v]overlay=shortest=1,format=yuv420p[out]")
    engine.command(["ffmpeg","-hide_banner","-loglevel","error","-y",
        "-loop","1","-framerate",str(FPS),"-i",str(frame),
        "-loop","1","-framerate",str(FPS),"-i",str(over),
        "-filter_complex",motion,"-map","[out]",
        "-r",str(FPS),"-frames:v",str(frames),"-an","-c:v","libx264",
        "-preset","veryfast","-crf","22","-pix_fmt","yuv420p",
        "-movflags","+faststart",str(out)])
    return "directed archival photograph: "+move

def synthesize_director_audition(items,workspace):
    """Per-film audition casting, never a substitute for human voice direction."""
    from kokoro_onnx import Kokoro
    tts=Kokoro(str(workspace/"kokoro-v1.0.fp16.onnx"),
               str(workspace/"voices-v1.0.bin"))
    clips=[]
    rate=None
    for s in items:
        voice=s.get("voice_preview","bm_george")
        if voice not in ("bm_george","bm_lewis","am_michael","bf_emma"):
            raise ValueError("Unknown review-only voice casting")
        wave,sr=tts.create(s["narration"],voice=voice,speed=1.06,
                           lang="en-us" if voice.startswith("am_") else "en-gb")
        wave=np.asarray(wave,dtype=np.float32).flatten()
        if not np.isfinite(wave).all():raise ValueError("Nonfinite audition speech")
        if rate is not None and sr!=rate:raise ValueError("Voice sample rate mismatch")
        rate=sr
        clips.append(wave)
        sf.write(str(workspace/("narration-"+s["id"]+".wav")),wave,sr)
        print("Director audition",voice,"scene",s["id"],"seconds",round(len(wave)/sr,2))
    return clips,rate

def render(film, args):
    OUTPUT.mkdir(parents=True,exist_ok=True)
    engine.FILM=OUTPUT
    engine.TOTAL_SECONDS=sum(int(s["sec"]) for s in film["shots"])
    # Overrides affect only this isolated process, never public film scripts.
    engine.fit_image=fit_image
    engine.overlay=overlay
    engine.make_clip=cinematic_photo_clip
    engine.synthesize=synthesize_director_audition
    shots=[]
    for n, shot in enumerate(film["shots"],1):
        scientific = bool(re.search(r"figure|diagram|schematic|microscopy|published|manuscript|illustrat|model|concept", shot["kind"], re.I))
        shots.append(dict(shot,id=f"{n:02d}",subtitle="",film_mode=film.get("mode","mechanism"),contain=scientific,voice_preview=film.get("voice_preview","bm_george")))
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
            video=engine.source_path(shot,"video",work) if shot.get("video") else None
            if shot.get("required_video") and not video and not shot.get("videos"):
                raise RuntimeError("Required original experimental footage unavailable")
            if shot.get("videos"):
                files=[]
                for idx,url in enumerate(shot["videos"]):
                    f=engine.source_path({"id":shot["id"]+str(idx),"video":url},"video",work)
                    if not f:raise RuntimeError("Original microscopy montage unavailable")
                    files.append(f)
                video=engine.make_motion_montage(files,count/FPS,work,shot["id"])
            target=work/f"clip-{shot['id']}.mp4"
            engine.make_clip(shot,image,video,frame,ov,count/FPS,target)
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
             "-t",str(engine.TOTAL_SECONDS),"-movflags","+faststart",str(destination)])
        seconds=float(json.loads(run(["ffprobe","-v","error","-show_entries",
           "format=duration","-of","json",str(destination)]))["format"]["duration"])
        if abs(seconds-engine.TOTAL_SECONDS)>.3:raise AssertionError(f"Duration {seconds}, expected {engine.TOTAL_SECONDS}")
        (OUTPUT/(film["slug"]+"-rough-cut.vtt")).write_text(
           captions(film,[len(v)/sr for v in voice]),encoding="utf-8")
        record={"slug":film["slug"],"status":"UNAPPROVED ROUGH CUT; NOT A PUBLIC FILM",
                "duration":seconds,"voice_mode":args.voice_mode,
                "director_audition_voice":film.get("voice_preview","bm_george"),
                "director_ledger":"assets/films/directors-ledger-v3.json",
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
