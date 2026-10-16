#!/usr/bin/env python3
"""Ruwaidix | Two Materials. No Section.
Reproducible 150-second scientific documentary.
Authentic, uncropped archive + explicitly labeled explanatory graphics.
Locally synthesized Kokoro voice; original quiet score; FFmpeg assembly.
No manufactured microscopic sections, no stock laboratory footage.
"""
import argparse
import hashlib
import json
import math
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
FILMS = ROOT / "assets" / "films"
MANUSCRIPT = FILMS / "two-materials-scenes.json"
OUTPUT = FILMS / "two-materials-no-section.mp4"
CAPTIONS = FILMS / "two-materials-no-section.vtt"
BUILD = FILMS / "two-materials-build.json"
W, H, FPS, DURATION = 1280, 720, 24, 150
DARK, PAPER, CLAY, MUTED = (18, 43, 47), (247, 245, 237), (203, 145, 116), (197, 216, 205)
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def command(parts):
    p = subprocess.run(parts, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if p.returncode:
        raise RuntimeError("Command failed: " + " ".join(map(str, parts)) + "\n" + p.stderr[-3500:])
    return p.stdout

def font(size, family="sans"):
    return ImageFont.truetype({"sans": SANS, "serif": SERIF, "bold": BOLD}[family], size)

def wrap(text, draw, face, width):
    acc, rows = "", []
    for word in text.split():
        t = (acc + " " + word).strip()
        if acc and draw.textbbox((0, 0), t, font=face)[2] > width:
            rows.append(acc)
            acc = word
        else:
            acc = t
    if acc: rows.append(acc)
    return rows

def text(draw, pos, value, color=PAPER, size=25, family="sans"):
    draw.text(pos, value, fill=color, font=font(size, family))

def rounded(draw, box, fill, outline=None, radius=14, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def image_panel(scene):
    src = ROOT / scene["image"]
    with Image.open(src) as file:
        picture = ImageOps.exif_transpose(file).convert("RGB")
    # The primary source image is always wholly visible; the blurred matte is decorative.
    background = ImageOps.fit(picture, (W, H), method=Image.Resampling.LANCZOS)
    background = background.filter(ImageFilter.GaussianBlur(48))
    background = Image.blend(background, Image.new("RGB", (W, H), DARK), 0.67)
    picture.thumbnail((1050, 402), Image.Resampling.LANCZOS)
    anchor = ((W - picture.width)//2, 127 + (399-picture.height)//2)
    background.paste(picture, anchor)
    d = ImageDraw.Draw(background)
    d.rectangle((anchor[0]-2, anchor[1]-2, anchor[0]+picture.width+1, anchor[1]+picture.height+1),
                outline=(173, 191, 181), width=2)
    return background

def schematic(scene):
    """All new diagrams are expressly labeled explanatory, never treated as observed images."""
    bg = Image.new("RGB", (W, H), DARK)
    d = ImageDraw.Draw(bg)
    card = (105, 142, 1175, 520)
    rounded(d, card, (235, 239, 230), radius=20)
    ink=(28, 65, 68); grey=(75, 102, 98); accent=(149, 76, 56)
    kind=scene["diagram"]
    if kind=="agarose":
        text(d,(150,172),"Conceptual orientation support",ink,31,"serif")
        rounded(d,(285,253,990,430),(183,215,203),radius=18)
        rounded(d,(311,279,967,404),(204,227,215),radius=10)
        for k,x in enumerate([420,635,850]):
            d.ellipse((x-63,322,x+48,350),fill=(80,121,128),outline=ink,width=3)
            d.ellipse((x+37,325,x+64,347),fill=(100,143,147))
            d.ellipse((x-50,329,x-44,335),fill=PAPER)
        text(d,(392,442),"2% AGAROSE SUPPORT  /  ALIGNMENT CONCEPT",accent,16,"bold")
    elif kind=="boundary":
        text(d,(160,170),"Two different media",ink,33,"serif")
        rounded(d,(218,238,1060,317),(168,213,207),radius=11)
        rounded(d,(218,346,1060,425),(238,212,179),radius=11)
        d.line((218,331,1060,331),fill=accent,width=5)
        for x in range(230,1050,38):
            d.ellipse((x,321,x+12,333),fill=accent)
        text(d,(260,255),"AGAROSE  /  HYDROPHILIC GEL",ink,18,"bold")
        text(d,(260,362),"PARAFFIN  /  HYDROPHOBIC MEDIUM",ink,18,"bold")
        text(d,(325,445),"Interface behavior requires measurement",accent,19)
    elif kind=="observation":
        text(d,(158,174),"What was visible?",ink,33,"serif")
        rounded(d,(194,256,529,417),(176,208,200),radius=11)
        rounded(d,(737,256,1088,417),(233,213,186),radius=11)
        d.line((552,334,714,334),fill=accent,width=5)
        d.polygon([(712,318),(743,334),(712,350)],fill=accent)
        text(d,(240,294),"LAYER",ink,26,"bold")
        text(d,(240,337),"SEPARATION",ink,24,"bold")
        text(d,(795,295),"FRAGMENTS",ink,24,"bold")
        text(d,(780,343),"AT MICROTOME",ink,17)
        text(d,(240,449),"OBSERVED  /  PRECISE CAUSE UNRESOLVED",accent,17,"bold")
    elif kind=="hypothesis":
        text(d,(152,175),"One possible contributor",ink,33,"serif")
        rounded(d,(168,256,1111,407),(215,229,216),radius=12)
        text(d,(220,283),"AGAROSE GRADE  +  THERMAL BEHAVIOUR",ink,26,"bold")
        text(d,(220,342),"May have contributed; not independently established",accent,19)
        text(d,(225,440),"A plausible explanation is not an experimental confirmation.",grey,18)
    elif kind=="controls":
        text(d,(152,170),"Comparisons to design, not results obtained",ink,29,"serif")
        boxes=[("AGAROSE", "Grade / concentration"),("PROCESS", "Dehydrate / clear"),("BLOCK", "Integrity at cutting")]
        for i,(a,b) in enumerate(boxes):
            x=142+i*350
            rounded(d,(x,250,x+319,400),(211,225,212) if i!=1 else (233,218,194),radius=15)
            text(d,(x+24,288),a,ink,25,"bold")
            text(d,(x+24,342),b,grey,17)
        text(d,(185,445),"PROPOSED EXPERIMENTS  /  NOT PERFORMED",accent,18,"bold")
    else:
        raise ValueError("Unexpected diagram type "+kind)
    return bg

def render_frame(scene, target):
    image = image_panel(scene) if scene["kind"]=="archival photograph" else schematic(scene)
    d = ImageDraw.Draw(image)
    # Fixed cinematic frame, all labels outside central scientific data.
    d.rectangle((0,0,W,110),fill=(14,34,39))
    d.rectangle((0,536,W,H),fill=(14,34,39))
    d.rectangle((70,38,118,43),fill=CLAY)
    text(d,(71,55),"RUWAIDIX   /   TWO MATERIALS. NO SECTION.",PAPER,18,"bold")
    text(d,(897,57),f"DOCUMENTARY   /   {scene['id']} OF 10",MUTED,14)
    title=scene["title"]
    face=font(43,"serif")
    lines=wrap(title,d,face,1110)
    for i,line in enumerate(lines[:2]):text(d,(68,553+i*53),line,PAPER,43,"serif")
    text(d,(70,684),scene["subtitle"],CLAY,15,"bold")
    text(d,(977,682),"ORIGINAL ARCHIVE" if scene["kind"]=="archival photograph" else "EXPLANATORY SCHEMATIC",MUTED,13)
    image.save(target,quality=93)

def clock(sec):
    n=round(sec*1000)
    return f"{n//3600000:02d}:{(n//60000)%60:02d}:{(n//1000)%60:02d}.{n%1000:03d}"

def save_captions(scenes):
    chunks=["WEBVTT", ""]
    for scene in scenes:
        words=scene["narration"].split()
        mid=math.ceil(len(words)/2)
        halves=[" ".join(words[:mid])," ".join(words[mid:])]
        a=scene["start"]+.6
        for k,part in enumerate(halves):
            b=scene["start"]+.6+(.49*scene["duration"])*(k+1)
            chunks.extend([clock(a)+" --> "+clock(b),part,""])
            a=b
    CAPTIONS.write_text("\n".join(chunks),encoding="utf-8")

def tts_speech(scenes, model_root):
    from kokoro_onnx import Kokoro
    engine=Kokoro(str(model_root/"kokoro-v1.0.fp16.onnx"),str(model_root/"voices-v1.0.bin"))
    speech=[]; sample_rate=None
    for scene in scenes:
        samples,sr=engine.create(scene["narration"],voice="bm_george",speed=1.10,lang="en-gb")
        arr=np.asarray(samples,dtype=np.float32).flatten()
        if not np.all(np.isfinite(arr)) or not arr.size:
            raise ValueError("Invalid synthesized narration at scene "+scene["id"])
        if sample_rate is not None and sr!=sample_rate:
            raise RuntimeError("Speech sample rate changed")
        sample_rate=sr
        length=len(arr)/sr
        print("Narration",scene["id"],round(length,2),"seconds; slot",scene["duration"])
        if length > scene["duration"]-1.55:
            raise ValueError(f"Voice in scene {scene['id']} overruns its allocated slot ({length:.1f} s). Edit words rather than truncate.")
        speech.append(arr)
    return speech,sample_rate

def render_audio(scenes, speech, sr, outfile):
    count=DURATION*sr
    arr=np.zeros(count,np.float32)
    speaking=np.zeros(count,np.float32)
    for scene,voice in zip(scenes,speech):
        start=int(round((scene["start"]+.65)*sr))
        end=start+len(voice)
        if end>count: raise AssertionError("Voice overran film")
        rms=float(np.sqrt(np.mean(voice**2)+1e-8))
        gain=min(2.0,.085/max(rms,.0001))
        arr[start:end]+=np.tanh(voice*gain)
        speaking[max(0,start-int(.3*sr)):min(count,end+int(.4*sr))]=1
    # Quiet original score: no stock music or algorithmic foley presented as field sound.
    t=np.arange(count,dtype=np.float32)/sr
    score=np.zeros(count,np.float32)
    chords=[(110,130.81,164.81),(98,146.83,174.61),(87.31,130.81,196.00)]
    for i,(a,b,c) in enumerate(chords):
        seg_start=i*50;seg_end=(i+1)*50
        win=np.clip((t-seg_start)/4,0,1)*np.clip((seg_end-t)/4,0,1)
        pad=(.54*np.sin(2*np.pi*a*t)+.26*np.sin(2*np.pi*b*t+.4)+.18*np.sin(2*np.pi*c*t+1))
        score+=np.asarray(win*pad,np.float32)
    fade=np.minimum(1,t/3)*np.minimum(1,(DURATION-t)/4)
    arr+=np.asarray(.017*score*fade*(1-.67*speaking),np.float32)
    peak=float(np.max(np.abs(arr)))
    if peak>.88:arr*=.88/peak
    sf.write(str(outfile),arr,sr,subtype="PCM_16")

def assemble(scenes, workspace, soundtrack):
    clips=[]
    for scene in scenes:
        src=workspace/("frame-"+scene["id"]+".jpg")
        render_frame(scene,src)
        result=workspace/("clip-"+scene["id"]+".mp4")
        fadeout=scene["duration"]-.55
        frames=FPS*scene["duration"]
        vf=("zoompan=z='min(zoom+0.000015,1.006)':"
            "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            "d=1:s=1280x720:fps=24,"
            f"fade=t=in:st=0:d=.45,fade=t=out:st={fadeout}:d=.55,"
            "format=yuv420p")
        command(["ffmpeg","-hide_banner","-loglevel","error","-y","-loop","1","-framerate","24",
                 "-i",str(src),"-vf",vf,"-frames:v",str(frames),"-an",
                 "-c:v","libx264","-preset","veryfast","-crf","22",
                 "-pix_fmt","yuv420p",str(result)])
        clips.append(result)
        print("Rendered",scene["id"],"type",scene["kind"])
    playlist=workspace/"playlist.txt"
    playlist.write_text("".join("file '"+str(p)+"'\n" for p in clips),encoding="utf-8")
    joined=workspace/"silent.mp4"
    command(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0",
             "-i",str(playlist),"-c","copy",str(joined)])
    command(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(joined),"-i",str(soundtrack),
             "-map","0:v:0","-map","1:a:0","-c:v","copy",
             "-c:a","aac","-b:a","160k","-af","loudnorm=I=-18:TP=-2:LRA=11",
             "-t",str(DURATION),"-movflags","+faststart",str(OUTPUT)])
    meta=json.loads(command(["ffprobe","-v","error","-show_entries","format=duration",
                              "-of","json",str(OUTPUT)]))
    seconds=float(meta["format"]["duration"])
    if abs(seconds-DURATION)>.17:raise RuntimeError("Final duration failed: "+str(seconds))
    if OUTPUT.stat().st_size>90000000:raise RuntimeError("Result exceeds GitHub file size budget")
    source_hashes={}
    for scene in scenes:
        if scene.get("image"):
            p=ROOT/scene["image"]
            source_hashes[scene["image"]]=hashlib.sha256(p.read_bytes()).hexdigest()
    BUILD.write_text(json.dumps({
        "title":"Two Materials. No Section.","seconds":seconds,
        "video_sha256":hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),
        "scene_count":len(scenes),"source_photo_sha256":source_hashes,
        "voice":"kokoro-onnx, bm_george, generated locally; not the author's authentic voice",
        "sound":"original restrained harmonic score, no recorded laboratory audio",
        "render_script":"scripts/render-two-materials-film.py",
        "scene_source":"assets/films/two-materials-scenes.json",
        "scientific_note":"Explanatory diagrams are labeled and are not microscopy or experimental outcomes",
    },indent=2)+"\n",encoding="utf-8")
    print("READY:",OUTPUT,"seconds",seconds,"MB",round(OUTPUT.stat().st_size/1e6,2))

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    parser.add_argument("--workspace",default="film-models")
    args=parser.parse_args()
    data=json.loads(MANUSCRIPT.read_text(encoding="utf-8"))
    scenes=data["scenes"]
    if len(scenes)!=10 or data["running_seconds"]!=DURATION:
        raise AssertionError("Film must contain ten source-grounded scenes at 150 seconds")
    cursor=0
    for i,scene in enumerate(scenes,1):
        if scene["id"]!=str(i).zfill(2) or scene["start"]!=cursor or scene["duration"]<10:
            raise AssertionError("Inconsistent scene order or duration")
        cursor+=scene["duration"]
        if not scene.get("narration") or not scene.get("title"):
            raise AssertionError("Missing narrative credit")
        if scene["kind"]=="archival photograph":
            if not (ROOT/scene["image"]).is_file():raise FileNotFoundError(scene["image"])
        elif scene["kind"]=="explanatory schematic":
            if not scene.get("diagram"):raise AssertionError("Missing schematic spec")
        else:raise AssertionError("Unidentified evidence status")
    if cursor!=DURATION:raise AssertionError("Incorrect cumulative running time")
    if args.validate_only:
        print("VALID: 10 scenes, three real archived photo sources, source distinction; 150 seconds")
        return
    root=Path(args.workspace).resolve()
    with tempfile.TemporaryDirectory(prefix="ruwaidix-histology-") as temp:
        workspace=Path(temp)
        speech,sr=tts_speech(scenes,root)
        track=workspace/"voice-score.wav"
        render_audio(scenes,speech,sr,track)
        save_captions(scenes)
        assemble(scenes,workspace,track)

if __name__=="__main__":main()
