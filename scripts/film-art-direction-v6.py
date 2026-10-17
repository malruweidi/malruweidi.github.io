#!/usr/bin/env python3
"""Publication Cinema V6: scientific illustration, never fabricated experimental imagery.

Create original labeled conceptual plates for scenes without a film-specific,
documented evidence asset. Retain specified genuine source photographs and figures.
These illustrations are *not* substitutes for graphs or measurements from papers.
"""
from pathlib import Path
import hashlib
import math
import random
from PIL import Image, ImageDraw, ImageFont

W,H=1600,900
INK=(11,30,36)
PAPER=(242,238,224)
MINT=(121,190,172)
GOLD=(224,171,106)
RUST=(197,109,87)

# The only borrowed media used by this edition. Every path is tied to its own story.
# Illustrations for other scenes are built from original geometric elements.
APPROVED={
 "airway-reopening":("assets/home-archive/figure-pulmonary-flow-chamber.jpg",),
 "cerebral-cilia":("assets/home-archive/figure-zebrafish-microscopy.jpg",),
 "curcumin-cyanide":("assets/home-archive/figure-cyanide-sensor.jpg",),
 "pla-grafting":("assets/films/source-figures/v3/pla-grafting-figure-08.jpg",),
 "flow-chamber-method":("assets/home-archive/figure-pulmonary-flow-chamber.jpg",),
 "zebrafish-hemodynamics":("assets/home-archive/figure-zebrafish-microscopy.jpg",),
 "histology-failure":(
   "assets/2026-10-13-new-photos/zebrafish-orientation-specimens.webp",
   "assets/2026-10-13-new-photos/zebrafish-histology-processing.webp",
   "assets/2026-10-13-new-photos/zebrafish-paraffin-microtomy-failure.webp"),
 "cairo-microscope":("assets/photos-2017-2019/microscope-morning-still-life-2017.webp",),
 "micelles-pahs":("assets/oct12-owner-photos/diblock-copolymer-unsuccessful-trials-2017.webp",),
 "heterocycle-cancer":("assets/2026-10-15-lab-photos/pyridine-4-carboxaldehyde-reagent-front-2018.webp",),
 "essay-life-between-diagnoses":("assets/2026-10-13-new-photos/august-2025-hospital-research.webp",),
 "essay-scientific-credit":("assets/2017-acs-el-sayed-group.webp",)
}
# Domain-specific visual grammar. No chart data or manuscript facsimiles invented.
MODE={
 "airway-reopening":"flow","cerebral-cilia":"vessel","slit2-robo":"binding",
 "curcumin-cyanide":"sensor","making-medicines-keep":"manuscript",
 "niosomes":"vesicle","echo-cnn-lstm":"echo","pla-grafting":"polymer",
 "pla-scaffolds":"polymer","flow-chamber-method":"flow",
 "zebrafish-hemodynamics":"vessel","ace2-covid-drugs":"enzyme",
 "gi-autoimmunity-1":"barrier","gi-autoimmunity-2":"diagnostic",
 "heart-failure-sensors":"echo","ace2-forms":"enzyme",
 "microfluidic-virus":"channel","drug-release-twins":"release",
 "food-printing":"lattice","ceramics-printing":"lattice",
 "cubosome-theranostics":"cubosome","micelles-pahs":"micelle",
 "heterocycle-cancer":"molecule","histology-failure":"layers",
 "cairo-microscope":"microscope","essay-life-between-diagnoses":"barrier",
 "essay-ai-email":"document","essay-machine-language":"document",
 "essay-academic-mental-health":"document","essay-scientific-credit":"network",
 "essay-tf-states":"molecule","essay-potency-exposure":"release",
 "essay-trna":"molecule","essay-proximity":"binding","essay-adc":"binding"
}
NODES={
 "flow":("bubble","interface","cells","injury"),
 "vessel":("flow","endothelium","cilia","signal"),
 "binding":("target A","molecular event","target B","response"),
 "sensor":("probe","analyte","optical signal","interpretation"),
 "manuscript":("recipe","ingredients","preparation","reliability"),
 "vesicle":("carrier","nebulization","deposition","release"),
 "echo":("acquisition","signal","model","validation"),
 "polymer":("substrate","treatment","interface","characterization"),
 "enzyme":("membrane form","soluble form","measurement","interpretation"),
 "barrier":("trigger","tissue response","barrier","evidence"),
 "diagnostic":("symptom","assessment","biopsy","treatment"),
 "channel":("sample","microchannel","detection","controls"),
 "release":("drug","carrier","transport","exposure"),
 "lattice":("feedstock","processing","architecture","function"),
 "cubosome":("lipid system","mesophase","cargo","translation"),
 "micelle":("polymer","assembly","hydrophobe","aqueous medium"),
 "molecule":("structure","interaction","assay","limits"),
 "layers":("agarose","paraffin","interface","sectioning"),
 "microscope":("instrument","observation","record","question"),
 "document":("original text","interpretation","claim","reader"),
 "network":("contribution","collaboration","recognition","record")
}

def font(size, bold=False):
    name="/usr/share/fonts/truetype/dejavu/DejaVuSans"+("-Bold" if bold else "")+".ttf"
    return ImageFont.truetype(name,size)

def circle(d,xy,r,color,width=4):
    x,y=xy
    d.ellipse((x-r,y-r,x+r,y+r),outline=color,width=width)

def draw_mode(d,mode,stage,seed):
    # Fixed framing keeps the editor's source statement readable.
    x0,y0=815,185
    rnd=random.Random(seed+stage)
    if mode in ("vesicle","micelle","cubosome"):
        for j in range(4):
            cx=x0+145+(j%2)*230
            cy=y0+135+(j//2)*235
            rad=67+(j%2)*17
            circle(d,(cx,cy),rad,MINT if j==stage%4 else GOLD,6)
            if mode=="cubosome":
                for k in range(-2,3):
                    d.line((cx-rad+15,cy+k*21,cx+rad-15,cy+k*21),fill=(56,103,102),width=3)
                    d.line((cx+k*21,cy-rad+15,cx+k*21,cy+rad-15),fill=(56,103,102),width=3)
            else:
                for k in range(9):
                    th=2*math.pi*k/9
                    px=cx+rad*.68*math.cos(th);py=cy+rad*.68*math.sin(th)
                    circle(d,(px,py),4,GOLD,3)
                if mode=="micelle":circle(d,(cx,cy),25,GOLD,3)
    elif mode in ("flow","vessel","channel","barrier","layers"):
        for j in range(7):
            y=y0+j*67
            d.line((x0,y,x0+670,y),fill=(45,91,91),width=3)
        if mode in ("flow","vessel","channel"):
            for j in range(5):
                cy=y0+48+j*91
                d.arc((x0+90+j*100,cy-35,x0+230+j*100,cy+45),0,180,fill=MINT,width=6)
                d.line((x0+75+j*110,cy+30,x0+135+j*110,cy+30),fill=GOLD,width=7)
            if mode=="vessel":
                for j in range(11):
                    x=x0+45+j*58
                    d.line((x,y0+465,x+7,y0+420-20*(j%3)),fill=MINT,width=5)
        elif mode=="layers":
            d.rectangle((x0+60,y0+145,x0+625,y0+260),fill=(61,103,104))
            d.rectangle((x0+60,y0+270,x0+625,y0+440),fill=(94,76,65))
            d.line((x0+60,y0+263,x0+625,y0+263),fill=RUST,width=8)
        else:
            for j in range(18):
                x=x0+35+j*36;y=y0+245+math.sin(j*.6)*32
                circle(d,(x,y),14,MINT,3)
    elif mode in ("molecule","binding","enzyme","sensor"):
        nodes=[(x0+130,y0+160),(x0+500,y0+140),(x0+350,y0+410),(x0+620,y0+390)]
        for i,(x,y) in enumerate(nodes):
            for j in range(i+1,len(nodes)):
                xx,yy=nodes[j]
                if (i+j)%2==0:d.line((x,y,xx,yy),fill=(67,113,110),width=5)
            circle(d,(x,y),58,MINT if i==stage%4 else GOLD,6)
            d.ellipse((x-13,y-13,x+13,y+13),fill=MINT if i==stage%4 else GOLD)
    elif mode in ("echo","diagnostic","release"):
        pts=[]
        for j in range(520):
            x=x0+j*1.27
            phase=(j/520)*math.pi*6
            if mode=="echo":
                z=125*math.exp(-((j%135-45)/35)**2)*math.sin(phase*2.1)
            elif mode=="release":
                z=185*(1-math.exp(-j/155.0))
            else:
                z=100*math.sin(phase)*math.cos(phase*.5)
            pts.append((x,y0+400-z))
        d.line(pts,fill=MINT,width=7,joint="curve")
        d.line((x0,y0+415,x0+660,y0+415),fill=GOLD,width=3)
        d.line((x0,y0+100,x0,y0+415),fill=GOLD,width=3)
    elif mode in ("polymer","lattice","network"):
        pts={}
        for row in range(5):
            for col in range(7):
                x=x0+col*96+(row%2)*25;y=y0+row*108
                pts[(row,col)]=(x,y)
        for (row,col),(x,y) in pts.items():
            if col<6:d.line((x,y,*pts[(row,col+1)]),fill=(66,112,111),width=4)
            if row<4:d.line((x,y,*pts[(row+1,col)]),fill=(66,112,111),width=4)
            circle(d,(x,y),12,MINT if (row+col+stage)%4==0 else GOLD,4)
    elif mode in ("manuscript","document","microscope"):
        d.rounded_rectangle((x0+80,y0+30,x0+615,y0+520),radius=22,outline=GOLD,width=5)
        if mode=="microscope":
            d.arc((x0+260,y0+50,x0+500,y0+340),170,340,fill=MINT,width=20)
            d.line((x0+310,y0+320,x0+300,y0+420),fill=GOLD,width=20)
            d.line((x0+220,y0+460,x0+540,y0+460),fill=MINT,width=18)
        else:
            for j in range(12):
                y=y0+93+j*31
                x=x0+130+(j%3)*18
                d.line((x,y,x+400-(j%4)*39,y),fill=MINT if j//3==stage%4 else (76,113,111),width=4)

def concept_image(slug,scene,workspace):
    mode=MODE.get(slug,"network")
    stage=max(0,int(scene["id"])-1)
    dseed=int(hashlib.sha256(slug.encode()).hexdigest()[:8],16)
    im=Image.new("RGB",(W,H),INK)
    d=ImageDraw.Draw(im)
    for j in range(24):
        x=(j*87 + dseed%97)%W
        d.line((x,0,x-270,H),fill=(23,56,60),width=2)
    draw_mode(d,mode,stage,dseed)
    accent=GOLD if stage%2 else MINT
    d.rectangle((66,74,138,82),fill=accent)
    d.text((65,101),"RESEARCH / EDITORIAL RECONSTRUCTION",font=font(23,True),fill=accent)
    d.text((65,185),slug.replace("-"," ").upper()[:39],font=font(38,True),fill=PAPER)
    title=scene["title"]
    import textwrap
    for j,line in enumerate(textwrap.wrap(title,width=31)[:4]):
        d.text((65,285+j*61),line,font=font(43,True),fill=PAPER)
    labels=NODES.get(mode,NODES["network"])
    for j,lab in enumerate(labels):
        color=accent if j==stage%4 else (153,176,166)
        d.text((835+(j%2)*335,740+(j//2)*42),lab.upper(),font=font(20,True),fill=color)
    d.line((65,790,1520,790),fill=(56,93,94),width=2)
    d.text((65,817),"SCHEMATIC  /  NOT A STUDY FIGURE, MEASUREMENT OR HISTORICAL FACSIMILE",font=font(19),fill=(173,193,179))
    output=workspace/("concept-"+scene["id"]+".png")
    im.save(output,optimize=True)
    return output

def select_visual(slug,scene,workspace,root):
    picture=scene["image"].lstrip("/")
    allow=APPROVED.get(slug,())
    kind=scene.get("kind","").lower()
    # Use only deliberately scoped relevant assets. Portraits and generic themed
    # images are never substituted for microscopy, historical objects or results.
    if picture in allow and ("original" in kind or "research" in kind or "firsthand" in kind or "laboratory" in kind or "published" in kind or "document" in kind):
        p=root/picture
        if p.exists():
            return p,scene["kind"],True
    return concept_image(slug,scene,workspace),"Original explanatory schematic; not research evidence",False
