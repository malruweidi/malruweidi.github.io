#!/usr/bin/env python3
"""Curcumin–cyanide 2019: a source-specific 120-second eight-scene documentary.

The photographic/spectral panel is the author's archived FOUR-PANEL source
figure, NOT a stock image or a synthetic spectrum. Original values come from
Analytical Methods 2019 DOI 10.1039/C9AY01557D. Crops are openly labelled.
No generated cellular fluorescence image is shown as observed microscopy.
"""
import io,math,hashlib,importlib.util,json,subprocess,tempfile
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps,ImageFilter

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"assets/home-archive/figure-cyanide-sensor.jpg"
OUT=ROOT/"assets/films/series-v3"
SLUG="curcumin-cyanide"
DOI="10.1039/C9AY01557D"
GIT_SHA="05f658f81f63fe0811699dd686955a232be97e36"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
W,H=1280,720
INK=(11,24,32);PAPER=(244,234,216);TURQUOISE=(112,194,183)
YELLOW=(241,198,80);ORANGE=(223,111,66);RED=(201,88,92);MUTED=(150,187,189)
SCENES=[
{"title":"The colour of a test","speech":"A bright yellow solution turns orange when cyanide is introduced. But does the colour change actually identify one ion, or only something about the mixture?","source":"2019 Analytical Methods 11:5169–5176; original author-archived four-panel photograph and absorption data."},
{"title":"The original scientific record","speech":"This is the published experiment, not a substitute stock photograph. The four panels record absorption, visible colour, fluorescence emission, and the vials under ultraviolet light.","source":"Owner archive figure-cyanide-sensor.jpg, visual panels a–d; RSC DOI 10.1039/C9AY01557D. Figure numbering pending original PDF inspection."},
{"title":"What changes in solution","speech":"The test was in ninety percent acetonitrile and ten percent water. Curcumin began yellow, while added cyanide produced a striking orange solution. This is not a water-only assay.","source":"2019 study Abstract: CH3CN:H2O 90:10; curcumin visible yellow-to-orange response; archived panel b."},
{"title":"Two spectral landmarks","speech":"The original absorbance figure gives the numerical story. The original band at four hundred twenty-one nanometres decreases, while a strong signal emerges at five hundred twenty. The shift is ninety-nine nanometres.","source":"2019 article measured UV-vis values 421 and 520 nm, shift 99 nm; original panel a."},
{"title":"Selectivity is conditional","speech":"Most tested monovalent anions caused no comparable response. Hydroxide is the important exception: it also changed the colour. That caveat belongs beside the claim of cyanide sensing.","source":"2019 article lists controls F−, Cl−, Br−, I−, acetate, dihydrogen arsenate, azide; hydroxide similar more intense response."},
{"title":"The light dims","speech":"Curcumin emits fluorescence around five hundred twenty nanometres. Adding cyanide quenched that emission. These are the actual fluorescence results, accompanied by photographed sample vials.","source":"2019 paper fluorescence at 520 nm and quenching; original four-panel figure panels c/d."},
{"title":"A cellular observation","speech":"Curcumin fluorescence was also observed in living cells. After cyanide was added, the signal slowly faded over time. The schematic here is illustrative; it is not a fabricated cell image.","source":"2019 article reports living-cell fluorescence and slow quenching; source microscopy image not staged, therefore never fabricated."},
{"title":"What the result does not mean","speech":"The reported detection limit was two point three micromolar under the study conditions. Solvent composition, hydroxide interference, and the cellular time response all limit the interpretation. Specificity must be tested, not assumed.","source":"2019 article lower limit 2.3 × 10^-6 molar, 90:10 CH3CN-water, hydroxide response and cell time dependence."}
]

def font(size=22,bold=False,serif=False):
    return ImageFont.truetype(SERIF if serif else BOLD if bold else SANS,size)
def txt(d,x,y,text,size=24,color=PAPER,bold=False,serif=False):
    d.text((x,y),text,font=font(size,bold,serif),fill=color)
def clamp(v):return min(1,max(0,v))
def smooth(v):v=clamp(v);return v*v*(3-2*v)
def bg():
    im=Image.new("RGB",(W,H),INK);d=ImageDraw.Draw(im)
    for y in range(H):
        f=y/H;d.line((0,y,W,y),fill=(int(9+11*f),int(26+13*f),int(34+9*f)))
    for k in range(9):
        x=140+k*130
        d.line((x,0,x,H),fill=(21,47,53),width=1)
    return im

def base(k,t):
    im=bg();d=ImageDraw.Draw(im)
    txt(d,59,24,"RUWAIDIX  /  ANALYTICAL CHEMISTRY  /  2019",14,TURQUOISE,True)
    txt(d,1086,24,f"STUDY  {k+1:02d}/08",15,YELLOW,True)
    d.line((58,63,1224,63),fill=(61,100,102),width=2)
    d.rectangle((55,677,1226,680),fill=(39,70,74))
    d.rectangle((55,677,int(55+1171*(k+t/15)/8),680),fill=YELLOW)
    txt(d,58,690,"Analytical Methods 2019  ·  DOI 10.1039/C9AY01557D  ·  SOURCE-SPECIFIC CINEMA",12,MUTED)
    return im,d

def heading(d,lines,small=None,y=188,size=59):
    for i,s in enumerate(lines):txt(d,57,y+i*(size+8),s,size,PAPER,serif=True)
    if small:txt(d,59,y+len(lines)*(size+8)+23,small,19,YELLOW)

def orig():
    return Image.open(SOURCE).convert("RGB")

def panel(which):
    x=orig()
    # Cropped quadrants preserve original spectra/legend, never redraw data.
    box={"a":(0,0,316,219),"b":(315,0,716,213),
         "c":(0,214,317,448),"d":(315,211,716,448)}
    return x.crop(box[which])

def exhibit(im,d,source,rect,tag):
    xx,yy,ww,hh=rect
    contained=ImageOps.contain(source,(ww,hh),Image.Resampling.LANCZOS)
    d.rectangle((xx-6,yy-6,xx+ww+6,yy+hh+6),fill=(226,228,221))
    im.paste(contained,(xx+(ww-contained.width)//2,yy+(hh-contained.height)//2))
    d.rectangle((xx-7,yy-7,xx+ww+7,yy+hh+7),outline=YELLOW,width=2)
    txt(d,xx,yy+hh+18,tag,14,MUTED)

def vessels(d,t,cx=930,cy=411):
    for i,(lab,col) in enumerate([("REFERENCE",YELLOW),("CYANIDE",ORANGE)]):
        x=cx+(i*175)-90
        yy=cy-95
        d.rounded_rectangle((x,yy,x+119,yy+215),radius=18,outline=(176,198,188),width=5)
        level=yy+100+(35 if i else 0)-7*math.sin(t*.35+i)
        d.rounded_rectangle((x+11,level,x+108,yy+206),radius=12,fill=col)
        d.line((x+16,yy+17,x+16,yy+160),fill=(241,245,239),width=4)
        txt(d,x-4,yy+234,lab,15,TURQUOISE,True)

def s0(im,d,t):
    heading(d,["AN ORANGE","WARNING"],"A PHOTO FROM THE RESEARCH, NOT STOCK",178,66)
    exhibit(im,d,panel("b"),(562,224,640,330),"ARCHIVED EXPERIMENTAL IMAGE / VISIBLE ION RESPONSE")

def s1(im,d,t):
    txt(d,65,110,"THE FOUR PANELS BELONG TO THIS EXACT STUDY",38,PAPER,serif=True)
    exhibit(im,d,orig(),(151,188,978,400),"AUTHOR-ARCHIVED PUBLISHED FOUR-PANEL RECORD / DO NOT CHANGE AXES OR COLORS")
    txt(d,61,615,"(a) Absorbance   (b) Visible colour   (c) Emission   (d) UV-photographed solutions",16,YELLOW)

def s2(im,d,t):
    heading(d,["NOT WATER","ALONE"],"90% ACETONITRILE  /  10% WATER",168,58)
    vessels(d,t)
    d.arc((581,468,774,564),200,348,fill=YELLOW,width=6)
    d.polygon([(764,507),(787,520),(768,534)],fill=YELLOW)
    txt(d,590,583,"Illustrative vials; actual source photograph in the previous scene.",14,MUTED)

def s3(im,d,t):
    heading(d,["A 99 nm","RED SHIFT"],"Measured absorption, not an invented curve",165,61)
    exhibit(im,d,panel("a"),(600,216,582,384),"SOURCE PANEL (a) / 421 nm → 520 nm")
    txt(d,71,522,"421",50,YELLOW,True)
    txt(d,207,529,"→",42,TURQUOISE)
    txt(d,288,522,"520",50,ORANGE,True)
    txt(d,74,585,"Wavelength / nm",15,MUTED)

def s4(im,d,t):
    heading(d,["ONE CRITICAL","EXCEPTION"],"A sensing claim must survive its controls",146,53)
    ions=["F−","Cl−","Br−","I−","AcO−","N₃−","CN−","OH−"]
    for i,name in enumerate(ions):
        x=518+(i%4)*166;y=284+(i//4)*138
        is_exception=i==7
        is_cyanide=i==6
        border=ORANGE if is_cyanide else RED if is_exception else TURQUOISE
        d.rounded_rectangle((x,y,x+139,y+99),radius=18,outline=border,width=4,fill=(25,51,56))
        txt(d,x+30,y+19,name,31,PAPER,True)
        label="RESPONSE" if is_exception or is_cyanide else "NO SIMILAR SHIFT"
        txt(d,x+12,y+66,label,12,border)
    txt(d,526,591,"Hydroxide produced a similar, more intense color response in the reported tests.",17,YELLOW)
    txt(d,66,598,"Not every anion is displayed. Conditions and concentration matter.",13,MUTED)

def s5(im,d,t):
    heading(d,["FLUORESCENCE","GOES QUIET"],"Measured emission near 520 nm",128,51)
    exhibit(im,d,panel("c"),(582,213,294,343),"ORIGINAL SOURCE (c)")
    exhibit(im,d,panel("d"),(905,213,307,343),"ORIGINAL SOURCE (d)")
    txt(d,61,573,"The paper reports cyanide-dependent fluorescence quenching.",18,YELLOW)

def s6(im,d,t):
    heading(d,["A SIGNAL","IN CELLS"],"Conceptual illustration / not microscopy",140,60)
    p=smooth(t/15)
    for i in range(10):
        x=588+(i%5)*131;y=270+(i//5)*141
        d.ellipse((x-45,y-47,x+46,y+46),outline=TURQUOISE,width=4)
        intensity=int((1-p*.9)*180)
        d.ellipse((x-12,y-13,x+12,y+13),fill=(intensity,intensity,35))
        d.arc((x-28,y-24,x+30,y+27),0,250,fill=(77,137,144),width=2)
    txt(d,582,584,"SLOW CELLULAR QUENCHING REPORTED; NO ORIGINAL CELL IMAGE USED",15,YELLOW)
    txt(d,60,605,"No fabricated confocal picture or kinetic trace.",14,MUTED)

def s7(im,d,t):
    heading(d,["THE TEST HAS","CONDITIONS"],"Evidence has boundaries",126,59)
    facts=[("2.3 µM","REPORTED LIMIT OF DETECTION"),
           ("90:10","ACETONITRILE TO WATER"),
           ("OH−","SIMILAR COLOR RESPONSE"),
           ("SLOW","LIVING-CELL QUENCHING")]
    for i,(value,label) in enumerate(facts):
        x=567+(i%2)*328;y=281+(i//2)*155
        d.rounded_rectangle((x,y,x+286,y+127),radius=15,fill=(25,56,63),outline=ORANGE if i==2 else TURQUOISE,width=3)
        txt(d,x+16,y+12,value,40,YELLOW,True)
        txt(d,x+18,y+88,label,13,PAPER)
    txt(d,63,605,"No unconditional claim of selective cyanide analysis in pure water.",17,ORANGE)

DRAWERS=[s0,s1,s2,s3,s4,s5,s6,s7]

def validate():
    raw=SOURCE.read_bytes()
    blob=b"blob "+str(len(raw)).encode()+b"\x00"+raw
    assert hashlib.sha1(blob).hexdigest()==GIT_SHA,"Source-archive image was changed without review"
    assert Image.open(SOURCE).size==(716,448)
    assert len(SCENES)==8

def main():
    validate()
    p=ROOT/"scripts/render-making-medicines-v3.py"
    spec=importlib.util.spec_from_file_location("ruwaidix_cinema_engine",p)
    engine=importlib.util.module_from_spec(spec);spec.loader.exec_module(engine)
    engine.OUT=OUT;engine.NAME=SLUG;engine.SCENES=SCENES;engine.DRAWERS=DRAWERS;engine.frame_base=base
    OUT.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="ruwaidix-curcumin-2019-") as td:
        tmp=Path(td)
        _,voice=engine.wav_voice(ROOT/"film-models",tmp)
        engine.subtitles(tmp,voice)
        clips=[engine.clip(i,tmp) for i in range(8)]
        cat=tmp/"concat.txt";cat.write_text("".join(f"file '{f}'\n" for f in clips))
        master=OUT/(SLUG+".mp4")
        subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(cat),
                        "-i",str(tmp/"narration.wav"),"-map","0:v","-map","1:a","-c:v","copy",
                        "-c:a","aac","-b:a","160k","-t","120","-movflags","+faststart",str(master)],check=True)
        (OUT/(SLUG+".vtt")).write_bytes((tmp/"captions.vtt").read_bytes())
        p=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(master)]))
        secs=float(p["format"]["duration"])
        assert abs(secs-120)<.38 and master.stat().st_size<98_000_000
        doc={"id":SLUG,"edition":"V3 source-specific colorimetric / fluorimetric cyanide experiment","primary_doi":DOI,
             "title":"Curcumin a colorimetric and fluorimetric cyanide probe in aqueous system and living cells",
             "original_author_archived_figure":"assets/home-archive/figure-cyanide-sensor.jpg",
             "source_image_git_blob_sha":GIT_SHA,"figure_panel_identity":"a absorption; b solution colors; c fluorescence; d UV samples. Original figure number pending source PDF confirmation.",
             "permissions":"RSC article-author reuse provision requires accurate attribution and can be confirmed before live embed",
             "no_stock_or_crossstudy_figures":True,"original_2019_spectra_unchanged":True,
             "duration_seconds":secs,"sha256":hashlib.sha256(master.read_bytes()).hexdigest(),"chapters":SCENES,
             "human_review":"NOT APPROVED; must audition each scene and confirm exact archived four-panel figure provenance before replacing public edition"}
        (OUT/(SLUG+".json")).write_text(json.dumps(doc,ensure_ascii=False,indent=2)+"\n")
        print("ENCODED SOURCE-SPECIFIC 2019 CYANIDE FILM",master,master.stat().st_size,flush=True)
if __name__=="__main__":main()
