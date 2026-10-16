#!/usr/bin/env python3
"""Non-subjective technical QA of the four Ruwaidix documentaries.
This cannot judge music, vocal naturalness or pronunciation by human listening.
"""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageStat

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/"assets"/"films"
DOCUMENT=ASSETS/"evidence-in-motion.json"

def run(args):
    p=subprocess.run(args,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode:
        raise RuntimeError("Failed: "+" ".join(args)+"\n"+p.stderr[-1200:])
    return p

def probe(filename):
    return json.loads(run(["ffprobe","-v","error","-show_entries","format=duration,size:stream=codec_type,codec_name,width,height,avg_frame_rate,sample_rate,channels","-of","json",str(filename)]).stdout)

def loudness(filename):
    p=run(["ffmpeg","-hide_banner","-nostats","-i",str(filename),"-filter_complex","ebur128=peak=true","-f","null","-"])
    summary=p.stderr.rsplit("Summary:",1)[-1]
    integrated=re.search(r"Integrated loudness:\s*I:\s*(-?\d+(?:\.\d+)?)\s*LUFS",summary)
    truepeak=re.search(r"True peak:\s*Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS",summary)
    if not integrated or not truepeak:
        raise RuntimeError("Integrated loudness/true peak were not measurable: "+summary[-650:])
    return float(integrated.group(1)),float(truepeak.group(1))

def captions(filename):
    vtt=filename.read_text(encoding="utf-8")
    if not vtt.startswith("WEBVTT"):raise AssertionError("Missing VTT header")
    times=re.findall(r"(\d\d:\d\d:\d\d\.\d{3}) --> (\d\d:\d\d:\d\d\.\d{3})",vtt)
    if len(times)<22:raise AssertionError("Too few readable caption cues")
    maxlen=0
    for block in vtt.split("\n\n"):
        if "-->" not in block:continue
        lines=block.splitlines()
        text=" ".join(lines[1:]).strip()
        maxlen=max(maxlen,len(text))
        if len(text)>74:raise AssertionError("Too long for comfortable phone captions: "+text)
    def seconds(tc):
        h,m,s=tc.split(":");return int(h)*3600+int(m)*60+float(s)
    for a,b in times:
        if seconds(a)>=seconds(b) or seconds(b)>120.06: raise AssertionError("Invalid subtitle range "+a+" "+b)
    return {"cue_count":len(times),"longest_cue_characters":maxlen,"last_end_seconds":seconds(times[-1][1])}

def visual_chapters(film):
    for scene in film["scenes"]:
        p=ASSETS/"plates"/(film["slug"]+"-"+scene["id"]+".webp")
        with Image.open(p) as im:
            if im.size!=(1280,720): raise AssertionError("Invalid visual frame "+str(p))
    if film["tone"]=="history":
        # Chapter paintings must differ within the actual illustration area,
        # not merely in their fixed title overlays.
        with Image.open(ASSETS/"plates"/(film["slug"]+"-02.webp")) as im2,Image.open(ASSETS/"plates"/(film["slug"]+"-03.webp")) as im3:
            a=im2.convert("RGB").crop((78,165,1200,445))
            b=im3.convert("RGB").crop((78,165,1200,445))
            diff=ImageChops.difference(a,b)
            return sum(ImageStat.Stat(diff).mean)/(3*255)
    return None

def main():
    data=json.loads(DOCUMENT.read_text(encoding="utf-8"))
    report={"title":"Ruwaidix Evidence in Motion — technical QA","method":"FFprobe streams; FFmpeg EBU R128 scan; WebVTT cue lengths; Pillow picture integrity. Human viewing and audio listening still required.","films":[]}
    for film in data["films"]:
        stem=film.get("media_stem",film["slug"])
        video=ASSETS/(stem+".mp4")
        info=probe(video)
        streams=info["streams"]
        picture=next(x for x in streams if x["codec_type"]=="video")
        audio=next(x for x in streams if x["codec_type"]=="audio")
        duration=float(info["format"]["duration"])
        if abs(duration-120)>.16: raise AssertionError("Bad duration "+stem+" "+str(duration))
        if (picture["codec_name"],picture["width"],picture["height"])!=("h264",1280,720): raise AssertionError("Wrong video stream "+stem)
        if audio["codec_name"]!="aac":raise AssertionError("Bad audio codec "+stem)
        if picture["avg_frame_rate"]!="24/1":raise AssertionError("Wrong frame rate "+stem)
        integrated,peak=loudness(video)
        if not (-22<=integrated<=-14):raise AssertionError("Out of acceptable dialogue loudness range: "+stem+" "+str(integrated))
        if peak>-0.5:raise AssertionError("Unsafe true peak "+stem+" "+str(peak))
        subs=captions(ASSETS/(stem+".vtt"))
        difference=visual_chapters(film)
        if difference is not None and difference<.012: raise AssertionError("Historical illustrations are indistinguishable")
        record={"film":film["slug"],"duration_seconds":round(duration,3),"video":picture["codec_name"],"audio":audio["codec_name"],
                "resolution":[1280,720],"frame_rate":24,"loudness_lufs":integrated,"true_peak_dBFS":peak,
                "captions":subs,"bytes":video.stat().st_size,"sha256":hashlib.sha256(video.read_bytes()).hexdigest()}
        if difference is not None:record["historical_illustrations_difference"]=round(difference,4)
        report["films"].append(record)
        print(film["slug"],"passes",duration,"s",integrated,"LUFS",peak,"dBFS",subs,flush=True)
    (ASSETS/"evidence-series-technical-qa.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

if __name__=="__main__":
    main()
