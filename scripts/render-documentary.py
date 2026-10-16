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
SCIENTIFIC_SAFE_AREA = (68, 140, 1212, 495)  # figures & movies: keep axes and specimen unobscured

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

def scientific_image_frame(path):
    """Preserve the entire figure, its axes, labels and scientific scale bars."""
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
    bg = Image.new("RGB", (W, H), (17, 40, 46))
    x0, y0, x1, y1 = SCIENTIFIC_SAFE_AREA
    margin = 10
    image.thumbnail((x1 - x0 - 2*margin, y1 - y0 - 2*margin), Image.Resampling.LANCZOS)
    x, y = (W - image.width)//2, y0 + (y1 - y0 - image.height)//2
    bg.paste(image, (x, y))
    d = ImageDraw.Draw(bg)
    d.rectangle((x0, y0, x1, y1), outline=(86, 116, 112), width=2)
    return bg

def fit_image(path, contain):
    if contain:
        return scientific_image_frame(path)
    with Image.open(path) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
    # In portrait archive footage the full photograph is more important than the crop.
    if image.height > image.width * 1.2:
        matte = ImageOps.fit(image, (W,H), Image.Resampling.LANCZOS)
        matte = matte.filter(ImageFilter.GaussianBlur(40))
        matte = Image.blend(matte, Image.new("RGB",(W,H),DARK), .38)
        main=image.copy()
        main.thumbnail((W-135,H-40), Image.Resampling.LANCZOS)
        matte.paste(main, ((W-main.width)//2,(H-main.height)//2))
        return matte
    return ImageOps.fit(image, (W,H), method=Image.Resampling.LANCZOS, centering=(.5,.47))

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

def make_frame(item, image_path, workspace):
    """Export the image and its separate title layer: typography never zooms."""
    bg = fit_image(image_path, bool(item.get("contain")))
    path = workspace / ("frame-" + item["id"] + ".png")
    bg.save(path, optimize=True)
    over = workspace / ("overlay-" + item["id"] + ".png")
    overlay(item).save(over)
    return path, over

def make_motion_montage(video_paths, duration, workspace, scene_id):
    """A sequence of real footage, not AI interpolation or generic stock B-roll."""
    if len(video_paths) < 2:
        raise ValueError("Montage needs at least two original recordings")
    part = duration / len(video_paths)
    inputs = []
    chains = []
    for i, video in enumerate(video_paths):
        inputs.extend(["-stream_loop", "-1", "-i", str(video)])
        chains.append(
            f"[{i}:v]fps={FPS},trim=duration={part:.4f},setpts=PTS-STARTPTS,"
            "scale=1280:720:force_original_aspect_ratio=decrease,"
            "pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x10272e,setsar=1"
            f"[v{i}]"
        )
    chains.append("".join(f"[v{i}]" for i in range(len(video_paths)))
                  + f"concat=n={len(video_paths)}:v=1:a=0[out]")
    output = workspace / ("montage-" + scene_id + ".mp4")
    command(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y"] + inputs + [
        "-filter_complex", ";".join(chains), "-map", "[out]", "-an", "-r", str(FPS),
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
        "-pix_fmt", "yuv420p", "-t", str(duration), str(output)
    ])
    return output

def make_clip(item, image, video, frame, over, duration, out):
    frames = int(round(duration*FPS))
    common = ["-r", str(FPS), "-frames:v", str(frames), "-an",
              "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
              "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out)]
    if video:
        # No zoom/crop of original animal microscopy; padded scientific window.
        # Place recording below the masthead, above the permanent title band.
        command(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                 "-stream_loop", "-1", "-i", str(video),
                 "-loop", "1", "-framerate", str(FPS), "-i", str(over),
                 "-filter_complex",
                 "[0:v]fps=24,scale=1240:375:force_original_aspect_ratio=decrease,"
                 "pad=1280:395:(ow-iw)/2:(oh-ih)/2:color=0x10272e,"
                 "pad=1280:720:0:118:color=0x10272e,setsar=1[bg];"
                 "[bg][1:v]overlay=shortest=1,format=yuv420p[v]",
                 "-map", "[v]"] + common)
        return "motion footage"
    if item.get("contain"):
        motion = "[0:v]scale=1280:720,format=yuv420p[bg];"
    else:
        # Motion is applied to the photograph alone, not to research captions.
        motion = ("[0:v]zoompan=z='min(zoom+0.000075,1.018)':"
                  "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
                  "d=1:s=1280x720:fps=24,format=yuv420p[bg];")
    command(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
             "-loop", "1", "-framerate", str(FPS), "-i", str(frame),
             "-loop", "1", "-framerate", str(FPS), "-i", str(over),
             "-filter_complex", motion + "[bg][1:v]overlay=shortest=1,format=yuv420p[v]",
             "-map", "[v]"] + common)
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

def film_score(t, voice_envelope):
    """Original, understated four-movement score. No external music samples."""
    # The harmonic progression follows the film's four chapters, rather than
    # imposing a commercial motivational-music beat on experimental evidence.
    harmonies = [
        (110.00, 130.81, 164.81),   # A minor / early curiosity
        (98.00, 146.83, 174.61),    # G / molecular matter
        (87.31, 130.81, 196.00),    # F / experiments that resisted
        (110.00, 164.81, 220.00),   # A / living systems and continuing work
    ]
    score = np.zeros_like(t, dtype=np.float32)
    for i, (root, third, fifth) in enumerate(harmonies):
        start = TOTAL_SECONDS * i / len(harmonies)
        end = TOTAL_SECONDS * (i+1) / len(harmonies)
        fade_in = np.clip((t-start)/3.0,0,1)
        fade_out = np.clip((end-t)/3.0,0,1)
        shape = fade_in * fade_out
        pad = (
            .58*np.sin(2*np.pi*root*t) +
            .25*np.sin(2*np.pi*third*t+.6) +
            .19*np.sin(2*np.pi*fifth*t+1.2) +
            .06*np.sin(2*np.pi*(root*2.002)*t)
        )
        score += np.asarray(shape*pad, dtype=np.float32)
    film_fade = np.minimum(1,t/3) * np.minimum(1,(TOTAL_SECONDS-t)/5)
    ducking = 1 - .58*np.clip(voice_envelope,0,1)
    return score * np.asarray(.019*film_fade*ducking,dtype=np.float32)

def soundtrack(speech, sr, frames, workspace):
    sample_count = int(round(TOTAL_SECONDS*sr))
    arr = np.zeros(sample_count,dtype=np.float32)
    voice_envelope = np.zeros(sample_count,dtype=np.float32)
    cursor = 0
    for samples, count in zip(speech,frames):
        start = cursor+int(.52*sr)
        end = min(start+len(samples),sample_count)
        if end <= start:
            raise ValueError("Narration timeline overflow")
        # Equalize natural variation in synthesizer volume without clipping.
        rms = float(np.sqrt(np.mean(samples**2)+1e-9))
        gain = min(2.0, .087/max(.0001,rms))
        spoken = np.tanh(samples[:end-start]*gain).astype(np.float32)
        arr[start:end] += spoken
        attack = max(0,start-int(.18*sr))
        release = min(sample_count,end+int(.37*sr))
        voice_envelope[attack:release] = 1.0
        cursor += round(count/FPS*sr)
    t = np.arange(sample_count,dtype=np.float32)/sr
    arr += film_score(t,voice_envelope)
    peak = float(np.max(np.abs(arr)))
    if peak > .89:
        arr *= .89/peak
    output = workspace/"soundtrack.wav"
    sf.write(str(output),arr,sr,subtype="PCM_16")
    return output

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
        videos = scene.get("videos", [])
        if videos:
            if len(videos) < 2 or len(set(videos)) != len(videos):
                raise AssertionError("Required motion montage uses distinct original recordings")
            if not scene.get("required_video", False):
                raise AssertionError("Original microscopy montage must be required, not silently replaced")
            for video in videos:
                if not video.startswith("https://"):
                    local = (ROOT/video).resolve()
                    if not local.is_relative_to(ROOT) or not local.is_file():
                        raise FileNotFoundError(video)
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
            if item.get("videos"):
                shots = []
                for n, url in enumerate(item["videos"]):
                    shot = source_path({"id":item["id"]+"-"+str(n),"video":url}, "video", workspace)
                    if not shot:
                        raise RuntimeError("Required original microscopy shot unavailable: "+url)
                    shots.append(shot)
                motion = make_motion_montage(shots, duration, workspace, item["id"])
            else:
                motion = source_path(item, "video", workspace)
                if item.get("required_video") and not motion:
                    raise RuntimeError("Required archival video unavailable for "+item["id"])
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
            "-map","0:v:0","-map","1:a:0","-c:v","copy","-af","loudnorm=I=-18:TP=-2:LRA=11","-c:a","aac","-b:a","160k",
            "-t",str(TOTAL_SECONDS),"-movflags","+faststart",str(output)])
        p=json.loads(command(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(output)]))
        duration=float(p["format"]["duration"])
        if abs(duration-TOTAL_SECONDS)>.15: raise RuntimeError("Failed the exact two-minute duration check")
        if output.stat().st_size>90000000: raise RuntimeError("Output too large for GitHub")
        digest=hashlib.sha256(output.read_bytes()).hexdigest()
        (FILM/"what-survives-build.json").write_text(json.dumps({
            "title":storyboard["title"],"seconds":duration,"video_sha256":digest,
            "clip_sources":footage,"motion_shots":len([s for s in items if s.get("video")])+sum(len(s.get("videos",[])) for s in items),"sound_design":"original four-movement harmonic score; speech-ducked; normalized to -18 LUFS target", "audio_engine":"kokoro-onnx bm_george; original synthesised score",
            "script_source":"assets/films/what-survives-scenes.json",
            "provenance":"Linked original media; no synthetic scientific evidence"},indent=2)+"\n")
        print("SUCCESS:",output,"seconds",duration,"size",output.stat().st_size)

if __name__=="__main__":
    main()
