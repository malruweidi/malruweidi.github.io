#!/usr/bin/env python3
"""A measured-figure-led documentary camera, NOT a random science slideshow.

- Every pixel of a published experimental panel comes from the same DOI.
- A cropped study figure is identified as a crop; axes and panel identity
  are never fabricated or rewritten.
- The flowing meniscus / plasma sequence is visually separate and labelled
  modern explanatory animation, not experiment footage.
- This tool never alters V1, V2, or earlier V3/V4 videos.
"""
import argparse,hashlib,io,json,math,subprocess,tempfile
from pathlib import Path
import numpy as np
import soundfile as sf
from PIL import Image,ImageDraw,ImageFont,ImageOps,ImageFilter

ROOT=Path(__file__).resolve().parents[1]
FIG=ROOT/"assets/films/source-figures/v3"
OUT=ROOT/"assets/films/series-v4"
MANIFEST=ROOT/"assets/films/V4-EXACT-FIGURE-DOCUMENTARIES.json"
W,H,FPS,CHAPTER=1280,720,24,15
BG=(13,31,35);CREAM=(249,241,227);MINT=(147,205,180);SAND=(218,176,128);GRAY=(189,210,201)
SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def run(cmd): 
    p=subprocess.run(cmd,capture_output=True)
    if p.returncode:raise RuntimeError(" ".join(map(str,cmd))+"\n"+p.stderr[-1600:].decode(errors="replace"))
    return p.stdout

def f(size=30,style="serif"):
    return ImageFont.truetype(SERIF if style=="serif" else BOLD if style=="bold" else SANS,size)

def text(d,p,msg,size=28,color=CREAM,style="serif"):
    d.text(p,msg,font=f(size,style),fill=color)

def ease(t):
    u=min(1,max(0,t))
    return u*u*(3-2*u)

_BACKGROUNDS={}
_PANELS={}
def background(src,k,t):
    if k in _BACKGROUNDS:
        return _BACKGROUNDS[k].copy()
    # Low contrast, defocused art direction from THIS paper's actual pixels,
    # NOT passed off as the experimental figure.
    fit=ImageOps.fit(src,(W,H),method=Image.Resampling.BICUBIC,centering=(.5,.5))
    fit=fit.filter(ImageFilter.GaussianBlur(radius=18)).convert("RGB")
    veil=Image.new("RGB",(W,H),BG)
    _BACKGROUNDS[k]=Image.blend(fit,veil,.90)
    return _BACKGROUNDS[k].copy()

def source_panel(src,region,dest):
    key=(id(src),region,dest)
    if key in _PANELS:return _PANELS[key]
    # Only unmodified pixel selection; preserve labels, intensity and color.
    if region is not None:
        w,h=src.size
        box=tuple(round(v*(w if i%2==0 else h)) for i,v in enumerate(region))
        src=src.crop(box)
    x0,y0,x1,y1=dest
    # Entire selected source figure panel fits, no stretching.
    img=ImageOps.contain(src,(x1-x0,y1-y0),method=Image.Resampling.LANCZOS)
    x=(x0+x1-img.width)//2;y=(y0+y1-img.height)//2
    _PANELS[key]=(img,(x,y))
    return _PANELS[key]

def read_art(film,figure):
    path=FIG/f"{film}-figure-{figure:02d}.jpg"
    if not path.is_file():raise FileNotFoundError("Exact study figure absent: "+str(path))
    return Image.open(path).convert("RGB"),path

def scene_camera(film,scene,i):
    src,ref=read_art(film,scene["figure"])
    # Different source shots have independently chosen native-image viewports.
    # Pixel ranges are modelled on real published multi-panel composition.
    box=None
    if film=="flow-chamber-method":
        if i in (0,1):box=(.42,.02,1,.58) if i==0 else None
        elif i==2:box=(.00,.00,.59,.50)
        elif i==3:box=(0,.00,.665,.99)
        elif i==4:box=(.655,0,1,1)
        elif i in (5,6):box=None
    elif film=="pla-grafting":
        box=None
    return src,box,ref

def credit(d,film,scene,cropped,figure):
    d.rectangle((0,666,W,H),fill=(12,35,39))
    if scene["mode"] in ("interface","surface"):
        msg="AUTHORED PHYSICAL EXPLANATION • NOT A MEASURED IMAGE"
    else:
        msg=f"ORIGINAL FIGURE {figure} • {'DOCUMENTED SOURCE PANEL CROP' if cropped else 'FULL PUBLISHED FIGURE'} • DOI {('10.3390/mps3040065' if film=='flow-chamber-method' else '10.3390/polym13213717')}"
    text(d,(39,677),msg,13,GRAY,"sans")

def visual_layers(d,film,scene,t):
    mode=scene["mode"]
    if mode=="interface":
        # Mechanics is qualitative, copied from conceptual Figure 1A.
        x0,x1=436,1221
        d.rounded_rectangle((x0,305,x1,525),radius=14,outline=MINT,width=5)
        for n in range(12):
            x=x0+33+n*59
            d.rounded_rectangle((x-21,477,x+23,507),radius=9,fill=(95,144,139),outline=(154,212,193),width=2)
            d.ellipse((x-7,488,x+7,502),fill=(28,67,75))
        bubble=505+600*ease(t/CHAPTER)
        d.rounded_rectangle((x0+11,326,bubble,463),radius=58,fill=(239,240,219))
        d.arc((bubble-64,327,bubble+65,463),255,105,fill=SAND,width=8)
        d.line((bubble+73,384,bubble+150,384),fill=SAND,width=6)
        d.polygon([(bubble+148,374),(bubble+165,384),(bubble+148,394)],fill=SAND)
        text(d,(512,547),"CELL MONOLAYER / MOVING AIR–LIQUID INTERFACE",18,CREAM,"bold")
        text(d,(514,581),"No stress magnitudes or velocity values inferred",17,MINT,"sans")
    elif mode=="surface":
        y=457
        d.rounded_rectangle((409,y,1204,y+102),radius=16,fill=(95,121,105),outline=MINT,width=4)
        # Individual active surface sites appear, no molecule identity invented.
        for n in range(23):
            x=431+n*32
            phase=math.sin(n*1.7+t*.7)
            if phase>-.2:
                d.line((x,y-2,x+9,y-40-12*phase),fill=SAND,width=4)
                d.ellipse((x+4,y-44-12*phase,x+14,y-33-12*phase),fill=SAND)
        text(d,(501,587),"FILM SURFACE / CONCEPTUAL REACTIVE-SITE MODEL",18,CREAM,"bold")
    elif mode in ("result","boundary"):
        pass

def full_scene(film,scene,i,t,art,region):
    canvas=background(art,i,t)
    d=ImageDraw.Draw(canvas)
    accent=int((i+t/CHAPTER)/8*(W-68))
    d.rectangle((37,69,W-37,71),fill=(61,98,95))
    d.rectangle((37,69,37+accent,71),fill=SAND)
    text(d,(39,30),"RUWAIDIX  /  RESEARCH CINEMA",15,MINT,"bold")
    text(d,(1078,30),f"{i+1:02d} / 08",15,SAND,"bold")
    # An authored schematic owns the canvas, with a smaller authentic figure
    # inset explicitly labelled as its source of conceptual orientation.
    if scene["mode"] in ("interface","surface"):
        pic,pos=source_panel(art,region,(959,90,1220,246))
        canvas.paste(pic,pos)
        d=ImageDraw.Draw(canvas)
        d.rectangle((pos[0]-1,pos[1]-1,pos[0]+pic.width+1,pos[1]+pic.height+1),outline=SAND,width=2)
        visual_layers(d,film,scene,t)
    else:
        # Figure is large, visible, and not overlaid by a fake chart.
        # Distinct shots can show the entire image or a clearly identified crop.
        if scene["mode"]=="opening":
            region=region or None
            dest=(488,113,1218,626)
        elif scene["mode"]=="closing":
            dest=(539,124,1190,604)
        elif scene["mode"]=="result":
            dest=(443,152,1213,621)
        elif scene["mode"]=="boundary":
            dest=(563,130,1214,607)
        else:
            dest=(438,115,1232,636)
        pic,pos=source_panel(art,region,dest)
        canvas.paste(pic,pos)
        d=ImageDraw.Draw(canvas)
        d.rectangle((pos[0]-3,pos[1]-3,pos[0]+pic.width+3,pos[1]+pic.height+3),outline=(200,174,140),width=2)
    # Smaller editorial words; figure dominates the viewport.
    bg_block=(28,133,414,629)
    d.rounded_rectangle(bg_block,16,fill=(15,41,44))
    text(d,(46,153),scene["eyebrow"].upper()[:31],13,SAND,"bold")
    y=220
    for title in scene["headline"]:
        text(d,(40,y),title,49,CREAM,"serif")
        y+=70
    if scene["mode"]=="result":
        label="SOURCE MEASUREMENT\nNOT SIMULATED"
    elif scene["mode"] in ("interface","surface"):
        label="SCHEMATIC MECHANICS\nNO FABRICATED DATA"
    else:
        label="PUBLISHED PRIMARY FIGURE\nSOURCE LINK IN CREDITS"
    for n,tline in enumerate(label.split("\n")):
        text(d,(46,555+n*25),tline,13,MINT,"bold")
    credit(d,film,scene,region is not None,scene["figure"])
    # Low-key cut transitions; avoid covering original data for most of scene.
    a=max(0,min(1,t/.52,(CHAPTER-t)/.52))
    if a<1:
        canvas=Image.blend(Image.new("RGB",(W,H),BG),canvas,a)
    return canvas

def synthesize(scenes,tmp,models):
    from kokoro_onnx import Kokoro
    tts=Kokoro(str(models/"kokoro-v1.0.fp16.onnx"),str(models/"voices-v1.0.bin"))
    clips=[];sr=0;stats=[]
    for i,scene in enumerate(scenes):
        wav,rate=tts.create(scene["narration"],voice="bm_george",speed=1.14,lang="en-gb")
        arr=np.asarray(wav,dtype=np.float32).flatten()
        if sr and rate!=sr:raise RuntimeError("TTS output rate changed")
        sr=rate;dur=len(arr)/sr
        if dur>CHAPTER-0.75:raise ValueError(f"Scene {i+1} spoken duration {dur:.2f}s > scene length. Rewrite; never truncate.")
        clips.append(arr);stats.append({"duration":round(dur,3),"words":len(scene["narration"].split())})
    audio=np.zeros(sr*CHAPTER*len(scenes),dtype=np.float32)
    for i,wav in enumerate(clips):
        start=round((i*CHAPTER+.65)*sr)
        audio[start:start+len(wav)]+=wav*.90
    # Quiet, non-licensed synthesized score. Never implies historic recording.
    t=np.arange(len(audio),dtype=np.float32)/sr
    pad=(.0045*np.sin(t*2*math.pi*55)+.003*np.sin(t*2*math.pi*82.4))
    audio=np.tanh(audio+pad)
    sf.write(tmp/"voice.wav",audio,sr,subtype="PCM_16")
    return stats

def vtt(scenes,stats,path):
    def tc(seconds):
        milli=round(max(0,seconds)*1000)
        return f"{milli//3600000:02}:{milli//60000%60:02}:{milli//1000%60:02}.{milli%1000:03}"
    parts=["WEBVTT",""]
    for i,scene in enumerate(scenes):
        word=scene["narration"].split()
        groups=[" ".join(word[j:j+7]) for j in range(0,len(word),7)]
        n=sum(len(s.split()) for s in groups);used=0
        start=i*CHAPTER+.65;duration=stats[i]["duration"]
        for part in groups:
            lo=start+duration*used/n;used+=len(part.split());hi=start+duration*used/n
            parts.extend([f"{tc(lo)} --> {tc(hi)}",part,""])
    path.write_text("\n".join(parts),encoding="utf8")

def render(film,info,models):
    scenes=info["scenes"]
    if len(scenes)!=8:raise ValueError("Eight purposeful chapter arguments required")
    with tempfile.TemporaryDirectory(prefix="ruwaidix-study-v4-") as scratch:
        tmp=Path(scratch)
        stats=synthesize(scenes,tmp,models)
        vtt(scenes,stats,tmp/"film.vtt")
        movies=[]
        for k,scene in enumerate(scenes):
            _PANELS.clear()
            src,region,ref=scene_camera(film,scene,k)
            out=tmp/f"scene-{k:02}.mp4"
            args=["ffmpeg","-hide_banner","-loglevel","error","-y","-f","image2pipe","-vcodec","mjpeg",
                  "-framerate",str(FPS),"-i","pipe:0","-an","-c:v","libx264","-preset","veryfast",
                  "-crf","23","-pix_fmt","yuv420p","-r",str(FPS),str(out)]
            pipe=subprocess.Popen(args,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
            try:
                for frame in range(FPS*CHAPTER):
                    img=full_scene(film,scene,k,frame/FPS,src,region)
                    b=io.BytesIO()
                    img.save(b,"JPEG",quality=83,subsampling=1)
                    pipe.stdin.write(b.getvalue())
            finally:
                pipe.stdin.close()
            if pipe.wait()!=0:raise RuntimeError("Rendering failed for scene "+str(k))
            movies.append(out)
            print("Film",film,"scene",k+1,"completed",flush=True)
        concat=tmp/"clips.txt"
        concat.write_text("".join(f"file '{p}'\n" for p in movies))
        OUT.mkdir(parents=True,exist_ok=True)
        target=OUT/(film+".mp4")
        run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(concat),
             "-i",str(tmp/"voice.wav"),"-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac",
             "-b:a","160k","-t",str(8*CHAPTER),"-movflags","+faststart",str(target)])
        seconds=float(json.loads(run(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(target)]))["format"]["duration"])
        if abs(seconds-120)>.30:raise RuntimeError("Unexpected film duration "+str(seconds))
        images=[]
        for s in scenes:
            pic=FIG/f"{film}-figure-{s['figure']:02}.jpg"
            images.append({"figure":s["figure"],"path":str(pic.relative_to(ROOT)),
                           "sha256":hashlib.sha256(pic.read_bytes()).hexdigest()})
        manifest={
          "title":info["title"],"id":film,"edition":"V4 study-figure-led documentary",
          "doi":info["doi"],"source":info["source"],"license":info["media_license"],
          "source_visual_limits":info["visual_thesis"],"source_figures":images,
          "original_figure_pixels_untouched":True,
          "separate_explanatory_animation":True,
          "new_science_fabricated":False,
          "duration_seconds":seconds,"sha256":hashlib.sha256(target.read_bytes()).hexdigest(),
          "human_review":"NOT APPROVED — listen, watch, verify panel identities and licensing before live embed",
          "narrator":"Kokoro ONNX, synthetic, not a real researcher narration",
          "chapters":[dict(s,tts_seconds=stats[i]["duration"]) for i,s in enumerate(scenes)]
        }
        (OUT/(film+".json")).write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
        (OUT/(film+".vtt")).write_bytes((tmp/"film.vtt").read_bytes())
        print("RENDER COMPLETE",film,target.stat().st_size,manifest["sha256"],flush=True)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--film",choices=["flow-chamber-method","pla-grafting"],required=True)
    args=parser.parse_args()
    cfg=json.loads(MANIFEST.read_text())["films"][args.film]
    render(args.film,cfg,ROOT/"film-models")
if __name__=="__main__":main()
