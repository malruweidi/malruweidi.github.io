#!/usr/bin/env python3
"""A review, not a fabricated microfluidic experiment: 8-chapter V5 documentary.

Only primary paper Figure 1 from DOI 10.1007/s42247-021-00169-7 appears.
All other science visuals are independently authored explanatory animations,
clearly labelled NOT ACTUAL EXPERIMENT. No related-paper media substitutions.
"""
import importlib.util,functools,hashlib,json,math
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps,ImageFilter

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"assets/films/source-figures/v4/microfluidic-virus"
PATH=SOURCE/"microfluidic-virus-figure-01-source-page.jpg"
DOI="10.1007/s42247-021-00169-7"
spec=importlib.util.spec_from_file_location("film_base_microfluidic",ROOT/"scripts/render-study-figures-v4.py")
core=importlib.util.module_from_spec(spec);spec.loader.exec_module(core)
core.OUT=ROOT/"assets/films/series-v5"
core.FIG=SOURCE
FILM="microfluidic-virus"
W,H=core.W,core.H
INK=(11,28,32); CREAM=(248,235,213); LIGHT=(150,203,182); GOLD=(229,172,111); BLUE=(97,154,178)
SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
@functools.lru_cache(maxsize=4)
def src():return Image.open(PATH).convert("RGB")
@functools.lru_cache(maxsize=3)
def science_panel(kind):
    img=src()
    if kind=="page":return ImageOps.contain(img,(735,603),Image.Resampling.LANCZOS)
    w,h=img.size
    # Figure 1 is the top-right original, on p.145 of the verified DOI PDF.
    return ImageOps.contain(img.crop((int(w*.35),int(h*.067),int(w*.948),int(h*.277))),(960,540),Image.Resampling.LANCZOS)
def font(n,typ="sans"):return ImageFont.truetype(SERIF if typ=="serif" else BOLD if typ=="bold" else SANS,n)
def say(d,p,s,n=23,shade=CREAM,typ="sans"):d.text(p,s,font=font(n,typ),fill=shade)
def stage(title,chap,eyebrow):
    im=Image.new("RGB",(W,H),INK);d=ImageDraw.Draw(im)
    say(d,(51,29),"RUWAIDIX    /    THE TECHNOLOGY OF DETECTION",16,LIGHT,"bold")
    say(d,(1117,28),f"{chap:02} / 08",16,GOLD,"bold")
    d.line((52,66,1224,66),fill=(73,110,107),width=2)
    say(d,(49,89),title,47,CREAM,"serif")
    say(d,(52,154),eyebrow,16,GOLD,"bold")
    d.line((52,674,1225,674),fill=(81,112,112),width=2)
    say(d,(54,691),"DOI 10.1007/S42247-021-00169-7   /   REVIEW FIGURE OR EXPLICITLY CONCEPTUAL MOTION",12,LIGHT)
    return im,d
def mix(a,b,t):return a+(b-a)*max(0,min(t,1))
def ease(t): t=max(0,min(t,1));return t*t*(3-2*t)
def arrow(d,ax,ay,bx,by,col=GOLD):
    d.line((ax,ay,bx,by),fill=col,width=5)
    dx=bx-ax;dy=by-ay;length=math.hypot(dx,dy) or 1
    u,v=dx/length,dy/length
    d.polygon([(bx,by),(bx-15*u+7*v,by-15*v-7*u),(bx-15*u-7*v,by-15*v+7*u)],fill=col)
def component(d,x,y,title,note,w=272,h=160):
    d.rounded_rectangle((x,y,x+w,y+h),radius=23,outline=(91,153,138),width=4,fill=(22,53,57))
    say(d,(x+22,y+29),title,26,CREAM,"serif")
    say(d,(x+22,y+102),note,17,LIGHT)
def particle(d,x,y,s=12,color=GOLD):
    d.ellipse((x-s,y-s,x+s,y+s),outline=color,width=3)
    for k in range(8):
        a=k*math.pi/4
        d.line((x+(s+2)*math.cos(a),y+(s+2)*math.sin(a),x+(s+8)*math.cos(a),y+(s+8)*math.sin(a)),fill=color,width=2)
def real_page(t):
    im,d=stage("A REVIEW, NOT A NEW DEVICE",1,"2021  /  EMERGENT MATERIALS  /  OPEN ACCESS")
    page=science_panel("page")
    im.paste(page,(W-page.width-52,(H-page.height)//2+8))
    d=ImageDraw.Draw(im)
    d.rectangle((W-page.width-55,(H-page.height)//2+6,W-50,(H+page.height)//2+13),outline=GOLD,width=2)
    for k,piece in enumerate(["Figure 1 is the authors'","own conceptual overview.","No patient data are shown."]):
        say(d,(67,297+k*58),piece,29,CREAM,"serif")
    say(d,(66,602),"FULL PAGE / NATIONAL LIBRARY ARCHIVE",16,GOLD)
    return im
def path_motion(t):
    im,d=stage("FROM SPECIMEN TO ANSWER",2,"DIRECT DETECTION / SAMPLES ARE NOT ASSAYS")
    boxes=[(60,288,"BODY FLUID","Collection"),(497,288,"CHIP","Sample handling"),(934,288,"SIGNAL","Interpretation")]
    for x,y,a,b in boxes:component(d,x,y,a,b,w=265,h=180)
    arrow(d,330,377,490,377);arrow(d,769,377,929,377)
    for k in range(5):
        xx=mix(330,930,(t/15+k*.2)%1)
        d.ellipse((xx-6,364,xx+6,377),fill=BLUE)
    say(d,(76,550),"Saliva, swab fluid, or blood: each needs its own method.",22)
    say(d,(76,585),"ILLUSTRATIVE FLOW / NOT A SINGLE VALIDATED DIAGNOSTIC",15,GOLD)
    return im
def target_choice(t):
    im,d=stage("WHAT DOES THE ASSAY FIND?",3,"VIRAL PARTICLE VS NUCLEIC ACID")
    component(d,104,237,"INTACT PARTICLE","Particle / antigen",w=445,h=300)
    component(d,732,237,"GENETIC MATERIAL","RNA or DNA",w=445,h=300)
    shift=int(28*math.sin(t*.8))
    particle(d,334+shift,390,53,GOLD)
    d.arc((847,310,1095,477),15,170,fill=LIGHT,width=8)
    for k in range(9):
        x=849+k*28
        y=396+30*math.sin(k*.8+t*.2)
        d.ellipse((x-7,y-7,x+7,y+7),fill=BLUE if k%2 else GOLD)
    say(d,(145,572),"Different targets demand different capture strategies.",22)
    say(d,(145,608),"EXPLANATORY DRAWING  /  NO CLAIM OF ASSAY PERFORMANCE",15,GOLD)
    return im
def figure_focus(t):
    im,d=stage("FIGURE 1: THE ORIGINAL FRAMEWORK",4,"ACTUAL PRIMARY-PAPER FIGURE / NOT DEVICE PHOTOGRAPHY")
    fig=science_panel("figure")
    x=(W-fig.width)//2+int(11*math.sin(t*.21));y=188+(445-fig.height)//2
    im.paste(fig,(x,y));d=ImageDraw.Draw(im)
    d.rectangle((x-4,y-4,x+fig.width+4,y+fig.height+4),outline=GOLD,width=3)
    say(d,(75,625),"Crop of the unmodified original Figure 1, page 145.",17,LIGHT)
    return im
def capture(t):
    im,d=stage("SELECTIVE RECOGNITION",5,"ANTIBODY / APTAMER / ENZYME / BEADS: ALTERNATIVES")
    # Six parallel fluid lanes to show assay design alternatives, not an actual chip.
    for k in range(4):
        yy=262+k*80
        d.rounded_rectangle((108,yy,1160,yy+46),radius=21,outline=(66,122,128),width=3)
        for i in range(9):
            x=167+i*105
            if i%3==0:
                d.line((x,yy+39,x,yy+18),fill=LIGHT,width=3)
                d.ellipse((x-5,yy+9,x+5,yy+20),fill=GOLD)
        pos=150+round(790*((t/15+k*.15)%1))
        particle(d,pos,yy+21,11,BLUE)
    say(d,(120,610),"Hypothetical parallel detection chemistries. No original device footage.",17,GOLD)
    return im
def transducer(t,type_name="optical"):
    im,d=stage("CONVERT CAPTURE INTO SIGNAL",6 if type_name=="optical" else 7,
               "OPTICAL" if type_name=="optical" else "ELECTRICAL / ELECTROCHEMICAL")
    # Trajectories are designed illustrations without numerical y axis.
    d.rounded_rectangle((78,236,1192,581),radius=16,outline=(78,132,122),width=4)
    for i in range(13):
        x=124+i*86
        d.line((x,271,x,544),fill=(32,65,67),width=2)
    d.line((101,492,1160,492),fill=LIGHT,width=3)
    if type_name=="optical":
        for k in range(24):
            x=119+k*43
            y=389+76*math.sin(k*.37-t*1.2)
            d.ellipse((x-4,y-4,x+4,y+4),fill=GOLD if k%2 else BLUE)
        say(d,(147,596),"Illustrative optical readout / not measured fluorescence.",18,GOLD)
    else:
        pts=[]
        for x in range(115,1156,8):
            f=(x-115)/1040
            y=410-62*math.sin(f*24+t*.7)-23*math.sin(f*77)
            pts.append((x,y))
        d.line(pts,fill=GOLD,width=4)
        say(d,(144,597),"Illustrative transduction / not recorded sensor current.",18,GOLD)
    return im
def boundary(t):
    im,d=stage("A SCHEMATIC IS NOT A CLINICAL TEST",8,"SEPARATE DESIGN FROM VALIDATION")
    component(d,78,252,"DESIGN","Potential assay",350,210)
    component(d,835,252,"VALIDATION","Independent samples",350,210)
    arrow(d,438,360,827,360)
    say(d,(134,541),"The 2021 work surveys technologies; it does not validate a",26,CREAM,"serif")
    say(d,(134,585),"single universal respiratory-virus diagnostic device.",26,CREAM,"serif")
    return im

SCENES=[
{"narration":"This open-access paper is a review, not a new patient experiment. Its published Figure One maps possible ways microfluidic systems might detect respiratory viruses."},
{"narration":"Sample preparation is upstream of detection. A swab, saliva specimen, or other fluid must be handled before a device can produce an interpretable signal."},
{"narration":"Some methods seek viral particles or antigens. Others search for viral nucleic acid. Those distinct targets create very different assay architectures."},
{"narration":"The authors' original Figure One connects sample, sensing elements, and transduction. These are alternatives, not proof that one fabricated chip performs every assay."},
{"narration":"An antibody, aptamer, magnetic bead, nanoparticle, or enzyme can form part of the sensing strategy. Specificity still depends on careful recognition chemistry."},
{"narration":"In optical schemes, changes in light are translated into a readout. The moving traces here explain the idea; they are not experimental results."},
{"narration":"Electrical and electrochemical methods use different signal pathways and calibration requirements. A visually convincing waveform alone cannot establish diagnostic accuracy."},
{"narration":"The scientific contribution is a critical map of detection technologies. Clinical validity requires sensitivity, specificity, controls, and verification in a defined population."}
]
def correct_art(film,num):
    if not PATH.exists():raise FileNotFoundError("Verified DOI Figure 1 source page unavailable.")
    return src().copy(),PATH

def custom_scene(film,scene,index,t,art,region):
    return [real_page,path_motion,target_choice,figure_focus,capture,lambda t:transducer(t,"optical"),
            lambda t:transducer(t,"electrical"),boundary][index](t)

def main():
    verified=json.loads((SOURCE/"source-provenance.json").read_text())
    if verified["doi"]!=DOI or verified["pmcid"]!="PMC7992628":raise ValueError("Figure from another study is forbidden")
    if hashlib.sha256(PATH.read_bytes()).hexdigest()!=verified["sha256"]:raise ValueError("Actual figure pixels changed")
    captions=["PRIMARY SOURCE","SAMPLE HANDLING","TARGET SELECTION","THE PUBLISHED SCHEMATIC",
              "BINDING CHEMISTRY","OPTICAL DETECTION","ELECTRICAL TRANSDUCTION","A REVIEW IS NOT A TRIAL"]
    scenes=[]
    for i,item in enumerate(SCENES):
        scenes.append({**item,"figure":1,"mode":"source","eyebrow":"Source-locked","headline":[captions[i]],
                       "evidence_caption":verified["caption"] if i in (0,3) else "Original authors' conceptual mechanism"})
    record={"title":"The Virus on a Chip: Detection Without Guesswork","doi":DOI,
            "source":"Tarim et al., 2021 Emergent Materials, DOI 10.1007/s42247-021-00169-7",
            "media_license":"Original Figure 1 CC BY 4.0; clearly labelled new explanatory diagrams by Ruwaidix",
            "visual_thesis":"One genuine Figure 1 shown in whole-page context and as a labelled excerpt. All other frames are disclosed unmeasured explanatory reconstructions.",
            "scenes":scenes}
    core.read_art=correct_art
    core.scene_camera=lambda film,scene,i:(src().copy(),None,PATH)
    core.full_scene=custom_scene
    core.render(FILM,record,ROOT/"film-models")
    p=core.OUT/(FILM+".json")
    data=json.loads(p.read_text())
    data["edition"]="V5 unique microfluidic review documentary / 8 evidence-led episodes"
    data["primary_figure"]="2021 paper original Figure 1 from page 145 of exact DOI national-library copy"
    data["validity"]="REVIEW: no new experiment or clinical device results are claimed"
    data["human_review"]="NOT APPROVED; verify all pronunciations, timings and figure identity before default live replacement"
    p.write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n")
if __name__=="__main__":main()
