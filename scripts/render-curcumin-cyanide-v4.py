#!/usr/bin/env python3
"""V4 re-edit of actual curcumin–cyanide study, with larger source figure panels.

Only the 2019 author's own four-panel archive is used for measured phenomena.
No spectrogram is invented; source crops keep original x/y axes and vial
colours. The earlier V1/V2/V3 editions are preserved.
"""
import importlib.util,json,math,functools
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("curcumin_v3",(ROOT/"scripts/render-curcumin-cyanide-v3.py"))
base=importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
base.OUT=ROOT/"assets/films/series-v4"
W,H=base.W,base.H
YELLOW=base.YELLOW;ORANGE=base.ORANGE;PAPER=base.PAPER
INK=base.INK;MUTED=base.MUTED;TURQUOISE=base.TURQUOISE
CROP=base.panel

def mat(image,part,rect,credit):
    x,y,w,h=rect
    pic=ImageOps.contain(CROP(part),(w,h),Image.Resampling.LANCZOS)
    draw=ImageDraw.Draw(image)
    draw.rectangle((x-9,y-9,x+w+9,y+h+9),fill=(230,231,219))
    X=x+(w-pic.width)//2
    Y=y+(h-pic.height)//2
    image.paste(pic,(X,Y))
    draw=ImageDraw.Draw(image)
    draw.rectangle((x-9,y-9,x+w+9,y+h+9),outline=YELLOW,width=3)
    base.txt(draw,x,y+h+23,credit,15,MUTED)

def s0(im,d,t):
    base.heading(d,["THE SAMPLE","CHANGES"],"ACTUAL SOLUTION VIALS FROM THIS STUDY",178,60)
    mat(im,"b",(480,185,722,382),"RSC ANALYTICAL METHODS 2019 / AUTHOR ARCHIVE, PANEL (b)")

def s1(im,d,t):
    base.txt(d,56,115,"FOUR ACTUAL MEASUREMENTS, ONE EXPERIMENT",41,PAPER,serif=True)
    original=base.orig()
    pic=ImageOps.contain(original,(1080,454),Image.Resampling.LANCZOS)
    im.paste(pic,((W-pic.width)//2,175+(454-pic.height)//2))
    d=ImageDraw.Draw(im)
    base.txt(d,68,642,"(a) UV–VIS ABSORBANCE   (b) COLOUR   (c) FLUORESCENCE   (d) UV-LIT SOLUTIONS",17,YELLOW)
    base.txt(d,68,666,"Unaltered four-panel author-archived source; all four phenomena are from DOI 10.1039/C9AY01557D.",13,MUTED)

def s3(im,d,t):
    base.heading(d,["TWO PEAKS.","ONE SHIFT."],"421 nm   →   520 nm   /   99 nm BATHOCHROMIC SHIFT",174,52)
    mat(im,"a",(460,200,726,410),"ORIGINAL MEASURED ABSORBANCE PANEL (a) / UNMODIFIED AXES")
    d=ImageDraw.Draw(im)
    # Emphasise the actual reported values, not an invented continuous curve.
    base.txt(d,79,513,"421",50,YELLOW,True)
    base.txt(d,217,514,"→",49,TURQUOISE)
    base.txt(d,315,513,"520",50,ORANGE,True)

def s4(im,d,t):
    base.heading(d,["THE CONTROL","THAT MATTERS"],"Hydroxide also changes the reported colour",133,57)
    ions=[("F−",False),("Cl−",False),("Br−",False),("I−",False),
          ("AcO−",False),("N₃−",False),("CN−",True),("OH−",True)]
    for i,(label,positive) in enumerate(ions):
        visible=base.smooth(t/14.8)>(i/9)
        if not visible:continue
        x=519+(i%4)*165;y=287+(i//4)*142
        stroke=ORANGE if i==6 else (225,91,91) if i==7 else TURQUOISE
        d.rounded_rectangle((x,y,x+139,y+96),radius=16,fill=(24,53,57),outline=stroke,width=4)
        base.txt(d,x+27,y+12,label,30,PAPER,True)
        base.txt(d,x+12,y+68,"COLOR CHANGE" if positive else "NO SIMILAR SHIFT",11,stroke,True)
    base.txt(d,526,594,"A response to OH− limits how specifically the assay identifies CN−.",19,YELLOW)

def s5(im,d,t):
    d=ImageDraw.Draw(im)
    base.heading(d,["TWO VIEWS OF","LIGHT LOSS"],"Source spectroscopy, then source-vial photo",133,55)
    focus="c" if t<7.5 else "d"
    credit="ORIGINAL FLUORESCENCE SPECTRA, PANEL (c)" if focus=="c" else "ORIGINAL UV-LIT SOLUTIONS, PANEL (d)"
    mat(im,focus,(497,216,685,382),credit)
    d=ImageDraw.Draw(im)
    base.txt(d,58,603,"Cyanide quenched curcumin emission around 520 nm.",19,YELLOW)

def main():
    retake=list(base.DRAWERS)
    retake[0]=s0
    retake[1]=s1
    retake[3]=s3
    retake[4]=s4
    retake[5]=s5
    base.DRAWERS=retake
    base.main()
    f=base.OUT/(base.SLUG+".json")
    record=json.loads(f.read_text())
    record["edition"]="V4 source-panel-led curcumin–cyanide documentary / larger archival original measured spectra and photographs"
    record["picture_design"]="Source panels are framed and re-sized without changing original axes or spectra; source chemistry is not illustrated using other papers."
    record["human_review"]="NOT APPROVED. Confirm source full PDF figure numbering, optical pronunciations and cinematic playback before releasing."
    f.write_text(json.dumps(record,indent=2,ensure_ascii=False)+"\n")
    print("CURCUMIN V4 SCIENTIFIC VISUAL RETAKE RENDERED; HUMAN REVIEW STILL REQUIRED")
if __name__=="__main__":main()
