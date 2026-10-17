#!/usr/bin/env python3
"""Study-specific V5 film of the 2020 single-bubble epithelial monolayer method.

Actual Figure 1, 5 and 6 pixels are from the SAME CC BY primary publication
DOI 10.3390/mps3040065. Conceptual bubble geometry remains conspicuously
separate from authentic cellular microscopy and the measured death-rate bar.
"""
import importlib.util,functools,hashlib,json,math
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps,ImageFilter
ROOT=Path(__file__).resolve().parents[1]
SOURCES=ROOT/"assets/films/source-figures/v3"
CORE=ROOT/"scripts/render-study-figures-v4.py"
spec=importlib.util.spec_from_file_location("flow_film_core",CORE)
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
base.OUT=ROOT/"assets/films/series-v5";base.FIG=SOURCES
FILM="flow-chamber-method";DOI="10.3390/mps3040065"
W,H=base.W,base.H
INK=(11,28,32);CREAM=(250,240,223);MINT=(139,194,175);GOLD=(231,170,112);STEEL=(92,150,153)
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf";SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
@functools.lru_cache(maxsize=5)
def figure(n):
    path=SOURCES/f"flow-chamber-method-figure-{n:02d}.jpg"
    if not path.exists():raise FileNotFoundError("Matching 2020 study figure unavailable: "+str(path))
    return Image.open(path).convert("RGB")
def font(n,kind="serif"):return ImageFont.truetype(SERIF if kind=="serif" else BOLD if kind=="bold" else SANS,n)
def txt(d,at,msg,n=24,fill=CREAM,kind="serif"):d.text(at,msg,font=font(n,kind),fill=fill)
def ease(v):return base.ease(v)
def backdrop(title,number,note):
    im=Image.new("RGB",(W,H),INK);d=ImageDraw.Draw(im)
    d.line((51,69,1226,69),fill=(66,103,102),width=2)
    txt(d,(55,31),"RUWAIDIX / BIOPHYSICAL METHODS / PUBLISHED PRIMARY FIGURES",14,MINT,"bold")
    txt(d,(1126,31),f"{number:02d}/08",15,GOLD,"bold")
    txt(d,(51,96),title,46,CREAM)
    txt(d,(55,161),note,16,GOLD,"bold")
    d.line((51,669,1226,669),fill=(69,106,99),width=2)
    txt(d,(52,690),"2020 METHODS AND PROTOCOLS  /  DOI 10.3390/MPS3040065  /  CELL MODEL ≠ PATIENT",12,MINT,"sans")
    return im,d
def full_panel(n,im,label,t,region=None):
    src=figure(n)
    # Never clip the first presentation of a measured image.
    target=ImageOps.contain(src,(1110,513),Image.Resampling.LANCZOS)
    if region:
        sw,sh=src.size
        x0,y0,x1,y1=region
        target=ImageOps.contain(src.crop((int(x0*sw),int(y0*sh),int(x1*sw),int(y1*sh))),(1120,512),Image.Resampling.LANCZOS)
    pos=((W-target.width)//2+int(math.sin(t*.3)*7),207+(445-target.height)//2)
    im.paste(target,pos);d=ImageDraw.Draw(im)
    d.rectangle((pos[0]-3,pos[1]-3,pos[0]+target.width+3,pos[1]+target.height+3),outline=GOLD,width=3)
    d.rounded_rectangle((43,610,1226,647),radius=8,fill=(17,42,46))
    txt(d,(58,618),label,17,CREAM,"sans")
    return im
def real_chamber(t):
    im,d=backdrop("THE EXPERIMENT IS A CHAMBER",1,"REAL FIGURE 1 / PHYSICAL ARRANGEMENT")
    return full_panel(1,im,"ORIGINAL FIGURE 1 • UNALTERED MULTIPANEL APPARATUS / NOT A HUMAN LUNG",t)
def chamber_detail(t):
    im,d=backdrop("FOLLOW THE BUBBLE",2,"REAL FIGURE 1 / CAMERA ON EXPERIMENTAL APPARATUS")
    region=(.49,0,.99,.61) if t>=5 else None
    return full_panel(1,im,"FULL FIGURE SHOWN FIRST; SUBSEQUENT CAMERA CROP OF THE SAME SOURCE",t,region)
def interface(t):
    im,d=backdrop("WHERE STRESS APPEARS",3,"EXPLANATORY FLUID INTERFACE / NO COMPUTED STRESS PROFILE")
    d.rounded_rectangle((121,274,1159,559),radius=22,fill=(20,54,58),outline=MINT,width=4)
    d.line((149,507,1133,507),fill=GOLD,width=7)
    for k in range(17):
        x=156+k*59
        d.rounded_rectangle((x,517,x+52,548),radius=12,outline=MINT,width=3)
        d.ellipse((x+20,524,x+33,536),fill=STEEL)
    x=105+900*ease(t/15)
    d.rounded_rectangle((160,313,min(1111,x),489),radius=82,fill=(191,215,207),outline=CREAM,width=7) if x>205 else None
    d.arc((x-44,317,x+54,487),-90,93,fill=GOLD,width=7)
    if x>300:
        for k in range(6):
            px=185+k*150
            if px<x:
                d.line((px,495,px,465+8*math.sin(t*.7+k)),fill=GOLD,width=4)
    txt(d,(169,588),"MOVING MENISCUS → LOCAL LOAD ON A CULTURED EPITHELIAL MONOLAYER",21,CREAM,"sans")
    return im
def cell_evidence(t):
    im,d=backdrop("THE ACTUAL LIVE–DEAD IMAGES",4,"FIGURE 5 / FULL SOURCE PANEL AND DOCUMENTED CONTROLS")
    return full_panel(5,im,"ORIGINAL 2020 FIGURE 5: GREEN = LIVE, RED = DEAD • STAINING IS REAL",t)
def control_detail(t):
    im,d=backdrop("A MEASURED DIFFERENCE",5,"FIGURE 5 / ORIGINAL SEVEN-REPLICATE BAR")
    # True Fig5 panel C only after displaying source whole above.
    return full_panel(5,im,"ORIGINAL FIGURE 5 PANEL C / VALIDATED REPLICATES, NOT A RE-DRAWN GRAPH",t,
                      (.54,.14,.97,.93) if t>=5 else None)
def actin_full(t):
    im,d=backdrop("THE CYTOSKELETON",6,"FIGURE 6 / MICROSCOPY OF ACTIN FILAMENTS AND NUCLEI")
    return full_panel(6,im,"UNALTERED FIGURE 6 / GREEN ACTIN + BLUE DAPI / NO GENERATED CELLS",t)
def filament_caution(t):
    im,d=backdrop("NOT ALL MEASURES MOVE TOGETHER",7,"ACTIN ORIENTATION / LIMITED INFERENCE")
    if t<5:
        return full_panel(6,im,"FIRST: TRUE FIGURE 6. NO STATISTICALLY SIGNIFICANT ACTIN CHANGE REPORTED.",t)
    # Qualitative line orientation: not a measured angle histogram or new image.
    for group in range(2):
        xx=140+group*620
        d.rounded_rectangle((xx,253,xx+478,537),radius=16,outline=MINT,width=2)
        for j in range(12):
            x=xx+42+j*35
            bend=14*math.sin(j*.9+t*.65) if group else 0
            d.line((x,306+bend,x+38,467-bend),fill=GOLD if group else STEEL,width=4)
        txt(d,(xx+27,559),"CELL MODEL : ILLUSTRATIVE LINES",16,CREAM,"sans")
    return im
def boundary(t):
    im,d=backdrop("ONE MODEL. ONE LIMIT.",8,"EVIDENCE / NO IN-VIVO EXTRAPOLATION")
    return full_panel(1,im,"ACTUAL APPARATUS, DEFINED CELL MODEL. THIS IS NOT A PATIENT OUTCOME.",t)

NARRATION=[
"A microbubble crosses a cultured lung epithelial monolayer. The paper documents the apparatus. The photograph on screen is from the experiment, not a patient's lung.",
"A syringe pump drives flow through the parallel plate chamber. Its coverslips support epithelial cells, while an advancing air–liquid interface creates the mechanical event.",
"The conceptual animation shows an interface moving over cells. This is not a measured stress field, and no velocity or force has been invented.",
"Here are the real live–dead micrographs. The control and the bubble-exposed cells are separate study conditions with fluorescence-based viability staining.",
"Seven repetitions revealed a substantially higher cell-death percentage after bubble propagation, approximately fifty-three percent, compared with near-zero control death.",
"The paper also imaged F-actin and nuclei. These are its actual microscopy panels, not AI-generated cytoskeletal photographs or unrelated studies.",
"A single bubble did not yield a statistically significant change in actin organization. Differences suggested by visual inspection cannot replace the measured statistical result.",
"The chamber makes a difficult reopening event experimentally observable. It does not on its own predict the outcome of ventilation in a living patient."
]
DRAW=[real_chamber,chamber_detail,interface,cell_evidence,control_detail,actin_full,filament_caution,boundary]
def correct_art(film,num):
    path=SOURCES/f"{film}-figure-{num:02d}.jpg"
    return figure(num).copy(),path
def draw_scene(film,scene,i,t,art,region):return DRAW[i](t)
def main():
    data=json.loads((SOURCES/"source-figure-provenance.json").read_text())
    matched={v["figure_number"]:v for v in data["figures"] if v["film"]==FILM}
    assert set(matched)=={1,5,6}
    for n,record in matched.items():
        path=SOURCES/f"{FILM}-figure-{n:02d}.jpg"
        assert record["doi"]==DOI and hashlib.sha256(path.read_bytes()).hexdigest()==record["sha256"]
    cfg={"title":"A Bubble Across a Cell Monolayer: Measured and Unmeasured","doi":DOI,
         "source":"Published 2020 Methods and Protocols, same-DOI original Figures 1, 5, 6",
         "media_license":"CC BY 4.0, original study authors; no photographic substitutions",
         "visual_thesis":"Full-frame real chamber/viability/actin figures with distinct physics animation; no artificial result figures.",
         "scenes":[{"figure":[1,1,1,5,5,6,6,1][i],
                    "mode":"source","headline":["SOURCE"],"eyebrow":"PROVENANCE",
                    "narration":NARRATION[i]} for i in range(8)]}
    base.read_art=correct_art
    base.scene_camera=lambda film,scene,i:(figure(scene["figure"]).copy(),None,SOURCES/f"{FILM}-figure-{scene['figure']:02d}.jpg")
    base.full_scene=draw_scene
    base.render(FILM,cfg,ROOT/"film-models")
    p=base.OUT/(FILM+".json")
    manifest=json.loads(p.read_text())
    manifest["edition"]="V5 full-width 2020 study documentary with separate source-correct motion"
    manifest["human_review"]="NOT APPROVED — check scientific interpretation, figure crops, voice and all 8 chapters."
    manifest["documented_figures"]={str(n):matched[n]["caption"] for n in matched}
    p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
if __name__=="__main__":main()
