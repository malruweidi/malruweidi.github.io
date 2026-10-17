#!/usr/bin/env python3
"""Source-preserving five-film narrative feature recut.

Keeps each original first-edition movie and its audio intact, except for a
separately disclosed Cairo narration track. Injects four full-motion, clearly
labelled scientific/editorial visual explanations at exact documented chapter
boundaries. No measured curves, histological sections or archives are forged.
"""
import argparse
import hashlib
import importlib.util
import io
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"assets"/"films"
OUT=SOURCE/"longform-v2"
DIRECTION=SOURCE/"longform-remake-direction.json"
NAMES={
    "what-survives-the-experiment":"what-survives-scenes.json",
    "airway-reopening-evidence-cut":"airway-reopening-evidence-scenes.json",
    "ring-that-never-closed":"ring-that-never-closed-scenes.json",
    "cairo-microscope":"cairo-microscope-scenes.json",
    "two-materials-no-section":"two-materials-scenes.json",
}
BASE_FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD_FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def run(cmd):
    p=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode:raise RuntimeError("Command: "+" ".join(map(str,cmd))+"\n"+p.stderr[-2200:].decode("utf8","replace"))
    return p.stdout

def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def sec(tc):
    h,m,s=tc.split(":")
    return int(h)*3600+int(m)*60+float(s)

def timeline(slug,scenes):
    if all(s.get("start") is not None for s in scenes):
        return {s["id"]:(float(s["start"]),float(s["duration"])) for s in scenes}
    vtt=(SOURCE/(slug+".vtt")).read_text(encoding="utf8")
    cues=re.findall(r"(?m)^(\d\d:\d\d:\d\d\.\d{3}) --> ",vtt)
    if len(cues)!=len(scenes)*2:
        raise ValueError("First-edition narration caption boundaries do not match "+slug)
    starts=[max(0,sec(cues[i*2])-.55) for i in range(len(scenes))]
    duration=json.loads((SOURCE/NAMES[slug]).read_text(encoding="utf8"))["running_seconds"]
    return {s["id"]:(starts[i],(starts[i+1] if i+1<len(scenes) else duration)-starts[i])
            for i,s in enumerate(scenes)}

def image_at(movie,when,destination):
    b=run(["ffmpeg","-hide_banner","-loglevel","error","-ss",str(when),"-i",str(movie),
           "-map","0:v:0","-frames:v","1","-f","image2pipe","-vcodec","mjpeg","-q:v","3","pipe:1"])
    img=Image.open(io.BytesIO(b)).convert("RGB")
    img.save(destination,quality=90)
    return destination

def overlay_for(scene,movie_stem,destination):
    """A movable diagram must be more visible than source labels, not cover data."""
    im=Image.new("RGBA",(1280,720),(0,0,0,0))
    d=ImageDraw.Draw(im)
    for y in range(480,720):
        alpha=int(246*((y-480)/240)**.75)
        d.line((0,y,1280,y),fill=(11,31,38,alpha))
    d.rectangle((60,43,117,48),fill=(197,140,105,255))
    d.text((60,68),"RUWAIDIX / SOURCE-ANNOTATED FILM EDITION",font=ImageFont.truetype(BOLD_FONT,16),
           fill=(243,240,230))
    d.text((61,117),movie_stem.replace("-"," ").upper()[:75],font=ImageFont.truetype(BASE_FONT,15),
           fill=(174,215,190))
    title=scene.get("title","A scientific explanation")
    size=45 if len(title)<34 else 37
    face=ImageFont.truetype(BOLD_FONT,size)
    d.text((58,525),title[:58],font=face,fill=(249,244,232))
    d.text((60,682),"CONCEPTUAL EXPLANATION / NOT A NEW EXPERIMENT",font=ImageFont.truetype(BASE_FONT,13),
           fill=(220,177,136))
    im.save(destination)

def chunks(text,limit=53):
    words=text.split();lines=[];buffer=""
    for w in words:
        candidate=(buffer+" "+w).strip()
        if buffer and len(candidate)>limit:lines.append(buffer);buffer=w
        else:buffer=candidate
    if buffer:lines.append(buffer)
    return lines

def tick(seconds):
    n=round(seconds*1000)
    return f"{n//3600000:02d}:{(n//60000)%60:02d}:{(n//1000)%60:02d}.{n%1000:03d}"

def cairo_voice(scenes,source,workspace,models):
    """The first edition is music-only. Add distinct, genuinely voiced content."""
    from kokoro_onnx import Kokoro
    voiceplan=source["narration_v2"]
    tts=Kokoro(str(models/"kokoro-v1.0.fp16.onnx"),str(models/"voices-v1.0.bin"))
    rate=None;parts=[]
    for scene in scenes:
        spoken,r=tts.create(voiceplan[scene["id"]],voice="bm_george",speed=1.10,lang="en-gb")
        a=np.asarray(spoken,dtype=np.float32).flatten()
        if rate is not None and rate!=r:raise RuntimeError("Cairo audio rate changed mid-film")
        rate=r;parts.append(a)
        allowed=float(scene["duration"])-1.0
        if len(a)/r>allowed:raise ValueError(f"Cairo scene {scene['id']} voice {len(a)/r:.1f}s exceeds {allowed:.1f}s")
    duration=120
    samples=np.zeros(duration*rate,dtype=np.float32)
    vtt=["WEBVTT",""]
    for s,a in zip(scenes,parts):
        begins=float(s["start"])+.46
        x=round(begins*rate);samples[x:x+len(a)]+=np.tanh(a*.82)
        lines=chunks(voiceplan[s["id"]])
        secs=len(a)/rate
        offset=0
        den=sum(len(t) for t in lines)
        for line in lines:
            start=begins+secs*(offset/den)
            offset+=len(line)
            stop=begins+secs*(offset/den)
            vtt.extend([f"{tick(start)} --> {tick(stop)}",line,""])
    wave=workspace/"cairo-narration.wav"
    sf.write(wave,samples,rate,subtype="PCM_16")
    return wave,"\n".join(vtt)+"\n"

def expected_release(slug):
    video=OUT/(slug+".mp4")
    manifest=OUT/(slug+"-build.json")
    return video,manifest

def is_ready(slug):
    video,manifest=expected_release(slug)
    caption=OUT/(slug+".vtt")
    if not all(p.is_file() for p in (video,manifest,caption)):return False
    info=json.loads(manifest.read_text(encoding="utf8"))
    return info.get("edition")=="longform-v2-recut" and \
           info.get("signature")=="four-motion-chapters-2026-10-17" and \
           hashlib.sha256(video.read_bytes()).hexdigest()==info.get("sha256")

def remaster(slug,plan,models):
    original=SOURCE/(slug+".mp4")
    if not original.is_file():raise FileNotFoundError(original)
    manuscript=json.loads((SOURCE/NAMES[slug]).read_text(encoding="utf8"))
    scenes=manuscript["scenes"];byid={s["id"]:s for s in scenes}
    timing=timeline(slug,scenes)
    length=int(manuscript["running_seconds"])
    output,metadata=expected_release(slug)
    with tempfile.TemporaryDirectory(prefix="ruwaidix-feature-"+slug+"-") as tmp:
        work=Path(tmp)
        motor=load("ruwaidix_film_motion",ROOT/"scripts"/"film-overhaul-motion.py")
        clips=[];starts=[];credits=[]
        for i,(sceneid,shot) in enumerate(plan["scene_motions"].items()):
            scene=byid[sceneid]
            start,dur=timing[sceneid]
            start=max(0,start+.10)
            seconds=min(dur-.65,length-start-.4)
            if seconds<5:raise ValueError(f"Unsafe visual edit length {slug}:{sceneid}")
            source=scene.get("image")
            is_archival=bool(source) and not source.startswith("http")
            local=ROOT/source if is_archival else None
            if local is not None and local.is_file() and local.suffix.lower() in (".png",".jpg",".jpeg",".webp"):
                picture=local
                classification="unchanged registered original source photograph or publication figure"
            else:
                picture=image_at(original,start+0.5,work/f"source-frame-{sceneid}.jpg")
                classification="unaltered extracted original film frame, not new scientific data"
            over=work/f"overlay-{sceneid}.png"
            overlay_for(scene,slug,over)
            target=work/f"motion-{sceneid}.mp4"
            motor.animate_scene({"id":sceneid,"_remake":shot},picture,over,seconds,target)
            clips.append(target);starts.append(start)
            credits.append({"scene":sceneid,"start_seconds":round(start,3),"duration_seconds":round(seconds,3),
                            "source_type":classification,"source_path":source if local and local.is_file() else slug+".mp4",
                            "motion":shot["motif"],"evidence":"Explicitly illustrated, not experimental measurement"})
        ffmpeg=["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(original)]
        for clip in clips:ffmpeg+=["-i",str(clip)]
        voice=None;subtitle=(SOURCE/(slug+".vtt")).read_text(encoding="utf8")
        if slug=="cairo-microscope":
            voice,subtitle=cairo_voice(scenes,plan,work,models)
            ffmpeg+=["-i",str(voice)]
        pipes=[];prev="[0:v]"
        for n,start in enumerate(starts,1):
            tag=f"[shift{n}]"
            out=f"[stage{n}]"
            pipes.append(f"[{n}:v]setpts=PTS-STARTPTS+{start:.6f}/TB,format=yuv420p{tag}")
            pipes.append(f"{prev}{tag}overlay=eof_action=pass:repeatlast=0:shortest=0{out}")
            prev=out
        pipes.append(f"{prev}fps=24,format=yuv420p[v]")
        if voice:
            voice_idx=len(clips)+1
            pipes.append("[0:a:0]volume=0.30[bed]")
            pipes.append(f"[{voice_idx}:a:0]volume=1.18[speech]")
            pipes.append("[bed][speech]amix=inputs=2:duration=first:dropout_transition=0,loudnorm=I=-18:TP=-2:LRA=11[a]")
        ffmpeg+=["-filter_complex",";".join(pipes),"-map","[v]"]
        ffmpeg+=["-map","[a]","-c:a","aac","-b:a","160k"] if voice else ["-map","0:a:0","-c:a","copy"]
        ffmpeg+=["-c:v","libx264","-preset","veryfast","-crf","22","-pix_fmt","yuv420p",
                 "-t",str(length),"-movflags","+faststart",str(output)]
        run(ffmpeg)
        desc=json.loads(run(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(output)]))
        duration=float(desc["format"]["duration"])
        if abs(duration-length)>.25:raise ValueError("Length mismatch "+slug+" "+str(duration))
        if output.stat().st_size>95_000_000:raise ValueError("Movie exceeds GitHub allowed file size")
        (OUT/(slug+".vtt")).write_text(subtitle,encoding="utf8")
        record={"title":manuscript["title"],"edition":"longform-v2-recut",
                "signature":"four-motion-chapters-2026-10-17",
                "seconds":duration,"sha256":hashlib.sha256(output.read_bytes()).hexdigest(),
                "original_mp4":str(original.relative_to(ROOT)),
                "source_manifest":str((SOURCE/NAMES[slug]).relative_to(ROOT)),
                "source_credits":credits,"human_screening":"NOT YET COMPLETED",
                "narration":("Original first-edition synthetic audio preserved" if not voice else
                             "New nine-scene Kokoro British-English synthetic narration mixed with original instrumental score"),
                "scientific_policy":plan["strict"],
                "tools":["Pillow 13","FFmpeg H264","Kokoro ONNX" if voice else "original AAC"]}
        metadata.write_text(json.dumps(record,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
        print("READY FEATURE",slug,duration,output.stat().st_size,"bytes",flush=True)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--validate-only",action="store_true")
    p.add_argument("--remaining-count",action="store_true")
    p.add_argument("--missing-only",action="store_true")
    p.add_argument("--limit",type=int,default=1)
    p.add_argument("--only")
    p.add_argument("--models",default="film-models")
    args=p.parse_args()
    plan=json.loads(DIRECTION.read_text(encoding="utf8"))["films"]
    if set(NAMES)-set(plan):raise ValueError("All five narrative features must have authored plans")
    selected=list(NAMES)
    if args.only:
        if args.only not in selected:raise ValueError(args.only)
        selected=[args.only]
    for slug in selected:
        info=plan[slug]
        scenes=json.loads((SOURCE/NAMES[slug]).read_text(encoding="utf8"))["scenes"]
        timing=timeline(slug,scenes)
        if len(info.get("scene_motions",{}))!=4:raise ValueError("Four source-led motion chapters required: "+slug)
        if set(info["scene_motions"])-set(timing):raise ValueError("Missing authored chapter in "+slug)
        if not (SOURCE/(slug+".mp4")).is_file():raise FileNotFoundError(slug)
        for v in info["scene_motions"].values():
            if len(v.get("annotations",[]))!=3:raise ValueError("Missing science illustration notes in "+slug)
        if slug=="cairo-microscope" and len(info.get("narration_v2",{}))!=9:
            raise ValueError("Microscope must have fully authored first-person scene narration")
    if args.validate_only:
        print("Verified exactly five narrative longform films and their authored source-aware recuts.")
        return
    OUT.mkdir(exist_ok=True,parents=True)
    if args.missing_only or args.remaining_count:selected=[x for x in selected if not is_ready(x)]
    if args.remaining_count:
        print(len(selected));return
    if args.limit<1:raise ValueError("Limit must be positive")
    for slug in selected[:args.limit]:
        remaster(slug,plan[slug],(ROOT/args.models).resolve())

if __name__=="__main__":
    main()
