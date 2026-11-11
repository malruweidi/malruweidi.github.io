#!/usr/bin/env python3
"""2021 actual-study pulmonary documentary using its own Figure 1, not generic lab photos.

Factual values are from 10.1152/japplphysiol.00574.2020, as narrated.
Reuse historical v3 engine's rendering and Kokoro infrastructure, NOT its art.
"""
import hashlib,importlib.util,json,math,tempfile
from pathlib import Path
from PIL import Image,ImageDraw,ImageOps

ROOT=Path(__file__).resolve().parents[1]
SPEC=ROOT/"scripts/render-cinema-v3-history.py"
l=importlib.util.spec_from_file_location("documentary_shared_engine",SPEC)
h=importlib.util.module_from_spec(l);l.loader.exec_module(h)
CAT=ROOT/"assets/films/v3/airway-reopening.storyboard.json"
OUT=ROOT/"assets/films/v3/rendered"
PRIMARY=ROOT/"assets/home-archive/figure-pulmonary-flow-chamber.jpg"
PALETTE={"bg":(16,32,40),"ink":(241,234,220),"teal":(109,186,181),"copper":(221,166,111),"dim":(129,160,165),"quiet":(50,74,84)}
def tpos(a,b,t):return a+(b-a)*h.smooth(t)
def square(d,x,y,w,h,col,stroke):
    d.rounded_rectangle((x,y,x+w,y+h),radius=14,fill=col,outline=stroke,width=2)
def line(d,a,b,color=(109,186,181),w=4):d.line((*a,*b),fill=color,width=w)
def txt(d,p,t,size=19,color=(241,234,220),bold=False):h.label(d,p,t,size,color,bold)
def wraptitle(d,text):
    h.textblock(d,64,188,text,width=514,size=40,lineheight=52,maxlines=3,serif=True)

def paint(scene,n,t):
    k=scene["visual"]; im=Image.new("RGB",(1280,720),PALETTE["bg"]);d=ImageDraw.Draw(im)
    for y in range(720):
        f=y/720
        d.line((0,y,1280,y),fill=(int(16+7*f),int(32+10*f),int(40+11*f)))
    txt(d,(63,42),"RUWAIDIX  /  REAL EXPERIMENT • PULMONARY MECHANOBIOLOGY",13,PALETTE["teal"],True)
    d.rectangle((63,73,123,79),fill=PALETTE["copper"])
    txt(d,(65,105),scene["eyebrow"],15,PALETTE["copper"],True)
    wraptitle(d,scene["heading"])
    d.line((64,643,1218,643),fill=PALETTE["quiet"],width=2)
    d.line((64,643,64+1154*(n+t)/8,643),fill=PALETTE["copper"],width=3)
    txt(d,(63,672),f"J APPL PHYSIOL 130:1143–1151 · 2021 · CHAPTER {n+1:02d}/08",12,PALETTE["teal"],True)
    txt(d,(918,672),"IN-VITRO STUDY · NO CLINICAL CLAIM",11,PALETTE["copper"],True)
    if k=="primary-figure":
        with Image.open(PRIMARY) as source:
            full=ImageOps.exif_transpose(source).convert("RGB")
            full.thumbnail((691,505),Image.Resampling.LANCZOS)
            x=1280-full.width-58
            y=119+(505-full.height)//2
            im.paste(full,(x,y))
            d.rectangle((x-2,y-2,x+full.width+2,y+full.height+2),outline=PALETTE["teal"],width=3)
        txt(d,(68,464),"ACTUAL STUDY FIGURE 1",18,PALETTE["copper"],True)
        h.textblock(d,68,505,"A: chamber • B: bubble • C: forces • D: live/dead",width=483,size=18,lineheight=27,maxlines=3)
    elif k=="bubble":
        d.rectangle((671,218,1216,455),outline=PALETTE["quiet"],width=3)
        d.rectangle((671,440,1216,460),fill=PALETTE["copper"])
        for i in range(14):
            x=678+i*38
            square(d,x,402,31,37,(25,72,77),PALETTE["teal"])
            d.ellipse((x+10,414,x+19,423),fill=PALETTE["quiet"])
        p=703+454*t
        d.arc((p-85,242,p+85,411),80,282,fill=PALETTE["copper"],width=10)
        for q in range(4):
            x=694+((t*330+q*108)%451)
            line(d,(x,302),(x+38,302),PALETTE["teal"],3)
        txt(d,(740,492),"APPROX. 3 mm/s • SINGLE BUBBLE",17,PALETTE["copper"],True)
    elif k=="treatment-groups":
        groups=[("CONTROL","Static L2 cells"),("BUBBLE","Mechanical stress"),("DEX + BUBBLE","Drug pretreatment"),("DHEA + BUBBLE","Drug pretreatment"),("LAT + BUBBLE","Mechanics comparator")]
        for q,(name,comment) in enumerate(groups):
            x=647+(q%2)*290;y=176+(q//2)*133
            square(d,x,y,278,111,(21,50,61),PALETTE["copper"] if t>.2+q*.13 else PALETTE["quiet"])
            txt(d,(x+15,y+22),name,16,PALETTE["teal"],True)
            txt(d,(x+15,y+58),comment,16,PALETTE["ink"])
        txt(d,(701,572),"EXPOSURES WERE NOT PATIENT TREATMENTS",13,PALETTE["copper"],True)
    elif k=="measurement":
        for q in range(8):
            x=680+(q%4)*126;y=255+(q//4)*137
            alive=q%3!=0
            d.ellipse((x-26,y-26,x+26,y+26),outline=PALETTE["teal"] if alive else PALETTE["copper"],width=4)
            d.ellipse((x-9,y-9,x+9,y+9),fill=PALETTE["teal"] if alive else (166,83,79))
        txt(d,(679,502),"GREEN: CALCEIN-AM / LIVE",18,PALETTE["teal"],True)
        txt(d,(679,535),"RED: ETHIDIUM HOMODIMER / DEAD",18,PALETTE["copper"],True)
        txt(d,(678,586),"SCHEMATIC CELLS · NOT MICROSCOPY",12,PALETTE["dim"])
    elif k=="reported-data":
        data=[("BUBBLE",54.7,3.94),("LAT",20.9,12.0),("DEX",15.1,3.43),("DHEA",16.1,2.9)]
        y0=500;scale=4.3
        for q,(name,mean,sem) in enumerate(data):
            x=690+q*129
            hh=mean*scale*h.smooth(t*3-.18*q)
            d.rectangle((x,y0-hh,x+76,y0),fill=PALETTE["copper"] if q==0 else PALETTE["teal"])
            if t>.22+.12*q:
                txt(d,(x-1,y0-hh-49),f"{mean:g}%",17,PALETTE["ink"],True)
                txt(d,(x-1,y0-hh-25),f"± {sem:g}",12,PALETTE["dim"])
            txt(d,(x,y0+20),name,15,PALETTE["copper"] if q==0 else PALETTE["teal"],True)
        line(d,(661,500),(1200,500),PALETTE["dim"],2)
        txt(d,(689,578),"Reported mean ± SEM · paper Fig. 3 · bars reveal static values",13,PALETTE["dim"])
    elif k=="cytoskeleton":
        for q in range(2):
            bx=671+q*276
            square(d,bx,231,248,255,(19,51,62),PALETTE["quiet"])
            for i in range(10):
                if q==0:
                    a=i*.628
                    p1=(bx+124+65*math.cos(a),359+65*math.sin(a))
                    p2=(bx+124-65*math.cos(a),359-65*math.sin(a))
                else:
                    x=bx+57+i*14
                    p1=(x,286);p2=(x,439)
                line(d,p1,p2,PALETTE["teal"],2)
            d.ellipse((bx+109,344,bx+139,374),fill=PALETTE["copper"])
        txt(d,(701,523),"CONTROL",16,PALETTE["teal"],True)
        txt(d,(975,523),"ILLUSTRATIVE REORGANIZATION",15,PALETTE["copper"],True)
        txt(d,(695,579),"Mechanism remains an interpretation of these measurements.",12,PALETTE["dim"])
    elif k=="boundary":
        square(d,652,235,238,236,(19,52,58),PALETTE["teal"])
        square(d,973,235,239,236,(52,47,51),PALETTE["copper"])
        txt(d,(671,259),"IN VITRO",19,PALETTE["teal"],True)
        txt(d,(993,259),"CLINICAL",19,PALETTE["copper"],True)
        for q,t0 in enumerate(["L2 rat cells","Single bubble","Controlled chamber"]):txt(d,(674,328+q*36),t0,17)
        for q,t0 in enumerate(["Patient outcomes","Systemic dosing","Repeated ventilation"]):txt(d,(991,328+q*36),t0,15)
        line(d,(900,355),(961,355),PALETTE["copper"],4)
        txt(d,(914,377),"≠",24,PALETTE["ink"],True)
    elif k=="study-chain":
        parts=["FLOW PHYSICS","CELL STATE","INJURY","NEXT MODEL"]
        y=226
        for q,title in enumerate(parts):
            x=687+(q%2)*261;yy=y+(q//2)*152
            square(d,x,yy,243,111,(20,48,58),PALETTE["teal"] if t>q*.18 else PALETTE["quiet"])
            txt(d,(x+16,yy+25),title,17,PALETTE["copper"] if q==3 else PALETTE["teal"],True)
            line(d,(x+21,yy+77),(x+22+190*h.smooth(t*3-q*.3),yy+77),PALETTE["dim"],3)
        txt(d,(711,568),"Interpretation must remain proportional to the model.",14,PALETTE["dim"])
    else:raise ValueError("Unknown topic-specific scientific motion "+k)
    return im

def main():
    data=json.loads(CAT.read_text(encoding="utf8"))
    scenes=data["scenes"];assert len(scenes)==8
    assert PRIMARY.exists()
    assert [s["visual"] for s in scenes]==["primary-figure","bubble","treatment-groups","measurement","reported-data","cytoskeleton","boundary","study-chain"]
    h.paint=paint
    OUT.mkdir(parents=True,exist_ok=True)
    review=Image.new("RGB",(1920,540),PALETTE["bg"])
    for i,s in enumerate(scenes):
        review.paste(paint(s,i,.75).resize((480,270),Image.Resampling.LANCZOS),((i%4)*480,(i//4)*270))
    review.save(OUT/"airway-reopening-v3-review.jpg",quality=89,optimize=True)
    models=ROOT/"film-models"
    with tempfile.TemporaryDirectory(prefix="ruwaidix-v3-airway") as work:
        tmp=Path(work);clips=[]
        for n,s in enumerate(scenes):
            output=tmp/f"shot-{n:02d}.mp4"
            h.make_scene(s,n,output);clips.append(output)
            print("AIRWAY V3 SHOT",n+1,s["visual"],flush=True)
        playlist=tmp/"playlist.txt"
        playlist.write_text("".join("file '"+str(p)+"'\n" for p in clips))
        picture=tmp/"picture.mp4"
        h.check(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(playlist),"-c","copy",str(picture)])
        wav=tmp/"narration.wav";vtt=OUT/"airway-reopening-v3.vtt"
        h.voices(scenes,models,wav,vtt)
        mp4=OUT/"airway-reopening-v3.mp4"
        h.check(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(picture),"-i",str(wav),"-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-b:a","160k","-af","loudnorm=I=-18:TP=-2:LRA=11","-t","128","-movflags","+faststart",str(mp4)])
        digest=hashlib.sha256(mp4.read_bytes()).hexdigest()
        (OUT/"airway-reopening-v3.json").write_text(json.dumps({"id":"airway-reopening","duration":128,"sha256":digest,"source_url":data["primary_paper"]["url"],
            "reported_values":data["quoted_numbers"],"source_figure":data["verified_figures"],"status":"DRAFT, needs artistic and spoken-term audition, publisher figure rights confirmation","evidence_boundary":"2021 rat L2 chamber experiment only; original exact Fig.1 included, all other cell pictures explicitly schematic"},indent=2))
        print("AIRWAY V3 COMPLETE",mp4.stat().st_size,digest)
if __name__=="__main__":main()
