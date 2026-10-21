#!/usr/bin/env python3
"""Film 01, airway reopening. Deterministic time-seekable cinematic frames.

No synthetic scientific measurements, microscopy, clinical footage, or clinical efficacy.
The film reuses the verified existing narration and the archived original published
figure, while replacing earlier near-static cards with purpose-built moving scenes.
Prior masters and all public website routes are untouched.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
import shutil
import subprocess
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/films/series-v9-airway"
AUDIO_MASTER = ROOT / "assets/films/series-v7-pilots/airway-reopening.mp4"
CAPTIONS = ROOT / "assets/films/series-v7-pilots/airway-reopening.vtt"
FIGURE = ROOT / "assets/home-archive/figure-pulmonary-flow-chamber.jpg"
W, H, FPS, LENGTH = 1280, 720, 24, 84
FRAMES = FPS * LENGTH
INK = (11, 29, 34)
INK2 = (16, 46, 53)
WHITE = (242, 240, 229)
SEA = (132, 210, 193)
COPPER = (237, 162, 116)
HAZARD = (210, 101, 101)
MUTED = (127, 166, 164)
SOURCE = "10.1152/japplphysiol.00574.2020"
CHAPTER_START = [0.0, 10.375, 23.792, 36.875, 52.125, 68.667, 84.0]
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SANS_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"

def command(args):
    p = subprocess.run(args, capture_output=True, text=True)
    if p.returncode:
        raise RuntimeError(" ".join(map(str,args)) + "\n" + p.stderr[-3000:])
    return p.stdout

def smooth(x):
    u=max(0.,min(1.,x))
    return u*u*(3-2*u)

def clamp(x,lo=0.,hi=1.):
    return max(lo,min(hi,x))

def interp(a,b,p):
    return a+(b-a)*p

def font(size,style="sans"):
    name={"sans":SANS,"bold":SANS_BOLD,"serif":SERIF,"mono":MONO}[style]
    return ImageFont.truetype(name,size)

def title(draw,xy,s,sz=58,color=WHITE,style="serif",spacing=0):
    draw.text(xy,s,font=font(sz,style),fill=color,stroke_width=0,spacing=spacing)

def line(draw,coords,color,width=2):
    draw.line(coords,fill=color,width=width,joint="curve")

def rect(draw,xy,fill,rad=0,outline=None,width=1):
    if rad:draw.rounded_rectangle(xy,radius=rad,fill=fill,outline=outline,width=width)
    else:draw.rectangle(xy,fill=fill,outline=outline,width=width)

def circle(draw,x,y,r,fill=None,outline=None,width=2):
    draw.ellipse((int(x-r),int(y-r),int(x+r),int(y+r)),
        fill=fill,outline=outline,width=width)

def faded_text(im,xy,s,alpha,size=24,color=WHITE,style="sans"):
    alpha=clamp(alpha)
    if alpha<0.002:return
    txt=Image.new("RGBA",im.size,(0,0,0,0))
    dd=ImageDraw.Draw(txt)
    dd.text(xy,s,font=font(size,style),fill=(*color,round(alpha*255)))
    im.alpha_composite(txt)

def visual_background():
    im=Image.new("RGBA",(W,H),(*INK,255))
    px=im.load()
    # Quiet directional light; no random particles or generalized fog.
    for y in range(H):
        for x in range(W):
            v=max(0.,1-math.sqrt(((x-960)/1050)**2+((y-260)/660)**2))
            q=0.13*v
            px[x,y]=(round(INK[0]*(1-q)+INK2[0]*q),
                       round(INK[1]*(1-q)+INK2[1]*q),
                       round(INK[2]*(1-q)+INK2[2]*q),255)
    return im

def crop_contain(im,area=(150,143,1110,565)):
    """Contain source figure without changing its aspect ratio or cutting axes."""
    image=im.copy()
    x0,y0,x1,y1=area
    image.thumbnail((x1-x0,y1-y0),Image.Resampling.LANCZOS)
    return image,((x0+x1-image.width)//2,(y0+y1-image.height)//2)

def chapter(t):
    for j in range(6):
        if CHAPTER_START[j] <= t < CHAPTER_START[j+1]:
            return j,t-CHAPTER_START[j],CHAPTER_START[j+1]-CHAPTER_START[j]
    return 5,15.333,15.333

def epithelium(draw,t,front,ym=506,damaged=False):
    """A moving mechanical explanation, explicitly not microscopy or measured cells."""
    n=18; pitch=54; x0=148
    line(draw,[(x0-15,ym+57),(x0+pitch*n-17,ym+57)],MUTED,3)
    for i in range(n):
        x=x0+i*pitch
        stress=clamp(1-abs((x+22)-front)/132) if damaged else 0
        dy=stress*(9+4*math.sin(3*t+i*.7))
        y=ym+dy
        outline=tuple(round(interp(SEA[k],HAZARD[k],stress*.85)) for k in range(3))
        rect(draw,(int(x),int(y),int(x+45),int(y+51)),fill=(23,55,59),rad=13,outline=outline,width=2)
        circle(draw,x+23,y+28,8,fill=(88,142,141))
    line(draw,[(134,ym-7),(1109,ym-7)],(59,109,113),2)

def flow(draw,t,left=110,right=1170,top=198,bottom=500,front=None):
    # Interface drawn as a moving physical analogy, not a CFD simulation.
    rect(draw,(left,top,right,bottom),None,rad=12,outline=(63,112,118),width=2)
    for yy in (top+37,top+81,top+129):
        line(draw,[(left+26,yy),(right-20,yy)],(32,76,82),2)
    if front is None:
        front=interp(left+58,right-130,smooth(t))
    # Bubble front: a single large air–liquid meniscus.
    pts=[]
    for j in range(45):
        y=top+17+j*(bottom-top-41)/44
        rel=(y-(top+bottom)/2)/((bottom-top)/2)
        x=front+96*math.sqrt(max(0.,1-rel*rel))
        pts.append((int(x),int(y)))
    line(draw,pts,COPPER,7)
    for j in range(0,35,4):
        xx=int(front+13-j*9)
        if xx>left+18: line(draw,[(xx,top+15),(xx-8,bottom-15)],(35,62,69),2)
    return front

def watermark(draw,j):
    # Minimal identity and chapter context; not production metadata.
    title(draw,(68,50),"RUWAIDIX  /  RESEARCH CINEMA",16,SEA,"mono")
    line(draw,[(68,82),(1211,82)],(48,86,91),2)
    title(draw,(68,657),f"{j+1:02d}  /  06",16,MUTED,"mono")
    title(draw,(980,657),"A BREATH CAN INJURE",13,MUTED,"mono")
    # Progress motion ties the six sequences together.
    line(draw,[(68,691),(68+int(1142*(CHAPTER_START[j]/LENGTH)),691)],COPPER,3)

def scientific_figure(im,figure,t,chapter_no):
    d=ImageDraw.Draw(im)
    xshift=int(3*math.sin(t*.22))
    safe=(153+xshift,142,1128+xshift,568)
    card=(safe[0]-12,safe[1]-12,safe[2]+12,safe[3]+12)
    rect(d,card,(240,240,232),rad=10)
    scaled,pos=crop_contain(figure,safe)
    im.paste(scaled,pos,scaled if scaled.mode=="RGBA" else None)
    d=ImageDraw.Draw(im)
    line(d,[(124,210),(124,536)],COPPER,2)
    title(d,(142,588),"ORIGINAL PUBLISHED RESEARCH",17,SEA,"mono")
    title(d,(142,614),SOURCE,15,MUTED,"mono")
    # Figure is always fully visible and stationary relative to its backing card.
    return im

def frame(t,figure,bg):
    j,local,duration=chapter(t)
    p=local/duration
    im=bg.copy()
    d=ImageDraw.Draw(im)
    watermark(d,j)
    # Film-specific motion grammar: held silhouettes, measured wipes, moving
    # meniscus, source-figure containment, and constrained type animation.
    if j==0:
        front=interp(-310,1110,smooth((local-.6)/9))
        flow(d,local/9,top=245,bottom=480,front=front)
        title(d,(105,138),"A BREATH",80,WHITE,"serif")
        faded_text(im,(105,220),"CAN INJURE",smooth((local-1.8)/1.1),73,COPPER,"serif")
        d=ImageDraw.Draw(im)
        for i in range(18):
            x=125+i*55
            h=6+18*clamp(1-abs(front-x)/300)
            line(d,[(x,615),(x,615-h)],SEA if x>front else COPPER,3)
        faded_text(im,(110,562),"The invisible forces of airway reopening",smooth((local-4.0)/1.0),23,WHITE)
    elif j==1:
        front=interp(140,1020,smooth((local-1.0)/(duration-2.2)))
        flow(d,p,top=185,bottom=490,front=front)
        epithelium(d,local,front,ym=492,damaged=True)
        title(d,(122,112),"A moving boundary",52,WHITE,"serif")
        faded_text(im,(124,599),"AIR  /  LIQUID  /  CULTURED CELLS",smooth(local/1.4),18,SEA,"mono")
        line(d,[(108,588),(1172,588)],(50,95,95),2)
    elif j==2:
        if local<duration*.67:
            scientific_figure(im,figure,local,j)
            faded_text(im,(844,105),"THE CHAMBER",smooth(local/1.2),17,COPPER,"mono")
        else:
            d=ImageDraw.Draw(im)
            title(d,(132,127),"Make injury",67,WHITE,"serif")
            title(d,(132,208),"measurable.",67,WHITE,"serif")
            values=["PARALLEL-PLATE CHAMBER","FLUORESCENT VIABILITY ASSAY","CELL MORPHOLOGY"]
            for k,s in enumerate(values):
                entry=smooth((local-duration*.66-k*.28)/.48)
                x=int(interp(160,200,entry))
                rect(d,(x,355+k*66,1035,406+k*66),(22,55,62),rad=8)
                faded_text(im,(x+30,369+k*66),s,entry,19,SEA,"mono")
    elif j==3:
        title(d,(105,112),"Before the bubble arrives",50,WHITE,"serif")
        # Experimental grouping only; no effect-size implication.
        f=smooth((local-1.2)/1.1)
        lab=[("UNPRETREATED",159,479),("DEXAMETHASONE",482,802),
             ("TRANS-DEHYDROANDROSTERONE",805,1125)]
        for index,(s,x0,x1) in enumerate(lab):
            rect(d,(x0,247,x1,496),(19,47,55),rad=14,outline=(72,107,111),width=2)
            for a in range(4):
                x=x0+55+a*59
                y=370+8*math.sin(local*.7+a*.3)
                circle(d,x,y,20,None,SEA,2)
                circle(d,x,y,7,(86,148,143))
            if index==0:
                faded_text(im,(x0+16,519),s,f,15,WHITE,"mono")
            elif index==1:
                faded_text(im,(x0+25,519),s,f,15,WHITE,"mono")
            else:
                # Long label wrapped so no text overflows its assigned column.
                faded_text(im,(x0+16,511),"TRANS-",f,16,WHITE,"mono")
                faded_text(im,(x0+16,535),"DEHYDROANDROSTERONE",f,12,WHITE,"mono")
        title(d,(159,608),"One controlled exposure. Different preconditions.",21,SEA,"sans")
        x=interp(155,1120,smooth((local-5)/(duration-6)))
        line(d,[(x,230),(x,490)],COPPER,3)
    elif j==4:
        title(d,(109,129),"What the cells showed",55,WHITE,"serif")
        # Qualitative research conclusion only. No invented bars or n values.
        epithelium(d,local,interp(245,1094,smooth(local/(duration-.6))),ym=352,damaged=True)
        faded_text(im,(133,540),"BUBBLE EXPOSURE INJURED CELLS",smooth(local/1.4),22,WHITE,"mono")
        faded_text(im,(133,581),"PRETREATMENT REDUCED MEASURED CELL DEATH IN VITRO",
                   smooth((local-3.3)/1.5),17,SEA,"mono")
        if local>duration*.62:
            line(d,[(125,528),(1120,528)],COPPER,2)
    else:
        # Claim boundary precedes the paper end frame.
        if local<duration*.54:
            title(d,(110,164),"A culture chamber",62,WHITE,"serif")
            title(d,(110,248),"is not a patient.",62,COPPER,"serif")
            line(d,[(112,356),(112,498)],SEA,3)
            faded_text(im,(144,379),"Mechanism is not clinical efficacy.",smooth(local/2),29,WHITE)
            faded_text(im,(144,437),"A question for translation, not a prescription.",
                       smooth((local-2.0)/1.0),20,SEA)
        else:
            scientific_figure(im,figure,local,j)
            d=ImageDraw.Draw(im)
            rect(d,(80,115,1080,175),INK,rad=6)
            title(d,(104,128),"THE EXPERIMENT REMAINS THE EVIDENCE",20,COPPER,"mono")
    # Edit points use motivated matte/shutter interruptions, not crossfades.
    # Brief black flashes are avoided for photosensitive viewers.
    d=ImageDraw.Draw(im)
    edge=smooth(local/.45)*smooth((duration-local)/.38)
    if edge<1:
        matte=Image.new("RGBA",(W,H),(*INK,int(255*(1-edge))))
        im=Image.alpha_composite(im,matte)
    return im.convert("RGB")

def probe(path):
    return json.loads(command(["ffprobe","-v","error","-show_format",
         "-show_streams","-of","json",str(path)]))

def validate():
    assert AUDIO_MASTER.is_file() and FIGURE.is_file() and CAPTIONS.is_file()
    assert len(CHAPTER_START)==7 and CHAPTER_START[-1]==84.
    assert CAPTIONS.read_text(encoding="utf8").startswith("WEBVTT")
    with Image.open(FIGURE) as orig:
        assert orig.width>=400 and orig.height>=250
    info=probe(AUDIO_MASTER)
    assert any(x["codec_type"]=="audio" for x in info["streams"])
    assert abs(float(info["format"]["duration"])-LENGTH)<.3
    return info

def render(quick=False):
    validate()
    OUT.mkdir(parents=True,exist_ok=True)
    with Image.open(FIGURE) as im: figure=im.convert("RGBA")
    background=visual_background()
    movie=OUT/"airway-reopening.mp4"
    poster=OUT/"airway-reopening.webp"
    sheet=Image.new("RGB",(1200,1080),INK)
    count=(FRAMES if not quick else FPS*7)
    frame_ids={int((CHAPTER_START[i]+min(3.7,(CHAPTER_START[i+1]-CHAPTER_START[i])*.5))*FPS):i
               for i in range(6)}
    if quick:count=FPS*7
    with tempfile.TemporaryDirectory(prefix="ruwaidix-airway-v9-") as work:
        temp_movie=Path(work)/"raw-video.mp4"
        args=["ffmpeg","-hide_banner","-loglevel","error","-y",
              "-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}",
              "-r",str(FPS),"-i","-",
              "-an","-c:v","libx264","-preset","fast","-crf","20",
              "-pix_fmt","yuv420p","-movflags","+faststart",str(temp_movie)]
        proc=subprocess.Popen(args,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
        try:
            for k in range(count):
                t=k/FPS
                img=frame(t,figure,background)
                if k in frame_ids:
                    ci=frame_ids[k]
                    thumb=img.resize((600,338),Image.Resampling.LANCZOS)
                    sheet.paste(thumb,((ci%2)*600,(ci//2)*360))
                if k==round(FPS*2):
                    img.save(poster,quality=90,method=6)
                proc.stdin.write(img.tobytes())
            proc.stdin.close()
            err=proc.stderr.read().decode("utf8","replace")
            rc=proc.wait()
            if rc:raise RuntimeError("Frame render failed: "+err[-2000:])
        except BaseException:
            proc.kill()
            raise
        if quick:
            shutil.copyfile(temp_movie,movie)
        else:
            # Existing synchronized voice narration, mastered without time shifts.
            command(["ffmpeg","-hide_banner","-loglevel","error","-y",
                "-i",str(temp_movie),"-i",str(AUDIO_MASTER),
                "-map","0:v:0","-map","1:a:0","-t",str(LENGTH),
                "-c:v","copy","-af","loudnorm=I=-18:LRA=9:TP=-2",
                "-c:a","aac","-b:a","192k","-movflags","+faststart",
                str(movie)])
    sheet.save(OUT/"airway-reopening.contact.webp",quality=89,method=6)
    shutil.copyfile(CAPTIONS,OUT/"airway-reopening.vtt")
    info=probe(movie)
    dur=float(info["format"]["duration"])
    assert (6.9<dur<7.2) if quick else abs(dur-LENGTH)<.15
    if not quick:assert {"audio","video"}<={x["codec_type"] for x in info["streams"]}
    record={
      "title":"A Breath Can Injure",
      "edition":"V9 / original cinematic animated research cut",
      "seconds":dur,"fps":FPS,"pixel_dimensions":[W,H],
      "original_audio":str(AUDIO_MASTER.relative_to(ROOT)),
      "audio_timing":"original untouched timeline; loudness re-master only",
      "original_captions":str(CAPTIONS.relative_to(ROOT)),
      "primary_paper_doi":SOURCE,
      "original_figure":str(FIGURE.relative_to(ROOT)),
      "figure_policy":"entire archival figure contained without cropping or replaced evidence",
      "scenes":["An unseen force","An advancing bubble","The experimental chamber",
                "Preconditioning cells","The observed result","Not a patient"],
      "source_boundary":"Original authored diagrams are illustrative; no invented data or clinical effect sizes",
      "music_policy":"preserve original program sound; no stock library or fake experiment sounds",
      "motion_engine":"deterministic frame=f(time); no temporal randomness; all math-based",
      "review_status":"cinematic REVIEW master — human listening and rights check pending",
      "mp4_sha256":hashlib.sha256(movie.read_bytes()).hexdigest()
    }
    (OUT/"airway-reopening.json").write_text(json.dumps(record,indent=2)+"\n",encoding="utf8")
    print(json.dumps({"mp4":str(movie),"duration":dur,"bytes":movie.stat().st_size,
       "sha256":record["mp4_sha256"],"review_status":record["review_status"]}))
    
if __name__=="__main__":
    cli=argparse.ArgumentParser()
    cli.add_argument("--validate-only",action="store_true")
    cli.add_argument("--quick",action="store_true")
    opts=cli.parse_args()
    if opts.validate_only:validate();print("Validated source media and narration")
    else:render(quick=opts.quick)
