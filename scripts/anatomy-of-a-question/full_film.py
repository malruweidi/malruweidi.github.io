#!/usr/bin/env python3
"""ANATOMY OF A QUESTION — full documentary, reproducible open-source master.

Only actual archival imagery, authentic footage, original score and explicitly
labelled conceptual animation are used. The third-person synthetic voice is a
CC0 Pocket TTS preset and is not Mahmoud's voice or a clone of it.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

HERE = Path(__file__).resolve().parent
W, H, FPS, SR = 1440, 600, 24, 48000
SCENES = json.loads((HERE / "full_shots.json").read_text(encoding="utf-8"))
assert sum(x["duration"] for x in SCENES) == 386


def run(argv: list[str]) -> None:
    subprocess.run(argv, check=True, stdout=subprocess.DEVNULL)


def fonts():
    serif = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
    sans = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    return serif, sans


def create_title(path: Path) -> None:
    im = Image.new("RGB", (W, H), "#080b0e")
    d = ImageDraw.Draw(im)
    serif, sans = fonts()
    titlefont = ImageFont.truetype(serif, 69)
    smallfont = ImageFont.truetype(sans, 20)
    for text, y in (("ANATOMY", 190), ("OF A QUESTION", 277)):
        b = d.textbbox((0, 0), text, font=titlefont)
        d.text(((W - (b[2] - b[0])) // 2, y), text, font=titlefont, fill="#e7e7e4")
    line = "MAHMOUD AL-RUWEIDI  ·  A RESEARCH DOCUMENTARY"
    b = d.textbbox((0, 0), line, font=smallfont)
    d.text(((W - (b[2] - b[0])) // 2, 435), line, font=smallfont, fill="#9ea8a9")
    im.save(path)


def create_black(path: Path) -> None:
    # No fictitious clinical chart, monitor, or reenactment.
    im = Image.new("RGB", (W, H), "#090e11")
    im.save(path)


def photo_filter(scene: dict) -> str:
    mode = scene["mode"]
    fx, fy = scene.get("focus", [.5, .5])
    if mode in {"data", "source"}:
        # The complete original scientific figure or historical page remains
        # legible and unmodified. Surrounding pillarbox is not a 'slide'.
        return (f"scale={W}:{H}:force_original_aspect_ratio=decrease:flags=lanczos,"
                f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=0x080b0e,"
                f"fps={FPS},format=yuv420p")
    z = {"detail":1.32, "data_detail":1.18,
         "source_detail":1.15, "portrait_detail":1.17}.get(mode,1.015)
    z_delta = .045 if mode not in {"detail", "portrait_detail"} else .065
    if mode in {"archive", "detail"}:
        grade = "eq=contrast=1.10:saturation=0.48:brightness=-0.010"
    elif mode in {"data_detail", "source_detail"}:
        grade = "eq=contrast=1.06:saturation=0.88:brightness=-0.008"
    else:
        grade = "eq=contrast=1.07:saturation=0.82:brightness=-0.008"
    return ",".join([
        f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos",
        f"crop={W}:{H}:x='(in_w-out_w)*{fx:.4f}':y='(in_h-out_h)*{fy:.4f}'",
        (f"zoompan=z='min({z:.4f}+on*0.00022,{z+z_delta:.4f})'"
         f":x='(iw-iw/zoom)*{fx:.4f}':y='(ih-ih/zoom)*{fy:.4f}'"
         f":d=1:s={W}x{H}:fps={FPS}"),
        grade,
        "vignette=angle=PI/6:mode=forward",
        "noise=alls=2:allf=t+u",
        "format=yuv420p",
    ])


def archival_full_frame_filter(mode: str) -> str:
    """Preserve complete original portrait/archive, with a subdued moving matte.

    Wide crop was suppressing the teacher and student's faces in the 2009
    picture. A documentary needs to retain that original visual evidence.
    """
    saturation = "0.53" if mode == "archive" else "0.82"
    return (
        "split[back][record];"
        f"[back]scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
        f"crop={W}:{H},gblur=sigma=35,"
        "eq=brightness=-0.22:saturation=0.37[matte];"
        f"[record]scale=1360:552:force_original_aspect_ratio=decrease:flags=lanczos,"
        f"eq=contrast=1.045:saturation={saturation}[original];"
        "[matte][original]overlay=(W-w)/2:(H-h)/2,"
        f"fps={FPS},format=yuv420p"
    )


def footage_filter() -> str:
    # Genuine footage remains fully visible with its native aspect ratio.
    # The blurred moving background derives from the same source recording.
    return (
        f"split[bg][fg];"
        f"[bg]scale={W}:{H}:force_original_aspect_ratio=increase,"
        f"crop={W}:{H},boxblur=luma_radius=25:luma_power=2:chroma_radius=12:chroma_power=2,"
        f"eq=brightness=-0.19:saturation=0.38[soft];"
        f"[fg]scale={W}:{H}:force_original_aspect_ratio=decrease:flags=lanczos[real];"
        f"[soft][real]overlay=(W-w)/2:(H-h)/2,"
        f"fps={FPS},format=yuv420p"
    )


def create_concept_video(out: Path, seconds: int) -> None:
    """Original mechanics illustration: moving air–liquid interface, not data."""
    serif, sans = fonts()
    cap = ImageFont.truetype(sans, 17)
    # Feed raw frames into FFmpeg to avoid thousands of intermediate PNG files.
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
           "-f", "rawvideo", "-vcodec", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-an",
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "24",
           "-pix_fmt", "yuv420p", "-r", str(FPS), str(out)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    assert proc.stdin is not None
    n = seconds * FPS
    try:
        for k in range(n):
            t = k / max(1, n-1)
            ease = t*t*(3-2*t)
            im = Image.new("RGB", (W, H), "#0b1317")
            d = ImageDraw.Draw(im)
            # Different fluid regions are interpretive schematic, not microscopy.
            front = int(250 + 900*ease)
            d.rectangle((front, 180, W, 474), fill="#12414b")
            d.ellipse((front-73, 180, front+72, 474), fill="#12414b")
            d.line([(100,474),(W-100,474)],fill="#a8afb0",width=4)
            for x in range(105, W-115, 69):
                d.rounded_rectangle((x,478,x+62,545),radius=11,fill="#304a55",outline="#6f9397",width=2)
                d.ellipse((x+22,499,x+40,517),fill="#a6897c")
            # A faint interface halo describes where shear is concentrated.
            for q in range(4):
                alpha = 90 - q*16
                col = (min(255,alpha+100),int(alpha*.7)+70,80)
                d.arc((front-76-q*7,178-q*5,front+71+q*7,475+q*5),90,270,fill=col,width=2)
            d.text((75,48),"CONCEPTUAL MODEL  ·  NOT EXPERIMENTAL FOOTAGE",font=cap,fill="#9aa9a8")
            d.text((132,246),"AIR",font=cap,fill="#c4d4d0")
            d.text((W-180,246),"LIQUID",font=cap,fill="#c4d4d0")
            proc.stdin.write(im.tobytes())
        proc.stdin.close()
        stderr = proc.stderr.read() if proc.stderr else b""
        rc = proc.wait()
        if rc: raise RuntimeError(stderr.decode(errors="replace")[-1000:])
    except Exception:
        proc.kill()
        raise


def render_shots(assets: Path, outdir: Path, force: bool, refresh_archive: bool=False) -> Path:
    segdir = outdir / "segments"
    segdir.mkdir(parents=True, exist_ok=True)
    create_title(segdir / "title.png")
    create_black(segdir / "black.png")
    files = []
    for i, shot in enumerate(SCENES):
        path = segdir / f"{i:02d}_{shot['id']}.mp4"
        files.append(path)
        if (not force and not (refresh_archive and shot["mode"] in {"archive", "portrait"})
                and path.exists() and path.stat().st_size > 3000):
            print("Picture cached", shot["id"], flush=True)
            continue
        mode = shot["mode"]
        d = shot["duration"]
        if mode == "concept_airway":
            create_concept_video(path, d)
            print("Picture rendered", shot["id"], flush=True)
            continue
        if mode in {"title", "illness_black"}:
            img = segdir / ("title.png" if mode == "title" else "black.png")
            filter_ = "format=yuv420p"
            if mode == "title": filter_ = "fade=t=in:st=0:d=1.4,format=yuv420p"
            cmd = ["ffmpeg","-hide_banner","-loglevel","error","-y","-loop","1",
                   "-framerate",str(FPS),"-t",str(d),"-i",str(img),"-vf",filter_]
        elif mode == "footage":
            video = assets / shot["asset"]
            cmd = ["ffmpeg","-hide_banner","-loglevel","error","-y",
                   "-stream_loop","-1","-i",str(video),"-t",str(d),
                   "-filter_complex",footage_filter()]
        elif mode in {"archive", "portrait"}:
            still = assets / shot["asset"]
            cmd = ["ffmpeg","-hide_banner","-loglevel","error","-y","-loop","1",
                   "-framerate",str(FPS),"-t",str(d),"-i",str(still),
                   "-filter_complex",archival_full_frame_filter(mode)]
        else:
            still = assets / shot["asset"]
            cmd = ["ffmpeg","-hide_banner","-loglevel","error","-y","-loop","1",
                   "-framerate",str(FPS),"-t",str(d),"-i",str(still),"-vf",photo_filter(shot)]
        cmd += ["-an","-c:v","libx264","-preset","veryfast","-crf","25",
                "-pix_fmt","yuv420p","-r",str(FPS),str(path)]
        run(cmd)
        print("Picture rendered",shot["id"],flush=True)
    concatfile = segdir / "concat.txt"
    concatfile.write_text("".join(f"file '{x.absolute()}'\n" for x in files),encoding="utf-8")
    picture = outdir / "picture_master.mp4"
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0",
         "-i",str(concatfile),"-c","copy",str(picture)])
    return picture


def compose_score(out: Path) -> Path:
    duration = sum(s["duration"] for s in SCENES)
    n = duration*SR
    rng = np.random.default_rng(2009)
    scores = np.zeros(n,dtype=np.float32)
    # An original, unhurried harmonic field, with a new harmony for each act.
    chapters = [(0,65,[55,82.41,110]),(65,155,[58.27,87.31,116.54]),
                (155,229,[49,73.42,98]),(229,274,[46.25,69.3,92.5]),
                (274,333,[55,82.41,110]),(333,386,[61.74,92.5,123.47])]
    for start,end,tones in chapters:
        block=4*SR
        for pos in range(start*SR,end*SR,block):
            stop=min(end*SR,pos+block)
            sec=np.arange(pos,stop,dtype=np.float64)/SR
            env=(.64+.36*np.sin((sec-start)/(end-start)*math.pi)**2)
            wave_=sum((.65/(j+1))*np.sin(2*math.pi*f*sec+0.2*np.sin(sec*.15+j))
                      for j,f in enumerate(tones))
            scores[pos:stop]=(.018*env*wave_).astype(np.float32)
    # Quiet room-tone; a breath of real-world air, not a heroic trailer score.
    for pos in range(0,n,4*SR):
        stop=min(n,pos+4*SR)
        noise=rng.standard_normal(stop-pos).astype(np.float32)
        noise=sosfilt(butter(2,[70,450],fs=SR,btype="bandpass",output="sos"),noise)
        scores[pos:stop]+=noise*.010
    # The ongoing-illness passage deliberately withdraws the music.
    t=np.arange(n,dtype=np.float32)/SR
    illness=((t>=239)&(t<274))
    scores[illness]*=.15
    scores*=np.minimum(1,t/3)*np.minimum(1,(duration-t)/6)
    stereo=np.stack([scores*.94,scores],axis=-1)
    wav=out/"original_score.wav"
    wavfile.write(wav,SR,stereo)
    return wav


def synth_narration(out: Path,force: bool) -> Path:
    master=out/"narration.wav"
    if master.exists() and master.stat().st_size>1000 and not force:
        print("Narration cached",flush=True)
        return master
    from pocket_tts import TTSModel
    model=TTSModel.load_model()
    state=model.get_state_for_audio_prompt("marius") # CC0 donated preset; no cloning.
    total=sum(s["duration"] for s in SCENES)
    voice=np.zeros(total*SR,dtype=np.float32)
    clips=out/"voice_clips"
    clips.mkdir(parents=True,exist_ok=True)
    position=0
    for s in SCENES:
        if not s["voice"]:
            position+=s["duration"]
            continue
        rawfile=clips/(s["id"]+"_raw.wav")
        if rawfile.exists() and rawfile.stat().st_size>1000 and not force:
            rate,a=wavfile.read(rawfile)
            source_dtype=a.dtype
            a=a.astype(np.float32)
            if source_dtype==np.int16: a/=32768
        else:
            a=model.generate_audio(state,s["voice"]).detach().cpu().numpy().astype(np.float32)
            rate=model.sample_rate
            wavfile.write(rawfile,rate,a)
        duration=len(a)/rate
        allowed=s["duration"]-s["lead"]-.18
        atempo=min(1.28,max(.83,duration/allowed))
        stretched=clips/(s["id"]+"_stretch.wav")
        run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(rawfile),
             "-af",f"atempo={atempo:.4f},aresample={SR}",str(stretched)])
        rr,signal=wavfile.read(stretched)
        sigtype=signal.dtype
        signal=signal.astype(np.float32)
        if sigtype==np.int16:signal/=32768
        if signal.ndim>1:signal=signal.mean(axis=1)
        rms=float(np.sqrt(np.mean(signal**2)+1e-10))
        signal*=min(4.0,.087/rms)
        fade=min(int(.035*SR),len(signal)//3)
        signal[:fade]*=np.linspace(0,1,fade)
        signal[-fade:]*=np.linspace(1,0,fade)
        begin=int((position+s["lead"])*SR)
        end=min(begin+len(signal),len(voice))
        voice[begin:end]+=signal[:end-begin]
        print("Narration",s["id"],f"{duration:.2f}s -> {len(signal)/SR:.2f}s",flush=True)
        position+=s["duration"]
    wavfile.write(master,SR,voice)
    return master


def combine_audio(out:Path,force:bool) -> Path:
    mixed=out/"soundtrack.wav"
    if mixed.exists() and mixed.stat().st_size>1000 and not force:
        return mixed
    voice=synth_narration(out,force)
    score=compose_score(out)
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(voice),
         "-i",str(score),"-filter_complex",
         "[0:a]volume=1.0[v];[1:a]volume=0.55[m];[v][m]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-18:TP=-2:LRA=10[out]",
         "-map","[out]","-ar",str(SR),str(mixed)])
    return mixed


def timestamp(t:float)->str:
    h=int(t//3600);m=int(t%3600//60);s=t%60
    return f"{h:02d}:{m:02d}:{s:06.3f}"


def export_docs(assets:Path,out:Path)->None:
    t=0; captions=["WEBVTT\n"]; manifest=[]
    for s in SCENES:
        start=t+s["lead"];end=t+s["duration"]-.15
        if s["voice"]:captions.append(f"{timestamp(start)} --> {timestamp(end)}\n{s['voice']}\n")
        asset=assets/s["asset"] if s["asset"] else None
        sha=hashlib.sha256(asset.read_bytes()).hexdigest() if asset and asset.exists() else None
        manifest.append({"in":t,"out":t+s["duration"],"shot":s["id"],
                         "asset":s["asset"],"sha256":sha,"mode":s["mode"],"narration":s["voice"]})
        t+=s["duration"]
    (out/"anatomy-of-a-question.vtt").write_text("\n".join(captions),encoding="utf-8")
    (out/"source_manifest.json").write_text(json.dumps({"duration":t,"shots":manifest},indent=2)+"\n")
    (out/"narration_script.txt").write_text("\n\n".join(s["voice"] for s in SCENES if s["voice"])+"\n")


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--assets",type=Path,default=HERE/"assets")
    p.add_argument("--out",type=Path,default=HERE/"output")
    p.add_argument("--force",action="store_true")
    p.add_argument("--refresh-archive",action="store_true")
    p.add_argument("--validate-only",action="store_true")
    args=p.parse_args()
    args.out.mkdir(parents=True,exist_ok=True)
    for s in SCENES:
        if s["asset"]:
            f=args.assets/s["asset"]
            if not f.is_file():raise FileNotFoundError(f)
    export_docs(args.assets,args.out)
    if args.validate_only:return
    pic=render_shots(args.assets,args.out,args.force,args.refresh_archive)
    audio=combine_audio(args.out,args.force)
    final=args.out/"anatomy-of-a-question-2026.mp4"
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(pic),
         "-i",str(audio),"-map","0:v:0","-map","1:a:0","-c:v","copy",
         "-c:a","aac","-b:a","160k","-shortest","-movflags","+faststart",str(final)])
    print("MASTER",final,flush=True)
    poster=args.out/"anatomy-of-a-question-2026.webp"
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-ss","368","-i",str(final),
         "-frames:v","1","-vf","scale=960:-2:flags=lanczos","-quality","85",str(poster)])


if __name__=="__main__":main()
