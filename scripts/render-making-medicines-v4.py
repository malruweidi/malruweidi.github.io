#!/usr/bin/env python3
"""V4 independent cinematic direction for Making Medicines Keep.

Composes actual, provenance-checked Wellcome Minhaj al-dukkān MS Arabic 1002
photographs with bespoke physically inspired 2D animation. No generic pharmacy
illustration, no fabricated historical footage, and no cross-study photographs.
The original V1, V2 and V3 MP4 releases are never overwritten.
"""
import importlib.util, math, json, hashlib, functools, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"assets/films/source-manuscripts/wellcome-ms-arabic-1002"
OUT=ROOT/"assets/films/series-v4"
MOTION=(ROOT/"scripts/render-making-medicines-v3.py")
spec=importlib.util.spec_from_file_location("making_medicines_v3_source",MOTION)
film=importlib.util.module_from_spec(spec)
spec.loader.exec_module(film)
film.OUT=OUT
W,H=film.W,film.H
CREAM=(240,224,193)
SAND=(211,167,110)
PALE=(246,236,213)
COPPER=(167,87,43)
GREEN=(105,161,139)
BLACK=(11,24,27)
FF=Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf")
BOLD=Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
PLAIN=Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")

def clamp(t):return max(0,min(1,t))
def ease(t):t=clamp(t);return t*t*(3-2*t)
def ft(n,style="serif"):return ImageFont.truetype(str(FF if style=="serif" else BOLD if style=="bold" else PLAIN),n)
def text(d,where,string,n=23,color=CREAM,style="serif",stroke=0):
    d.text(where,string,font=ft(n,style),fill=color,stroke_width=stroke,stroke_fill=BLACK)
def line(d,pts,col,w=2):d.line(pts,fill=col,width=w,joint="curve")
def matte(im,d,x=0,y=0,w=W,h=H,opacity=145):
    im.paste(Image.new("RGB",(w,h),BLACK),(x,y),Image.new("L",(w,h),opacity))
def top_label(d,sec):
    text(d,(55,39),"RUWAIDIX   /   MATERIAL HISTORIES",14,GREEN,"bold")
    text(d,(1051,39),f"FILM 01    {sec:02d}/08",14,SAND,"bold")
    line(d,[(54,72),(1226,72)],(100,131,115),1)
def bottom_label(d,msg):
    d.rounded_rectangle((46,656,1233,702),8,fill=(18,43,45))
    text(d,(63,671),msg,14,CREAM,"plain")

@functools.lru_cache(maxsize=7)
def photo(num):
    return Image.open(SOURCE/f"canvas-{num:03d}.jpg").convert("RGB")

_RESIZED = {}
def _pan_crop(src,t,fx=.5,fy=.5,zoom=1.01):
    # Re-use pixels resized from a verified source; only camera crop moves.
    sw,sh=src.size;ratio=max(W/sw,H/sh)
    scale=ratio*zoom
    nw,nh=round(sw*scale),round(sh*scale)
    key=(id(src),nw,nh)
    if key not in _RESIZED:
        _RESIZED[key]=src.resize((nw,nh),Image.Resampling.BICUBIC)
    visible=_RESIZED[key]
    dx=max(0,nw-W);dy=max(0,nh-H)
    ax=int(clamp(fx)*dx);ay=int(clamp(fy)*dy)
    return visible.crop((ax,ay,ax+W,ay+H))

def manuscript_frame(num,t,zoom=1.27,back=(18,29,28),px=.44,py=.50):
    src=photo(num)
    # Present the actual scanned leaf without altered glyphs; crop/pan is cinematic.
    return _pan_crop(src,t,px+.06*math.sin(t*.12),py+.04*math.cos(t*.11),zoom)

@functools.lru_cache(maxsize=6)
def _shadow_overlay(amount,reverse):
    # Compose a real alpha gradient once rather than rewriting every pixel.
    band=Image.new("RGBA",(W,H),(0,0,0,0))
    draw=ImageDraw.Draw(band)
    for x in range(W):
        pos=(W-x)/W if reverse else x/W
        alpha=round(amount*max(0,1-pos*1.25)**1.5)
        draw.line((x,0,x,H),fill=(10,25,28,alpha),width=1)
    return band

def shader(im,amount=152,reverse=False):
    return Image.alpha_composite(im.convert("RGBA"),
                                 _shadow_overlay(amount,reverse)).convert("RGB")

def baseline(k,t):
    # Less UI chrome. A cinematic shot may occupy the entire viewport.
    im=Image.new("RGB",(W,H),BLACK)
    return im,ImageDraw.Draw(im)

def source_credit(d,short="WELLCOME COLLECTION  /  MS ARABIC 1002  /  EGYPT 1904"):
    bottom_label(d,short)

def _glass(d,center=(875,417),wide=340,high=320,fillfraction=.50,heat=.0):
    cx,cy=center;wx=wide/2
    left,right=cx-wx,cx+wx
    top,bottom=cy-high/2,cy+high/2
    # Trapezoidal copper pot, copper lip, natural fluid and specular reflection.
    d.polygon([(left+22,top+20),(right-22,top+20),(right-50,bottom),
               (left+50,bottom)],fill=(46,63,56))
    d.polygon([(left+36,top+35),(right-36,top+35),(right-58,bottom-7),
               (left+58,bottom-7)],fill=(88,66,47))
    y=bottom-high*.79*fillfraction
    d.polygon([(left+35,y),(right-35,y),(right-58,bottom-9),(left+58,bottom-9)],fill=(170,93,42))
    d.ellipse((left+32,y-10,right-32,y+18),fill=(213,142,71),outline=(241,200,114),width=3)
    for n in range(3):
        wave=math.sin(heat*.7+n*.9)
        line(d,[(left+70+n*42,y+65+wave*4),(right-60,y+65+wave*4)],(226,158,82),2)
    d.arc((left+20,top-10,right-20,top+70),190,350,fill=(231,171,100),width=13)
    d.arc((left+20,top-10,right-20,top+70),0,175,fill=(202,122,63),width=13)
    for n in range(6):
        x=cx+(n-3)*39
        d.arc((x-18,bottom-26,x+21,bottom+42),215,355,fill=(191,92,46),width=4)

def _text_group(d,eyebrow,headline,body,x=55,y=155,heading=59,body_size=24):
    text(d,(x,y),eyebrow.upper(),16,SAND,"bold")
    for n,ln in enumerate(headline):
        text(d,(x,y+51+n*(heading+11)),ln,heading,PALE)
    for n,ln in enumerate(body):
        text(d,(x,y+52+len(headline)*(heading+11)+n*36),ln,body_size,CREAM,"plain")

def opening(im,d,t):
    # Camera across actual 1904 volume binding; no generic Cairo photo.
    b=manuscript_frame(1,t,zoom=1.37,px=.57,py=.53)
    im.paste(shader(b,255,False))
    d=ImageDraw.Draw(im)
    text(d,(57,147),"A RESEARCH FILM ABOUT A MATERIAL THAT MUST LAST",16,SAND,"bold")
    text(d,(50,239),"MAKING",91,PALE)
    text(d,(50,340),"MEDICINES",91,PALE)
    text(d,(54,439),"KEEP",101,PALE)
    line(d,[(58,571),(531,571)],SAND,3)
    text(d,(58,591),"Cairo pharmacy / original handbook composed 1260",18,CREAM,"plain")
    source_credit(d,"GENUINE LATER MANUSCRIPT WITNESS / MS ARABIC 1002 / EGYPT 1904")

def actual_book(im,d,t):
    b=manuscript_frame(13,t,zoom=1.55,px=.57,py=.49)
    im.paste(b)
    im.paste(Image.new("RGB",(W,H),BLACK),(0,0),
      Image.new("L",(W,H),int(48+14*math.sin(.45*t))))
    d=ImageDraw.Draw(im)
    # Title is a floating, translucent physical archival film label.
    d.rounded_rectangle((68,440,815,633),radius=10,fill=(12,33,35))
    text(d,(97,459),"THE DOCUMENT IS REAL",19,SAND,"bold")
    text(d,(92,500),"Minhāj al-dukkān",46,PALE)
    text(d,(97,560),"Written in Cairo, 1260  /  copied in Egypt, 1904",18,CREAM,"plain")
    source_credit(d,"WELLCOME MS ARABIC 1002; FULL HISTORICAL ARABIC SPREAD / NOT THE GENIZAH")

def vehicle(im,d,t):
    # Glass/copper vessel fills field and changes as liquid enters; form is an abstract identity.
    im.paste(_pan_crop(photo(26),t,.88,.30,1.4))
    im.paste(Image.new("RGB",(W,H),BLACK),(0,0),Image.new("L",(W,H),225))
    d=ImageDraw.Draw(im)
    _glass(d,(912,381),490,490,fillfraction=.42+.29*ease(t/15),heat=t)
    # pour - amber ribbon is animation of process, no false laboratory observation
    pts=[(1050,98),(1032,154),(1005,225),(972,302)]
    for k in range(3):line(d,[(px-k*4,py) for px,py in pts],(218+k*8,145+k*6,66),6)
    _text_group(d,"julep / julāb",["THE BASE","IS NOT","PASSIVE"],["Rose water + sugar.","Fruit gives the form."],x=55,y=182,heading=56,body_size=23)
    bottom_label(d,"AL-KŪHĪN'S MATERIAL ANALOGY / ILLUSTRATIVE COMPOUNDING VESSEL")

def clarification(im,d,t):
    im.paste(_pan_crop(photo(26),t,.35,.50,1.28))
    im.paste(Image.new("RGB",(W,H),BLACK),(0,0),Image.new("L",(W,H),231))
    d=ImageDraw.Draw(im)
    _glass(d,(665,421),665,464,.60,heat=t)
    # Foam is progressively skimmed by a spoon: no claim surviving apparatus.
    q=ease(t/15)
    n=max(0,26-round(q*22))
    for i in range(n):
        col=(229,216,182) if i%3 else (183,201,190)
        x=390+(i*47)%530
        y=249+(i*11)%48
        r=4+i%4
        d.ellipse((x-r,y-r,x+r,y+r),outline=col,width=2)
    sx=381+int(q*515)
    d.ellipse((sx-76,230,sx+76,272),outline=PALE,width=5)
    line(d,[(sx+48,252),(sx+187,156)],(176,142,95),10)
    d.rounded_rectangle((59,138,402,244),10,fill=(13,32,35))
    text(d,(78,158),"CLARIFY",57,PALE)
    text(d,(77,215),"Dissolve  /  Skim  /  Strain",19,SAND,"plain")
    bottom_label(d,"PROCESS RECONSTRUCTION / EGG-WHITE CLARIFICATION + CLOTH FILTRATION")

def endpoint(im,d,t):
    im.paste(_pan_crop(photo(13),t,.5,.45,1.35))
    im.paste(Image.new("RGB",(W,H),BLACK),(0,0),Image.new("L",(W,H),230))
    d=ImageDraw.Draw(im)
    # syrup stretching strand: variable flow length, not artificially quantified.
    cx=884
    x=815+math.sin(t*.13)*15
    fill=(209,147,76)
    d.arc((x-88,154,x+89,342),185,345,fill=(215,165,105),width=14)
    upper_y=271
    line(d,[(cx,upper_y),(cx+13,295),(cx+10,360+54*math.sin(t*.31)),(cx-18,500+20*math.sin(t*.25))],fill,25)
    d.ellipse((722,473,1077,585),fill=(130,71,39),outline=(229,174,103),width=9)
    _text_group(d,"qiwām",["NOT","A NUMBER"],["A recognized material state.","A judgment made in practice."],x=58,y=180,heading=65)
    bottom_label(d,"PERCEIVED CONSISTENCY / NO HISTORICAL VISCOSITY, WATER-ACTIVITY OR SHELF-LIFE ASSAY")

def crystallization(im,d,t):
    # Fingerprint-like crystallized sugar dissolves while warm water enters.
    im.paste(_pan_crop(photo(26),t,.84,.63,1.5))
    im.paste(Image.new("RGB",(W,H),BLACK),(0,0),Image.new("L",(W,H),232))
    d=ImageDraw.Draw(im)
    d.ellipse((631,227,1185,631),fill=(73,65,47),outline=(196,139,74),width=13)
    q=ease(t/15)
    randomizer=random.Random(726)
    for k in range(188):
        x=randomizer.randrange(686,1133);y=randomizer.randrange(282,579)
        dx=(x-901)/210;dy=(y-419)/137
        if dx*dx+dy*dy>1:continue
        r=max(1,int((1-q)*randomizer.choice([6,7,10,13])))
        d.polygon([(x-r,y),(x,y-r),(x+r,y),(x,y+r)],fill=(217,193,144))
    for k in range(int(3+q*6)):
        xx=936+k*25
        d.ellipse((xx-12,142+k*12,xx+12,162+k*12),fill=GREEN)
    _text_group(d,"tasakkur",["WHEN","SYRUP","FAILS"],["Add warm water.","Dissolve and correct."],x=59,y=182,heading=57)
    bottom_label(d,"REPAIR IS IN THE SOURCE TEXT / THIS ANIMATION IS NOT A MEASURED EXPERIMENT")

def substitution(im,d,t):
    # True Arabic text as backplate; overlaid balancing judgement with simple organic ingredients.
    im.paste(_pan_crop(photo(13),t,.57,.5,1.7))
    im.paste(Image.new("RGB",(W,H),BLACK),(0,0),Image.new("L",(W,H),196))
    d=ImageDraw.Draw(im)
    text(d,(57,143),"THE SUBSTITUTE",61,PALE)
    text(d,(57,207),"IS A JUDGMENT",61,PALE)
    d.ellipse((756,310,1109,623),outline=SAND,width=4)
    for j,(ang,r) in enumerate([(0,86),(2.1,62),(4.2,48)]):
        xx=932+91*math.cos(ang+t*.15)
        yy=459+91*math.sin(ang+t*.15)
        d.ellipse((xx-r/2,yy-r/2,xx+r/2,yy+r/2),
                  fill=((121+17*j),(142-21*j),(77+16*j)),
                  outline=PALE,width=3)
    line(d,[(755,299),(1109,299)],SAND,4)
    d.arc((839,286,1014,301),0,180,fill=PALE,width=4)
    text(d,(61,356),"Similarity of appearance",26,CREAM,"plain")
    text(d,(61,398),"does not establish",26,CREAM,"plain")
    text(d,(61,440),"functional equivalence.",26,CREAM,"plain")
    bottom_label(d,"SCARCITY / FUNCTION / ROUTE / HONESTY — NOT MODERN BIOEQUIVALENCE")

def recipe_gap(im,d,t):
    # The page is from Wellcome handbook, deliberately NOT presented as a Genizah prescription.
    im.paste(_pan_crop(photo(13),t,.56,.43,1.6))
    im.paste(Image.new("RGB",(W,H),BLACK),(0,0),Image.new("L",(W,H),182))
    d=ImageDraw.Draw(im)
    q=ease(t/15)
    text(d,(55,152),"THE PAGE",86,PALE)
    text(d,(55,244),"IS NOT",84,PALE)
    text(d,(56,336),"THE SHELF",84,PALE)
    line(d,[(60,461),(840,461)],SAND,3)
    text(d,(65,493),"A prescription records therapeutic demand.",29,CREAM)
    text(d,(64,541),"An inventory records only some possible supply.",25,CREAM)
    text(d,(60,594),"Neither proves the medicine was dispensed.",24,SAND)
    bottom_label(d,"BACKGROUND: MINHĀJ WITNESS (1904) / GENIZAH IMAGE NOT REPRODUCED")

MOVES=[opening,actual_book,vehicle,clarification,endpoint,crystallization,substitution,recipe_gap]

def main():
    film.frame_base=baseline
    film.DRAWERS=MOVES
    film.main()
    original=OUT/"making-medicines-keep.json"
    obj=json.loads(original.read_text(encoding="utf8"))
    obj["edition"]="V4 archival-material documentary / 8 cinematic chapters"
    obj["motion_style"]="Archival scan camera moves, bespoke full-field material processes and high-contrast editorial titles; no generated fake historical photography."
    obj["visual_primary_evidence"]="Wellcome MS Arabic 1002 (copy Egypt 1904), originally composed 1260, publicly catalogued and retrieved via verified IIIF"
    obj["previous_v3"]=str(Path("assets/films/series-v3/making-medicines-keep.mp4"))
    obj["human_review"]="NOT HUMAN REVIEWED — cinematic, historical, legal and pronunciation screening required."
    original.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("V4 FILM RENDERED in",str(OUT))

if __name__=="__main__":main()
