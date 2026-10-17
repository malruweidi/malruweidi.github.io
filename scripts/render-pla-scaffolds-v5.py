#!/usr/bin/env python3
"""Cinematic V5: original 2020 electrospun PLA antimicrobial scaffold research.

Every SEM/AFM/FTIR image and Table 3 comes from the verified same-DOI
publisher PDF. Camera movement is pixel-selection only; no artificial
experimental traces or clinical outcomes. Original figures appear as whole
source records before any explicitly labelled close-up.
"""
import importlib.util,functools,hashlib,json,math
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps,ImageFilter

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/"assets/films/source-figures/v4/pla-scaffolds"
spec=importlib.util.spec_from_file_location("base_v4",ROOT/"scripts/render-study-figures-v4.py")
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
base.OUT=ROOT/"assets/films/series-v5"
FILM="pla-scaffolds"; DOI="10.1016/j.surfcoat.2020.126216"
W,H=base.W,base.H
INK=(11,28,31); WARM=(244,234,217); MINT=(128,184,166); GOLD=(226,175,110)

@functools.lru_cache(maxsize=10)
def asset(number):
    path=ASSETS/f"pla-scaffolds-figure-{number:02d}.jpg"
    if not path.exists():raise FileNotFoundError("Exact 2020 figure missing "+str(path))
    return Image.open(path).convert("RGB")

@functools.lru_cache(maxsize=16)
def prepared(n,mode):
    source=asset(n)
    if mode=="full":
        # Background only. This softened collage is never called raw data.
        full=ImageOps.fit(source,(W,H),Image.Resampling.BICUBIC)
        return Image.blend(full.filter(ImageFilter.GaussianBlur(25)),
                           Image.new("RGB",(W,H),INK),.78)
    return ImageOps.contain(source,(1120,585),Image.Resampling.LANCZOS)

def font(n,serif=True):
    return ImageFont.truetype(
      "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf" if serif else
      "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",n)

def label(d,p,s,n=21,col=WARM):
    d.text(p,s,font=font(n),fill=col,stroke_width=0)

def lerp(a,b,t):return a+(b-a)*max(0,min(1,t))
def ease(t):return base.ease(t)

def panel_clip(source,region,maxwidth=1110,maxheight=565):
    sw,sh=source.size
    x0,y0,x1,y1=region
    raw=source.crop((int(x0*sw),int(y0*sh),int(x1*sw),int(y1*sh)))
    return ImageOps.contain(raw,(maxwidth,maxheight),Image.Resampling.LANCZOS)

def evidence_plate(bg,picture,t,caption,style="full",region=None):
    im=bg.copy();d=ImageDraw.Draw(im)
    # Two distinct filmmaking shots: at 0-5 s original full figure; 5-15 s
    # a clearly labelled micrograph subpanel or full original figure.
    if region and t>=5:
        picture=panel_clip(picture,region)
        caption="PANEL CROP · "+caption
    else:
        picture=ImageOps.contain(picture,(1084,572),Image.Resampling.LANCZOS)
    # frame widens slightly without ever sacrificing labels/axes to cropping
    movement=int(12*math.sin(t*.22))
    x=(W-picture.width)//2+movement
    y=104+(552-picture.height)//2
    im.paste(picture,(x,y))
    d=ImageDraw.Draw(im)
    d.rectangle((x-2,y-2,x+picture.width+2,y+picture.height+2),outline=GOLD,width=3)
    d.rounded_rectangle((35,21,1225,75),12,fill=(13,38,40))
    label(d,(50,39),caption,19,WARM)
    return im

def animated_electrospin(t):
    bg=Image.new("RGB",(W,H),INK);d=ImageDraw.Draw(bg)
    label(d,(46,34),"FROM SOLUTION TO FIBRE",46)
    label(d,(50,94),"RECONSTRUCTION · NOT EXPERIMENT FOOTAGE",16,GOLD)
    # a needle, continuous moving fibre jet and collector
    d.polygon([(205,196),(317,196),(300,275),(222,275)],fill=(74,104,107))
    d.polygon([(221,274),(301,274),(262,327)],fill=(199,164,115))
    d.line((60,587,1200,587),fill=MINT,width=10)
    d.line((60,616,1200,616),fill=GOLD,width=3)
    # jet path is a physical qualitative concept, not actual microscopy
    progress=ease(t/13)
    for i in range(15):
        if i/15>progress:break
        points=[]
        for k in range(30):
            u=k/29
            x=267+u*(820+i*2)+17*u*math.sin(k*.8+i*1.4+t*1.7)
            y=330+u*245+14*u*math.sin(k*.55+i*.8+t*.7)
            points.append((x,y))
        d.line(points,fill=(110+min(i*4,60),158,135),width=2)
    label(d,(48,651),"ELECTROSPINNING SCHEMATIC | SOURCE: 2020 FIGURE 1",17)
    return bg

def plasma_motion(t):
    bg=Image.new("RGB",(W,H),INK);d=ImageDraw.Draw(bg)
    label(d,(47,32),"A SURFACE BEFORE AND AFTER PLASMA",37)
    label(d,(50,94),"RF TREATMENT · SITES REPRESENTED CONCEPTUALLY",16,GOLD)
    for k in range(15):
        y=280+k*18
        points=[(x,y+13*math.sin(.015*x+k*1.9+t*.28)) for x in range(70,1230,18)]
        d.line(points,fill=(73+k*4,133+k*2,119+k),width=6)
    n=int(94*ease(t/13))
    for k in range(n):
        x=80+(k*151)%1120;y=186+(k*43)%330
        r=4+(k%3)
        d.ellipse((x-r,y-r,x+r,y+r),fill=GOLD)
    label(d,(48,651),"ORIGINAL 2020 PLASMA-TREATMENT RATIONALE / NO RATE OR DENSITY MEASURED",16)
    return bg

def graph(figure,t,headline,zoom=None):
    bg=prepared(figure,"full")
    src=asset(figure)
    original=src.copy()
    # Figure/tables occupy >70% of screen. Graphs only ever shown whole:
    # axes are part of data, never cropped or repainted.
    if figure in (7,3):zoom=None
    im=evidence_plate(bg,original,t,headline,region=zoom)
    return im

def full_scene(slug,scene,index,t,fig,unused):
    if index==1:return animated_electrospin(t)
    if index==2:return plasma_motion(t)
    if index==0:
        # First show actual SEM four-panel experiment: a *research* image.
        return graph(5,t,"ACTUAL 2020 ELECTROSPUN PLA SEM / FIGURE 5")
    if index==3:
        if t<7.5:
            return graph(5,t,"SEM FIGURE 5 / FULL FOUR-CONDITION RECORD",
                         zoom=(.01,.02,.50,.44))
        return graph(5,t-7.5,"SEM FIGURE 5 / PLASMA AND ACID-GRAFTED FIBRES",
                     zoom=(.50,.44,.99,.89))
    if index==4:
        return graph(6,t,"ACTUAL AFM: Rₐ, FIVE PLA SAMPLE CONDITIONS / FIGURE 6")
    if index==5:
        return graph(7,t,"UNALTERED FTIR–ATR TRACES / FIGURE 7")
    if index==6:
        im=graph(3,t,"ORDINAL BACTERIAL GROWTH SCORES / ORIGINAL TABLE 3")
        d=ImageDraw.Draw(im);d.rounded_rectangle((32,622,1246,656),8,fill=(13,35,36))
        label(d,(45,626),"S. AUREUS & E. COLI | CONTROL vs PLASMA vs ASA vs FA | 3 READINGS",19)
        return im
    if index==7:
        im=graph(5,t,"ORIGINAL SEM: SOURCE EVIDENCE, NOT CLINICAL IMPLANT TEST")
        d=ImageDraw.Draw(im);d.rounded_rectangle((28,620,1252,661),10,fill=(15,42,43))
        label(d,(47,626),"IN VITRO COLONIZATION IS NOT A CLINICAL OUTCOME",23)
        return im
    raise ValueError(index)

def correct_source(slug,num):
    p=ASSETS/f"pla-scaffolds-figure-{num:02d}.jpg"
    return asset(num).copy(),p

def main():
    source=json.loads((ASSETS/"source-provenance.json").read_text())
    assert source["doi"]==DOI and len(source["figures"])==5
    cfg=json.loads((ROOT/"assets/films/V4-PLA-SCAFFOLDS-2020-DIRECTORIAL.json").read_text())
    entry=cfg["video"]
    record={"title":entry["title"],"doi":DOI,"source":entry["source"],
      "media_license":entry["media_license"],"visual_thesis":entry["visual_thesis"],
      "scenes":entry["chapters"]}
    base.read_art=correct_source
    base.full_scene=full_scene
    base.FOCUS[FILM]={}
    base.render(FILM,record,ROOT/"film-models")
    p=base.OUT/(FILM+".json")
    j=json.loads(p.read_text())
    j["edition"]="V5 cinematic full-frame primary source documentary"
    j["camera_treatment"]="Figure-first full-frame evidence, source-labelled microscopy edits, dynamic electrospinning/plasma models, no artificial assay curves"
    j["source_pdf_sha256"]=source["pdf_sha256"]
    j["data_fidelity"]="All originals are taken from the 2020 publisher study, scales retained, ordinal bacterial scores shown without redrawing."
    j["human_review"]="NOT APPROVED — audit 120-second voice and watch full-frame film before release"
    p.write_text(json.dumps(j,indent=2,ensure_ascii=False)+"\n")
if __name__=="__main__":main()
