#!/usr/bin/env python3
"""2020 original PLA electrospun antimicrobial scaffold study — V3 source cinema.

Every scientific image comes from the actual 2020 PDF DOI
10.1016/j.surfcoat.2020.126216, NOT the unrelated 2021 PLA-film paper.
Unchanged, attributed experimental panels and source page hashes are carried
with the release; animation is marked conceptual and never fabricates data.
"""
import hashlib,importlib.util,json,math,subprocess,tempfile
from pathlib import Path
from functools import lru_cache
from PIL import Image,ImageDraw,ImageFont,ImageOps

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"assets/films/source-figures/pla-scaffolds-2020"
OUT=ROOT/"assets/films/series-v3"
NAME="pla-scaffolds"
DOI="10.1016/j.surfcoat.2020.126216"
W,H=1280,720;PALE=(245,238,224);INK=(13,36,40)
MINT=(126,190,171);BLUE=(83,133,154);AMBER=(225,165,94)
PEACH=(212,109,94);SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

SCENES=[
 {"title":"SURFACE, NOT JUST SHAPE","speech":"An electrospun polymer mat can have the intended shape and still invite bacterial colonization. This study asked whether its surface could be changed.","figure":None},
 {"title":"THREE REAL STEPS","speech":"The published method combined electrospinning, radiofrequency plasma treatment, and then ascorbic or fumaric acid modification. This is the original figure from that experiment.","figure":"Figure 1"},
 {"title":"THIRTY SECONDS","speech":"Plasma treatment produced reactive surfaces. The study selected thirty seconds for subsequent modification, balancing functionalization with damage that can accumulate during longer treatment.","figure":None},
 {"title":"THE ACTUAL MICROGRAPHS","speech":"These micrographs belong to this exact scaffold paper. Untreated, plasma-treated, ascorbic-grafted and fumaric-grafted fibres show different surface textures, with three-micrometre scale bars.","figure":"Figure 5"},
 {"title":"WETTABILITY IS NOT SIMPLE","speech":"Water contact angle fell with plasma treatment and ascorbic grafting. Fumaric acid grafting instead produced a high water contact angle. The measured table shows why material identity matters.","figure":"Figure 6 / Table 2"},
 {"title":"A CHEMICAL FINGERPRINT","speech":"The paper's infrared spectra support interpretation of functional changes after treatment. Spectral assignments belong alongside microscopy and the other material evidence, not in place of them.","figure":"Figure 7"},
 {"title":"THE ANTIMICROBIAL ASSAY","speech":"In the reported colony assessment, both acid-grafted scaffolds received zero growth scores against Staphylococcus aureus and Escherichia coli. That is an in-vitro result.","figure":"Table 3"},
 {"title":"NOT YET A CLINICAL DEVICE","speech":"The research demonstrates surface alteration and an antimicrobial response in an assay. Clinical infection prevention, durability and biological compatibility remain separate questions.","figure":None}
]
def ft(n,typ="regular"):return ImageFont.truetype({"regular":SANS,"bold":BOLD,"serif":SERIF}[typ],n)
def txt(d,x,y,s,n=22,c=PALE,k="regular"):d.text((x,y),s,font=ft(n,k),fill=c)
def ease(a):a=max(0,min(1,a));return a*a*(3-2*a)
def line(d,points,c,width=3):d.line(points,fill=c,width=width,joint="curve")
def background(k,t):
 im=Image.new("RGB",(W,H),INK);d=ImageDraw.Draw(im)
 for y in range(H):
  h=y/H
  d.line((0,y,W,y),fill=(int(11+11*h),int(31+15*h),int(37+17*h)))
 txt(d,53,33,"RUWAIDIX / ORIGINAL MATERIALS RESEARCH",15,MINT,"bold")
 txt(d,973,33,f"SCT 2020   {k+1:02d}/08",14,AMBER,"bold")
 line(d,[(51,68),(1230,68)],(65,104,108),2)
 line(d,[(55,675),(55+1170*(k+t/15)/8,675)],AMBER,4)
 txt(d,56,699,"PRIMARY DATA: POPELKA ET AL., 2020 / DOI 10.1016/J.SURFCOAT.2020.126216",11,MINT)
 return im,d
def heading(d,lines,x=51,y=193,size=60):
 for i,item in enumerate(lines):txt(d,x,y+i*(size+11),item,size,PALE,"serif")
@lru_cache(maxsize=6)
def raw(label):
 name={"Figure 1":"figure-1","Figure 5":"figure-5","Figure 6 / Table 2":"figure-6",
       "Figure 7":"figure-7","Table 3":"table-3"}[label]
 return Image.open(BASE/(name+"-full-source-page.png")).convert("RGB")
def actual(im,d,key,rect,bounds,caption):
 # Pixel-preserving zoom of original paper page region; the figure itself
 # is not recolored, annotated over, or altered. Attribution sits outside.
 page=raw(key);x0,y0,x1,y1=bounds
 region=page.crop((x0,y0,x1,y1))
 box=(rect[2]-rect[0],rect[3]-rect[1])
 pasted=ImageOps.contain(region,box,method=Image.Resampling.LANCZOS)
 ox=rect[0]+(box[0]-pasted.width)//2
 oy=rect[1]+(box[1]-pasted.height)//2
 d.rectangle((ox-8,oy-8,ox+pasted.width+8,oy+pasted.height+8),fill=PALE)
 im.paste(pasted,(ox,oy))
 d.rectangle((ox-8,oy-8,ox+pasted.width+8,oy+pasted.height+8),outline=AMBER,width=3)
 txt(d,rect[0]+6,rect[3]+11,caption,13,MINT)
def fibers(d,t,small=False):
 for k in range(19):
  x1=310+(k%5)*110
  x2=650+(k%7)*87
  y=165+k*23
  points=[]
  for j in range(30):
   alpha=j/29
   xx=x1+(x2-x1)*alpha
   yy=y+30*math.sin(alpha*6+k*.7+t*.28)
   points.append((xx,yy))
  c=(83+6*(k%3),126+7*(k%5),135+3*(k%2))
  line(d,points,c,11 if not small else 5)
def s0(im,d,t):
 heading(d,["A FIBRE","IS AN","INTERFACE"],size=69)
 fibers(d,t)
 txt(d,55,600,"PLA electrospun scaffold / conceptual magnification",18,MINT)
def s1(im,d,t):
 txt(d,67,110,"FROM THE ACTUAL 2020 PAPER",22,AMBER,"bold")
 actual(im,d,"Figure 1",(150,154,1160,592),(101,112,923,618),
        "Source Fig. 1 / electrospinning → plasma → ASA or FA; original chemistry preserved")
def s2(im,d,t):
 heading(d,["PLASMA","ACTIVATION"],size=65)
 fibers(d,t,small=True)
 q=ease(t/15)
 for k in range(25):
  x=560+k*26;y=214+(k%8)*46
  a=math.sin(t*3.4+k*.8)
  rad=3+int(8*q)
  d.ellipse((x-rad,y-rad,x+rad,y+rad),fill=AMBER if a>0 else MINT)
 txt(d,556,606,"ILLUSTRATIVE CHARGED-SPECIES INTERACTIONS / NO MEASURED FLUX",15,MINT)
def s3(im,d,t):
 heading(d,["THE REAL","SEM PANELS"],size=53)
 actual(im,d,"Figure 5",(508,132,1183,601),(113,102,899,891),
        "Fig. 5 a–d; all original 3 µm scale bars retained")
def s4(im,d,t):
 heading(d,["NOT ONE","WETTING","RESPONSE"],size=54)
 actual(im,d,"Figure 6 / Table 2",(487,145,1212,612),(103,452,844,944),
       "Table 2 original: water contact angle / ASA versus FA materially different")
def s5(im,d,t):
 heading(d,["THE FTIR","SPECTRA"],size=58)
 actual(im,d,"Figure 7",(480,128,1207,598),(181,156,802,788),
        "Fig. 7 authentic FTIR-ATR; original ordinate, abscissa and legend preserved")
def s6(im,d,t):
 heading(d,["TESTED","AGAINST","BACTERIA"],size=52)
 actual(im,d,"Table 3",(593,142,1168,618),(105,505,567,902),
        "Table 3: S. aureus and E. coli colony-assessment scale, original entries")
 txt(d,55,587,"0 = no growth on the",20,AMBER)
 txt(d,55,615,"reported assay scale",20,AMBER)
def s7(im,d,t):
 heading(d,["WHAT DOES","THIS PROVE?"],size=60)
 q=ease(t/15)
 items=[("GRAFTED SURFACE","chemical/material evidence"),
        ("BACTERIAL ASSAY","reported growth assessment"),
        ("CLINICAL PERFORMANCE","not established")]
 for k,(h,sub) in enumerate(items):
  x=620;y=174+k*145
  d.rounded_rectangle((x,y,x+551,y+116),radius=16,fill=(25,61,66),
                      outline=MINT if k<2 else PEACH,width=3)
  txt(d,x+22,y+17,h,25,PALE,"bold")
  txt(d,x+22,y+71,sub,18,AMBER if k<2 else PEACH)
 txt(d,55,620,"Evidence is bounded by its experimental setting.",16,MINT)
DRAW=[s0,s1,s2,s3,s4,s5,s6,s7]

def validate():
 doc=json.loads((BASE/"source-identity.json").read_text())
 assert doc["doi"]==DOI
 for label in ("Figure 1","Figure 5","Figure 6","Figure 7","Table 3"):
  item=next(x for x in doc["study_specific_media"] if x["label"]==label)
  assert hashlib.sha256((ROOT/item["artifact"]).read_bytes()).hexdigest()==item["sha256"]
 return doc
def main():
 source=validate()
 spec=importlib.util.spec_from_file_location("film_encoder",ROOT/"scripts/render-making-medicines-v3.py")
 eng=importlib.util.module_from_spec(spec);spec.loader.exec_module(eng)
 eng.OUT=OUT;eng.NAME=NAME;eng.SCENES=[{"id":f"{i+1:02}","title":s["title"],"speech":s["speech"],"source":DOI} for i,s in enumerate(SCENES)]
 eng.frame_base=background;eng.DRAWERS=DRAW
 OUT.mkdir(exist_ok=True,parents=True)
 with tempfile.TemporaryDirectory(prefix="ruwaidix-2020-pla-scaffold") as tmp:
  wd=Path(tmp)
  _,tts=eng.wav_voice(ROOT/"film-models",wd)
  eng.subtitles(wd,tts)
  clips=[eng.clip(i,wd) for i in range(8)]
  listing=wd/"concat.txt"
  listing.write_text("".join(f"file '{p}'\n" for p in clips))
  movie=OUT/(NAME+".mp4")
  subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(listing),"-i",str(wd/"narration.wav"),"-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-b:a","160k","-t","120","-movflags","+faststart",str(movie)],check=True)
  (OUT/(NAME+".vtt")).write_bytes((wd/"captions.vtt").read_bytes())
  p=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(movie)]))
  duration=float(p["format"]["duration"])
  assert abs(duration-120)<.4
  metadata={"id":NAME,"edition":"V3 original exact-2020-paper PLA scaffold documentary",
   "doi":DOI,"source_paper":"Surface and Coatings Technology (2020), 400:126216",
   "duration_seconds":duration,"sha256":hashlib.sha256(movie.read_bytes()).hexdigest(),
   "license":"CC BY 4.0, source university archive and Popelka et al.",
   "research_boundary":"In-vitro colony assessment is not a clinical device outcome. 2021 PLA-film dataset is distinct.",
   "source_pages":source["study_specific_media"],"chapters":SCENES,
   "human_review":"NOT APPROVED: scientific/cinematic/voice and source panel inspection required"}
  (OUT/(NAME+".json")).write_text(json.dumps(metadata,indent=2,ensure_ascii=False)+"\n")
  print("ENCODED 2020 PLA scaffold V3 original-paper film",movie,movie.stat().st_size,flush=True)
if __name__=="__main__":main()
