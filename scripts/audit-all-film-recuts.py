#!/usr/bin/env python3
"""Independent release-gate checks for source-preserving Ruwaidix film remakes.

Technical gate, NOT an automatic scientific, licensing, pronunciation or artistic
approval. It audits real encoded frames rather than judging JSON alone.
"""
import argparse
import hashlib
import json
import re
import statistics
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"assets"/"films"

def run(args):
    p=subprocess.run(args,capture_output=True)
    if p.returncode:raise RuntimeError(" ".join(map(str,args))+"\n"+p.stderr[-1500:].decode("utf8","replace"))
    return p.stdout

def details(movie):
    parsed=json.loads(run(["ffprobe","-v","error","-show_format","-show_streams","-of","json",str(movie)]))
    streams=parsed["streams"]
    video=next((s for s in streams if s.get("codec_type")=="video"),None)
    audio=next((s for s in streams if s.get("codec_type")=="audio"),None)
    if not video or not audio:raise ValueError("Missing H264 video or speech/music audio: "+movie.name)
    if video["codec_name"]!="h264" or audio["codec_name"]!="aac":
        raise ValueError("Expected H264/AAC web compatible streams: "+movie.name)
    if video.get("width")!=1280 or video.get("height")!=720:
        raise ValueError("Output is not the verified 1280x720 master: "+movie.name)
    return parsed,video,audio

def captions(path,duration):
    body=path.read_text(encoding="utf8")
    if not body.startswith("WEBVTT"):raise ValueError("Missing WEBVTT: "+str(path))
    pattern=r"(\d\d):(\d\d):(\d\d)\.(\d{3}) --> (\d\d):(\d\d):(\d\d)\.(\d{3})"
    matches=list(re.finditer(pattern,body))
    if len(matches)<12:raise ValueError("Too few captions: "+str(path))
    results=[]
    max_text=0
    for i,m in enumerate(matches):
        nums=[int(x) for x in m.groups()]
        start=sum((nums[0]*3600,nums[1]*60,nums[2],nums[3]/1000))
        end=sum((nums[4]*3600,nums[5]*60,nums[6],nums[7]/1000))
        if not (0<=start<end<=duration+.8):raise ValueError("Caption outside film: "+str(path))
        if i>0 and start<results[-1][1]-.1:raise ValueError("Overlapping captions: "+str(path))
        following=body[m.end():].split("\n\n",1)[0].strip()
        max_text=max(max_text,max([len(x) for x in following.splitlines()] or [0]))
        results.append((start,end))
    if max_text>130:raise ValueError("Caption exceeds mobile readable width: "+str(path)+" "+str(max_text))
    return {"cue_count":len(matches),"max_caption_line":max_text,
            "last_caption_second":round(results[-1][1],2)}

def encoded_blackout_audit(movie,duration):
    """Decode actual movie at 2 Hz, then find uninterrupted near-black sequences.

    A black transition frame is legitimate; a sustained blank field after
    compositing is a release blocker. Uses image area mean, not OCR.
    """
    width,height,rate=32,18,2
    samples=run(["ffmpeg","-hide_banner","-loglevel","error","-i",str(movie),
        "-vf",f"fps={rate},scale={width}:{height},format=gray",
        "-f","rawvideo","pipe:1"])
    bytes_per=width*height
    expected=int(duration*rate)
    count=len(samples)//bytes_per
    if count<expected-5:raise ValueError("Video frame stream shorter than expected: "+movie.name)
    black=[]
    run_start=None
    for n in range(count):
        buf=samples[n*bytes_per:(n+1)*bytes_per]
        mean=sum(buf)/bytes_per
        nearblack=mean<8.0
        if nearblack and run_start is None:run_start=n
        if (not nearblack or n==count-1) and run_start is not None:
            until=n if not nearblack else n+1
            black.append([round(run_start/rate,2),round(until/rate,2)])
            run_start=None
    worst=max([(b-a) for a,b in black] or [0])
    if worst>=2.0:raise ValueError("Continuous unexplained black-out >=2s: "+movie.name+" "+str(black))
    return {"sample_rate_hz":rate,"blank_intervals_seconds":black,"longest_black_seconds":worst}

def inspect(film,collection):
    m=collection/(film+".mp4")
    if not m.is_file():raise FileNotFoundError(m)
    meta1=collection/(film+".json")
    meta2=collection/(film+"-feature-build.json")
    meta3=collection/(film+"-build.json")
    manifest=next((p for p in (meta1,meta2,meta3) if p.is_file()),None)
    if manifest is None:raise ValueError("Missing independent film provenance: "+film)
    record=json.loads(manifest.read_text(encoding="utf8"))
    digest=hashlib.sha256(m.read_bytes()).hexdigest()
    if digest!=record.get("sha256"):raise ValueError("Film bytes differ from signed source manifest: "+film)
    info,video,audio=details(m)
    duration=float(info["format"]["duration"])
    if abs(duration-float(record["seconds"]))>.4:raise ValueError("Unexpected edit runtime: "+film)
    if not record.get("human_screening"):raise ValueError("Missing explicit screening status: "+film)
    track=collection/(film+".vtt")
    return {"name":film,"seconds":round(duration,2),"size_bytes":m.stat().st_size,
        "sha256":digest,"width":video["width"],"height":video["height"],
        "codec":video["codec_name"],"audio":audio["codec_name"],
        "captions":captions(track,duration),
        "black_frames":encoded_blackout_audit(m,duration),
        "human_screening":record["human_screening"]}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--collection",choices=["series-v2","longform-v2"],required=True)
    args=parser.parse_args()
    folder=SOURCE/args.collection
    films=sorted(x.stem for x in folder.glob("*.mp4"))
    if not films:raise ValueError("No encoded films to screen in "+str(folder))
    report={"collection":args.collection,"method":"Decoded H.264/AAC and 2Hz full-film low-resolution luminance frames; machine technical QA only",
            "caveat":"No synthetic assessment can establish scientific truth, ethical rights, cultural sensitivity or naturalness of pronunciation.",
            "films":[inspect(f,folder) for f in films]}
    target=folder/"technical-qa.json"
    target.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("VALIDATED",len(films),"complete films against encoded-frame blackouts, captions, codecs and SHA manifests")
    print("Max blackout seconds:",max(f["black_frames"]["longest_black_seconds"] for f in report["films"]))
if __name__=="__main__":
    main()
