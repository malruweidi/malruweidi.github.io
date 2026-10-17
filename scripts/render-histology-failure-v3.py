#!/usr/bin/env python3
"""Two Materials. No Section. — genuine late-2025 lab-archive short film.

All photographs are the owner's actual failed zebrafish histology attempt.
No successful micrographs are substituted and no inference about a molecular
cause or changed tissue morphology is presented as observed data.
"""
import hashlib,importlib.util,io,json,math,subprocess,tempfile
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps

ROOT=Path(__file__).resolve().parents[1]
PHOTOS=ROOT/"assets/2026-10-13-new-photos"
OUT=ROOT/"assets/films/series-v3"
SLUG="histology-failure"
SOURCES=[
("zebrafish-orientation-specimens.webp","963ea9561a986b9858c34f8eb15b95e9aa0daa86"),
("zebrafish-histology-processing.webp","45a46894d7a9bbfbe4cd9194bbce06751fca861c"),
("zebrafish-paraffin-microtomy-failure.webp","746a499ab1571a351a60bbacdcdb694560ea952f")]
W,H=1280,720
DARK=(11,27,34);WHITE=(247,241,223);GOLD=(222,164,101);TEAL=(121,191,181);GRAY=(168,194,189);ROSE=(209,125,142)
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
SCENES=[
{"title":"Small specimens and a question","speech":"I needed histological sections of zebrafish embryos. They were small, and their orientation mattered: a slice through the wrong plane could miss the anatomy I wanted to study.","source":"Owner's 2025 image of five oriented zebrafish specimens, no outcome claimed."},
{"title":"An orientation scaffold","speech":"My first step used two percent agarose as a support. I could position the specimens before the paraffin step, with the hope of preserving the chosen plane during sectioning.","source":"Owner first-person account, 2% agarose preparation; placement photograph."},
{"title":"Two materials in sequence","speech":"The proposal depended on two different materials. Agarose maintained orientation; paraffin was supposed to support thin sections after processing. The second stage would have to integrate with the first.","source":"First-person description, not a claim of chemical bonding between matrices."},
{"title":"The laboratory attempt","speech":"This is the real processing apparatus from that attempt. It records what was tried, but a photograph of the instrument is not evidence that a usable section was made.","source":"Owner late-2025 photograph of laboratory histological processing instrument."},
{"title":"Where the interface mattered","speech":"Instead of behaving like one mechanically coherent block, the embedded materials formed distinguishable layers. A sectioning method that works with one solid block may fail when the material interface separates.","source":"Observed layer separation in first-person record; hypothetical mechanical explanation labelled."},
{"title":"At the microtome","speech":"Here is the actual block in the microtome. At sectioning the material separated and broke apart. The problem was no longer merely positioning a fish; it was obtaining a sectionable composite.","source":"Owner microtomy-failure photograph: actual preparation, no successful tissue section."},
{"title":"No interpretable section","speech":"I did not obtain reliable, interpretable histological sections from this sequence. Nothing here is a successful stained slide, and these photographs should not be used to imply one.","source":"Failed result in first-person field note. No fabricated microscopy or quantitative output."},
{"title":"The next trial would differ","speech":"The failure suggests questions for a new method: embedding compatibility, processing, and orientation controls. Those are experiments still to perform, not results I have already produced.","source":"Future method hypotheses only; exact procedure for successful follow-up not established."}
]

def font(n=24,k="sans"):return ImageFont.truetype({"sans":SANS,"serif":SERIF,"bold":BOLD}[k],n)
def text(d,x,y,s,n=25,color=WHITE,k="sans"):d.text((x,y),s,font=font(n,k),fill=color)
def smooth(x):x=max(0,min(1,x));return x*x*(3-2*x)
def root_image():
    im=Image.new("RGB",(W,H),DARK);d=ImageDraw.Draw(im)
    for y in range(H):
        a=y/H
        d.line((0,y,W,y),fill=(int(10+10*a),int(27+13*a),int(35+10*a)))
    return im
def frame(k,t):
    im=root_image();d=ImageDraw.Draw(im)
    d.line((49,74,1230,74),fill=(68,111,110),width=2)
    text(d,55,35,"RUWAIDIX   /   LABORATORY FIELD NOTE   /   LATE 2025",14,TEAL,"bold")
    text(d,1084,35,f"CHAPTER {k+1:02d}/08",14,GOLD,"bold")
    d.rectangle((55,681,1230,683),fill=(37,69,77))
    d.rectangle((55,681,55+int(1175*(k+t/15)/8),683),fill=GOLD)
    text(d,55,694,"ACTUAL EXPERIMENTAL PHOTOGRAPHS / HYPOTHESES ARE MARKED / NO SUCCESSFUL SECTION",11,GRAY)
    return im,d

cache={}
def photo(n):
    if n not in cache:cache[n]=Image.open(PHOTOS/SOURCES[n][0]).convert("RGB")
    return cache[n]

def picture(im,d,index,x,y,w,h,t=0,full=True,credit=True):
    img=photo(index)
    if full:
        rendered=ImageOps.contain(img,(w,h),Image.Resampling.LANCZOS)
    else:
        scale=max(w/img.width,h/img.height)*(1.12+.04*math.sin(t*.09))
        rendered=img.resize((round(img.width*scale),round(img.height*scale)),Image.Resampling.BICUBIC)
        sx=int((rendered.width-w)*(.46+.1*math.sin(t*.08)));sy=int((rendered.height-h)*(.48+.07*math.cos(t*.08)))
        rendered=rendered.crop((sx,sy,sx+w,sy+h))
    X=x+(w-rendered.width)//2;Y=y+(h-rendered.height)//2
    d.rounded_rectangle((x-6,y-6,x+w+6,y+h+6),radius=8,fill=(236,234,217))
    im.paste(rendered,(X,Y))
    d=ImageDraw.Draw(im)
    if credit:text(d,x,y+h+16,"OWNER'S ORIGINAL FAILED-EXPERIMENT ARCHIVE / 2025",14,GOLD,"bold")
    return d

def headline(d,lines,eyebrow="",y=166,n=57):
    if eyebrow:text(d,58,y-41,eyebrow,16,GOLD,"bold")
    for i,s in enumerate(lines):text(d,57,y+i*(n+10),s,n,WHITE,"serif")

def s0(im,d,t):
    d=picture(im,d,0,528,128,682,491,t,full=False)
    d.rectangle((31,155,506,577),fill=(11,27,34))
    headline(d,["THE PLANE","MATTERED"],"SPECIMEN ORIENTATION",201,63)
    text(d,64,447,"The starting image is real.",22,TEAL)
    text(d,64,492,"The section did not yet exist.",19,GRAY)

def s1(im,d,t):
    d=picture(im,d,0,641,168,514,418,t,full=True)
    headline(d,["TWO-PERCENT","AGAROSE"],"FIRST MATERIAL",189,60)
    text(d,61,477,"Hold the small specimens",21,TEAL)
    text(d,61,514,"in a chosen orientation.",21,TEAL)

def s2(im,d,t):
    headline(d,["TWO","MATERIALS"],"A COMPOSITE MUST HOLD",143,71)
    q=smooth(t/15)
    x=600
    for i,(name,col,Y) in enumerate([("AGAROSE SUPPORT",TEAL,338),("PARAFFIN MATRIX",GOLD,503)]):
        yy=Y+int((1-q)*(-55 if i==0 else 55))
        d.rounded_rectangle((x,yy,x+573,yy+93),radius=13,fill=col)
        text(d,x+32,yy+31,name,26,DARK,"bold")
    for i in range(6):
        xx=644+i*78
        d.ellipse((xx,453,xx+34,471),fill=ROSE)
    text(d,601,627,"Explanatory materials diagram / not an original micrograph",16,GRAY)

def s3(im,d,t):
    d=picture(im,d,1,498,132,710,476,t,full=False)
    d.rectangle((31,148,476,532),fill=(11,27,34))
    headline(d,["THE ACTUAL","APPARATUS"],"DOCUMENTARY PHOTOGRAPH",187,56)
    text(d,59,460,"It was used.",21,TEAL)
    text(d,59,490,"That does not prove success.",18,GRAY)

def s4(im,d,t):
    headline(d,["ONE BLOCK","WAS NEEDED"],"THE MATERIAL INTERFACE",150,58)
    q=smooth(t/15)
    x,y=588,296
    d.rounded_rectangle((x,y,x+559,y+118),radius=11,fill=TEAL)
    d.rounded_rectangle((x,y+123+54*q,x+559,y+254+54*q),radius=11,fill=GOLD)
    d.line((x+30,y+120,x+528,y+120),fill=ROSE,width=5)
    text(d,x+25,y+31,"Agarose",29,DARK,"bold")
    text(d,x+26,y+167+54*q,"Paraffin",29,DARK,"bold")
    text(d,589,620,"Observed separation; proposed mechanical explanation, not a measured modulus",14,GRAY)

def s5(im,d,t):
    d=picture(im,d,2,510,116,697,499,t,full=False)
    d.rectangle((28,169,488,527),fill=(11,27,34))
    headline(d,["AT THE","MICROTOME"],"ACTUAL FAILED BLOCK",207,63)
    text(d,55,466,"The interface broke apart.",21,ROSE)

def s6(im,d,t):
    d=picture(im,d,2,77,146,575,456,t,full=True)
    d.rectangle((671,171,1217,565),fill=DARK)
    text(d,693,185,"THE NEGATIVE RESULT",17,GOLD,"bold")
    text(d,690,258,"NO USABLE",57,WHITE,"serif")
    text(d,690,336,"SECTION",61,WHITE,"serif")
    text(d,696,485,"No stained tissue micrograph",19,TEAL)
    text(d,696,520,"is being claimed.",19,TEAL)

def s7(im,d,t):
    headline(d,["THE NEXT","EXPERIMENT"],"QUESTIONS, NOT RESULTS",141,69)
    ideas=[("01","Embedding compatibility"),("02","Dehydration and clearing"),("03","Orientation and section controls")]
    for i,(code,name) in enumerate(ideas):
        y=292+i*102
        d.rounded_rectangle((576,y,1187,y+81),radius=15,outline=TEAL if i<2 else GOLD,width=3)
        text(d,593,y+21,code,26,GOLD,"bold")
        text(d,650,y+24,name,22,WHITE)
    text(d,589,629,"An unsuccessful experiment remains part of the research record.",17,GRAY)

DRAWERS=[s0,s1,s2,s3,s4,s5,s6,s7]
def validate():
    for name,gitsha in SOURCES:
        raw=(PHOTOS/name).read_bytes()
        assert hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\x00"+raw).hexdigest()==gitsha,"Owner image content changed"
    assert len(SCENES)==8
def main():
    validate()
    file=ROOT/"scripts/render-making-medicines-v3.py"
    spec=importlib.util.spec_from_file_location("rx_histology_audio",file)
    eng=importlib.util.module_from_spec(spec);spec.loader.exec_module(eng)
    eng.OUT=OUT;eng.NAME=SLUG;eng.SCENES=SCENES;eng.DRAWERS=DRAWERS;eng.frame_base=frame
    OUT.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="zebrafish-failed-v3-") as td:
        tmp=Path(td)
        _,times=eng.wav_voice(ROOT/"film-models",tmp)
        eng.subtitles(tmp,times)
        clips=[eng.clip(k,tmp) for k in range(8)]
        listing=tmp/"concat.txt";listing.write_text("".join(f"file '{x}'\n" for x in clips))
        master=OUT/(SLUG+".mp4")
        subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(listing),
                        "-i",str(tmp/"narration.wav"),"-map","0:v","-map","1:a","-c:v","copy","-c:a","aac",
                        "-b:a","160k","-t","120","-movflags","+faststart",str(master)],check=True)
        (OUT/(SLUG+".vtt")).write_bytes((tmp/"captions.vtt").read_bytes())
        f=json.loads(subprocess.check_output(["ffprobe","-loglevel","error","-show_entries","format=duration","-of","json",str(master)]))
        secs=float(f["format"]["duration"]);assert abs(secs-120)<.35
        report={"id":SLUG,"edition":"V3 authored original-failure photography","duration_seconds":secs,
                "sha256":hashlib.sha256(master.read_bytes()).hexdigest(),
                "sources":[{"path":str((PHOTOS/name).relative_to(ROOT)),"git_sha":sha} for name,sha in SOURCES],
                "first_person_source":"stories/failed-zebrafish-histology.html",
                "result":"UNSUCCESSFUL. No interpretable serial zebrafish section obtained",
                "scientific_limit":"Mechanics of agarose-paraffin interface are inferred from observed separation, not proved experimentally. No tissue micrograph, measured modulus, or successful repeat invented.",
                "human_review":"NOT APPROVED. Compare full-size source photographs and listen to film before replacing any original.",
                "chapters":SCENES}
        (OUT/(SLUG+".json")).write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
        print("AUTHENTIC NEGATIVE-RESULT CINEMA",master,master.stat().st_size)
if __name__=="__main__":main()
