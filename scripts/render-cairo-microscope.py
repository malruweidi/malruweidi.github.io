#!/usr/bin/env python3
"""The Microscope I Brought from Cairo — original, open-source 120s archival film.
No fabricated travel footage, no voice impersonation or stock-lab scenes.
A deliberately quiet, text-led first-person visual essay, using original photographs.
"""
import argparse, hashlib, json, math, subprocess, tempfile
from pathlib import Path
import numpy as np
import soundfile as sf
from PIL import Image,ImageDraw,ImageFont,ImageOps,ImageFilter

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets"/"films"
STORY=OUT/"cairo-microscope-scenes.json"
VIDEO=OUT/"cairo-microscope.mp4"
VTT=OUT/"cairo-microscope.vtt"
MANIFEST=OUT/"cairo-microscope-build.json"
W,H,FPS,LENGTH=1280,720,24,120
INK=(20,44,49);CREAM=(247,245,237);MIST=(228,235,224);RUST=(176,99,75);MUTED=(173,190,184)
SERIF=Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf")
SANS=Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
BOLD=Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")

def run(cmd):
    p=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    if p.returncode:raise RuntimeError(" ".join(map(str,cmd))+"\n"+p.stderr[-2500:])
    return p.stdout

def font(sz,style="sans"):
    return ImageFont.truetype({"sans":SANS,"serif":SERIF,"bold":BOLD}[style],sz)

def text(draw,xy,value,size=24,color=CREAM,style="sans"):
    draw.text(xy,value,font=font(size,style),fill=color)

def wrap(draw,statement,width,size,style="sans"):
    ft=font(size,style);parts=[];a=""
    for word in statement.split():
        b=(a+" "+word).strip()
        if a and draw.textbbox((0,0),b,font=ft)[2]>width:
            parts.append(a);a=word
        else:a=b
    if a:parts.append(a)
    return parts

def fit_full(path,box):
    with Image.open(path) as im:
        source=ImageOps.exif_transpose(im).convert("RGB")
    source.thumbnail((box[2]-box[0]-28,box[3]-box[1]-30),Image.Resampling.LANCZOS)
    return source

def frame(s,path):
    paper=Image.new("RGB",(W,H),CREAM)
    draw=ImageDraw.Draw(paper)
    draw.rectangle((0,0, W,H),fill=CREAM)
    draw.rectangle((0,0,W,112),fill=INK)
    draw.rectangle((0,H-91,W,H),fill=INK)
    draw.line((54,140,1226,140),fill=(196,202,195),width=1)
    draw.line((54,H-118,1226,H-118),fill=(196,202,195),width=1)
    draw.rectangle((56,38,110,43),fill=RUST)
    text(draw,(56,58),"RUWAIDIX   /   PERSONAL FILMS",17,MIST,"bold")
    text(draw,(1020,60),"CAIRO  →  QATAR",15,MIST)
    text(draw,(57,645),f"{s['id']} / 09    ·    {s['note']}",13,MIST)
    text(draw,(1135,645),"2017 ARCHIVE",12,MIST)

    if s["mode"] in ("archive","context"):
        draw.rounded_rectangle((54,158,753,589),radius=17,fill=(222,226,218))
        pic=fit_full(ROOT/s["image"],(54,158,753,589))
        x=54+(699-pic.width)//2;y=158+(431-pic.height)//2
        paper.paste(pic,(x,y))
        draw=ImageDraw.Draw(paper)
        draw.rectangle((x-1,y-1,x+pic.width+1,y+pic.height+1),outline=(108,130,122),width=2)
        if s["mode"]=="context":
            draw.rectangle((70,552,739,581),fill=INK)
            text(draw,(82,557),"SEPARATE UNIVERSITY LAB PHOTO   /   NOT THE HOME MICROSCOPE",11,CREAM,"bold")
    elif s["mode"]=="route":
        draw.rounded_rectangle((54,158,753,589),radius=17,fill=(226,234,225))
        draw.line((174,374,633,374),fill=RUST,width=4)
        draw.ellipse((160,359,190,389),fill=RUST)
        draw.ellipse((618,359,648,389),fill=RUST)
        text(draw,(96,294),"QASR EL EINY",29,INK,"serif")
        text(draw,(476,294),"QATAR",34,INK,"serif")
        text(draw,(95,439),"CAIRO",19,(89,109,106))
        text(draw,(411,439),"DESTINATION / HOME",16,(89,109,106))
        text(draw,(89,520),"EDITORIAL ROUTE   ·   NO TRAVEL FOOTAGE",13,RUST,"bold")
    else:
        draw.rounded_rectangle((54,158,753,589),radius=17,fill=(218,229,219))
        draw.rectangle((121,226,129,521),fill=RUST)
        center="The freedom to return." if s["id"]=="06" else "Seeing is not knowing."
        if s["id"]=="06":lines=["The freedom","to return."]
        else:lines=["Seeing is","not knowing."]
        for i,line in enumerate(lines):text(draw,(161,275+78*i),line,47,INK,"serif")
        text(draw,(161,493),"A REFLECTION   /   NOT EXPERIMENTAL DATA",12,RUST,"bold")
    draw=ImageDraw.Draw(paper)
    text(draw,(785,190),s["title"],32,INK,"serif")
    draw.rectangle((787,246,824,250),fill=RUST)
    lines=wrap(draw,s["text"],421,25)
    if len(lines)>9:raise ValueError("Text density would exceed composition in "+s["id"]+": "+str(len(lines)))
    for i,line in enumerate(lines):text(draw,(785,275+35*i),line,25,INK)
    # Do not cover the archived photograph with labels, data, or invented measurements.
    paper.save(path,quality=92)

def clock(t):
    n=round(t*1000)
    return f"{n//3600000:02d}:{n//60000%60:02d}:{n//1000%60:02d}.{n%1000:03d}"

def captions(scenes):
    cues=["WEBVTT", ""]
    for s in scenes:
        chunks=s["text"].split(". ")
        if len(chunks)<2:chunks=[s["text"]]
        chunks=[x.strip().rstrip(".")+"." for x in chunks if x.strip()]
        n=len(chunks)
        for i,p in enumerate(chunks):
            st=s["start"]+0.3+s["duration"]*(i/n)
            en=s["start"]+0.3+s["duration"]*((i+1)/n)
            en=min(en,s["start"]+s["duration"]-.08)
            cues.extend([f"{clock(st)} --> {clock(en)}",p,""])
    VTT.write_text("\n".join(cues),encoding="utf-8")

def soundtrack(workspace):
    sr=24000
    count=LENGTH*sr
    t=np.arange(count,dtype=np.float32)/sr
    total=np.zeros(count,dtype=np.float32)
    # Instrumental-only score: spare, soft resonant notes with long rests.
    # Original generated score, no simulated laboratory or Cairo field recordings.
    notes=[(0,110.00),(13,146.83),(27,130.81),(42,98.00),(56,164.81),
           (70,110.00),(85,130.81),(99,146.83),(111,110.00)]
    for index,(onset,hz) in enumerate(notes):
        start=int(onset*sr)
        duration=min(int(11.6*sr),count-start)
        x=np.arange(duration,dtype=np.float32)/sr
        env=np.clip(x/.65,0,1)*np.exp(-x/6.7)
        harmonic=(np.sin(2*np.pi*hz*x)+.27*np.sin(2*np.pi*hz*2*x+.27)+.1*np.sin(2*np.pi*hz*3*x))
        tone=.025*env*harmonic
        total[start:start+duration]+=tone.astype(np.float32)
    fade=np.minimum(1,t/3.5)*np.minimum(1,(LENGTH-t)/5.0)
    total*=np.asarray(fade,dtype=np.float32)
    total=np.clip(total,-.85,.85)
    filename=workspace/"score.wav"
    sf.write(str(filename),total,sr,subtype="PCM_16")
    return filename

def render(scenes,workspace,audio):
    clips=[]
    for s in scenes:
        src=workspace/("frame-"+s["id"]+".jpg")
        frame(s,src)
        output=workspace/("shot-"+s["id"]+".mp4")
        n=s["duration"]*FPS
        # The gentle camera push moves the whole editorial frame only.
        # Published/archival source image stays visually recognizable and uncropped.
        vf=("zoompan=z='min(zoom+0.000014,1.005)':"
            "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            "d=1:s=1280x720:fps=24,"
            f"fade=t=in:st=0:d=0.65,fade=t=out:st={s['duration']-0.75}:d=0.75,format=yuv420p")
        run(["ffmpeg","-hide_banner","-loglevel","error","-y",
             "-loop","1","-framerate",str(FPS),"-i",str(src),
             "-vf",vf,"-frames:v",str(n),"-an","-c:v","libx264",
             "-preset","veryfast","-crf","22","-pix_fmt","yuv420p",str(output)])
        print("Rendered",s["id"],s["mode"],s["duration"],"seconds",flush=True)
        clips.append(output)
    playlist=workspace/"concat.txt"
    playlist.write_text("".join("file '"+str(c)+"'\n" for c in clips),encoding="utf-8")
    silent=workspace/"silent.mp4"
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0",
         "-i",str(playlist),"-c","copy",str(silent)])
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(silent),"-i",str(audio),
         "-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac",
         "-b:a","128k","-af","loudnorm=I=-20:TP=-2:LRA=11",
         "-t",str(LENGTH),"-movflags","+faststart",str(VIDEO)])
    data=json.loads(run(["ffprobe","-v","error","-show_entries","format=duration",
                         "-of","json",str(VIDEO)]))
    seconds=float(data["format"]["duration"])
    if abs(seconds-LENGTH)>.15:raise RuntimeError(f"Duration mismatch: {seconds}")
    if VIDEO.stat().st_size>90_000_000:raise RuntimeError("Video too large for GitHub Contents")
    hashes={}
    for s in scenes:
        if s.get("image"):
            p=ROOT/s["image"]
            hashes[s["image"]]=hashlib.sha256(p.read_bytes()).hexdigest()
    MANIFEST.write_text(json.dumps({
        "title":"The Microscope I Brought from Cairo",
        "seconds":seconds,
        "video_sha256":hashlib.sha256(VIDEO.read_bytes()).hexdigest(),
        "scene_count":len(scenes),
        "source_photo_sha256":hashes,
        "script_source":"assets/films/cairo-microscope-scenes.json",
        "render_script":"scripts/render-cairo-microscope.py",
        "audio":"Quiet originally generated instrumental score; no speech; not ambient documentary field sound",
        "evidence":"Actual personal microscope photograph from 2017 archive. Separate internship photograph clearly marked contextual only. No footage of purchase or travel claimed."
    },indent=2)+"\n",encoding="utf-8")
    print("Output",VIDEO,"seconds",seconds,"bytes",VIDEO.stat().st_size,flush=True)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    args=parser.parse_args()
    data=json.loads(STORY.read_text(encoding="utf-8"))
    scenes=data["scenes"]
    if len(scenes)!=9 or data["running_seconds"]!=LENGTH:raise ValueError("Expected nine 120-second scenes")
    pos=0
    for i,s in enumerate(scenes,1):
        if s["id"]!=f"{i:02d}" or s["start"]!=pos or s["duration"]<8:
            raise ValueError("Scenes are not contiguous")
        pos+=s["duration"]
        if s["mode"] not in {"archive","context","route","typography"}:
            raise ValueError("Unapproved shot type")
        if s.get("image") and not (ROOT/s["image"]).is_file():
            raise FileNotFoundError(s["image"])
    if pos!=LENGTH:raise ValueError("Incorrect total duration")
    if args.validate_only:
        print("VALID: nine scenes, 120 seconds, photographed microscope and labeled editorial contexts")
        return
    with tempfile.TemporaryDirectory(prefix="ruwaidix-cairo-") as temp:
        ws=Path(temp)
        audio=soundtrack(ws)
        captions(scenes)
        render(scenes,ws,audio)

if __name__=="__main__":main()
