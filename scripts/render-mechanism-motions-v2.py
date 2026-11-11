#!/usr/bin/env python3
"""Four original, clearly disclosed animated scientific explanations for Ruwaidix.
They are not photographs of the author's laboratory or period historical footage.
All frame art is authored locally with Pillow; FFmpeg creates silent H.264 inserts.
"""
import argparse
import hashlib
import json
import math
import shutil
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/motion-v2"
W,H,FPS=1280,720,24
BLUE=(13,37,45)
INK=(242,238,224)
MINT=(141,196,179)
AMBER=(220,165,111)
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
CLIPS={
"airway-interface":{
"title":"Airway reopening: a moving liquid boundary",
"source":"Al-Ruweidi et al., J Appl Physiol 130, 1143–1151 (2021), doi:10.1152/japplphysiol.00574.2020",
"disclosure":"Original mechanistic illustration of the moving air–liquid boundary; not the experiment's recorded video, geometry, scale, or measurements",
},
"niosomes-nebulization":{
"title":"The nebulization challenge",
"source":"Author's ongoing master's research into inhalable dexamethasone-containing niosomal vesicles",
"disclosure":"Original process explanation; does not assert that any vesicle survived or failed nebulization; no measured size or deposition data",
},
"histology-interface":{
"title":"When agarose and paraffin separate",
"source":"Owner-supplied photographs of unsuccessful zebrafish specimen embedding and microtomy",
"disclosure":"Original mechanism hypothesis based on observed block separation; does not claim that polymer interface chemistry or failure mechanism was proven",
},
"historical-syrup":{
"title":"Consistency, storage, crystallization",
"source":"Making Medicines Keep: Syrups, Substitution, and Pharmaceutical Reliability in Ayyubid-Mamluk Cairo (accepted 15 October 2026)",
"disclosure":"Illustrative material sequence, not period footage, a recipe reconstruction, chemical time-lapse, or evidence of a particular Cairo shop",
}
}
def ft(size=22,bold=False):
    return ImageFont.truetype(BOLD if bold else FONT,size)
def ease(t):
    x=max(0.0,min(1.0,t))
    return x*x*(3.0-2.0*x)
def line_text(draw,xy,content,size=20,color=INK,bold=False):
    draw.text(xy,content,font=ft(size,bold),fill=color)
def bg(title,slug):
    im=Image.new("RGB",(W,H),BLUE)
    d=ImageDraw.Draw(im)
    for y in range(H):
        p=y/H
        d.line(((0,y),(W,y)),fill=(int(10+12*p),int(37+15*p),int(43+12*p)))
    for y in range(132,598,40):d.line(((64,y),(1216,y)),fill=(29,65,69),width=1)
    d.rectangle((62,64,116,68),fill=AMBER)
    line_text(d,(62,80),"RUWAIDIX  /  ORIGINAL SCIENTIFIC MOTION",16,INK,True)
    line_text(d,(62,141),title,32,INK,True)
    d.line(((62,610),(1218,610)),fill=(81,120,122),width=2)
    line_text(d,(62,632),"CONCEPTUAL ANIMATION  •  NOT SOURCE FOOTAGE OR EXPERIMENTAL DATA",17,(177,207,194))
    line_text(d,(1120,676),slug.upper().replace("-","  /  "),13,AMBER)
    return im,d

def airway(im,d,t):
    x=235+690*ease(t)
    d.rounded_rectangle((92,245,1180,520),radius=22,outline=(141,181,175),width=6)
    d.rectangle((106,265,1166,447),fill=(28,72,78))
    for k in range(15):
        c=145+k*69
        d.rounded_rectangle((c,465,c+55,516),radius=19,fill=(80,126,126),outline=(162,194,180),width=3)
        d.ellipse((c+20,482,c+36,498),fill=(40,74,83))
    d.ellipse((int(x-118),270,int(x+118),449),fill=(18,42,48),outline=AMBER,width=7)
    d.arc((int(x-120),271,int(x+120),448),310,50,fill=(237,194,126),width=9)
    d.line(((int(x),231),(int(x),256)),fill=AMBER,width=3)
    line_text(d,(max(95,min(int(x)-145,920)),208),"MOVING AIR–LIQUID BOUNDARY",17,AMBER,True)
    line_text(d,(135,540),"EPITHELIAL CELL MONOLAYER   /   SIMPLIFIED",20,MINT,True)
    for k in range(3):
        cx=int(x-130-k*62)
        if 130<cx<1150:
            d.line(((cx,402),(cx+24,432)),fill=(225,177,120),width=3)

def niosome(im,d,t):
    d.rounded_rectangle((100,242,440,520),radius=22,outline=(106,163,153),width=3)
    d.rounded_rectangle((474,265,755,490),radius=22,outline=(197,166,117),width=3)
    d.rounded_rectangle((789,242,1152,520),radius=22,outline=(106,163,153),width=3)
    for x,label in ((140,"FORMULATION"),(517,"NEBULIZATION"),(842,"WHAT EMERGES?")):
        line_text(d,(x,272),label,18,INK,True)
    x,y=275,396
    d.ellipse((x-82,y-82,x+82,y+82),outline=AMBER,width=13)
    d.ellipse((x-68,y-68,x+68,y+68),outline=MINT,width=6)
    for k in range(11):
        a=2*math.pi*k/11
        px=x+69*math.cos(a);py=y+69*math.sin(a)
        d.ellipse((px-5,py-5,px+5,py+5),fill=(238,192,133))
    zz=ease(t)
    d.line(((440,390),(505,390)),fill=AMBER,width=6)
    d.polygon([(505,390),(489,379),(489,401)],fill=AMBER)
    for i in range(14):
        rx=570+156*zz*(.65+.15*(i%3))
        ry=340+(i%7)*18+10*math.sin(9*t+i)
        r=5+i%4
        d.ellipse((rx-r,ry-r,rx+r,ry+r),fill=(162,206,186))
    d.line(((758,390),(807,390)),fill=AMBER,width=6)
    d.polygon([(807,390),(791,379),(791,401)],fill=AMBER)
    cx,cy=972,395
    radius=40+20*math.sin(t*math.pi)**2
    d.ellipse((cx-radius,cy-radius,cx+radius,cy+radius),outline=MINT,width=4)
    line_text(d,(835,535),"MORPHOLOGY & DELIVERY MUST BE MEASURED",15,AMBER)

def histology(im,d,t):
    s=ease(t)
    left=240-int(110*s); right=665+int(96*s)
    d.rectangle((left,287,left+402,474),fill=(104,153,144),outline=(204,223,199),width=5)
    d.rectangle((right,287,right+402,474),fill=(170,140,104),outline=(239,208,159),width=5)
    for k in range(4):
        px=left+75+k*75
        d.ellipse((px,342,px+30,366),outline=(38,79,78),width=4)
    line_text(d,(left+125,496),"AGAROSE",22,MINT,True)
    line_text(d,(right+146,496),"PARAFFIN",22,AMBER,True)
    blade_y=234-33*math.sin(math.pi*t)
    d.polygon([(650,blade_y),(870,blade_y),(761,blade_y+46)],fill=(208,210,200),outline=(238,241,225))
    line_text(d,(82,555),"OBSERVATION: THE TWO MATERIALS SEPARATED DURING MICROTOMY",18,INK)
    if s>.3:
        d.line(((649,283),(649,475)),fill=(229,130,101),width=4)

def syrup(im,d,t):
    d.ellipse((340,487,930,542),fill=(25,44,45))
    d.rounded_rectangle((418,265,858,497),radius=24,outline=(207,174,121),width=9)
    d.rectangle((433,330,846,485),fill=(141,75,39))
    for i in range(30):
        px=445+i*13
        y=335+7*math.sin(i*.65+t*10)
        d.line(((px,y),(px+13,337+7*math.sin((i+1)*.65+t*10))),fill=(232,153,74),width=4)
    count=int(18*ease(max(0,(t-.42)/.58)))
    for i in range(count):
        x=470+(i*37)%330;y=384+(i*23)%80
        d.polygon(((x,y-8),(x+7,y),(x,y+8),(x-7,y)),fill=(246,210,145),outline=(253,235,196))
    d.line(((570,252),(570,300)),fill=(225,180,129),width=6)
    line_text(d,(453,548),"CONCENTRATION   ·   CONSISTENCY   ·   STORAGE",19,AMBER,True)
    line_text(d,(112,238),"ILLUSTRATION OF A PHYSICAL PROBLEM, NOT A RECIPE",17,MINT)

SCENES={"airway-interface":airway,"niosomes-nebulization":niosome,
        "histology-interface":histology,"historical-syrup":syrup}

def render(slug,seconds):
    path=OUT/(slug+".mp4")
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-y",
         "-f","rawvideo","-pixel_format","rgb24","-video_size",f"{W}x{H}",
         "-framerate",str(FPS),"-i","pipe:0",
         "-an","-c:v","libx264","-preset","veryfast","-crf","24",
         "-pix_fmt","yuv420p","-movflags","+faststart",str(path)]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    try:
        for n in range(round(seconds*FPS)):
            t=n/max(1,round(seconds*FPS)-1)
            im,d=bg(CLIPS[slug]["title"],slug)
            SCENES[slug](im,d,t)
            proc.stdin.write(im.tobytes())
        proc.stdin.close()
        err=proc.stderr.read().decode("utf-8",errors="replace")
        code=proc.wait()
        if code:raise RuntimeError(err[-1500:])
    except BaseException:
        proc.kill()
        proc.wait()
        raise
    if not path.exists() or path.stat().st_size<35000:raise ValueError("Short or absent MP4")
    duration=json.loads(subprocess.check_output(
        ["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(path)]
    ))["format"]["duration"]
    if abs(float(duration)-seconds)>.1:raise ValueError("Unexpected animation duration")
    return {"id":slug,**CLIPS[slug],"seconds":float(duration),
            "sha256":hashlib.sha256(path.read_bytes()).hexdigest(),"filename":path.name,
            "rights":"Original computer-generated editor illustration; scientifically conceptual, not observed footage",
            "public_release_approved":False}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--validate-only",action="store_true")
    p.add_argument("--clip",action="append",choices=sorted(CLIPS))
    p.add_argument("--seconds",type=float,default=12.0)
    a=p.parse_args()
    if a.seconds<1 or a.seconds>15:raise ValueError("Duration outside safety bounds")
    selected=a.clip or list(CLIPS)
    if not Path(FONT).is_file() or not shutil.which("ffmpeg"):
        raise FileNotFoundError("DejaVu fonts and FFmpeg required")
    if a.validate_only:
        print("All four original reconstruction mechanisms and production labels verified")
        return
    OUT.mkdir(parents=True,exist_ok=True)
    reports=[render(s,a.seconds) for s in selected]
    manifest={"status":"MOTION INSERTS ARE UNAPPROVED CONCEPTUAL ANIMATIONS",
              "generator":"Pillow 2D renderer + FFmpeg H.264; no paid models, voices or stock assets",
              "clips":reports}
    (OUT/"motion-source-manifest.json").write_text(
        json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("Completed conceptual motion clips:",", ".join(selected))
if __name__=="__main__":main()
