#!/usr/bin/env python3
"""2021 PLA surface-grafting paper: original 8-chapter V3 evidence film.

Exact JATS/DOI-confirmed Figures 1, 4 and 8 are used with original panels and
source metadata. All other visuals are labelled conceptual and geometrically
animated, not passed off as microscopy or spectroscopy. Neither the 2020
PLA-scaffold research nor generic stock laboratory images appear here.
"""
import hashlib,importlib.util,io,json,math,random,subprocess,tempfile
from pathlib import Path

import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageOps

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"assets/films/source-figures/v3"
DEST=ROOT/"assets/films/series-v3"
ID="pla-grafting"
DOI="10.3390/polym13213717"
W,H=1280,720
DEEP=(13,28,32)
MINT=(103,179,171)
GOLD=(222,181,118)
PAPER=(246,241,227)
SILVER=(196,210,206)
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
DATA=[
  ("Untreated",74.4),("Plasma only",107),("Untreated + ASA",73.3),
  ("Plasma + ASA",130),("Untreated + FA",87.2),("Plasma + FA",211)
]
SCENES=[
 {"title":"The invisible surface","speech":"Two plastic films may look identical until something meets their surface. We changed the outermost layer of poly lactic acid, then tested how it behaved.","source":"2021 Polymers 13:3717; material study premise."},
 {"title":"A baseline for the experiment","speech":"Untreated PLA had a measured water contact angle of seventy point two degrees. In this experiment, that helped establish the reference surface for comparison.","source":"2021 paper Table 1; water contact angle 70.2 (±1.6) degrees."},
 {"title":"Plasma changes the contact layer","speech":"Cold plasma alters the film's contact surface. The next question is whether new surface chemistry can be introduced, rather than merely depositing molecules on an unprepared polymer.","source":"2021 paper methods and discussion; illustrative plasma activation mechanism, not experimental footage."},
 {"title":"Two different grafting reagents","speech":"The study compared ascorbic acid with fumaric acid after plasma treatment. Their different surface responses became a test of what chemical modification had actually achieved.","source":"Original 2021 grafting study; ASA versus FA treatments."},
 {"title":"Proof must be chemical","speech":"Contact angle alone cannot establish molecular attachment. The investigators also used X-ray photoelectron spectroscopy to compare surface chemistry after plasma exposure and grafting.","source":"2021 source paper Figure 4: XPS spectra; genuine original published figure."},
 {"title":"The wetting changed","speech":"The measured water contact angle fell from seventy point two degrees untreated to fifty five point one after plasma treatment, and forty nine point six after fumaric acid grafting.","source":"2021 paper Table 1 water contact angles and Figure 1 wettability; actual numeric values."},
 {"title":"The peel experiment","speech":"In the original peel test, the untreated laminate resisted separation at seventy four newtons per meter. Fumaric acid grafting after plasma treatment reached two hundred eleven.","source":"2021 paper Figure 8; original figures indicate ~74.4 and 211 N/m."},
 {"title":"The control answers the question","speech":"Adding fumaric acid without plasma gave only eighty seven newtons per meter. The strongest result required the treatment sequence. That is evidence for a surface process, not a universal packaging claim.","source":"2021 paper Figure 8: untreated + FA approximately 87.2; plasma + FA 211 N/m."}
]

def fnt(size=20,kind="normal"):
 return ImageFont.truetype({"normal":SANS,"bold":BOLD,"serif":SERIF}[kind],size)
def write(d,p,s,size=25,color=PAPER,kind="normal"):
 d.text(p,s,font=fnt(size,kind),fill=color)
def clamp(t):return max(0,min(1,t))
def ease(t):t=clamp(t);return t*t*(3-2*t)
def canvas():
 im=Image.new("RGB",(W,H),DEEP)
 d=ImageDraw.Draw(im)
 for y in range(H):
  q=y/H
  d.line((0,y,W,y),fill=(int(10+17*q),int(30+25*q),int(36+22*q)),width=1)
 return im
def header(d,k,eyebrow,source="2021 · POLYMERS · DOI:10.3390/POLYM13213717"):
 write(d,(55,39),"RUWAIDIX / MATERIALS LABORATORY",15,MINT,"bold")
 write(d,(1044,39),f"EXPERIMENT {k+1:02d}/08",15,GOLD,"bold")
 d.line((52,74,W-52,74),fill=(75,102,99),width=1)
 write(d,(54,104),eyebrow.upper(),17,GOLD,"bold")
 d.rectangle((43,660,W-44,704),fill=(17,43,46))
 write(d,(59,677),source,13,SILVER)
def headline(d,*lines,x=58,y=192,size=55):
 for i,ln in enumerate(lines):write(d,(x,y+i*(size+15)),ln,size,PAPER,"serif")
def film_overlay(d,s):
 write(d,(55,630),s,15,MINT)
FIGURES={n:Image.open(SOURCE/f"pla-grafting-figure-{n:02d}.jpg").convert("RGB") for n in (1,4,8)}
PALE=(215,222,214)
DARK_G=(28,59,58)
def original_figure(im,d,n,t,box=(466,156,1232,625)):
 source=FIGURES[n]
 l,u,r,b=box
 # Entire published multi-panel figure preserved, no axis crop or fake controls.
 fitted=ImageOps.contain(source,(r-l-14,b-u-14),method=Image.Resampling.LANCZOS)
 bg=Image.new("RGB",(r-l,b-u),(239,236,229))
 bg.paste(fitted,((r-l-fitted.width)//2,(b-u-fitted.height)//2))
 im.paste(bg,(l,u))
 d=ImageDraw.Draw(im)
 d.rectangle(box,outline=GOLD,width=2)
 write(d,(l+5,b+8),f"Original paper Figure {n}; entire panel",14,GOLD)
 return d
def molecular_film(d,t,xc=775,yc=464):
 # Polymer backbone is a conceptual, nonquantitative surface cross-section.
 d.rounded_rectangle((375,494,1184,624),18,fill=(45,70,69),outline=(100,144,130),width=3)
 for row in range(3):
  yy=530+32*row
  for k in range(19):
   x=410+k*39
   d.ellipse((x-7,yy-7,x+7,yy+7),fill=(130+row*15,155,137))
   if k<18:d.line((x+7,yy,x+32,yy),fill=(168,191,177),width=3)
 # Mobile surface modifiers in the upper environment, clearly not measured XPS.
 for k in range(17):
  x=406+(k*47)%741
  y=300+math.sin(t*.8+k)*35
  d.ellipse((x-5,y-5,x+5,y+5),fill=GOLD)
def s0(im,d,t):
 header(d,0,"A material changes at its boundary")
 headline(d,"THE OUTSIDE","IS THE TEST",size=65)
 molecular_film(d,t)
 d.line((401,492,1155,492),fill=GOLD,width=6)
 film_overlay(d,"PLA film surface · explanatory polymer representation, not microscopy.")
def s1(im,d,t):
 header(d,1,"Quantify the starting surface")
 headline(d,"WHAT DOES","A DROP SEE?",size=56)
 # Drawable tangent plane and fitted contact-angle concept; numeric comes from source Table 1.
 cx,cy=905,460
 d.line((594,558,1180,558),fill=PALE,width=7)
 d.ellipse((cx-168,cy-95,cx+168,cy+150),outline=MINT,width=8)
 d.rectangle((600,559,1180,635),fill=(44,78,75))
 d.arc((cx-155,cy-75,cx+155,cy+165),182,356,fill=GOLD,width=7)
 write(d,(595,303),"70.2°",53,GOLD,"bold")
 write(d,(816,627),"Untreated PLA / Table 1",17,PALE)
 film_overlay(d,"Measured mean contact angle: 70.2 ± 1.6°; droplet drawing is illustrative.")
def s2(im,d,t):
 header(d,2,"The contact layer is activated")
 headline(d,"PLASMA","FIRST",size=70)
 molecular_film(d,t)
 for i in range(36):
  x=415+(i*31)%740
  yy=150+(i*19)%235
  speed=(t/15)*240
  y=yy+speed
  a=clamp((t-i*.07)/3)
  if y>505:continue
  d.line((x,y-24,x+6,y+7),fill=(180,230,219) if i%2 else GOLD,width=2)
 for i in range(18):
  x=405+i*40
  r=4+4*ease(t/15)
  d.ellipse((x-r,490-r,x+r,490+r),fill=GOLD)
 film_overlay(d,"Plasma-surface chemistry schematic / no invented activation density.")
def s3(im,d,t):
 header(d,3,"The comparator decides what chemistry means")
 headline(d,"TWO GRAFT","ROUTES",size=59)
 for i,(lab,sub,col) in enumerate([("ASCORBIC ACID","ASA",(120,197,161)),("FUMARIC ACID","FA",(210,151,101))]):
  x=486+i*358
  d.rounded_rectangle((x,253,x+308,560),18,fill=(29,61,60),outline=col,width=3)
  write(d,(x+22,283),lab,21,col,"bold")
  write(d,(x+24,327),sub,49,PALE,"serif")
  for j in range(6):
   xx=x+45+j*40
   y=449+14*math.sin(t*.6+j)
   d.ellipse((xx-9,y-9,xx+9,y+9),fill=col)
   if j<5:d.line((xx+8,y,xx+31,y),fill=PALE,width=3)
  write(d,(x+24,509),"After plasma activation",15,SILVER)
 film_overlay(d,"Conceptual chemical routes · actual reagent-specific covalent structures not depicted.")
def s4(im,d,t):
 header(d,4,"Chemical evidence / original published XPS spectra")
 write(d,(63,134),"XPS / PLA SURFACE CHEMISTRY",39,PALE,"serif")
 d=original_figure(im,d,4,t,(97,210,1195,606))
 write(d,(91,624),"Original published Figure 4. No synthetic spectroscopy.",14,MINT)
def s5(im,d,t):
 header(d,5,"Wetting measurements / the actual study and conditions")
 write(d,(63,136),"THE MEASURED CONTACT ANGLES",36,PALE,"serif")
 d=original_figure(im,d,1,t,(87,207,1201,602))
 write(d,(93,620),"Untreated: 70.2°  /  Plasma: 55.1°  /  Plasma + FA: 49.6°",17,MINT)
def s6(im,d,t):
 header(d,6,"The actual laminate peel-resistance experiment")
 write(d,(63,133),"THE PEEL-RESISTANCE RESULT",37,PALE,"serif")
 d=original_figure(im,d,8,t,(83,200,1203,611))
 write(d,(90,624),"Original Figure 8, N/m  /  unmodified graph and controls",14,MINT)
def s7(im,d,t):
 header(d,7,"Without plasma, the extra agent was insufficient")
 headline(d,"THE CONTROL","MATTERS",size=54)
 points=[("Untreated",74.4),("No plasma+FA",87.2),("Plasma+FA",211)]
 for i,(lab,v) in enumerate(points):
  y=290+i*101
  write(d,(493,y-5),lab,22,PALE)
  maxwidth=402
  scale=ease((t-.4*i)/10)
  d.rounded_rectangle((727,y,727+maxwidth*scale*v/240,y+42),7,fill=MINT if i<2 else GOLD)
  write(d,(1151,y+7),f"{v:g}",23,GOLD,"bold")
 write(d,(730,628),"Peel resistance  /  N per meter",16,SILVER)
 film_overlay(d,"Values transcribed from published Figure 8, not simulated data.")
DRAWERS=[s0,s1,s2,s3,s4,s5,s6,s7]
def make_frame(k,t):
 im=canvas()
 return im,ImageDraw.Draw(im)
def verify():
 meta=json.loads((SOURCE/"source-figure-provenance.json").read_text())
 rows={r["figure_number"]:r for r in meta["figures"] if r["film"]==ID}
 assert set(rows)>={1,4,8},rows.keys()
 for n in (1,4,8):
  path=SOURCE/f"pla-grafting-figure-{n:02d}.jpg"
  assert rows[n]["doi"]==DOI
  assert hashlib.sha256(path.read_bytes()).hexdigest()==rows[n]["sha256"]
  assert rows[n]["caption"] and rows[n]["license"].startswith("Creative Commons")
def main():
 verify()
 source_manifest=json.loads((SOURCE/"source-figure-provenance.json").read_text())
 rows={r["figure_number"]:r for r in source_manifest["figures"] if r["film"]==ID}
 path=ROOT/"scripts/render-making-medicines-v3.py"
 spec=importlib.util.spec_from_file_location("ruwaidix_audio_encoder",path)
 engine=importlib.util.module_from_spec(spec)
 spec.loader.exec_module(engine)
 engine.NAME=ID;engine.OUT=DEST;engine.SCENES=SCENES
 engine.DRAWERS=DRAWERS;engine.frame_base=make_frame
 DEST.mkdir(parents=True,exist_ok=True)
 with tempfile.TemporaryDirectory(prefix="ruwaidix-pla-v3") as td:
  temp=Path(td)
  sr,times=engine.wav_voice((ROOT/"film-models").resolve(),temp)
  engine.subtitles(temp,times)
  parts=[engine.clip(i,temp) for i in range(8)]
  entries=temp/"sections.txt"
  entries.write_text("".join(f"file '{p}'\n" for p in parts))
  master=DEST/(ID+".mp4")
  subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(entries),
    "-i",str(temp/"narration.wav"),"-map","0:v","-map","1:a","-c:v","copy","-c:a","aac","-b:a","160k",
    "-t","120","-movflags","+faststart",str(master)],check=True)
  (DEST/(ID+".vtt")).write_bytes((temp/"captions.vtt").read_bytes())
  p=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(master)]))
  duration=float(p["format"]["duration"])
  assert abs(duration-120)<.35
  d={"id":ID,"edition":"V3 primary-study figures and original experiment storytelling",
    "paper":"Surface Modification of Poly(lactic acid) Film via Cold Plasma Assisted Grafting of Fumaric and Ascorbic Acid",
    "doi":DOI,"duration":duration,"sha256":hashlib.sha256(master.read_bytes()).hexdigest(),
    "figures":[rows[n] for n in (1,4,8)],
    "data_note":"Contact angles: 70.2° untreated, 55.1° plasma, 49.6° FA-plasma; peel resistance: 74.4 untreated, 73.3 ASA without plasma, 87.2 FA without plasma, 107 plasma, 130 ASA-plasma, 211 FA-plasma. Published paper Table 1 and Figure 8. No simulated experiment promoted as observation.",
    "restrictions":"2020 antimicrobial PLA scaffolds were a different study and are not depicted. Artificial film/polymer molecular shapes are conceptual. Original figures contain original controls, captions and axis units.",
    "human_review":"NOT YET APPROVED: check audio/acoustics, data readouts, figure rights and full-speed editing",
    "chapters":[dict(scene,tts_seconds=times[i]["tts_seconds"]) for i,scene in enumerate(SCENES)]}
  (DEST/(ID+".json")).write_text(json.dumps(d,indent=2,ensure_ascii=False)+"\n")
  print("VERIFIED PLA STUDY FILM",master,"bytes",master.stat().st_size)
if __name__=="__main__":main()
