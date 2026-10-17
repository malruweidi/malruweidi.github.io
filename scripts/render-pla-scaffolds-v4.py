#!/usr/bin/env python3
"""2020 electrospun PLA mats documentary: a completely separate film from 2021 PLA foil.

Reuses only shared audio/encoding infrastructure, NEVER the 2021 article's art.
All measured images come from verified DOI 10.1016/j.surfcoat.2020.126216.
Original explanatory physics is labelled conceptual; original axes untouched.
"""
import importlib.util,json,math
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
PATH=ROOT/"scripts/render-study-figures-v4.py"
spec=importlib.util.spec_from_file_location("ruwaidix_source_film",PATH)
fx=importlib.util.module_from_spec(spec);spec.loader.exec_module(fx)
FIG=ROOT/"assets/films/source-figures/v4/pla-scaffolds"
DOI="10.1016/j.surfcoat.2020.126216"
fx.FIG=FIG
film="pla-scaffolds"
original_layers=fx.visual_layers
original_credit=fx.credit

def credit(d,slug,scene,cropped,figure):
    d.rectangle((0,666,fx.W,fx.H),fill=(12,35,39))
    is_table=figure==3
    if scene["mode"] in ("interface","surface"):
        note="EXPLANATORY SCHEMATIC / 2020 FIBRE-MAT EXPERIMENT; NOT IMAGING"
    else:
        title="TABLE 3" if is_table else f"FIGURE {figure}"
        note=f"{title} • ORIGINAL 2020 PLA FIBRE MAT STUDY • DOI {DOI}"
    if cropped:note += " • STUDY-SPECIFIC DOCUMENTED CROP"
    fx.text(d,(36,680),note,12,fx.GRAY,"sans")

def physical_motion(d,slug,scene,t):
    mode=scene["mode"]
    if mode=="interface":
        # FIBRE electrospinning from the actual Figure 1, not a drop or airway meniscus.
        # Motion is a qualitative polymer-jet depiction (not high-speed footage).
        tip=(750,246)
        collector=(1050,548)
        d.ellipse((tip[0]-23,tip[1]-20,tip[0]+23,tip[1]+20),outline=fx.MINT,width=4)
        d.polygon([(738,259),(762,259),(750,277)],fill=fx.SAND)
        d.line((644,550,1190,550),fill=fx.GRAY,width=7)
        d.line((644,566,1190,566),fill=fx.MINT,width=3)
        progress=fx.ease(t/15)
        for j in range(23):
            if progress < j/28:continue
            start=(j/23)*math.pi*2
            points=[]
            for z in range(33):
                v=z/32
                xx=750+300*v+18*math.sin(start+v*18+t*.8)*v
                yy=285+245*v+11*math.cos(start+v*15+t*.5)*v
                points.append((xx,yy))
            d.line(points,fill=fx.SAND if j%3==0 else fx.MINT,width=2)
        fx.text(d,(518,582),"POLYMER JET / ELECTRIC FIELD / COLLECTION: CONCEPTUAL",14,fx.CREAM,"bold")
    elif mode=="surface":
        # Excited species appear *above* a raster fiber structure; no radical
        # identity or precise kinetics are claimed.
        for j in range(10):
            y=446+j*14
            d.line([(487,y),(1203,y+9*math.sin(j+t*.22))],
                   fill=(65+3*j,125+2*j,123+j),width=6)
        fraction=fx.ease(t/15)
        for j in range(70):
            if j/70 > fraction:continue
            x=494+(j*71)%690
            y=364+(j*37)%128
            size=3+j%4
            d.ellipse((x-size,y-size,x+size,y+size),fill=fx.SAND)
            if j%4==0:d.line((x,y-13,x,y-4),fill=fx.MINT,width=2)
        fx.text(d,(522,592),"QUALITATIVE PLASMA ACTIVE-SITE MODEL / 30 s SELECTED",14,fx.CREAM,"bold")
    else:original_layers(d,slug,scene,t)

def source_image(slug,figure):
    name=f"pla-scaffolds-figure-{figure:02d}.jpg"
    img=FIG/name
    if not img.is_file():
        raise FileNotFoundError("Cannot silently substitute another study image: "+str(img))
    return Image.open(img).convert("RGB"),img

def main():
    cfg=json.loads((ROOT/"assets/films/V4-PLA-SCAFFOLDS-2020-DIRECTORIAL.json").read_text())
    assert cfg["publication"]["doi"]==DOI
    provenance=json.loads((FIG/"source-provenance.json").read_text())
    assert provenance["doi"]==DOI and len(provenance["figures"])==5
    assert len(cfg["video"]["chapters"])==8
    film_config={
      "title":cfg["video"]["title"],"doi":DOI,"source":cfg["video"]["source"],
      "media_license":cfg["video"]["media_license"],"visual_thesis":cfg["video"]["visual_thesis"],
      "scenes":cfg["video"]["chapters"]
    }
    fx.read_art=source_image
    fx.credit=credit
    fx.visual_layers=physical_motion
    fx.FOCUS["pla-scaffolds"]={3:(.05,.46,.51,1.00)}  # SEM full quadrant of original source figure
    # The table is an ordinal assessment, not a numeric measurement trend.
    # Do not animate invented axes or bacteria micrographs.
    fx.render(film,film_config,ROOT/"film-models")
    target=fx.OUT/(film+".json")
    obj=json.loads(target.read_text())
    obj["publisher_pdf_sha256"]=provenance["pdf_sha256"]
    obj["original_figures"]="Figures 1/5/6/7 and ORIGINAL Table 3 of the 2020 scaffold study"
    obj["distinction"]="Do not use separate 2021 PLA film-aluminium peel experiment"
    obj["human_review"]="NOT APPROVED — study figure crop review, pronunciation and rights attribution remain"
    target.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+"\n")

if __name__=="__main__":main()
