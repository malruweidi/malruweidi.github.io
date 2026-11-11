#!/usr/bin/env python3
"""Original scientific motion studies: diagrams, NEVER experimental footage."""
import argparse,hashlib,json,math,subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
BASE=Path(__file__).resolve().parents[1]
OUT=BASE/"assets/films/animations-v2"
W,H,FPS,DURATION=1280,720,24,16
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
def frame(title,subtitle):
    im=Image.new("RGB",(W,H),"#10262e"); d=ImageDraw.Draw(im)
    d.rounded_rectangle((70,145,1205,495),radius=18,fill="#183740",outline="#41616a",width=3)
    d.text((110,176),title,font=ImageFont.truetype(FONT,22),fill="#edc39d")
    d.text((110,215),subtitle,font=ImageFont.truetype(FONT,16),fill="#d4e6df")
    d.text((105,461),"EXPLANATORY MOTION / CONCEPTUAL, NOT A MEASURED EXPERIMENT",font=ImageFont.truetype(FONT,13),fill="#afc5c1")
    return im,d
def airway(u):
    im,d=frame("An advancing air-liquid interface","Physical event in an illustrative parallel-plate chamber")
    d.rounded_rectangle((170,270,1110,429),radius=15,outline="#b8cec4",width=5)
    d.rectangle((182,392,1098,417),fill="#365e65")
    for x in range(203,1095,50):
        d.ellipse((x-14,398,x+14,430),fill="#74a69a",outline="#e1eadf",width=2)
    x=260+715*u
    d.ellipse((x-103,278,x+103,387),fill="#326775",outline="#e1b78d",width=5)
    d.line((x+121,331,x+185,331),fill="#e1b78d",width=5)
    d.polygon([(x+192,331),(x+176,321),(x+176,341)],fill="#e1b78d")
    return im
def ace2(u):
    im,d=frame("ACE2 ectodomain shedding","Different compartments: membrane anchored and soluble")
    for x in range(180,1090,28):
        for y in (371,427):d.ellipse((x-7,y-7,x+7,y+7),fill="#86bfb1")
        d.line((x-4,384,x-4,412),fill="#5f9e91",width=3)
        d.line((x+4,384,x+4,412),fill="#5f9e91",width=3)
    x,y=424+440*u,316-83*u
    d.line((424,366,424,342),fill="#caa077",width=10)
    d.ellipse((x-45,y-43,x+45,y+28),fill="#ae815f",outline="#efc49d",width=4)
    d.ellipse((x-17,y-25,x+29,y+12),fill="#c99b74")
    if u>.10:
        d.line((510,312,655,270),fill="#eed0ae",width=3)
        d.polygon([(658,267),(645,264),(651,280)],fill="#eed0ae")
    return im
def edible(u):
    im,d=frame("The printed filament must hold its shape","Rheology governs deposition and post-extrusion deformation")
    x=260+690*u
    d.rounded_rectangle((x-30,258,x+34,323),radius=8,fill="#8daaa5",outline="#f4e6cf",width=3)
    d.polygon([(x-17,322),(x+17,322),(x+6,351),(x-6,351)],fill="#98b4b0")
    pts=[]
    for k in range(91):
        xx=235+(x-235)*k/90
        sag=math.sin(math.pi*k/90)*23*max(0,min(1,(u-.45)*2))
        pts.append((xx,400+sag))
    d.line(pts,fill="#dba975",width=21,joint="curve")
    d.line((200,451,1048,451),fill="#9abbb2",width=3)
    return im
def chip(u):
    im,d=frame("Microfluidic sample handling","Transport through a channel, not a recorded viral assay")
    pts=[(194,309),(452,309),(452,399),(824,399),(824,309),(1081,309)]
    d.line(pts,fill="#81b8c1",width=70,joint="curve")
    d.line(pts,fill="#225462",width=55,joint="curve")
    sections=[];length=0
    for (a,b),(c,e) in zip(pts,pts[1:]):
        dist=math.hypot(c-a,e-b);sections.append((length,length+dist,a,b,c,e));length+=dist
    for i in range(13):
        z=((u*.7+i/13)%1)*length
        for low,high,a,b,c,e in sections:
            if low<=z<=high:
                q=(z-low)/(high-low)
                x,y=a+(c-a)*q,b+(e-b)*q
                d.ellipse((x-9,y-9,x+9,y+9),fill="#edb17f" if i%3==0 else "#85c0b1")
                break
    return im
FILMS={"airway-interface":airway,"ace2-shedding":ace2,
       "edible-extrusion":edible,"microfluidic-transport":chip}
def export(name):
    OUT.mkdir(parents=True,exist_ok=True)
    target=OUT/(name+".mp4")
    args=["ffmpeg","-hide_banner","-loglevel","error","-y","-f","rawvideo","-pixel_format","rgb24",
        "-video_size",str(W)+"x"+str(H),"-framerate",str(FPS),"-i","pipe:0","-an",
        "-c:v","libx264","-preset","veryfast","-crf","22","-pix_fmt","yuv420p",
        "-movflags","+faststart",str(target)]
    p=subprocess.Popen(args,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    for n in range(FPS*DURATION):
        p.stdin.write(FILMS[name](n/(FPS*DURATION)).tobytes())
    p.stdin.close()
    err=p.stderr.read();result=p.wait()
    if result:raise RuntimeError(err.decode("utf-8","replace")[-1500:])
    manifest={"name":name,"duration":DURATION,"frame_rate":FPS,"size":[W,H],
              "evidence_status":"ORIGINAL CONCEPTUAL ANIMATION; NOT EXPERIMENTAL FOOTAGE",
              "source":"scripts/render-science-motion-v2.py",
              "sha256":hashlib.sha256(target.read_bytes()).hexdigest()}
    (OUT/(name+".json")).write_text(json.dumps(manifest,indent=2)+"\n")
    print("RENDERED",name,target.stat().st_size)
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    a=parser.parse_args()
    if a.validate_only:
        for key,fn in FILMS.items():
            assert fn(.45).size==(1280,720)
            print("VALID SCIENTIFIC CONCEPT",key)
        return
    for name in FILMS:export(name)
if __name__=="__main__":main()
