#!/usr/bin/env python3
"""Ruwaidix pulmonary film director's cut.
Eleven source-led scenes, 180 seconds. New conceptual diagrams and a chart
of four *published* means, with no simulated experimental microscopy.
All real figure pixels remain visible and unaltered in the research window.
"""
import argparse, json, hashlib, math, subprocess, tempfile
from pathlib import Path
import numpy as np
import soundfile as sf
from PIL import Image,ImageDraw,ImageFont,ImageOps,ImageFilter

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets"/"films"
STORY=OUT/"airway-reopening-evidence-scenes.json"
VIDEO=OUT/"airway-reopening-evidence-cut.mp4"
VTT=OUT/"airway-reopening-evidence-cut.vtt"
POSTER=OUT/"airway-reopening-evidence-poster.webp"
BUILD=OUT/"airway-reopening-evidence-build.json"
W,H,FPS,TOTAL=1280,720,24,180
PINE=(21,51,57);DARK=(12,29,35);PAPER=(247,245,237)
SOFT=(226,233,226);CLAY=(184,109,80);MUTED=(172,193,182)
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"

def cmd(args):
    p=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    if p.returncode: raise RuntimeError(" ".join(map(str,args))+"\n"+p.stderr[-3200:])
    return p.stdout
def f(size,kind="normal"):
    return ImageFont.truetype({"normal":FONT,"bold":BOLD,"serif":SERIF}[kind],size)
def label(d,x,y,t,size=23,color=PAPER,kind="normal"):
    d.text((x,y),t,font=f(size,kind),fill=color)
def wrap(d,s,maxw,face):
    lines=[];line=""
    for w in s.split():
        cand=(line+" "+w).strip()
        if line and d.textbbox((0,0),cand,font=face)[2]>maxw:lines.append(line);line=w
        else:line=cand
    if line:lines.append(line)
    return lines
def box(d,xy,color,outline=None,r=16,w=2):
    d.rounded_rectangle(xy,radius=r,fill=color,outline=outline,width=w)
def background():
    im=Image.new("RGB",(W,H),PINE)
    d=ImageDraw.Draw(im)
    for y in range(128,550):
        u=(y-128)/422
        d.line((0,y,W,y),fill=(int(22+8*u),int(51+10*u),int(58+5*u)),width=1)
    return im
def layout(scene):
    im=background();d=ImageDraw.Draw(im)
    d.rectangle((0,0,W,116),fill=DARK)
    d.rectangle((0,540,W,H),fill=DARK)
    d.rectangle((65,41,112,46),fill=CLAY)
    label(d,66,57,"RUWAIDIX / PULMONARY MECHANOBIOLOGY",16,PAPER,"bold")
    label(d,1050,60,scene["id"]+"/ 11",17,MUTED)
    title_face=f(45,"serif")
    for k,line in enumerate(wrap(d,scene["title"],1110,title_face)[:2]):
        label(d,64,553+k*50,line,45,PAPER,"serif")
    label(d,65,681,scene["kind"],13,CLAY,"bold")
    label(d,974,682,"2021 / RESEARCH",12,MUTED)
    return im

def draw_airway(d):
    box(d,(86,169,1197,503),(231,235,230),r=27)
    box(d,(152,249,1120,402),(184,211,208),r=72)
    d.rectangle((170,312,1100,344),fill=(96,145,145))
    for x in range(195,1100,55):
        d.ellipse((x,390,x+35,418),fill=(206,173,140),outline=(80,108,111),width=2)
    d.ellipse((440,254,630,390),fill=PAPER,outline=(154,92,71),width=6)
    d.line((620,326,830,326),fill=CLAY,width=6)
    d.polygon([(830,308),(860,326),(830,344)],fill=CLAY)
    label(d,190,202,"LIQUID-LINED AIRWAY / IDEALIZED",19,PINE,"bold")
    label(d,713,358,"ADVANCING AIR",17,PINE,"bold")

def draw_interface(d):
    box(d,(90,160,1190,514),(224,232,226),r=25)
    d.rectangle((172,267,1070,418),fill=(174,205,199))
    d.pieslice((355,228,611,435),270,90,fill=PAPER,outline=CLAY,width=5)
    d.line((565,275,930,275),fill=CLAY,width=4)
    d.polygon([(930,264),(951,275),(930,286)],fill=CLAY)
    for x in range(185,1030,57):
        d.rounded_rectangle((x,407,x+43,428),radius=11,fill=(72,120,121))
    label(d,192,191,"CELL LAYER / CONTROLLED CHANNEL",20,PINE,"bold")
    label(d,703,303,"MOVING INTERFACE",21,PINE,"bold")
    label(d,193,461,"SCHEMATIC ONLY — NOT LUNG FOOTAGE",15,(135,76,53),"bold")

def published(d,im,path):
    with Image.open(path) as pic:
        src=ImageOps.exif_transpose(pic).convert("RGB")
    src.thumbnail((1032,347),Image.Resampling.LANCZOS)
    x=(W-src.width)//2;y=157+(350-src.height)//2
    im.paste(src,(x,y))
    d.rectangle((x-1,y-1,x+src.width+1,y+src.height+1),outline=(181,205,194),width=2)
    # The full experimental image is contained rather than cropped.
    label(d,96,489,"ORIGINAL PUBLISHED FIGURE / UNCROPPED",13,MUTED,"bold")

def draw_design(d):
    box(d,(90,160,1190,514),(230,235,226),r=24)
    fields=[("STATIC","CULTURED CELLS"),("BUBBLE","NO PRETREATMENT"),("BUBBLE + DEX","PRETREATED"),("BUBBLE + DHEA","PRETREATED")]
    for i,(title,subtitle) in enumerate(fields):
        x=123+i*265
        box(d,(x,242,x+245,397),SOFT if i%2==0 else (216,226,216),outline=(174,197,178),r=12)
        label(d,x+18,267,title,20,PINE,"bold")
        label(d,x+18,311,subtitle,13,(65,99,94))
        d.line((x+18,359,x+227,359),fill=CLAY,width=4)
    label(d,125,435,"GROUP COMPARISON / DIAGRAM, NOT MICROSCOPY",16,(130,76,51),"bold")

def draw_assay(d):
    box(d,(90,160,1190,514),(230,236,226),r=24)
    label(d,136,200,"LIVE / DEAD STAINING",25,PINE,"bold")
    for i,(title,word,c) in enumerate([("CALCEIN","LIVE",(57,131,102)),("ETHIDIUM","DEAD",(159,85,75))]):
        x=145+i*510
        box(d,(x,280,x+475,411),SOFT,r=15)
        d.ellipse((x+32,319,x+83,370),fill=c)
        label(d,x+108,320,title,22,PINE,"bold")
        label(d,x+108,357,word+" CELLS / ASSAY LEGEND",15,(67,94,91))
    label(d,142,452,"SYMBOLS EXPLAIN STAIN LOGIC; THEY ARE NOT OBSERVED CELLS",15,(129,73,52),"bold")

DATA=[("BUBBLE ONLY",54.7,(177,105,82)),("DEX + BUBBLE",15.1,(80,137,122)),("DHEA + BUBBLE",16.1,(80,137,122)),("LAT + BUBBLE",20.9,(133,146,126))]
def draw_results(d,focus):
    box(d,(88,152,1191,516),(237,239,231),r=25)
    label(d,137,180,"PUBLISHED MEAN CELL DEATH (%)",24,PINE,"bold")
    label(d,139,215,"SINGLE BUBBLE / RAT L2 CELL CULTURE / NOT CLINICAL EFFICACY",14,(105,79,61),"bold")
    x0=520;x1=1050;span=x1-x0
    for tick in [0,20,40,60]:
        yy=275
        x=x0+span*tick/60
        d.line((int(x),yy,int(x),449),fill=(203,214,207),width=1)
        label(d,int(x)-6,459,str(tick),12,(95,115,110))
    for i,(name,value,color) in enumerate(DATA):
        y=281+i*43
        length=int(span*value/60)
        color =color if focus=="all" or i==focus else (177,193,182)
        d.rounded_rectangle((x0,y,x0+length,y+23),radius=4,fill=color)
        d.text((x0+length+8,y),f"{value:.1f}%",font=f(17,"bold"),fill=PINE)
        label(d,151,y+3,name,16,PINE,"bold")
    label(d,150,490,"BARS SHOW PUBLISHED MEANS ONLY; NO NEW DATA",13,(126,82,64),"bold")

def draw_actin(d):
    box(d,(92,160,1190,516),(228,235,227),r=24)
    label(d,140,193,"CELL STRUCTURE AND RESPONSE",25,PINE,"bold")
    for i in range(2):
        x=156+i*505
        box(d,(x,267,x+450,415),SOFT,r=15)
        if i==0:
            for p in range(11):
                y=287+p*9
                d.arc((x+56,y,x+389,y+70),0,180,fill=(71,123,125),width=2)
            label(d,x+55,438,"CONTROL / CONCEPTUAL ACTIN",15,PINE)
        else:
            for p in range(10):
                yy=298+p*9
                d.line((x+45,yy,x+385,yy+12),fill=(168,115,87),width=2)
            label(d,x+56,438,"TREATED / CONCEPTUAL CHANGE",15,PINE)
    label(d,145,479,"NOT A RECONSTRUCTION OF ACTUAL STAINING OR AFM DATA",12,(132,76,51),"bold")

def draw_limits(d):
    box(d,(90,160,1190,516),(225,235,228),r=26)
    terms=[("STUDIED","RAT L2 EPITHELIAL CELLS"),("EXPOSED","ONE PROPAGATING BUBBLE"),("NOT ESTABLISHED","PATIENT TREATMENT EFFECT")]
    for i,(heading,description) in enumerate(terms):
        y=202+i*92
        d.line((135,y+66,1120,y+66),fill=(197,207,195),width=2)
        label(d,153,y,heading,17,(149,83,65),"bold")
        label(d,467,y,description,20,PINE,"bold")

def draw_scene(scene,figure,path):
    im=layout(scene);d=ImageDraw.Draw(im)
    v=scene["visual"]
    if v=="airway":draw_airway(d)
    elif v=="interface":draw_interface(d)
    elif v=="publication":published(d,im,figure)
    elif v=="design":draw_design(d)
    elif v=="assay":draw_assay(d)
    elif v=="result-control":draw_results(d,0)
    elif v=="result-dex":draw_results(d,1)
    elif v=="result-dhea":draw_results(d,2)
    elif v=="result-lat":draw_results(d,3)
    elif v=="actin":draw_actin(d)
    elif v=="limits":draw_limits(d)
    else:raise ValueError("Unknown scientific scene "+v)
    im.save(path,quality=92)
    return im

def fmt(t):
    ms=int(round(1000*t))
    return f"{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d}.{ms%1000:03d}"
def write_vtt(scenes):
    cues=["WEBVTT","","NOTE Narration and figures explained; no invented experimental measurements.",""]
    for s in scenes:
        words=s["narration"].split()
        cut=math.ceil(len(words)/2)
        for k,chunk in enumerate([" ".join(words[:cut])," ".join(words[cut:])]):
            start=s["start"]+.5+(s["duration"]-.9)*k/2
            stop=s["start"]+.5+(s["duration"]-.9)*(k+1)/2
            cues.extend([fmt(start)+" --> "+fmt(stop),chunk,""])
    VTT.write_text("\n".join(cues),encoding="utf-8")

def sound(scenes,voices,sr,work):
    n=TOTAL*sr;a=np.zeros(n,dtype=np.float32)
    env=np.zeros(n,dtype=np.float32)
    for s,voice in zip(scenes,voices):
        begin=int((s["start"]+.7)*sr)
        end=begin+len(voice)
        if end>n:raise RuntimeError("Narration exceeds total film")
        rms=float(np.sqrt(np.mean(voice**2)+1e-8))
        gain=min(2.0,.082/max(.001,rms))
        a[begin:end]+=np.tanh(voice*gain)
        env[max(0,begin-int(.14*sr)):min(n,end+int(.4*sr))]=1.
    t=np.arange(n,dtype=np.float32)/sr
    score=np.zeros(n,dtype=np.float32)
    chords=[(73.42,110,146.83),(82.41,123.47,164.81),(87.31,130.81,174.61)]
    for idx,(b,c,e) in enumerate(chords):
        start=idx*60;end=start+60
        win=np.clip((t-start)/4,0,1)*np.clip((end-t)/6,0,1)
        pad=.55*np.sin(2*np.pi*b*t)+.19*np.sin(2*np.pi*c*t+.4)+.09*np.sin(2*np.pi*e*t+1)
        score+=np.asarray(win*pad,np.float32)
    fade=np.minimum(1,t/3)*np.minimum(1,(TOTAL-t)/5)
    a+=np.asarray(.017*score*fade*(1-.65*env),np.float32)
    if np.max(np.abs(a))>.9:a*=.9/np.max(np.abs(a))
    target=work/"voice-score.wav"
    sf.write(target,a,sr,subtype="PCM_16")
    return target

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--validate-only",action="store_true")
    p.add_argument("--workspace",default="film-models")
    args=p.parse_args()
    m=json.loads(STORY.read_text(encoding="utf-8"))
    scenes=m["scenes"]
    t=0
    for i,s in enumerate(scenes,1):
        assert s["id"]==str(i).zfill(2)
        assert s["start"]==t
        assert s["duration"]>=12
        t+=s["duration"]
    assert len(scenes)==11 and t==180
    assert m["reported_mean_cell_death_percent"]=={"bubble_control":54.7,"dexamethasone":15.1,"transdehydroandrosterone":16.1,"latrunculin_A":20.9}
    fig=ROOT/m["source_figure"]
    assert fig.exists()
    if args.validate_only:
        print("VALID: 11 scientific scenes, 180 seconds, actual source figure, verified 2021 study data")
        return
    from kokoro_onnx import Kokoro
    root=Path(args.workspace).resolve()
    tts=Kokoro(str(root/"kokoro-v1.0.fp16.onnx"),str(root/"voices-v1.0.bin"))
    with tempfile.TemporaryDirectory(prefix="ruwaidix-airway-") as temp:
        work=Path(temp)
        voices=[];sr=None;clips=[]
        for s in scenes:
            spoken,rate=tts.create(s["narration"],voice="bm_george",speed=1.10,lang="en-gb")
            v=np.asarray(spoken,dtype=np.float32).flatten()
            if sr is not None and sr!=rate:raise RuntimeError("Voice sample rate changed")
            sr=rate
            seconds=len(v)/sr
            print("VOICE",s["id"],round(seconds,2),"slot",s["duration"],flush=True)
            if seconds>s["duration"]-1.15:raise RuntimeError("Scene voice too long; edit text rather than truncate: "+s["id"])
            voices.append(v)
        track=sound(scenes,voices,sr,work)
        write_vtt(scenes)
        for s in scenes:
            filename=work/("frame-"+s["id"]+".jpg")
            still=draw_scene(s,fig,filename)
            if s["id"]=="01":still.save(POSTER,"WEBP",quality=87)
            length=s["duration"];frames=FPS*length
            clip=work/("scene-"+s["id"]+".mp4")
            vf=("zoompan=z='min(zoom+0.000012,1.006)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
                f"d=1:s=1280x720:fps=24,fade=t=in:st=0:d=0.42,fade=t=out:st={length-.50}:d=0.50,format=yuv420p")
            cmd(["ffmpeg","-hide_banner","-loglevel","error","-y","-loop","1","-framerate","24","-i",str(filename),
                 "-vf",vf,"-frames:v",str(frames),"-an","-c:v","libx264","-preset","veryfast","-crf","23",
                 "-pix_fmt","yuv420p",str(clip)])
            clips.append(clip)
            print("SHOT",s["id"],s["visual"],flush=True)
        playlist=work/"concat.txt"
        playlist.write_text("".join("file '"+str(x)+"'\n" for x in clips),encoding="utf-8")
        silent=work/"joined.mp4"
        cmd(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(playlist),
             "-c","copy",str(silent)])
        cmd(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(silent),"-i",str(track),"-map","0:v:0","-map","1:a:0",
             "-c:v","copy","-af","loudnorm=I=-18:TP=-2:LRA=11","-c:a","aac","-b:a","160k","-t",str(TOTAL),
             "-movflags","+faststart",str(VIDEO)])
    seconds=float(json.loads(cmd(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(VIDEO)]))["format"]["duration"])
    if abs(seconds-180)>.2:raise RuntimeError("Incorrect run time: "+str(seconds))
    if VIDEO.stat().st_size>90_000_000:raise RuntimeError("MP4 too large for git")
    BUILD.write_text(json.dumps({"title":m["title"],"seconds":seconds,"scene_count":len(scenes),
      "video_sha256":hashlib.sha256(VIDEO.read_bytes()).hexdigest(),"source_figure_sha256":hashlib.sha256(fig.read_bytes()).hexdigest(),
      "numerical_data":m["reported_mean_cell_death_percent"],"doi":m["publication"],
      "drawings":"Original annotated explanatory plates, not observed data; proportional bars display published means only",
      "voice":"Open-source Kokoro bm_george; generated voice, not original scientist's recorded voice",
      "audio":"Original synthesized quiet harmonic score; no borrowed music or field recordings",
      "source_manifest":"assets/films/airway-reopening-evidence-scenes.json",
      "renderer":"scripts/render-airway-evidence-cut.py"},indent=2)+"\n",encoding="utf-8")
    print("COMPLETE",VIDEO,round(seconds,2),VIDEO.stat().st_size,flush=True)
if __name__=="__main__": main()
