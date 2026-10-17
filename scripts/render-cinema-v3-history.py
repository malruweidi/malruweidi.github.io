#!/usr/bin/env python3
"""Source-first historical documentary. 8 wholly different motion scenes.

NO sourced figure is emulated as a facsimile; no historical photograph is
generated; Arabic quotation comes from the author's cited transcription.

Requires FFmpeg, Kokoro ONNX, Pillow (RAQM), Noto Naskh Arabic, NumPy, SoundFile.
Produced film is explicitly a human-review DRAFT.
"""
import argparse, hashlib, io, json, math, subprocess, tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont, features

ROOT=Path(__file__).resolve().parents[1]
DIRECTION=ROOT/"assets/films/v3/making-medicines-keep.storyboard.json"
DEST=ROOT/"assets/films/v3/rendered"
W,H,FPS,DURATION=1280,720,24,16
BG=(18,40,44); CREAM=(240,230,209); TEAL=(132,186,170)
COPPER=(224,157,111); GREY=(137,160,152); FAINT=(52,81,79)
REGULAR="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
ARABIC="/usr/share/fonts/truetype/noto/NotoNaskhArabic-Regular.ttf"

def font(size=20,bold=False,serif=False,arabic=False):
    path=ARABIC if arabic else SERIF if serif else BOLD if bold else REGULAR
    return ImageFont.truetype(path,size,layout_engine=ImageFont.Layout.RAQM)

def smooth(x):
    a=max(0.0,min(1.0,x))
    return a*a*(3-2*a)

def tween(a,b,t):return a+(b-a)*smooth(t)
def label(d,xy,text,size=18,color=CREAM,bold=False,serif=False):
    d.text(xy,text,font=font(size,bold=bold,serif=serif),fill=color)

def wrap(d,text,face,maxwidth,maxlines=3):
    words=text.split();lines=[];cur=""
    for word in words:
        trial=(cur+" "+word).strip()
        if cur and d.textbbox((0,0),trial,font=face)[2]>maxwidth:
            lines.append(cur);cur=word
        else:cur=trial
    if cur:lines.append(cur)
    if len(lines)>maxlines:raise ValueError("Overlong typography; author a shorter title: "+text)
    return lines

def panel(d,box,outline=FAINT,fill=(23,52,55),r=18,w=2):
    d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=w)

def textblock(d,x,y,text,width=515,size=28,color=CREAM,lineheight=41,maxlines=3,serif=False):
    f=font(size,serif=serif)
    lines=wrap(d,text,f,width,maxlines)
    for i,s in enumerate(lines): d.text((x,y+i*lineheight),s,font=f,fill=color)
    return len(lines)*lineheight

def moving_node(d,x,y,amount,textstr,active=False):
    a=10+20*smooth(amount)
    d.ellipse((x-a,y-a,x+a,y+a),fill=COPPER if active else FAINT,outline=TEAL,width=3)
    if amount>.1:label(d,(x-38,y+46),textstr,size=15,color=COPPER if active else CREAM)

def line(d,a,b,col=FAINT,width=3): d.line((*a,*b),fill=col,width=width)

def base(scene,i,t):
    # Compositional discipline: persistent editorial margin, zero fake archive scans.
    im=Image.new("RGB",(W,H),BG);d=ImageDraw.Draw(im)
    for y in range(H):
        frac=y/H
        d.line((0,y,W,y),fill=(int(18+8*frac),int(40+6*frac),int(44+5*frac)))
    d.rectangle((65,73,119,79),fill=COPPER)
    label(d,(66,42),"RUWAIDIX  /  PHARMACY & MATERIAL HISTORY",14,TEAL,True)
    label(d,(64,96),scene["eyebrow"].upper(),16,COPPER,True)
    textblock(d,64,177,scene["heading"],width=521,size=37,lineheight=51,maxlines=3,serif=True)
    d.line((64,495,565,495),fill=FAINT,width=2)
    textblock(d,64,513,scene["margin"],width=518,size=15,color=GREY,lineheight=24,maxlines=4)
    label(d,(64,673),f"SOURCE-CRITICAL FILM  /  CHAPTER {i+1:02d} OF 08",12,TEAL,True)
    label(d,(914,673),"NOT AN HISTORICAL RECONSTRUCTION",11,COPPER,True)
    d.line((64,654,1215,654),fill=FAINT,width=2)
    d.line((64,654,64+1151*((i+t)/8),654),fill=COPPER,width=3)
    return im,d

def shot(d,scene,t):
    kind=scene["visual"]
    if kind=="temporal-friction":
        label(d,(660,178),"CAIRO  ·  c. 1260",38,COPPER,False,True)
        label(d,(664,234),"COMPOUNDING",20,CREAM,True)
        processes=[("PREPARATION",719),("STORAGE",917),("USE",1125)]
        line(d,(704,397),(1146,397),TEAL,5)
        for k,(name,x) in enumerate(processes):
            moving_node(d,x,397,3*t-k*.5,name,t>(k+0.8)/3)
        label(d,(666,499),"Could a preparation remain usable?",19,CREAM)
    elif kind=="documents":
        names=[("SHOP HANDBOOK","Minhāj al-dukkān"),("HOSPITAL FORMULARY","Al-Dustūr"),("PRESCRIPTION","Genizah"),("MARKET WARNINGS","Ḥisba literature")]
        for k,(kind,title) in enumerate(names):
            x=671+(k%2)*276;y=207+(k//2)*178
            dx=int((1-smooth(t*4-k*.8))*75)
            panel(d,(x+dx,y,x+250+dx,y+150),outline=COPPER if k==min(3,int(4*t)) else FAINT)
            label(d,(x+dx+14,y+25),kind,14,TEAL,True)
            label(d,(x+dx+14,y+70),title,17,CREAM)
            for n in range(2):line(d,(x+dx+14,y+108+n*16),(x+dx+170,y+108+n*16),FAINT,2)
    elif kind=="arabic-quote":
        panel(d,(642,195,1220,492),outline=TEAL,fill=(28,57,58))
        label(d,(673,220),"AUTHOR'S TRANSCRIPTION FROM THE PRINTED TEXT",13,COPPER,True)
        arabic=scene["arabic"]
        if not features.check("raqm"):raise RuntimeError("RAQM required for correct Arabic shaping")
        f=font(39,arabic=True)
        bbox=d.textbbox((0,0),arabic,font=f,direction="rtl",language="ar")
        if bbox[2]>500: f=font(30,arabic=True)
        d.text((1175,270),arabic,font=f,fill=CREAM,anchor="ra",direction="rtl",language="ar")
        line(d,(675,385),(675+490*smooth(t),385),COPPER,4)
        textblock(d,673,411,scene["translation"],width=490,size=19,color=CREAM,lineheight=29)
    elif kind=="process":
        steps=scene["steps"]
        label(d,(657,173),"A RECIPE IS A SEQUENCE OF JUDGMENTS",18,COPPER,True)
        for k,p in enumerate(steps):
            x=660+(k%2)*264;y=213+(k//2)*99
            if k==4:x=791;y=511
            level=smooth(t*5-k*.83)
            panel(d,(x,y,x+247,y+77),outline=COPPER if level>.8 else FAINT,r=11)
            label(d,(x+13,y+16),f"{k+1:02d}",15,COPPER,True)
            label(d,(x+47,y+19),p,16,CREAM)
            d.line((x+47,y+57,x+48+175*level,y+57),fill=TEAL,width=4)
    elif kind=="repair":
        label(d,(667,190),"TASAKKUR   →   HOT WATER   →   QIWĀM",20,COPPER,True)
        panel(d,(652,239,924,454),outline=TEAL)
        panel(d,(954,239,1212,454),outline=COPPER)
        for ix in range(6):
            for iy in range(5):
                x=689+ix*39+19*smooth(t)
                y=279+iy*34+15*math.sin(t*6+ix)*smooth(t)
                if t<.42: x=689+ix*39;y=279+iy*34
                d.ellipse((x-5,y-5,x+5,y+5),fill=TEAL)
        for k in range(14):
            x=1003+((k*41+210*t)%166)
            y=274+((k*29+135*t)%139)
            d.ellipse((x-4,y-4,x+4,y+4),fill=COPPER)
        label(d,(695,472),"CRYSTAL CONDITION",14,TEAL,True)
        label(d,(983,472),"RESTORATION SCHEME",14,COPPER,True)
        label(d,(674,539),"Text records a bounded repair rule. No process data are simulated.",14,GREY)
    elif kind=="substitution":
        nodes=[("NEEDED","Ingredient available?"),("COMPARE","Action · suitability"),("DECIDE","Not equivalence testing")]
        for k,(tag,main) in enumerate(nodes):
            y=214+k*125
            panel(d,(688,y,1166,y+99),outline=COPPER if int(t*3)==k else FAINT)
            label(d,(715,y+14),tag,13,COPPER,True)
            label(d,(715,y+44),main,19,CREAM)
            if k<2:
                line(d,(925,y+99),(925,y+111),TEAL,3)
                d.polygon([(918,y+109),(933,y+109),(925,y+122)],fill=TEAL)
    elif kind=="two-documents":
        panel(d,(654,224,920,473),outline=TEAL)
        panel(d,(949,224,1214,473),outline=COPPER)
        label(d,(680,245),"PRESCRIPTION",18,TEAL,True)
        label(d,(976,245),"INVENTORY?",18,COPPER,True)
        label(d,(679,296),"Daybreak:",16,GREY)
        label(d,(679,324),"Electuary",18,CREAM)
        label(d,(679,387),"Fourth hour:",16,GREY)
        label(d,(679,415),"Decoction",18,CREAM)
        for k in range(5):
            line(d,(983,310+k*25),(1142-10*k,310+k*25),FAINT,3)
        line(d,(927,347),(945,347),COPPER,3)
        label(d,(700,528),"A prescription documents demand, not proof that a shop filled it.",15,GREY)
    elif kind=="reliability":
        names=["IDENTITY","PROCESS","TIME","EQUIVALENCE","TRUST"]
        cx,cy=929,341
        for k,name in enumerate(names):
            theta=(-math.pi/2)+k*2*math.pi/5
            rad=180
            x=cx+rad*math.cos(theta);y=cy+rad*math.sin(theta)
            d.line((cx,cy,x,y),fill=FAINT,width=3)
            node=smooth(6*t-.25*k)
            d.ellipse((x-19*node,y-19*node,x+19*node,y+19*node),fill=COPPER if k==0 else TEAL)
            label(d,(x-64,y+32),name,15,CREAM,True)
        d.ellipse((cx-57,cy-57,cx+57,cy+57),fill=(31,71,69),outline=COPPER,width=4)
        label(d,(cx-42,cy-7),"KEEP",25,CREAM,True)
        label(d,(642,573),"ACCEPTED 15 OCTOBER 2026  /  NOT YET PUBLISHED",13,COPPER,True)
    else:raise ValueError("Unknown visual mode "+kind)

def paint(scene,index,t):
    image,d=base(scene,index,t)
    shot(d,scene,t)
    return image

def check(cmd):
    p=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    if p.returncode:raise RuntimeError(" ".join(map(str,cmd))+"\n"+p.stderr[-2200:])
    return p.stdout

def make_scene(scene,index,dest):
    count=DURATION*FPS
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-y","-f","image2pipe","-framerate",str(FPS),
         "-vcodec","mjpeg","-i","pipe:0","-an","-c:v","libx264","-preset","veryfast","-crf","22",
         "-r",str(FPS),"-pix_fmt","yuv420p","-movflags","+faststart",str(dest)]
    process=subprocess.Popen(cmd,stdin=subprocess.PIPE,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    try:
        for i in range(count):
            pic=paint(scene,index,i/(count-1))
            blob=io.BytesIO()
            pic.save(blob,format="JPEG",quality=83,subsampling=0)
            process.stdin.write(blob.getvalue())
    finally:process.stdin.close()
    err=process.stderr.read().decode("utf8","replace")
    if process.wait()!=0:raise RuntimeError("Failed shot "+scene["key"]+"\n"+err[-2000:])

def timecode(seconds):
    milliseconds=int(round(seconds*1000))
    return f"{milliseconds//3600000:02d}:{(milliseconds//60000)%60:02d}:{(milliseconds//1000)%60:02d}.{milliseconds%1000:03d}"

def voices(scenes,models,audio,vtt):
    from kokoro_onnx import Kokoro
    instance=Kokoro(str(models/"kokoro-v1.0.fp16.onnx"),str(models/"voices-v1.0.bin"))
    samples=[];rate=None;captions=["WEBVTT",""]
    for index,scene in enumerate(scenes):
        data,r=instance.create(scene["narration"],voice="bm_george",speed=1.1,lang="en-gb")
        sound=np.asarray(data,dtype=np.float32).flatten()
        rate=r if rate is None else rate
        if r!=rate:raise ValueError("Varying TTS sampling rate")
        if len(sound)>rate*(DURATION-.8):
            raise ValueError("Narration longer than 16-second shot, scene "+scene["key"]+
                             "; rewrite more tightly rather than speeding the voice")
        result=np.zeros(int(rate*DURATION),dtype=np.float32)
        start=int(rate*.7)
        result[start:start+len(sound)]=np.tanh(sound*.8)
        samples.append(result)
        # Sentence-level timestamps. Human listening and phoneme alignment still pending.
        begin=index*DURATION+.7
        end=begin+len(sound)/rate
        captions.extend([timecode(begin)+" --> "+timecode(end),scene["narration"],""])
    joined=np.concatenate(samples)
    sf.write(audio,joined,rate,subtype="PCM_16")
    vtt.write_text("\n".join(captions),encoding="utf8")
    return rate

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--validate-only",action="store_true")
    ap.add_argument("--preview-only",action="store_true")
    ap.add_argument("--models",default="film-models")
    opts=ap.parse_args()
    entry=json.loads(DIRECTION.read_text(encoding="utf8"))
    scenes=entry["scenes"]
    if len(scenes)!=8 or len({s["key"] for s in scenes})!=8:raise ValueError("Eight individually authored shots required")
    if len({s["visual"] for s in scenes})!=8:raise ValueError("One distinct motion implementation per shot")
    if not features.check("raqm"):raise RuntimeError("Pillow RAQM Arabic shaping is mandatory")
    if not Path(ARABIC).is_file():raise FileNotFoundError(ARABIC)
    # A composite contact sheet of actual authored frames makes superficial filler visible
    # before allowing the MP4 renderer to run.
    review=Image.new("RGB",(4*480,2*270),BG)
    for index,scene in enumerate(scenes):
        frame=paint(scene,index,.72).resize((480,270),Image.Resampling.LANCZOS)
        review.paste(frame,((index%4)*480,(index//4)*270))
    DEST.mkdir(parents=True,exist_ok=True)
    review.save(DEST/"making-medicines-keep-v3-review.jpg",quality=91,subsampling=0)
    if opts.validate_only or opts.preview_only:
        print("VALIDATED: 8 different visuals, exact source-notes, shaped Arabic and contact-sheet preview.")
        return
    with tempfile.TemporaryDirectory(prefix="ruwaidix-history-v3-") as temp:
        folder=Path(temp)
        clips=[]
        for i,scene in enumerate(scenes):
            shot_file=folder/f"scene-{i+1:02d}.mp4"
            make_scene(scene,i,shot_file);clips.append(shot_file)
            print("Rendered",i+1,scene["key"],flush=True)
        seq=folder/"clips.txt"
        seq.write_text("".join("file '"+str(p)+"'\n" for p in clips),encoding="utf8")
        picture=folder/"picture.mp4"
        check(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0",
               "-i",str(seq),"-c","copy",str(picture)])
        voice=folder/"narration.wav"
        cap=DEST/"making-medicines-keep-v3.vtt"
        voices(scenes,(ROOT/opts.models).resolve(),voice,cap)
        movie=DEST/"making-medicines-keep-v3.mp4"
        check(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(picture),"-i",str(voice),
               "-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac",
               "-b:a","160k","-af","loudnorm=I=-18:TP=-2:LRA=11","-t",str(len(scenes)*DURATION),
               "-movflags","+faststart",str(movie)])
        if movie.stat().st_size>92_000_000:raise RuntimeError("Too large to store as a GitHub source asset")
        checksum=hashlib.sha256(movie.read_bytes()).hexdigest()
        meta={"movie":"making-medicines-keep-v3.mp4","status":"DRAFT—human scientific, Arabic pronunciation, image and creative review pending",
              "sha256":checksum,"runtime_seconds":len(scenes)*DURATION,
              "image_policy":"NONE of the authentic manuscript photographs has been sourced or silently fabricated; typeset source quotations and analytical diagrams only",
              "visuals":[{"scene":s["key"],"method":s["visual"],"source":s["sources"],"disclaimer":s["margin"]} for s in scenes],
              "narration":"Kokoro open synthetic voice, per-scene time bounds; sentence subtitles approximate acoustic timing",
              "link":"https://www.qdl.qa/en/archive/81055/vdc_100023441781.0x000001"}
        (DEST/"making-medicines-keep-v3.json").write_text(json.dumps(meta,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
        print("RENDER SUCCESS",movie,checksum)
if __name__=="__main__":main()
