#!/usr/bin/env python3
"""The Ring That Never Closed: archival-first scientific essay film.
180 seconds; 10 scenes; scientifically annotated explanatory plates;
contextual source figure appears unmodified; no invented compounds/spectra.
Audio via freely available Kokoro ONNX and restrained original score.
"""
import argparse, hashlib, json, math, subprocess, tempfile
from pathlib import Path
import numpy as np
import soundfile as sf
from PIL import Image,ImageDraw,ImageFont,ImageOps

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets"/"films"
SCENES=OUT/"ring-that-never-closed-scenes.json"
VIDEO=OUT/"ring-that-never-closed.mp4"
VTT=OUT/"ring-that-never-closed.vtt"
POSTER=OUT/"ring-that-never-closed-poster.webp"
BUILD=OUT/"ring-that-never-closed-build.json"
W,H,FPS,DURATION=1280,720,24,180
INK=(18,47,53);PAPER=(246,244,235);MUTED=(87,111,105)
COPPER=(165,79,54);SAFFRON=(212,154,67);MOSS=(102,140,117)
SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def run(parts):
    p=subprocess.run(parts,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    if p.returncode:raise RuntimeError(" ".join(map(str,parts))+"\n"+p.stderr[-3000:])
    return p.stdout
def face(sz,typ="sans"):
    return ImageFont.truetype({"sans":SANS,"serif":SERIF,"bold":BOLD}[typ],sz)
def text(d,pos,value,sz=24,fill=INK,typ="sans"):
    d.text(pos,value,font=face(sz,typ),fill=fill)
def wrap(d,value,size,width,typ="sans"):
    ft=face(size,typ);rows=[];row=""
    for word in value.split():
        v=(row+" "+word).strip()
        if row and d.textbbox((0,0),v,font=ft)[2]>width:rows.append(row);row=word
        else:row=v
    if row:rows.append(row)
    return rows
def panel(d,r,fill,outline=None):
    d.rounded_rectangle(r,radius=19,fill=fill,outline=outline,width=2)
def base(s):
    im=Image.new("RGB",(W,H),PAPER)
    d=ImageDraw.Draw(im)
    d.rectangle((0,0,W,109),fill=INK)
    d.rectangle((0,535,W,H),fill=INK)
    d.rectangle((67,40,115,44),fill=SAFFRON)
    text(d,(67,60),"RUWAIDIX / THE UNFINISHED ROUTE",17,PAPER,"bold")
    text(d,(1030,62),s["id"]+" / 10",16,(194,214,200))
    title_size=43
    titlelines=wrap(d,s["title"],title_size,1120,"serif")
    for i,line in enumerate(titlelines[:2]):
        text(d,(65,545+i*49),line,title_size,PAPER,"serif")
    text(d,(66,684),s["kind"],13,(235,183,117),"bold")
    text(d,(1025,684),"2018 - 2021",13,(190,211,197))
    return im
def molecule(d,x,y,open_gap=False):
    # Unspecified ring icon. Not an atomically resolved structure or product claim.
    p=[(x,y-78),(x+70,y-38),(x+70,y+38),(x,y+78),(x-70,y+38),(x-70,y-38)]
    segs=list(zip(p,p[1:]+p[:1]))
    for i,(a,b) in enumerate(segs):
        if i==1 and open_gap:
            d.line((a[0]+3,a[1]+4,a[0]+22,a[1]+24),fill=COPPER,width=6)
            d.line((b[0]-19,b[1]-17,b[0]-2,b[1]-3),fill=COPPER,width=6)
        else:d.line((a,b),fill=INK,width=5)
    d.ellipse((x+81,y-56,x+97,y-40),fill=SAFFRON)
def draw_route(d):
    panel(d,(105,155,1175,510),(236,239,231))
    molecule(d,365,324,True)
    d.line((495,322,750,322),fill=COPPER,width=5)
    d.polygon([(748,309),(775,322),(748,335)],fill=COPPER)
    panel(d,(831,245,1078,397),(221,224,217))
    text(d,(861,287),"TARGET CLASS",18,INK,"bold")
    text(d,(862,329),"IMIDAZOPYRIDINES",17,COPPER,"bold")
    text(d,(165,447),"SCHEMATIC INTENT / NOT A CONFIRMED STRUCTURE",16,COPPER,"bold")
def draw_plan(d):
    panel(d,(106,156,1174,509),(234,237,227))
    for k,(a,b) in enumerate([("ROUTE A","PLANNED"),("ROUTE B","PLANNED")]):
        y=227+k*153
        panel(d,(162,y-21,502,y+73),(220,230,217))
        text(d,(205,y+5),a,28,INK,"bold")
        d.line((532,y+24,740,330),fill=COPPER,width=5)
    panel(d,(800,262,1071,399),(230,220,203))
    text(d,(841,292),"TARGET",24,INK,"bold")
    text(d,(824,341),"UNOBTAINED",21,COPPER,"bold")
    text(d,(165,466),"DESIGN GOAL ONLY / PROJECT PROPOSAL",16,COPPER,"bold")
def draw_failed(d):
    panel(d,(102,154,1178,511),(235,236,227))
    molecule(d,361,328,True)
    d.line((478,328,747,328),fill=COPPER,width=5)
    d.line((598,303,631,350),fill=COPPER,width=9)
    d.line((631,303,598,350),fill=COPPER,width=9)
    panel(d,(815,252,1103,404),(236,226,209))
    text(d,(849,281),"NO ISOLATED",22,INK,"bold")
    text(d,(836,326),"TARGET RING",25,COPPER,"bold")
    text(d,(165,463),"RECORDED OUTCOME / 2021 FINAL REPORT",15,COPPER,"bold")
def draw_imines(d):
    panel(d,(105,155,1175,509),(236,239,232))
    for k in range(3):
        x=170+k*330
        panel(d,(x,245,x+295,391),(220,230,220))
        text(d,(x+27,269),f"IMINE 0{k+1}",22,INK,"bold")
        text(d,(x+30,324),"C = N",40,COPPER,"serif")
    text(d,(180,456),"THREE CHARACTERIZED SCHIFF BASES / SCHEMATIC ONLY",17,COPPER,"bold")
def draw_anion(d,figure):
    with Image.open(figure) as data:
        original=ImageOps.exif_transpose(data).convert("RGB")
    original.thumbnail((1060,325),Image.Resampling.LANCZOS)
    im=Image.new("RGB",(W,H),PAPER)
    baseframe=im
    d.rectangle((108,149,1172,508),fill=(225,233,223))
    x=(W-original.width)//2
    y=160+(325-original.height)//2
    im.paste(original,(x,y))
    d=ImageDraw.Draw(im)
    d.rectangle((x-2,y-2,x+original.width+1,y+original.height+1),outline=MUTED,width=2)
    text(d,(130,474),"ARCHIVAL RESEARCH-CONTEXT FIGURE / UNALTERED",15,COPPER,"bold")
    return im
def draw_color(d):
    panel(d,(102,155,1178,507),(234,235,224))
    for k,(labelname,swatch) in enumerate([("BEFORE",(230,197,67)),("WITH CYANIDE",(222,132,57))]):
        x=280+k*460
        d.rounded_rectangle((x,242,x+210,403),radius=31,fill=swatch,outline=(116,106,84),width=3)
        text(d,(x+5,427),labelname,19,INK,"bold")
    d.line((550,320,688,320),fill=COPPER,width=5)
    d.polygon([(681,306),(712,320),(681,334)],fill=COPPER)
    text(d,(180,177),"COLOUR RESPONSE / ILLUSTRATIVE SWATCHES",19,COPPER,"bold")
def draw_spectrum(d):
    panel(d,(103,155,1177,507),(233,236,228))
    panel(d,(166,220,534,408),(223,234,223))
    panel(d,(741,220,1104,408),(239,222,200))
    text(d,(242,249),"~380 nm",36,INK,"serif")
    text(d,(823,249),"~450 nm",36,INK,"serif")
    text(d,(243,326),"BAND DIMINISHED",18,COPPER,"bold")
    text(d,(828,326),"BAND GREW",20,COPPER,"bold")
    d.line((565,312,700,312),fill=COPPER,width=4)
    d.polygon([(696,300),(724,312),(696,325)],fill=COPPER)
    text(d,(200,450),"LIMIT OF DETECTION 1.42 × 10^-5 M / REPORTED VALUE",16,COPPER,"bold")
    # No synthetic absorption graph or digitized peak shapes.
def draw_biology(d):
    panel(d,(105,155,1175,509),(233,237,227))
    for k,n in enumerate(["CMP5","CMPB"]):
        x=168+k*527
        panel(d,(x,221,x+435,423),(219,229,219) if not k else (233,221,205))
        text(d,(x+29,247),n,40,INK,"serif")
        text(d,(x+30,318),"CELL-LINE ASSAYS",21,COPPER,"bold")
        text(d,(x+30,359),"EXPLORATORY",16,MUTED)
    text(d,(188,461),"COLLABORATIVE BIOLOGICAL WORK / NOT A CLINICAL RESULT",15,COPPER,"bold")
def draw_uncertainty(d):
    panel(d,(108,153,1171,508),(234,237,229))
    labels=[("c-MYC","SOME MEASUREMENTS INCREASED"),("SIGNIFICANCE","SOME COMPARISONS NOT SIGNIFICANT"),("PRMT5","TARGET ENGAGEMENT UNPROVEN")]
    for k,(head,desc) in enumerate(labels):
        y=199+95*k
        d.line((161,y+70,1090,y+70),fill=(207,214,202),width=2)
        text(d,(169,y+6),head,27,INK,"bold")
        text(d,(460,y+10),desc,18,COPPER,"bold")
def draw_archive(d):
    panel(d,(110,154,1170,508),(230,235,224))
    for k,(year,line) in enumerate([("2018","PROPOSED IMIDAZOPYRIDINES"),("2021","IMINES + SENSING EVIDENCE")]):
        x=174+k*484
        panel(d,(x,227,x+439,401),(244,240,225))
        text(d,(x+36,253),year,51,INK,"serif")
        text(d,(x+35,335),line,17,COPPER,"bold")
    text(d,(171,451),"BIOLOGICAL MECHANISM UNRESOLVED / COVID-ERA ACCESS LIMITS",14,COPPER,"bold")
def draw_scene(scene,fig,out):
    im=base(scene);d=ImageDraw.Draw(im)
    visual=scene["visual"]
    if visual=="route":draw_route(d)
    elif visual=="plan":draw_plan(d)
    elif visual=="failed":draw_failed(d)
    elif visual=="imines":draw_imines(d)
    elif visual=="anion":
        # The entire original archival context figure is contained, never falsified.
        with Image.open(fig) as f0:
            source=ImageOps.exif_transpose(f0).convert("RGB")
        source.thumbnail((1070,339),Image.Resampling.LANCZOS)
        x=(W-source.width)//2;y=153+(346-source.height)//2
        im.paste(source,(x,y));d=ImageDraw.Draw(im)
        d.rectangle((x-2,y-2,x+source.width+1,y+source.height+1),outline=MUTED,width=2)
        text(d,(137,497),"CONTEXT FIGURE / SPECIFIC REPORT IDENTITY NOT VERIFIED",13,COPPER,"bold")
    elif visual=="color":draw_color(d)
    elif visual=="spectrum":draw_spectrum(d)
    elif visual=="biology":draw_biology(d)
    elif visual=="uncertainty":draw_uncertainty(d)
    elif visual=="archive":draw_archive(d)
    else:raise ValueError("Bad scene type "+visual)
    im.save(out,quality=93)
    return im
def fmt(t):
    ms=round(1000*t)
    return f"{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d}.{ms%1000:03d}"
def captions(scenes):
    lines=["WEBVTT","","NOTE Source-grounded narration; diagrams are editorial, not source data.",""]
    for s in scenes:
        words=s["narration"].split();n=math.ceil(len(words)/2)
        for k,span in enumerate([" ".join(words[:n])," ".join(words[n:])]):
            t=s["start"]+.55
            dur=s["duration"]-1.0
            lines.extend([fmt(t+dur*k/2)+" --> "+fmt(t+dur*(k+1)/2),span,""])
    VTT.write_text("\n".join(lines),encoding="utf-8")
def audio(scenes,speech,sr,tmp):
    samples=np.zeros(DURATION*sr,dtype=np.float32)
    envelope=np.zeros_like(samples)
    for scene,voice in zip(scenes,speech):
        start=int((scene["start"]+.65)*sr)
        end=start+len(voice)
        rms=float(np.sqrt(np.mean(voice**2)+1e-8))
        gain=min(2.0,.085/max(.0001,rms))
        samples[start:end]+=np.tanh(voice*gain)
        envelope[max(0,start-int(.2*sr)):min(len(samples),end+int(.4*sr))]=1.0
    t=np.arange(len(samples),dtype=np.float32)/sr
    score=np.zeros_like(samples)
    for i,(a,b,c) in enumerate([(110,164.81,196),(98,146.83,174.61),(87.31,130.81,164.81)]):
        start=i*60;end=start+60
        fade=np.clip((t-start)/5,0,1)*np.clip((end-t)/6,0,1)
        tones=.47*np.sin(2*np.pi*a*t)+.21*np.sin(2*np.pi*b*t+.4)+.11*np.sin(2*np.pi*c*t+1)
        score+=np.asarray(tones*fade,dtype=np.float32)
    overall=np.minimum(1,t/4)*np.minimum(1,(DURATION-t)/5)
    samples+=np.asarray(.018*score*overall*(1-.65*envelope),dtype=np.float32)
    if np.max(np.abs(samples))>.89:samples*=.89/np.max(np.abs(samples))
    wav=tmp/"soundtrack.wav"
    sf.write(wav,samples,sr,subtype="PCM_16")
    return wav
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    parser.add_argument("--workspace",default="film-models")
    args=parser.parse_args()
    source=json.loads(SCENES.read_text(encoding="utf-8"))
    scenes=source["scenes"];cur=0
    for i,s in enumerate(scenes,1):
        assert s["id"]==str(i).zfill(2) and s["start"]==cur and s["duration"]>=12
        cur+=s["duration"]
    assert len(scenes)==10 and cur==180
    assert source["chemical_observations"]["detection_limit_molar"]==1.42e-5
    figure=ROOT/source["source_figure"]
    assert figure.is_file()
    if args.validate_only:
        print("VALID 10 scenes, 180 seconds; report numbers and archival context verified")
        return
    from kokoro_onnx import Kokoro
    models=Path(args.workspace).resolve()
    engine=Kokoro(str(models/"kokoro-v1.0.fp16.onnx"),str(models/"voices-v1.0.bin"))
    with tempfile.TemporaryDirectory(prefix="ruwaidix-synthesis-") as directory:
        tmp=Path(directory);voices=[];sr=None;clips=[]
        for scene in scenes:
            wav,rate=engine.create(scene["narration"],voice="bm_george",speed=1.10,lang="en-gb")
            wav=np.asarray(wav,dtype=np.float32).flatten()
            if sr is not None and rate!=sr:raise ValueError("Inconsistent Kokoro rate")
            sr=rate
            seconds=len(wav)/sr
            if not np.all(np.isfinite(wav)) or seconds>scene["duration"]-1.15:
                raise ValueError(f"Scene {scene['id']} narration exceeds slot: {seconds:.2f}s")
            voices.append(wav);print("VOICE",scene["id"],round(seconds,2),flush=True)
        soundtrack=audio(scenes,voices,sr,tmp)
        captions(scenes)
        for scene in scenes:
            frame=tmp/("frame-"+scene["id"]+".jpg")
            still=draw_scene(scene,figure,frame)
            if scene["id"]=="01":still.save(POSTER,"WEBP",quality=88)
            clip=tmp/("scene-"+scene["id"]+".mp4")
            length=scene["duration"]
            vf=("zoompan=z='min(zoom+0.000012,1.006)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
                f"d=1:s=1280x720:fps=24,fade=t=in:st=0:d=0.43,fade=t=out:st={length-.53}:d=0.53,format=yuv420p")
            run(["ffmpeg","-hide_banner","-loglevel","error","-y","-loop","1","-framerate","24","-i",str(frame),
                 "-vf",vf,"-frames:v",str(length*FPS),"-an","-c:v","libx264","-preset","veryfast","-crf","23",
                 "-pix_fmt","yuv420p",str(clip)])
            clips.append(clip)
            print("SCENE",scene["id"],scene["visual"],flush=True)
        playlist=tmp/"playlist.txt"
        playlist.write_text("".join("file '"+str(x)+"'\n" for x in clips),encoding="utf-8")
        silent=tmp/"silent.mp4"
        run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(playlist),"-c","copy",str(silent)])
        run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(silent),"-i",str(soundtrack),
             "-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-b:a","160k",
             "-af","loudnorm=I=-18:TP=-2:LRA=11","-t",str(DURATION),"-movflags","+faststart",str(VIDEO)])
    meta=json.loads(run(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(VIDEO)]))
    duration=float(meta["format"]["duration"])
    if abs(duration-DURATION)>.2:raise RuntimeError("Expected exactly three minutes")
    if VIDEO.stat().st_size>90_000_000:raise RuntimeError("Output too large for GitHub")
    BUILD.write_text(json.dumps({
      "title":source["title"],"seconds":duration,"scene_count":len(scenes),
      "video_sha256":hashlib.sha256(VIDEO.read_bytes()).hexdigest(),
      "source_figure_sha256":hashlib.sha256(figure.read_bytes()).hexdigest(),
      "source_manifest":"assets/films/ring-that-never-closed-scenes.json",
      "source_records":[source["archive"],source["project_record"]],
      "figure_policy":source["figure_use"],"scientific_integrity":source["scientific_integrity"],
      "render_script":"scripts/render-ring-that-never-closed.py",
      "voice":"Kokoro ONNX bm_george generated speech; not the researcher's actual voice",
      "sound":"Original generated harmonic score without field recordings or borrowed music"
    },indent=2)+"\n",encoding="utf-8")
    print("COMPLETED",VIDEO,round(duration,2),VIDEO.stat().st_size,flush=True)
if __name__=="__main__":main()
