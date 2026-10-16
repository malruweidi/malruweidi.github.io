#!/usr/bin/env python3
"""Reproducible Ruwaidix documentary: authentic archive + Kokoro ONNX + FFmpeg.
No synthetic person, no stock scientific performance, no paid TTS dependency.
Usage: python scripts/render-documentary.py [--validate-only]
"""
import argparse
import hashlib
import json
import math
import shutil
import subprocess
import tempfile
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
FILM = ROOT / "assets" / "films"
SCENES = FILM / "what-survives-scenes.json"
W, H, FPS, TOTAL_SECONDS = 1280, 720, 24, 120
FONT_ROOT = Path("/usr/share/fonts/truetype/dejavu")
FONT_BOLD = FONT_ROOT / "DejaVuSans-Bold.ttf"
FONT_NORMAL = FONT_ROOT / "DejaVuSans.ttf"
DARK = (14, 34, 40)
WARM = (245, 242, 233)

def command(args):
    result = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode:
        raise RuntimeError("Command failed: " + " ".join(map(str,args)) + "\n" + result.stderr[-2500:])
    return result.stdout

def source_path(item, key, workspace):
    value = item.get(key)
    if not value:
        return None
    if value.startswith("https://"):
        suffix = "." + value.split("?")[0].rsplit(".", 1)[-1]
        target = workspace / ("download-" + item["id"] + "-" + key + suffix)
        try:
            req = urllib.request.Request(value, headers={"User-Agent":"Ruwaidix-documentary/1.0"})
            with urllib.request.urlopen(req, timeout=35) as resp, target.open("wb") as out:
                shutil.copyfileobj(resp, out)
            if target.stat().st_size < 200:
                raise RuntimeError("empty remote media")
            return target
        except Exception as err:
            print("Optional remote media unavailable:", value, str(err))
            return None
    local = (ROOT / value).resolve()
    if not local.is_relative_to(ROOT) or not local.is_file():
        raise FileNotFoundError(value)
    return local

def font(size, bold=False):
    path = FONT_BOLD if bold else FONT_NORMAL
    return ImageFont.truetype(str(path), size)

def lines_to_fit(text, draw, ft, max_width):
    words, result, current = text.split(), [], ""
    for word in words:
        proposed = (current + " " + word).strip()
        if draw.textbbox((0,0), proposed, font=ft)[2] > max_width and current:
            result.append(current)
            current = word
        else:
            current = proposed
    if current: result.append(current)
    return result

def fit_image(path, contain):
    with Image.open(path) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
    bg = ImageOps.fit(image, (W, H), method=Image.Resampling.LANCZOS)
    bg = bg.filter(ImageFilter.GaussianBlur(35))
    bg = Image.blend(bg, Image.new("RGB",(W,H),DARK), 0.38)
    if contain:
        main = image.copy()
        main.thumbnail((W-115,H-110), Image.Resampling.LANCZOS)
        bg.paste(main, ((W-main.width)//2,(H-main.height)//2))
    else:
        bg = ImageOps.fit(image, (W,H), method=Image.Resampling.LANCZOS, centering=(.5,.45))
    return bg

def overlay(item):
    layer = Image.new("RGBA",(W,H),(0,0,0,0))
    pixels = Image.new("RGBA",(W,H),(0,0,0,0))
    # Translucent gradient preserves original images and makes labels legible.
    g = ImageDraw.Draw(pixels)
    for y in range(H):
        strength = int(204 * max(0, (y-220)/(H-220))**1.4)
        g.line([(0,y),(W,y)],fill=(DARK[0],DARK[1],DARK[2],strength))
    layer = Image.alpha_composite(layer,pixels)
    d = ImageDraw.Draw(layer)
    d.rectangle((62,50,113,54),fill=(196,129,99,255))
    d.text((62,71), "RUWAIDIX / A RESEARCH FILM", font=font(18,True), fill=WARM)
    d.text((62,104),item["subtitle"].upper(),font=font(16),fill=(213,224,214))
    d.text((62,490),item["id"]+" / 12",font=font(19),fill=(232,177,142))
    title_font=font(48,True)
    title_lines=lines_to_fit(item["title"],d,title_font,1115)
    for i,line in enumerate(title_lines[:2]):
        d.text((62,522+i*59),line,font=title_font,fill=WARM,stroke_width=1,stroke_fill=(20,40,42))
    d.text((62,678),item["kind"].upper(),font=font(14),fill=(214,226,219))
    return layer

def make_frame(item,image_path,workspace):
    bg = fit_image(image_path, bool(item.get("contain")))
    composite=Image.alpha_composite(bg.convert("RGBA"),overlay(item))
    path=workspace/("frame-"+item["id"]+".png")
    composite.convert("RGB").save(path, optimize=True)
    layer=workspace/("overlay-"+item["id"]+".png")
    overlay(item).save(layer)
    return path,layer

def make_clip(item, image, video, frame, over, duration, out):
    frames=int(round(duration*FPS))
    vf="zoompan=z='min(zoom+0.00016,1.042)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1280x720:fps=24,format=yuv420p"
    common=["-r",str(FPS),"-frames:v",str(frames),"-an","-c:v","libx264","-preset","veryfast","-crf","23","-pix_fmt","yuv420p","-movflags","+faststart",str(out)]
    if video:
        try:
            command(["ffmpeg","-hide_banner","-loglevel","error","-y","-stream_loop","-1","-i",str(video),"-loop","1","-framerate",str(FPS),"-i",str(over),"-filter_complex",
            "[0:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,eq=brightness=-0.035:saturation=0.86[bg];[bg][1:v]overlay=shortest=1,format=yuv420p[v]",
            "-map","[v]"]+common)
            return "motion footage"
        except Exception as err:
            print("Video decode failed; keeping genuine still:",str(err))
    command(["ffmpeg","-hide_banner","-loglevel","error","-y","-loop","1","-framerate",str(FPS),"-i",str(frame),"-vf",vf]+common)
    return "archival still"

def vtt_time(seconds):
    ms=round(seconds*1000)
    return f"{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d}.{ms%1000:03d}"

def write_vtt(items, starts, lengths):
    cues=["WEBVTT", ""]
    for item, start, length in zip(items,starts,lengths):
        words=item["narration"].split()
        cut=len(words)//2
        for k,phrase in enumerate((" ".join(words[:cut])," ".join(words[cut:]))):
            begin=start+0.55+(length*.49*k)
            end=min(start+0.55+(length*.49*(k+1)),start+length+0.6)
            cues.extend([f"{vtt_time(begin)} --> {vtt_time(end)}",phrase,""])
    (FILM/"what-survives-the-experiment.vtt").write_text("\n".join(cues),encoding="utf-8")

def synthesize(items, workspace):
    from kokoro_onnx import Kokoro
    model=workspace/"kokoro-v1.0.fp16.onnx"
    voices=workspace/"voices-v1.0.bin"
    if not model.exists() or not voices.exists():
        raise RuntimeError("Missing Kokoro models; use model-files-v1.1 in the workflow")
    tts=Kokoro(str(model),str(voices))
    speech=[]
    sample_rate=None
    for scene in items:
        samples, sr=tts.create(scene["narration"],voice="bm_george",speed=1.06,lang="en-gb")
        samples=np.asarray(samples,dtype=np.float32).flatten()
        if not np.all(np.isfinite(samples)):
            raise ValueError("Non-finite audio in scene "+scene["id"])
        if sample_rate and sr!=sample_rate:
            raise ValueError("Sample rate mismatch")
        sample_rate=sr
        speech.append(samples)
        sf.write(str(workspace/("narration-"+scene["id"]+".wav")),samples,sr)
        print("Scene",scene["id"],"voice seconds:",round(len(samples)/sr,2))
    return speech,sample_rate

def allocate(speech,sr):
    minframes=[math.ceil((len(x)/sr+.95)*FPS) for x in speech]
    total=TOTAL_SECONDS*FPS
    if sum(minframes)>total:
        raise ValueError(f"Narration exceeds 120 seconds with breathing gaps: {sum(minframes)/FPS:.1f}s. Edit the narration; do not truncate or time-stretch the voice.")
    extra=total-sum(minframes)
    # Long scientific scenes need more breathing room, not identical ten-second slots.
    weights=[len(x) for x in speech]
    additions=[int(extra*w/sum(weights)) for w in weights]
    for i in range(extra-sum(additions)):
        additions[i%len(additions)]+=1
    frames=[a+b for a,b in zip(minframes,additions)]
    assert sum(frames)==total
    return frames

def soundtrack(speech,sr,frames,workspace):
    samples_total=int(round(TOTAL_SECONDS*sr))
    arr=np.zeros(samples_total,dtype=np.float32)
    cursor=0
    for samples,count in zip(speech,frames):
        start=cursor+int(.52*sr)
        end=min(start+len(samples),samples_total)
        arr[start:end]+=samples[:end-start]
        cursor+=round(count/FPS*sr)
    # Self-generated unobtrusive room-tone bed; no external music licensing.
    t=np.arange(samples_total,dtype=np.float32)/sr
    swell=np.minimum(1,t/3)*np.minimum(1,(TOTAL_SECONDS-t)/4)
    bed=(np.sin(2*np.pi*110*t)*.0018+np.sin(2*np.pi*164.81*t)*.0015+np.sin(2*np.pi*220*t)*.0009)*swell
    arr+=bed.astype(np.float32)
    peak=np.max(np.abs(arr))
    if peak>.92: arr=arr*(.92/peak)
    path=workspace/"soundtrack.wav"
    sf.write(str(path),arr,sr,subtype="PCM_16")
    return path

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    parser.add_argument("--workspace",help="Directory containing Kokoro model files (downloaded by CI)")
    args=parser.parse_args()
    storyboard=json.loads(SCENES.read_text(encoding="utf-8"))
    items=storyboard["scenes"]
    if len(items)!=12 or storyboard["running_seconds"]!=TOTAL_SECONDS:
        raise AssertionError("Film is exactly twelve research scenes and 120 seconds")
    for i,scene in enumerate(items,1):
        if scene["id"]!=f"{i:02d}" or not scene.get("credit") or not scene.get("link"):
            raise AssertionError("Unattributed, misordered or incomplete film scene")
        for k in ("image","fallback","video"):
            if scene.get(k) and not scene[k].startswith("https://"):
                p=(ROOT/scene[k]).resolve()
                if not p.is_relative_to(ROOT) or not p.is_file():
                    raise FileNotFoundError(str(p))
    if args.validate_only:
        print("12 scenes validated against source media; no synthetic figure data.")
        return
    with tempfile.TemporaryDirectory(prefix="ruwaidix-film-") as tmp:
        workspace=Path(tmp)
        model_root=Path(args.workspace).resolve() if args.workspace else ROOT/"film-models"
        for name in ("kokoro-v1.0.fp16.onnx","voices-v1.0.bin"):
            src=model_root/name
            if not src.is_file(): raise FileNotFoundError(str(src))
            (workspace/name).symlink_to(src)
        speech,sr=synthesize(items,workspace)
        frame_counts=allocate(speech,sr)
        starts=[]; position=0
        for count in frame_counts:
            starts.append(position/FPS);position+=count
        write_vtt(items,starts,[len(x)/sr for x in speech])
        durations=[count/FPS for count in frame_counts]
        clips=[]
        footage=[]
        for item,duration in zip(items,durations):
            pic=source_path(item,"image",workspace) or source_path(item,"fallback",workspace)
            if not pic: raise RuntimeError("No image for scene "+item["id"])
            motion=source_path(item,"video",workspace)
            frame,over=make_frame(item,pic,workspace)
            out=workspace/("scene-"+item["id"]+".mp4")
            medium=make_clip(item,pic,motion,frame,over,duration,out)
            footage.append(medium)
            clips.append(out)
            print("Rendered",item["id"],"duration",duration,medium)
        playlist=workspace/"clips.txt"
        playlist.write_text("".join("file '"+str(clip)+"'\n" for clip in clips),encoding="utf-8")
        video=workspace/"video.mp4"
        command(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(playlist),"-c","copy",str(video)])
        track=soundtrack(speech,sr,frame_counts,workspace)
        output=FILM/"what-survives-the-experiment.mp4"
        command(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(video),"-i",str(track),
            "-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-b:a","160k",
            "-t",str(TOTAL_SECONDS),"-movflags","+faststart",str(output)])
        p=json.loads(command(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(output)]))
        duration=float(p["format"]["duration"])
        if abs(duration-TOTAL_SECONDS)>.15: raise RuntimeError("Failed the exact two-minute duration check")
        if output.stat().st_size>90000000: raise RuntimeError("Output too large for GitHub")
        digest=hashlib.sha256(output.read_bytes()).hexdigest()
        (FILM/"what-survives-build.json").write_text(json.dumps({
            "title":storyboard["title"],"seconds":duration,"video_sha256":digest,
            "clip_sources":footage,"audio_engine":"kokoro-onnx bm_george; original generated ambient bed",
            "script_source":"assets/films/what-survives-scenes.json",
            "provenance":"Linked original media; no synthetic scientific evidence"},indent=2)+"\n")
        print("SUCCESS:",output,"seconds",duration,"size",output.stat().st_size)

if __name__=="__main__":
    main()
