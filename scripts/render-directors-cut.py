#!/usr/bin/env python3
"""Source-credited film director's-cut preview. Existing films are never overwritten.

One narrative chapter may contain multiple photo/illustration shots; cuts respond
to the story rather than one artificial six-scene template. Only verifiable
non-fiction is presented as documentary evidence.
"""
import argparse
import hashlib
import importlib.util
import json
import math
import shutil
import subprocess
import tempfile
import time
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/films/director-cuts/making-medicines-keep.json"
TARGET = ROOT / "assets/films/director-cuts"
BASE = ROOT / "scripts/render-documentary.py"
spec = importlib.util.spec_from_file_location("ruwaidix_film_engine", BASE)
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)
engine.TOTAL_SECONDS = 120
W, H, FPS = 1280, 720, 24
NORMAL = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def command(*args):
    result = subprocess.run(args, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(" ".join(map(str, args)) + "\n" + result.stderr[-3200:])
    return result.stdout

def read_manifest():
    manifest = json.loads(SOURCE.read_text(encoding="utf-8"))
    assert manifest["seconds"] == 120 and len(manifest["chapters"]) == 8
    for i, chapter in enumerate(manifest["chapters"], 1):
        assert chapter["id"] == str(i).zfill(2)
        assert 10 < len(chapter["narration"].split()) < 44
        assert len(chapter["shots"]) >= 2
        for shot in chapter["shots"]:
            assert shot["type"] and shot["credit"]
            assert bool(shot.get("remote")) != bool(shot.get("image"))
            if shot.get("remote"):
                assert shot["remote"].startswith("https://commons.wikimedia.org/wiki/Special:FilePath/")
                assert shot.get("source") and "license" not in shot.get("type","").lower()
            else:
                path = (ROOT / shot["image"]).resolve()
                assert path.is_relative_to(ROOT) and path.is_file(), str(path)
    return manifest

def fetch_shot(shot, folder, chapter, index):
    if not shot.get("remote"):
        return ROOT / shot["image"]
    output = folder / ("museum-" + chapter + "-" + str(index) + ".jpg")
    error = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(shot["remote"], headers={
                "User-Agent":"RuwaidixDocumentary/1.0 (editorial, licensed source attribution)"})
            with urllib.request.urlopen(req, timeout=45) as stream:
                data = stream.read(16_000_000)
            if len(data) < 4000 or len(data) >= 16_000_000:
                raise ValueError("Image empty or oversized")
            output.write_bytes(data)
            with Image.open(output) as im: im.verify()
            return output
        except Exception as ex:
            error = ex
            time.sleep(attempt + 1)
    raise RuntimeError("Source image cannot be fetched; refusing to replace with fake evidence: " + shot["remote"]) from error

def font(file, px):
    return ImageFont.truetype(file, px)

def director_overlay(item):
    """Small, quiet chapter identifications; avoid the repeated huge template masthead."""
    plate = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(plate)
    for y in range(485, H):
        a = int(208 * ((y-485)/(H-485))**1.15)
        d.line((0,y,W,y), fill=(7,24,29,a))
    d.rectangle((60,54,110,58),fill=(202,151,99,230))
    d.text((60,72),"RUWAIDIX   /   HISTORIES OF MEDICINE",font=font(NORMAL,15),fill=(249,243,227))
    d.text((60,507),"CHAPTER "+item["chapter"],font=font(NORMAL,16),fill=(230,176,115))
    words=item["title"]
    p=font(SERIF,39)
    lines=engine.lines_to_fit(words,d,p,1050)
    for j,line in enumerate(lines[:2]):
        d.text((58,538+j*43),line,font=p,fill=(251,246,231),stroke_width=1,stroke_fill=(12,23,27))
    d.text((60,678),item["shot_type"][:70],font=font(NORMAL,13),fill=(224,213,194))
    return plate

def voice_tracks(chapters, work, model_root, voice):
    from kokoro_onnx import Kokoro
    tts = Kokoro(str(model_root/"kokoro-v1.0.fp16.onnx"),
                 str(model_root/"voices-v1.0.bin"))
    tracks=[]
    sample_rate=None
    for ch in chapters:
        audio, sr=tts.create(ch["narration"],voice=voice,speed=1.0,lang="en-gb")
        audio=np.asarray(audio,dtype=np.float32).reshape(-1)
        if not len(audio) or not np.all(np.isfinite(audio)):
            raise ValueError("Unusable narrator audio: "+ch["id"])
        if sample_rate is not None and sample_rate!=sr:
            raise ValueError("Voice sample rates differ")
        sample_rate=sr
        tracks.append(audio)
        sf.write(str(work/("narrator-"+ch["id"]+".wav")),audio,sr)
    return tracks, sample_rate

def write_vtt(chapters, starts, tracks, sr, destination):
    text=["WEBVTT",""]
    for chapter,begin,track in zip(chapters,starts,tracks):
        words=chapter["narration"].split()
        pieces=[words[i:i+8] for i in range(0,len(words),8)]
        speech_length=len(track)/sr
        for i,piece in enumerate(pieces):
            a=begin+0.52+speech_length*i/len(pieces)
            b=begin+0.52+speech_length*(i+1)/len(pieces)
            text += [engine.vtt_time(a)+" --> "+engine.vtt_time(b)," ".join(piece),""]
    destination.write_text("\n".join(text),encoding="utf-8")

def produce(manifest,model_root,voice):
    chapters=manifest["chapters"]
    TARGET.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="ruwaidix-directors-cut-") as scratch:
        work=Path(scratch)
        tracks,sr=voice_tracks(chapters,work,model_root,voice)
        frame_counts=engine.allocate(tracks,sr)
        timeline=[]; cursor=0
        for n in frame_counts:
            timeline.append(cursor/FPS)
            cursor += n
        assert cursor == 120*FPS
        tag=voice.replace("_","-")
        prefix=TARGET / ("making-medicines-keep-directors-cut-"+tag)
        write_vtt(chapters,timeline,tracks,sr,prefix.with_suffix(".vtt"))
        clips=[]
        engine.overlay=director_overlay
        for ch,frames in zip(chapters,frame_counts):
            shots=ch["shots"]
            lengths=[frames//len(shots)]*len(shots)
            for i in range(frames%len(shots)): lengths[i]+=1
            for index,(shot,count) in enumerate(zip(shots,lengths),1):
                source=fetch_shot(shot,work,ch["id"],index)
                item={"id":ch["id"]+chr(96+index),"chapter":ch["id"],
                      "title":ch["title"],"shot_type":shot["type"],"contain":False}
                # Museum leaves and archival diagrams are never distorted by video framing.
                frame,layer=engine.make_frame(item,source,work)
                clip=work/("shot-"+item["id"]+".mp4")
                engine.make_clip(item,source,None,frame,layer,count/FPS,clip)
                clips.append(clip)
        playlist=work/"playlist.txt"
        playlist.write_text("".join("file '"+str(x)+"'\n" for x in clips))
        picture=work/"picture.mp4"
        command("ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0",
                "-i",str(playlist),"-c","copy",str(picture))
        sound=engine.soundtrack(tracks,sr,frame_counts,work)
        video=Path(str(prefix)+".mp4")
        command("ffmpeg","-hide_banner","-loglevel","error","-y",
                "-i",str(picture),"-i",str(sound),"-map","0:v:0","-map","1:a:0",
                "-c:v","copy","-af","loudnorm=I=-18:TP=-2:LRA=11",
                "-c:a","aac","-b:a","160k","-t","120","-movflags","+faststart",str(video))
        probe=json.loads(command("ffprobe","-v","error","-show_entries","format=duration",
                                 "-of","json",str(video)))
        length=float(probe["format"]["duration"])
        if abs(length-120)>0.3 or video.stat().st_size > 95000000:
            raise AssertionError("Output duration or GitHub file size out of bounds")
        record={"id":manifest["id"],"edition":manifest["edition"],"seconds":length,
                "voice":voice,"sha256":hashlib.sha256(video.read_bytes()).hexdigest(),
                "shots":[{"chapter":ch["id"],"type":s["type"],
                          "credit":s["credit"],"source":s.get("source",s.get("image"))}
                         for ch in chapters for s in ch["shots"]],
                "rights_note":"Public-domain/CC museum and architectural images are context, "
                "not representations of the author's historical sources. "
                "Creative reconstruction is identified. Human audio approval required."}
        Path(str(prefix)+".json").write_text(json.dumps(record,indent=2)+"\n")
        print("PREVIEW READY",video,length,"seconds",len(record["shots"]),"shots",video.stat().st_size,"bytes")

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--validate-only",action="store_true")
    p.add_argument("--models",default="film-models")
    p.add_argument("--voice",default="bm_lewis",choices=("bm_lewis","bm_george"))
    args=p.parse_args()
    manifest=read_manifest()
    print("Validated",len(manifest["chapters"]),"chapters,",
          sum(len(x["shots"]) for x in manifest["chapters"]),"individually credited shots")
    if not args.validate_only:
        produce(manifest,ROOT/args.models,args.voice)

if __name__=="__main__":
    main()
